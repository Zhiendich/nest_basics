import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
  ],
})
export class AppModule {}
