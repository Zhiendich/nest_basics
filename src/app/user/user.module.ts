import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from 'src/services/prisma.service';
import { CacheService } from 'src/services/cache.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService, CacheService],
  exports: [UserService],
})
export class UserModule {}
