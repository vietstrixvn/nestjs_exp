import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import googleConfig from './configs/google.config';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { CategoryModule } from './modules/category/category.module';
import { DatabaseModule } from './modules/database';
import { RedisCacheModule } from './modules/redis/redis.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [googleConfig],
      envFilePath: '.env',
    }),
    DatabaseModule,
    RedisCacheModule,
    
    UserModule,
    AuthModule,

    CategoryModule,
    BlogModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
