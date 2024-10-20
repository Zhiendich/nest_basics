import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/services/cache.service';
import { Roles } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from 'src/services/prisma.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: CacheService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });
  const request = {
    email: 'alice@prisma.io',
    password: 'alicepassword',
  };
  const result = {
    user: {
      id: 3,
      email: 'alice@prisma.io',
      name: 'Alice',
      roles: [Roles.user],
    },
    accessToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJhbGljZUBwcmlzbWEuaW8iLCJpYXQiOjE3MjkzNDkyNTYsImV4cCI6MTcyOTM1Mjg1Nn0.s_3xvp8rGfLMmVXUh0J--gpb0-sDNwQkqCeWc5OhnI8',
    refreshToken: 'sdadsadsadasdas',
  };

  describe('login', () => {
    it('user try to login', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(result);
      const mockResponse = {
        json: jest.fn().mockReturnValue(result),
      } as unknown as Response;
      await authController.login(request, mockResponse);
      expect(mockResponse.json).toHaveBeenCalledWith(result);
    });
  });
});
