import { Logger, Provider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from 'ioredis';


export const redisClientProvider: Provider = {
    provide: 'REDIS_CLIENT',
    useFactory: (config: ConfigService) => {
        const host = "localhost"
        const port = 6379
        const password = "Admin123"
        const db = 0

        const client = new Redis({ host, port, password, db })

        client.on('connect', () => Logger.debug('Redis connected !'))
        client.on('error', (err) => Logger.error('Connection error', err))

        return client
    },
    inject: [ConfigService]
}
