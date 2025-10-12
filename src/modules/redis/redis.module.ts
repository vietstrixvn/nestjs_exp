import { Module } from "@nestjs/common";
import { LuaScriptService } from "./lua.script";
import { redisClientProvider } from "./redis.provider";
import { RedisCacheService } from "./redis.service";


@Module({
    providers: [RedisCacheService, redisClientProvider, LuaScriptService],
    exports: [RedisCacheService, redisClientProvider, LuaScriptService]
})

export class RedisCacheModule { }
