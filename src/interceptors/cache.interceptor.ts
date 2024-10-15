import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from 'src/services/cache.service';
import { Reflector } from '@nestjs/core';
import { CACHE_TTL_KEY } from 'src/decorators/cache-ttl.decorator';

@Injectable()
export class CustomCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const key = request.url;

    const ttl =
      this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler()) ||
      10 * 1000;

    const cachedResponse = await this.cacheService.get(key);
    if (cachedResponse) {
      return of(JSON.parse(cachedResponse));
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.set(key, JSON.stringify(response), ttl);
      }),
    );
  }
}
