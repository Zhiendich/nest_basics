import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from 'src/app/auth/auth.module';
import { Roles } from '@prisma/client';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/user/user.service';
import { PrismaService } from 'src/services/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppModule } from 'src/app/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const authService = {
    login: jest.fn().mockReturnValueOnce({
      user: {
        id: 3,
        email: 'alice@prisma.io',
        name: 'Alice',
        roles: [Roles.user],
      },
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    }),
    validateUser: jest.fn().mockReturnValueOnce({
      id: 3,
      email: 'alice@prisma.io',
      name: 'Alice',
      roles: [Roles.user],
    }),
    generateTokens: jest.fn(),
    register: jest.fn().mockReturnValueOnce({
      user: {
        id: 3,
        email: 'alice@prisma.io',
        name: 'Alice',
        roles: [Roles.user],
      },
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    }),
  };
  const userService = { findOne: jest.fn() };
  const prismaService = { findOne: jest.fn() };
  const jwtService = { sign: jest.fn(), verify: jest.fn() };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') {
        return 'test_access_jwt_secret';
      }
      if (key === 'JWT_REFRESH_SECRET') {
        return 'test_refresh_jwt_secret';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, AppModule],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .overrideProvider(UserService)
      .useValue(userService)
      .overrideProvider(PrismaService)
      .useValue(prismaService)
      .overrideProvider(JwtService)
      .useValue(jwtService)
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  ////////////////////

  it('Login user incorectly', async () => {
    authService.login.mockRejectedValueOnce({
      statusCode: 401,
      message: 'Unauthorized',
    });

    return await request(app.getHttpServer())
      .post('/auth/login')
      .expect(401)
      .expect({ message: 'Unauthorized', statusCode: 401 });
  });

  it('Login user corectly', async () => {
    authService.login.mockResolvedValueOnce({
      user: {
        id: 3,
        email: 'alice@prisma.io',
        name: 'Alice',
        roles: [Roles.user],
      },
      accessToken: 'accessToken',
    });

    return await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'alice@prisma.io',
        password: 'alicepassword',
      })
      .expect(201)
      .expect({
        user: {
          id: 3,
          email: 'alice@prisma.io',
          name: 'Alice',
          roles: [Roles.user],
        },
        accessToken: 'accessToken',
      });
  });

  ////////////////////

  it('Register user', async () => {
    authService.register.mockRejectedValueOnce({
      user: {
        id: 3,
        email: 'alice@prisma.io',
        name: 'Alice',
        roles: [Roles.user],
        password: 'alicepassword',
      },
      accessToken: 'accessToken',
    });

    return await request(app.getHttpServer())
      .post('/auth/register')
      .expect(201)
      .expect({
        user: {
          id: 3,
          email: 'alice@prisma.io',
          name: 'Alice',
          roles: [Roles.user],
        },
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      });
  });
});
