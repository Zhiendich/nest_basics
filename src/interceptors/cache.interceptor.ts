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
    const body = request.body;
    const { id } = request.params;

    const ttl =
      this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler()) ||
      10 * 1000;
    const stringBody = JSON.stringify(body);

    const cachedResponse = await this.cacheService.get(id + key + stringBody);
    if (cachedResponse) {
      return of(JSON.parse(cachedResponse));
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.set(
          id + key + stringBody,
          JSON.stringify(response),
          ttl,
        );
      }),
    );
  }
}
