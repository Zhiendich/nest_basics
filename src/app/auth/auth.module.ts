import { Module } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/strategies/local.strategy';
import { ConfigService } from '@nestjs/config';
import { AccessJwtStrategy } from 'src/strategies/access-jwt.strategy';
import { RefreshJwtStrategy } from 'src/strategies/refresh-jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '300s' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    UserService,
    LocalStrategy,
    AccessJwtStrategy,
    RefreshJwtStrategy,
  ],
})
export class AuthModule {}
