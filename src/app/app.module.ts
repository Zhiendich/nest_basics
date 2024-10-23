import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from 'src/app/user/user.module';
import { AuthModule } from 'src/app/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { AccessJwtGuard } from 'src/guards/access-jwt.guard';
import { RefreshJwtGuard } from 'src/guards/refresh-jwt.guard';
import { CacheModule } from '../modules/cache.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';
import { RolesGuard } from 'src/guards/role.guard';
import { ParseIdPipe } from 'src/pipes/parseId.pipe';
import { LoggerMiddleware } from 'src/middleware/logger.middleware';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { FileModule } from './file/file.module';
import { WhetherModule } from './whether/whether.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule,
    EventEmitterModule.forRoot(),
    WinstonModule.forRoot({}),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    FileModule,
    WhetherModule,
  ],
  controllers: [],
  providers: [
    Logger,
    {
      provide: APP_GUARD,
      useClass: AccessJwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RefreshJwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ParseIdPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
