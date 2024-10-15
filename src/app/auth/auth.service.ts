import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { RegisterUserDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/types/jwt.types';
import { CacheService } from 'src/services/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private config: ConfigService,
    private readonly redis: CacheService,
  ) {}
  async login(dto: LoginUserDto): Promise<{
    user: Omit<User, 'password'>;
    accessToken: string;
    refreshToken: string;
  } | null> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      return null;
    }
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
    };

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOne({ email });
    const isEqual = password === user.password;
    // const isEqual = await bcrypt.compare(password, user.password);
    if (user && isEqual) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async register(dto: RegisterUserDto): Promise<Omit<User, 'password'> | null> {
    const findUser = await this.usersService.findOne({ email: dto.email });
    if (findUser) {
      throw new ConflictException();
    }
    const user = await this.usersService.create(dto);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  async refresh(id: number, email: string) {
    const payload: JwtPayload = {
      id,
      email,
    };
    return await this.generateTokens(payload);
  }
  async generateTokens(
    payload: JwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }
  async addTokensToBlacklist(
    access: { accessTokenExp: number; accessToken: string },
    refresh: { refreshTokenExp: number; refreshToken: string },
  ) {
    const { accessToken, accessTokenExp } = access;
    const { refreshToken, refreshTokenExp } = refresh;
    await this.redis.set(accessToken, 'blacklisted', accessTokenExp);
    await this.redis.set(refreshToken, 'blacklisted', refreshTokenExp);
  }
}
