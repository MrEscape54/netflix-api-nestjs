import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowHeaders: ['Content-Type, Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown fields
      transform: true, // auto-transform DTO types
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
