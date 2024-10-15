import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async getUser(id: number): Promise<User> {
    return await this.prismaService.user.findUnique({ where: { id } });
  }
  async findOne<K extends keyof User>(where: {
    [key in K]: User[K];
  }): Promise<User | null> {
    return this.prismaService.user.findFirst({ where });
  }
  async create(newUser: Omit<User, 'id'>): Promise<User | null> {
    return this.prismaService.user.create({ data: newUser });
  }
}
