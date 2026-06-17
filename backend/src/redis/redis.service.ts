import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;
const LOCKOUT_WINDOW_SECONDS = 15 * 60;
const LOCKOUT_THRESHOLD = 10;

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis(config.get<string>('REDIS_URL')!);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  private refreshKey(userId: string, jti: string) {
    return `refresh:${userId}:${jti}`;
  }

  async storeRefreshToken(userId: string, jti: string): Promise<void> {
    await this.client.set(this.refreshKey(userId, jti), '1', 'EX', REFRESH_TOKEN_TTL_SECONDS);
  }

  async isRefreshTokenValid(userId: string, jti: string): Promise<boolean> {
    const value = await this.client.get(this.refreshKey(userId, jti));
    return value !== null;
  }

  async revokeRefreshToken(userId: string, jti: string): Promise<void> {
    await this.client.del(this.refreshKey(userId, jti));
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    const keys = await this.client.keys(`refresh:${userId}:*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  private lockoutKey(email: string) {
    return `login_failures:${email}`;
  }

  async recordLoginFailure(email: string): Promise<number> {
    const key = this.lockoutKey(email);
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, LOCKOUT_WINDOW_SECONDS);
    }
    return count;
  }

  async clearLoginFailures(email: string): Promise<void> {
    await this.client.del(this.lockoutKey(email));
  }

  async isLockedOut(email: string): Promise<boolean> {
    const count = await this.client.get(this.lockoutKey(email));
    return count !== null && parseInt(count, 10) >= LOCKOUT_THRESHOLD;
  }
}
