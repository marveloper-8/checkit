import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from "dotenv"

dotenv.config()

async function bootstrap() {
  console.log('JWT_SECRET:', process.env.JWT_SECRET)
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }))

  app.useGlobalFilters(new HttpExceptionFilter())

  app.useGlobalInterceptors(new LoggingInterceptor())

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })

  const config = new DocumentBuilder()
    .setTitle('Order Management API')
    .setDescription('API documentation for Order Management System with Chat Feature')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT || 3000)
}
bootstrap();
