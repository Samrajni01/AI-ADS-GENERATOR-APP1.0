import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull'
//import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'; // New
import { PrismaService } from '../prisma/prisma.service'
import { CacheService } from '../cache/cache.service'
import { GenerateAdDto } from './dto/generate-ad.dto'
import { MediaService } from 'src/media/media.service';
import { AdStatus } from '@prisma/client';

@Injectable()
export class AiService {
 private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    private mediaService: MediaService,
    @InjectQueue('ai') private aiQueue: Queue,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });
  }

  async generateAd(userId: string, dto: GenerateAdDto) {
  try {
    const shouldIncludeImage = dto.includeImage === true;

    // Expert System Prompt
    const systemPrompt = `You are a world-class digital marketing strategist and copywriter.
      Generate highly engaging, conversion-optimized ad content for ${dto.platform}.
      Your copy should hook the reader immediately and align with the specified tone.
      Respond ONLY in this exact JSON format:
      {
        "title": "A scroll-stopping headline",
        "body": "Compelling ad body text with a clear value proposition",
        "callToAction": "A strong, action-oriented CTA"${shouldIncludeImage ? ',\n       "imagePrompt": "Generate a creative advertisement image prompt specific to this product. Make it visually striking and eye-catching, colors popping, looks unmistakably like a paid advertisement. Focus on the product in an appealing commercial setting with dramatic lighting and vibrant brand colors, photorealistic 4k. If relevant, include lifestyle elements like human interaction with the product (e.g., hands holding, lips drinking, person using). NO garbled words, NO books. Only ONE short punchy hook line of text if needed, nothing else"' : ''}
      }`;

    // Refined User Prompt for better AI context
    const userPrompt = `
      Create a high-performing ad campaign based on these parameters:
      - BRAND/PRODUCT: ${dto.productName || 'Not specified'}
      - CAMPAIGN GOAL: ${dto.prompt}
      - TARGET AUDIENCE: ${dto.targetAudience || 'General audience'}
      - VOICE & TONE: ${dto.tone || 'Professional and trustworthy'}
      - AD PLATFORM: ${dto.platform}
      
      ${shouldIncludeImage ? 'Generate an image prompt that looks like a real paid social media ad. Must include: bold product placement, advertisement banner layout, vibrant brand colors, promotional design style. NOT a lifestyle photo — an actual advertisement.' : ''}
    `;

    // 1. Call Gemini for Text & Image Prompt
    const result = await this.model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const content = result.response.text();
    console.log("RAW GEMINI RESPONSE:", content);
    if (!content) throw new InternalServerErrorException('AI returned empty response');

   const cleanContent = content.replace(/```json|```/g, '').trim();
const parsed = JSON.parse(cleanContent);
    console.log("PARSED OBJECT:", parsed);

    // 2. Save to Database
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
        userId: userId, // Use the flat ID instead of the { connect } object
      },
    });
    //(new)The Image Flow using MediaService
    if (shouldIncludeImage && parsed.imagePrompt) {
      const imageBuffer = await this.generateAdImage(parsed.imagePrompt);

      if (imageBuffer) {
        // We mock a "Multer File" object to reuse your MediaService logic
        const mockFile: any = {
          buffer: imageBuffer,
          originalname: `ai-gen-${ad.id}.png`,
          mimetype: 'image/png',
          size: imageBuffer.length,
        };
        const media = await this.mediaService.uploadFile(mockFile, userId);

        // Link the Media URL to the Ad
        await this.prisma.db.ad.update({
          where: { id: ad.id },
         data: { imageUrl: `/uploads/${media.url}` }
        });

        ad.imageUrl = `/uploads/${media.url}`
      }
    }



    // 3. Optional: Trigger Hugging Face immediately if requested
    // You can handle the buffer here or move this logic to your Bull queue
    if (shouldIncludeImage && parsed.imagePrompt) {
       // logic to trigger this.generateAdImage(parsed.imagePrompt) goes here
    }

    await this.cacheService.del(`ads:user:${userId}`);
    await this.aiQueue.add('post-process', { 
      adId: ad.id, 
      userId, 
      hasImage: shouldIncludeImage 
    });

    return {
      ad,
      callToAction: parsed.callToAction,
      generatedBy: 'gemini-1.5-flash',
    };
 } catch (error) {
    console.log("--- ERROR DETECTED ---");
    console.error(error); // This prints the FULL stack trace
    console.log("----------------------");
    
    // Check if it's a Prisma error specifically
    if (error.code) console.log("Prisma Error Code:", error.code);
    
    throw new InternalServerErrorException(error.message || 'AI Service Failed');
  }
}

  // Generate multiple variations
  async generateVariations(userId: string, dto: GenerateAdDto) {
    // 1. Expert System Prompt
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

    // 2. High-Quality User Prompt
    const userPrompt = `
      Create 3 high-conversion ad variations for the following product:
      - PRODUCT NAME: ${dto.productName || 'Not specified'}
      - CAMPAIGN GOAL: ${dto.prompt}
      - TARGET AUDIENCE: ${dto.targetAudience || 'General'}
      - VOICE & TONE: ${dto.tone || 'Professional'}
      - AD PLATFORM: ${dto.platform}
      
      Ensure each variation feels fresh and targets a different psychological trigger.
    `;

    // 3. Gemini Call
    const result = await this.model.generateContent(`${systemPrompt}\n\n${userPrompt}`);
    const responseText = await result.response.text();
    
    if (!responseText) throw new InternalServerErrorException('AI returned empty response');

    const parsed = JSON.parse(responseText);
    
    // Return only the variations array
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
          "x-wait-for-model": "true" // Keep this so it waits for the model to wake up
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
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
}  }
