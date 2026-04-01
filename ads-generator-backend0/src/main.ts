import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptors'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  /*app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  })
    */
   app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads',
});

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }))

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter())

  // Global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor())

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  })

  await app.listen(process.env.PORT ?? 3001)
}
bootstrap()