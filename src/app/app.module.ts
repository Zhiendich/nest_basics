import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from 'src/app/user/user.module';
import { AuthModule } from 'src/app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AccessJwtGuard } from 'src/guards/access-jwt.guard';
import { RefreshJwtGuard } from 'src/guards/refresh-jwt.guard';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

// import { CacheModule } from '../modules/cache.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // CacheModule,
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      // host: 'localhost',
      // port: 6379,
    }),
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
