import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
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

    @Delete(':id')
    @UseGuards(AuthStrategy)
    async deleteBlog(
        @Param('id' ) id :string,
        @Req() req
    ) {
        const deleteBlog = await this.categoryService.delete(id)
        return deleteBlog
    }

    @Patch(':id')
    @UseGuards(AuthStrategy)
    async updateCategory(
        @Param('id') id: string,
        @Body() dto: any,
        @Req() req
    ) {
        const updatedCategory = await this.categoryService.update(id, dto)
        return updatedCategory
    }
}
