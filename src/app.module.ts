import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { BlogModule } from './modules/blog/blog.module';
import { CategoryModule } from './modules/category/category.module';
import { DatabaseModule } from './modules/database';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    DatabaseModule,

    UserModule,
    AuthModule,

    CategoryModule,
    BlogModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
