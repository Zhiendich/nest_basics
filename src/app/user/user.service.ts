import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/services/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async getUser(id: number): Promise<User> {
    return await this.prismaService.user.findUnique({ where: { id } });
  }
  async findOne<K extends keyof User>(where: {
    [key in K]: User[K];
  }): Promise<User | null> {
    return this.prismaService.user.findFirst({ where });
  }
  async create(newUser: Omit<User, 'id' | 'roles'>): Promise<User | null> {
    return this.prismaService.user.create({ data: newUser });
  }
  async update(
    data: Omit<User, 'id' | 'roles'>,
    id: number,
  ): Promise<User | null> {
    const updatedUser = this.prismaService.user.update({ where: { id }, data });
    if (updatedUser) {
      this.eventEmitter.emit('user.updated', { id });
    }
    return updatedUser;
  }
}
