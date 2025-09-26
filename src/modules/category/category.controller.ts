import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CreateCategoryDto } from "src/dots/category.dto";
import { AuthStrategy } from "../auth/guards/guard";
import { CategoryService } from "./category.service";


@Controller('categories')
export class CategoryController {

    constructor(
        private readonly categoryService: CategoryService
    ){}

    @Post()
    @UseGuards(AuthStrategy)
    async createCategory(@Body() dto: CreateCategoryDto) {
        const category = await this.categoryService.create(dto);
        return category;
    }

    @Get()
    async getAllCategories() {
        const categories = await this.categoryService.findAll();
        return categories;
    }
}
