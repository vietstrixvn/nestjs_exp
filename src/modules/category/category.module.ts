import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CategoryEntity, CategorySchema } from "src/entities/category.entity";
import { AuthModule } from "../auth/auth.module";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";


@Module({

    imports: [
        MongooseModule.forFeature([ {name: CategoryEntity.name, schema: CategorySchema} ]),
        AuthModule
    ],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService]
})
export class CategoryModule {}
