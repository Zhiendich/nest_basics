import { Global, Module } from '@nestjs/common';
import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheService } from 'src/services/cache.service';

@Global()
@Module({
  providers: [
    {
      provide: 'KEYV_INSTANCE',
      useFactory: () =>
        new Keyv({
          store: new KeyvRedis('redis://localhost:6379'),
        }),
    },
    CacheService,
  ],
  exports: ['KEYV_INSTANCE', CacheService],
})
export class CacheModule {}
