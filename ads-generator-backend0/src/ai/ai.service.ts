import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull'
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service'
import { CacheService } from '../cache/cache.service'
import { GenerateAdDto } from './dto/generate-ad.dto'
import { MediaService } from 'src/media/media.service';
import { AdStatus } from '@prisma/client';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private openai: OpenAI;
  private groq: Groq;

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private mediaService: MediaService,
    @InjectQueue('ai') private aiQueue: Queue,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  private async generateWithFallback(systemPrompt: string, userPrompt: string): Promise<string> {
    const providers = [
      () => this.tryGroq('llama-3.3-70b-versatile', systemPrompt, userPrompt),
      () => this.tryGemini('gemini-1.5-flash', systemPrompt, userPrompt),
      () => this.tryGemini('gemini-2.5-flash', systemPrompt, userPrompt),
      () => this.tryOpenAI('gpt-4o-mini', systemPrompt, userPrompt),
    ];

    for (const provider of providers) {
      try {
        const result = await provider();
        if (result) return result;
      } catch (err: any) {
        const isCapacityError = [503, 429, 529].includes(err?.status) ||
          err?.message?.includes('503') ||
          err?.message?.includes('overloaded') ||
          err?.message?.includes('rate limit');
        if (isCapacityError) {
          console.warn(`Provider failed (${err?.status}), trying next...`);
          continue;
        }
        throw err;
      }
    }
    throw new InternalServerErrorException('All AI providers are currently unavailable.');
  }

  private async tryGemini(modelName: string, systemPrompt: string, userPrompt: string) {
    console.log(`Trying Gemini: ${modelName}`);
    const model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { responseMimeType: "application/json" } 
    });
    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    return result.response.text();
  }

  private async tryGroq(modelName: string, systemPrompt: string, userPrompt: string) {
    console.log(`Trying Groq: ${modelName}`);
    const result = await this.groq.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });
    return result.choices[0]?.message?.content || null;
  }

  private async tryOpenAI(modelName: string, systemPrompt: string, userPrompt: string) {
    console.log(`Trying OpenAI: ${modelName}`);
    const result = await this.openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });
    return result.choices[0]?.message?.content || null;
  }

  async generateAd(userId: string, dto: GenerateAdDto) {
    try {
      const shouldIncludeImage = dto.includeImage === true;

      const systemPrompt = `You are a world-class digital marketing strategist and copywriter.
        Generate highly engaging, conversion-optimized ad content for ${dto.platform}.
        Your copy should hook the reader immediately and align with the specified tone.
        Respond ONLY in this exact JSON format:
        {
          "title": "A scroll-stopping headline",
          "body": "Compelling ad body text with a clear value proposition",
          "callToAction": "A strong, action-oriented CTA"${shouldIncludeImage ? ',\n       "imagePrompt": "Generate a creative advertisement image prompt specific to this product. Make it visually striking and eye-catching, colors popping, looks unmistakably like a paid advertisement. Focus on the product in an appealing commercial setting with dramatic lighting and vibrant brand colors, photorealistic 4k. If relevant, include lifestyle elements like human interaction with the product (e.g., hands holding, lips drinking, person using). NO garbled words, NO books. Only ONE short punchy hook line of text if needed, nothing else"' : ''}
        }`;

      const userPrompt = `
        Create a high-performing ad campaign based on these parameters:
        - BRAND/PRODUCT: ${dto.productName || 'Not specified'}
        - CAMPAIGN GOAL: ${dto.prompt}
        - TARGET AUDIENCE: ${dto.targetAudience || 'General audience'}
        - VOICE & TONE: ${dto.tone || 'Professional and trustworthy'}
        - AD PLATFORM: ${dto.platform}
        
        ${shouldIncludeImage ? 'Generate an image prompt that looks like a real paid social media ad. Must include: bold product placement, advertisement banner layout, vibrant brand colors, promotional design style. NOT a lifestyle photo — an actual advertisement.' : ''}
      `;

      const content = await this.generateWithFallback(systemPrompt, userPrompt);
      console.log("RAW AI RESPONSE:", content);
      if (!content) throw new InternalServerErrorException('AI returned empty response');

      const cleanContent = content.replace(/```json|```/g, '').trim();

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("NO JSON FOUND:", cleanContent);
        throw new Error("Invalid AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      console.log("PARSED OBJECT:", parsed);

      const ad = await this.prisma.db.ad.create({
        data: {
          title: parsed.title,
          body: parsed.body,
          callToAction: parsed.callToAction,
          platform: dto.platform,
          prompt: dto.prompt,
          productName: dto.productName,
          targetAudience: dto.targetAudience,
          tone: dto.tone,
          imagePrompt: parsed.imagePrompt || null,
          imageUrl: null,
          status: dto.campaignId ? AdStatus.ACTIVE : AdStatus.DRAFT,
          campaignId: dto.campaignId || null,
          userId: userId,
        },
      });

      if (shouldIncludeImage && parsed.imagePrompt) {
        const imageBuffer = await this.generateAdImage(parsed.imagePrompt);

        if (imageBuffer) {
          try {
            const mockFile: any = {
              buffer: imageBuffer,
              originalname: `ai-gen-${ad.id}.png`,
              mimetype: 'image/png',
              size: imageBuffer.length,
            };
            const media = await this.mediaService.uploadFile(mockFile, userId);
            await this.prisma.db.ad.update({
              where: { id: ad.id },
              data: { imageUrl: `/uploads/${media.url}` }
            });
            ad.imageUrl = `/uploads/${media.url}`;
          } catch (e) {
            console.error('Image upload failed, continuing anyway:', e);
          }
        }
      }

      try {
        await this.cacheService.del(`ads:user:${userId}`);
      } catch (e) {
        console.warn('Cache delete failed, skipping:', e.message);
      }

      try {
        await this.aiQueue.add('post-process', { 
          adId: ad.id, 
          userId, 
          hasImage: shouldIncludeImage 
        });
      } catch (e) {
        console.warn('Queue add failed, skipping:', e.message);
      }

      return {
        ad,
        callToAction: parsed.callToAction,
        generatedBy: 'gemini-1.5-flash',
      };

    } catch (error: unknown) {
      console.log("--- ERROR DETECTED ---");
      console.error(error);
      console.log("----------------------");

      if (typeof error === 'object' && error !== null && 'code' in error) {
        console.log("Prisma Error Code:", (error as any).code);
      }

      const message = error instanceof Error ? error.message : 'AI Service Failed';
      throw new InternalServerErrorException(message);
    }
  }

  async generateVariations(userId: string, dto: GenerateAdDto) {
    const systemPrompt = `You are a master of A/B testing and ad copy. 
    Generate 3 distinct ad variations optimized for ${dto.platform}. 
    Each variation should have a unique angle (e.g., one emotional, one benefit-driven, one curiosity-driven).
    Respond ONLY in this exact JSON format:
    {
      "variations": [
        { "title": "Headline 1", "body": "Body text 1", "callToAction": "CTA 1" },
        { "title": "Headline 2", "body": "Body text 2", "callToAction": "CTA 2" },
        { "title": "Headline 3", "body": "Body text 3", "callToAction": "CTA 3" }
      ]
    }`;

    const userPrompt = `
      Create 3 high-conversion ad variations for the following product:
      - PRODUCT NAME: ${dto.productName || 'Not specified'}
      - CAMPAIGN GOAL: ${dto.prompt}
      - TARGET AUDIENCE: ${dto.targetAudience || 'General'}
      - VOICE & TONE: ${dto.tone || 'Professional'}
      - AD PLATFORM: ${dto.platform}
      
      Ensure each variation feels fresh and targets a different psychological trigger.
    `;

    const responseText = await this.generateWithFallback(systemPrompt, userPrompt);
    
    if (!responseText) throw new InternalServerErrorException('AI returned empty response');

    const cleanContent = responseText.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid AI response");

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.variations;
  }

  async generateAdImage(prompt: string) {
    try {
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        {
          headers: { 
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
            // ← x-wait-for-model removed
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`HF Error Status: ${response.status} - ${errorData}`);
        throw new Error(`Hugging Face API failed: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer); 

    } catch (error: unknown) {
      console.error("Image Gen Error:", error);
      return null;
    }
  }
}