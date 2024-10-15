import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { CustomCacheInterceptor } from 'src/interceptors/cache.interceptor';

@Controller('user')
@UseInterceptors(CustomCacheInterceptor)
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':id')
  @CacheTTL(10)
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const findUser = await this.userService.getUser(id);
    if (!findUser) {
      throw new NotFoundException();
    }
    return findUser;
  }
}
