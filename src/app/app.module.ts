import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from 'src/app/user/user.module';
import { AuthModule } from 'src/app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessJwtGuard } from 'src/guards/access-jwt.guard';
import { RefreshJwtGuard } from 'src/guards/refresh-jwt.guard';
import { CacheModule } from '../modules/cache.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessJwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RefreshJwtGuard,
    },
  ],
})
export class AppModule {}
