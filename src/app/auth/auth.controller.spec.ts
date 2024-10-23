import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CacheService } from 'src/services/cache.service';
import { Roles, User } from '@prisma/client';
import { Response } from 'express';
import { PrismaService } from 'src/services/prisma.service';
import { Logger } from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { AuthDataTransfer } from 'src/types/auth.types';

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
            register: jest.fn(),
            refresh: jest.fn(),
            addTokensToBlacklist: jest.fn(),
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
          provide: Logger,
          useValue: {
            error: jest.fn(),
          },
        },
        {
          provide: PrismaService.toString(),
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            user: {
              findFirst: jest.fn(),
            },
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
  const loginRequest: LoginUserDto = {
    email: 'alice@prisma.io',
    password: 'alicepassword',
  };
  const loginResult = {
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

  const mockLoginResponse = {
    json: jest.fn().mockReturnValue(loginResult),
    cookie: jest.fn(),
  } as unknown as Response;

  describe('login', () => {
    it('user try to login', async () => {
      jest.spyOn(authService, 'login').mockResolvedValue(loginResult);
      const result = await authController.login(
        loginRequest,
        mockLoginResponse,
      );
      expect(result).toEqual(loginResult);
      expect(mockLoginResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        loginResult.refreshToken,
        {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        },
      );
      const resultWithoutRefreshToken = { ...loginResult };
      delete resultWithoutRefreshToken.refreshToken;
      expect(mockLoginResponse.json).toHaveBeenCalledWith(
        resultWithoutRefreshToken,
      );
    });
  });

  ////////////////////////////////

  const registrationRequest: RegisterUserDto = {
    email: 'alice@prisma.io',
    password: 'alicepassword',
    name: 'alice',
  };

  const regisrationResult: User = {
    email: 'alice@prisma.io',
    roles: [Roles.user],
    id: 1,
    name: 'alice',
    password: 'alicepassword',
  };

  describe('registration', () => {
    it('user try to register', async () => {
      jest.spyOn(authService, 'register').mockResolvedValue(regisrationResult);
      const result = await authController.register(registrationRequest);
      expect(result).toEqual(regisrationResult);
      expect(authService.register).toHaveBeenCalledWith(registrationRequest);
    });
  });

  ////////////////////////////////

  const refreshRequest: AuthDataTransfer = {
    accessToken: 'test',
    refreshToken: 'test',
    user: { email: 'test@gmail.com', id: 1 },
    accessTokenInfo: { email: 'test@gmail.com', id: 1, exp: 100000012 },
    refreshTokenInfo: { email: 'test@gmail.com', id: 1, exp: 100000012 },
  };

  const refreshResult = {
    accessToken: 'sadasdsadsa',
    refreshToken: 'sadasdsadsa',
  };

  const mockRefreshResponse = {
    json: jest.fn().mockReturnValue(refreshResult),
    cookie: jest.fn(),
    status: jest.fn().mockImplementation(function () {
      return this;
    }),
  } as unknown as Response;

  describe('refresh', () => {
    it('user try to refresh token', async () => {
      jest.spyOn(authService, 'addTokensToBlacklist').mockResolvedValue(null);
      jest.spyOn(authService, 'refresh').mockResolvedValue(refreshResult);
      const result = await authController.refresh(
        mockRefreshResponse,
        refreshRequest,
      );
      expect(result).toEqual(refreshResult);
      expect(mockRefreshResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        refreshResult.refreshToken,
        {
          maxAge: 7 * 24 * 60 * 60 * 1000,
          httpOnly: true,
        },
      );
      expect(mockRefreshResponse.status).toHaveBeenCalledWith(200);
      expect(mockRefreshResponse.json).toHaveBeenCalledWith({
        accessToken: refreshResult.accessToken,
      });
    });
  });

  ////////////////////////////////

  const logoutRequest: AuthDataTransfer = {
    accessToken: 'test',
    refreshToken: 'test',
    user: { email: 'test@gmail.com', id: 1 },
    accessTokenInfo: { email: 'test@gmail.com', id: 1, exp: 100000012 },
    refreshTokenInfo: { email: 'test@gmail.com', id: 1, exp: 100000012 },
  };

  const mockLogoutResponse = {
    json: jest.fn().mockReturnValue({ message: 'Successfully logged out' }),
    clearCookie: jest.fn(),
    status: jest.fn().mockImplementation(function () {
      return this;
    }),
  } as unknown as Response;

  describe('logout', () => {
    it('user try to logout', async () => {
      jest.spyOn(authService, 'addTokensToBlacklist').mockResolvedValue(null);
      const result = await authController.logout(
        mockLogoutResponse,
        logoutRequest,
      );
      expect(result).toEqual({ message: 'Successfully logged out' });
      expect(mockLogoutResponse.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        {
          httpOnly: true,
        },
      );
      expect(mockLogoutResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
