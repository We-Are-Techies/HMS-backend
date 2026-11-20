import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.enableCors();

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log(`HMS Backend running on http://localhost:${port}`);
}
await bootstrap();
