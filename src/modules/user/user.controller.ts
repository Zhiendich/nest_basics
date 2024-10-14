import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    const findUser = await this.userService.getUser(id);
    if (!findUser) {
      throw new NotFoundException();
    }
    return findUser;
  }
}
