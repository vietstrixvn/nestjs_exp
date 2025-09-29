import { Module } from "@nestjs/common";
import { MongooseModule } from '@nestjs/mongoose';
import { BlogEntity, BlogSchema } from "src/entities/blog.entity";
import { AuthModule } from "../auth/auth.module";
import { CategoryModule } from "../category/category.module";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: BlogEntity.name, schema: BlogSchema }]),
        AuthModule,
        CategoryModule
    ],
    controllers: [BlogController],
    providers: [BlogService],
    exports: [BlogService]
})

export class BlogModule {}
