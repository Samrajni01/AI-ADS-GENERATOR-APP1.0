import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { MediaService } from './media.service'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'

@UseGuards(JwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  // POST /media/upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.mediaService.uploadFile(file, user.id)
  }

  // GET /media
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.mediaService.findAll(user.id)
  }

  // GET /media/:id
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mediaService.findOne(id, user.id)
  }

  // DELETE /media/:id
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mediaService.remove(id, user.id)
  }
}