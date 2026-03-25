import { ValidationPipe } from '@nestjs/common'

export const customValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  errorHttpStatusCode: 422,
})