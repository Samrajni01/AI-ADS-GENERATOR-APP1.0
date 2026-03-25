import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull'
import OpenAI from 'openai'
import { PrismaService } from '../prisma/prisma.service'
import { CacheService } from '../cache/cache.service'
import { GenerateAdDto } from './dto/generate-ad.dto'

@Injectable()
export class AiService {
  private openai: OpenAI

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
    @InjectQueue('ai') private aiQueue: Queue,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async generateAd(userId: string, dto: GenerateAdDto) {
    try {
      // Build smart prompt
      const systemPrompt = `You are an expert advertising copywriter. 
      Generate compelling ad content optimized for ${dto.platform}.
      Keep it concise, engaging and conversion-focused.
      Respond ONLY in this exact JSON format:
      {
        "title": "ad title here",
        "body": "ad body text here",
        "callToAction": "CTA text here"
      }`

      const userPrompt = `
        Create an ad with these details:
        - Product/Service: ${dto.productName || 'Not specified'}
        - Platform: ${dto.platform}
        - Tone: ${dto.tone || 'Professional'}
        - Target Audience: ${dto.targetAudience || 'General'}
        - Brief: ${dto.prompt}
      `

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      const content = completion.choices[0].message.content
      if (!content) throw new InternalServerErrorException('AI returned empty response')

      // Parse JSON response
      const parsed = JSON.parse(content)

      // Save generated ad to DB
      const ad = await this.prisma.db.ad.create({
        data: {
          title: parsed.title,
          body: parsed.body,
          platform: dto.platform,
          prompt: dto.prompt,
          userId,
        },
      })

      // Invalidate cache
      await this.cacheService.del(`ads:user:${userId}`)

      // Add to queue for post processing
      await this.aiQueue.add('post-process', { adId: ad.id, userId })

      return {
        ad,
        callToAction: parsed.callToAction,
        generatedBy: 'gpt-4',
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new InternalServerErrorException('Failed to parse AI response')
      }
      throw error
    }
  }

  // Generate multiple variations
  async generateVariations(userId: string, dto: GenerateAdDto) {
    const systemPrompt = `You are an expert advertising copywriter.
    Generate 3 different ad variations optimized for ${dto.platform}.
    Respond ONLY in this exact JSON format:
    {
      "variations": [
        { "title": "title 1", "body": "body 1", "callToAction": "CTA 1" },
        { "title": "title 2", "body": "body 2", "callToAction": "CTA 2" },
        { "title": "title 3", "body": "body 3", "callToAction": "CTA 3" }
      ]
    }`

    const userPrompt = `
      Create 3 ad variations:
      - Product/Service: ${dto.productName || 'Not specified'}
      - Platform: ${dto.platform}
      - Tone: ${dto.tone || 'Professional'}
      - Target Audience: ${dto.targetAudience || 'General'}
      - Brief: ${dto.prompt}
    `

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    })

    const content = completion.choices[0].message.content
    if (!content) throw new InternalServerErrorException('AI returned empty response')

    const parsed = JSON.parse(content)
    return parsed.variations
  }
}