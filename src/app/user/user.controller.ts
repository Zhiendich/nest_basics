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
import { CustomCacheInterceptor } from 'src/interceptors/cache.interceptor';
import { CacheTTL } from 'src/decorators/cache-ttl.decorator';

@Controller('user')
@UseInterceptors(CustomCacheInterceptor)
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':id')
  @CacheTTL(10000)
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const findUser = await this.userService.getUser(id);
    if (!findUser) {
      throw new NotFoundException();
    }
    return findUser;
  }
}
