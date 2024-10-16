import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Keyv } from 'keyv';

@Injectable()
export class CacheService {
  constructor(@Inject('KEYV_INSTANCE') private readonly keyv: Keyv) {}

  async get(key: string): Promise<string> {
    return await this.keyv.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.keyv.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.keyv.delete(key);
  }

  @OnEvent('user.updated')
  async handleUserUpdatedEvent(event: { id: number }) {
    //@ts-ignore
    const store = this.keyv.opts.store;
    //@ts-ignore
    const keys = await store.redis.keys('*');
    const userKey = keys.filter((key: string) =>
      key.startsWith(`keyv:${event.id}`),
    );
    await this.delete(userKey);
  }
}
