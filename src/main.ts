import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Configure CORS for production
  app.enableCors({
    origin: [
      'https://carbonmintx.vercel.app',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on port ${port}`);
}
bootstrap();
