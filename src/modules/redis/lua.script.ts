import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import * as fs from "fs";
import Redis from "ioredis";
import * as path from "path";


@Injectable()
export class LuaScriptService implements OnModuleInit, OnModuleDestroy {
    private scripts: Record<string, string> = {}

    constructor(
        @Inject("REDIS_CLIENT")
        private readonly redisClient: Redis
    ) { }

    async onModuleInit() {
        try {
            const filePath = path.join(process.cwd(), "src/modules/redis/cache.lua");
            const code = fs.readFileSync(filePath, "utf8");

            const sha = (await this.redisClient.script("LOAD", code)) as string;
            this.scripts["cache"] = sha,

                Logger.log("Lua script [cache.lua] loaded successfully! ")
        } catch (err) {
            Logger.error('Failed to load file: ', err)
        }
    }

    async onModuleDestroy() {
        await this.redisClient.quit()
    }

    // === GET ===
    async get<T>(key: string): Promise<T | null> {
        try {
            const raw = (await this.redisClient.evalsha(
                this.scripts["cache"],
                1,
                key,
                "get"
            )) as string | null;

            if (raw) {
                Logger.log(`[Redis] Cache HIT for key: ${key}`);
                return JSON.parse(raw) as T;
            } else {
                Logger.warn(`[Redis] Cache MISS for key: ${key}`);
                return null;
            }
        } catch (e) {
            Logger.error("[Redis] Get error:", e);
            return null;
        }
    }

    // === SET ===
    async set(key: string, value: any, ttl: number = 60): Promise<void> {
        const data = JSON.stringify(value)
        await this.redisClient.evalsha(
            this.scripts["cache"],
            1,
            key,
            "set",
            data,
            ttl.toString()
        );

        Logger.log(`[REDIS] Cache SET key ${key} (TTL: ${ttl}s)`)
    }

    // === DEL ===
    async del(key: string): Promise<void> {
        await this.redisClient.evalsha(this.scripts["cache"], 1, key, "del")
        Logger.log(`[REDIS] Cache DEL ket: ${key}`)
    }

    // === DEL BY PATTERN ===
    async delByPattern(pattern: string): Promise<void> {
        const deleted = (await this.redisClient.evalsha(
            this.scripts["cache"],
            1,
            pattern,
            "delByPattern"
        )) as number

        if (deleted > 0) {
            Logger.log(`[REDIS] Deleted ${deleted} kets matching pattern '${pattern}'`)
        } else {
            Logger.warn(`[REDIS] No keys matched pattern ${pattern}`)
        }
    }

    async reset(): Promise<void> {
        await this.redisClient.evalsha(
            this.scripts["cache"],
            0,
            "",
            "reset"
        )
        Logger.warn(`[REDIS] All cache flushed!`)
    }

    async scanKeys(cursor: string = '0', options: { match?: string; count?: number } = {}) {
        let result: [string, string[]];

        if (options.match && options.count) {
            result = await this.redisClient.scan(cursor, 'MATCH', options.match, 'COUNT', options.count.toString());
        } else if (options.match) {
            result = await this.redisClient.scan(cursor, 'MATCH', options.match);
        } else if (options.count) {
            result = await this.redisClient.scan(cursor, 'COUNT', options.count.toString());
        } else {
            result = await this.redisClient.scan(cursor);
        }

        const [newCursor, keys] = result;
        return { cursor: newCursor, keys };
    }

}
