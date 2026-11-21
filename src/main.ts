import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing for JWT HTTP-only cookies
  app.use(cookieParser());

  // Enable CORS with credentials for frontend cookie transmission
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Centrally configure URI-based API versioning (e.g., /api/v1/admin/auth/login)
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
    .setTitle('Varma Nursing Home - Hospital Management System API')
    .setDescription(
      'Enterprise REST API documentation for Varma Nursing Home patient registration, clinical vitals, intake management, and admin dashboard operations.',
    )
    .setVersion('1.0')
    .addTag('Patient Registrations', 'Public APIs for registering clinical patients and vitals')
    .addTag('Admin Auth', 'APIs for admin authentication, JWT session cookies, and admin profile')
    .addTag('Admin Dashboard & Patient Management', 'Protected APIs for analytics, dashboard metrics, and patient management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token (optional if session cookie is present)',
      },
      'bearer-jwt',
    )
    .addCookieAuth('admin_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'admin_token',
      description: 'HTTP-only session cookie set upon successful admin login',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Varma Nursing Home API Documentation',
  });

  const port = process.env.PORT ?? 5000;
  await app.listen(port);

  console.log(`HMS Backend running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
  console.log(`Admin APIs active under /api/v1/admin/*`);
}
await bootstrap();
