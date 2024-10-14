import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as cookieParser from 'cookie-parser';
import { AccessJwtGuard } from './guards/access-jwt.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: [process.env.FRONTEND_URL], credentials: true });
  app.use(cookieParser());
  const reflector = app.get(Reflector);
  app.useGlobalGuards(
    new AccessJwtGuard(reflector),
    new RefreshJwtGuard(reflector),
  );
  await app.listen(3000).then(() => {
    console.log('Server is working');
  });
}
bootstrap();
