import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CacheService } from '../cache/cache.service'
import * as fs from 'fs'
import * as path from 'path'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class MediaService {
  // ✅
//private uploadDir = path.join(__dirname, '..', '..', 'uploads')
private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {
    // Create uploads folder if not exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true })
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: string,
  ) {
    if (!file) throw new BadRequestException('No file provided')

    // Generate unique filename
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    const filepath = path.join(this.uploadDir, filename)

    // Save file to disk
    fs.writeFileSync(filepath, file.buffer)

    // Save to DB
    const media = await this.prisma.db.media.create({
      data: {
        filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: filename,
        //url: `/uploads/${filename}`,
        userId,
      },
    })

    // Invalidate cache
    await this.cacheService.del(`media:user:${userId}`)

    return media
  }

  async findAll(userId: string) {
    const cacheKey = `media:user:${userId}`
    const cached = await this.cacheService.get(cacheKey)
    if (cached) return cached

    const media = await this.prisma.db.media.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    await this.cacheService.set(cacheKey, media, 60)
    return media
  }

  async findOne(id: string, userId: string) {
    const media = await this.prisma.db.media.findUnique({
      where: { id },
    })
    if (!media) throw new NotFoundException('File not found')
    if (media.userId !== userId) throw new NotFoundException('File not found')
    return media
  }

  async remove(id: string, userId: string) {
    const media = await this.findOne(id, userId)

    // Delete file from disk
    const filepath = path.join(this.uploadDir, media.filename)
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }

    // Delete from DB
    await this.prisma.db.media.delete({ where: { id } })
    await this.cacheService.del(`media:user:${userId}`)

    return { message: 'File deleted successfully' }
  }
}