import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as cookieParser from 'cookie-parser';
import { AccessJwtGuard } from './guards/access-jwt.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: [process.env.FRONTEND_URL], credentials: true });
  app.use(cookieParser());
  const reflector = app.get(Reflector);
  const redis = app.get(getRedisConnectionToken());
  app.useGlobalGuards(
    new AccessJwtGuard(reflector, redis),
    new RefreshJwtGuard(reflector, redis),
  );
  await app.listen(3000).then(() => {
    console.log('Server is working');
  });
}
bootstrap();
