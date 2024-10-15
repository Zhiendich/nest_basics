import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

const setUpSwagger = (app: INestApplication<any>) => {
  const config = new DocumentBuilder()
    .setTitle('Nest basics')
    .setDescription('Nest basics API description')
    .setVersion('1.0')
    .addTag('nest')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: [process.env.FRONTEND_URL], credentials: true });
  app.use(cookieParser());
  setUpSwagger(app);
  await app.listen(3000).then(() => {
    console.log('Server is working');
  });
}
bootstrap();
