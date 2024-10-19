import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthDataTransfer } from 'src/types/auth.types';

export const GetJwtPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthDataTransfer => {
    const request = ctx.switchToHttp().getRequest();
    const accessToken = request.headers.authorization.split(' ')[1];
    const refreshToken = request.cookies.refreshToken;
    return {
      user: request.user,
      accessTokenInfo: request.accessTokenInfo,
      refreshTokenInfo: request.refreshTokenInfo,
      accessToken,
      refreshToken,
    };
  },
);
