import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Roles, User } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { CustomCacheInterceptor } from 'src/interceptors/cache.interceptor';
import { CacheTTL } from 'src/decorators/cache-ttl.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { CheckRoles } from 'src/decorators/role.decorator';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseInterceptors(CustomCacheInterceptor)
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
  @CheckRoles(Roles.admin)
  @Put(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() newUserData: UpdateUserDto,
  ): Promise<User> {
    const updatedUser = await this.userService.update(newUserData, id);
    if (!updatedUser) {
      throw new NotFoundException();
    }
    return updatedUser;
  }
}
