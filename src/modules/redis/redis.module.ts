import { Module } from "@nestjs/common";
import { redisClientProvider } from "./redis.provider";
import { RedisCacheService } from "./redis.service";


@Module({
    providers: [RedisCacheService, redisClientProvider],
    exports: [RedisCacheService, redisClientProvider]
})

export class RedisCacheModule { }
