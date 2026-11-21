import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Centrally configure URI-based API versioning (e.g., /api/v1/patient-registrations)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global validation pipe with whitelist and auto-transform enabled
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configure Swagger documentation at /api/docs
  const config = new DocumentBuilder()
    .setTitle('Varma Nursing Home - Patient Registration API')
    .setDescription(
      'Enterprise REST API documentation for Varma Nursing Home patient registration, clinical vitals, body measurements, and intake management.',
    )
    .setVersion('1.0')
    .addTag('Patient Registrations', 'APIs for creating, querying, updating, and deleting clinical patient registrations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Varma Nursing Home API Documentation',
  });

  const port = process.env.PORT ?? 5000;
  await app.listen(port);

  console.log(`HMS Backend running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
  console.log(`API v1 Endpoint: http://localhost:${port}/api/v1/patient-registrations`);
}
await bootstrap();
