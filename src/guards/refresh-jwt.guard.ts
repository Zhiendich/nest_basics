import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CacheService } from 'src/services/cache.service';

@Injectable()
export class RefreshJwtGuard extends AuthGuard('jwt-refresh') implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: CacheService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());

    if (isPublic) {
      return true;
    }

    const request: Request = context.switchToHttp().getRequest();
    const token = request.cookies.refreshToken;
    const isBlacklisted = await this.redis.get(token);
    if (isBlacklisted) {
      return false;
    }
    const canActivateResult = await Promise.resolve(super.canActivate(context));

    return canActivateResult as boolean;
  }
}
