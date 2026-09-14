import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './shared/common/exceptions/all-exceptions.filter';
import { TransformInterceptor } from './shared/common/interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';
import { RedisIoAdapter } from './shared/redis/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  try {
    const redisIoAdapter = new RedisIoAdapter(configService);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
  } catch (e) {
    console.warn('[Redis] Connection skipped or offline:', e);
  }

  app.setGlobalPrefix('api/v1');

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );


  // Reflecting any Origin (origin: true) is broader than necessary, but
  // verified not to be a live CSRF/credential-theft vector: this app has no
  // cookie-based auth anywhere (no cookie-parser, no res.cookie/Set-Cookie -
  // pure Bearer-token auth), so a malicious page reflecting a victim's
  // origin back can't ride along on an authenticated session the way it
  // could with cookies. Still tightened to an explicit allowlist when one is
  // configured, since "not currently exploitable" isn't the same as
  // "intentionally scoped" - set CORS_ALLOWED_ORIGINS (comma-separated) to
  // the real deployed frontend origins to opt in. Left permissive by
  // default (unchanged behavior) rather than guessing at production
  // domains this session has no way to verify - hardcoding a wrong or
  // incomplete allowlist would silently break the real deployed frontend.
  const allowedOrigins = configService
    .get<string>('CORS_ALLOWED_ORIGINS', '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Enterprise Marketplace API')
    .setDescription('Production-grade marketplace authentication and user management API service.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
