import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Redis } from 'ioredis';


@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
    constructor(
        @Inject('REDIS_CLIENT')
        private readonly redisClient: Redis
    ) { }

    onModuleInit() {
        this.redisClient.on('connect', () => {
            Logger.debug('Redis connected successfully');
        });
        this.redisClient.on('error', (error) => {
            Logger.error('[Redis] Connection error:', error);
        });
        this.redisClient.on('reconnecting', () => {
            Logger.warn('[Redis] Reconnecting...');
        });
    }

    async onModuleDestroy() {
        if (this.redisClient) {
            await this.redisClient.quit();
            Logger.log('Redis client connection closed');
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const raw = await this.redisClient.get(key);
            if (raw) {
                Logger.log(`Cache HIT for key: ${key}`);
                return JSON.parse(raw) as T;
            } else {
                Logger.warn(`Cache MISS for key: ${key}`);
                return null;
            }
        } catch (error) {
            Logger.error('Error getting value from Redis', error);
            return null;
        }
    }

    async set(key: string, value: any, ttl: number = 60): Promise<void> {
        try {
            const stringValue = JSON.stringify(value);
            await this.redisClient.set(key, stringValue, 'EX', ttl);
            Logger.log(`Cache SET for key: ${key} with TTL: ${ttl}s`);
        } catch (error) {
            Logger.error('Error setting value to Redis', error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.redisClient.del(key);
            Logger.log(`Cache DEL for key: ${key}`);
        } catch (error) {
            Logger.error('Error deleting key from Redis', error);
        }
    }


    async reset(): Promise<void> {
        try {
            await this.redisClient.flushall();
            Logger.log('Redis cache flushed');
        } catch (error) {
            Logger.error('Error flushing Redis cache', error);
        }
    }

    async delByPattern(pattern: string): Promise<void> {
        try {
            const keys = await this.redisClient.keys(pattern);
            if (keys.length > 0) {
                await this.redisClient.del(...keys);
                Logger.log(
                    `Deleted ${keys.length} keys with pattern '${pattern}'`
                );
            }
        } catch (error) {
            Logger.error('Error deleting keys by pattern', error);
        }
    }
}
