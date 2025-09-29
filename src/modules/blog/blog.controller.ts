import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CreateBlogDto, UpdateBlogDto } from "src/dots/blog.dto";
import { AuthStrategy } from "../auth/guards/guard";
import { BlogService } from "./blog.service";


@Controller("blogs")
export class BlogController {

    constructor(
        private readonly blogService: BlogService
    ) { }

    @Post()
    @UseGuards(AuthStrategy)
    async create(
        @Body() dto: CreateBlogDto,
        @Req() req
    ) {
        const blog = await this.blogService.create(dto);
        return blog;
    }

    @Get()
    async getAll(
        @Query('categoryId') categoryId?: string,
    ) {
        const blogs = await this.blogService.findAll(undefined, undefined, categoryId);
        return blogs;
    }


    @Get(':id')
    async getOne(
        @Param('id') id: string) {
        const blog = await this.blogService.findById(id);
        return blog;
    }

    @Delete(':id')
    @UseGuards(AuthStrategy)
    async deleteBlog(
        @Param('id') id: string,
        @Req() req
    ) {
        const deleteBlog = await this.blogService.delete(id)
        return deleteBlog
    }


    @Patch(':id')
    @UseGuards(AuthStrategy)
    async updateBlog(
        @Param('id') id: string,
        @Body() dto: UpdateBlogDto,
        @Req() req
    ) {
        const updatedBlog = await this.blogService.update(id, dto)
        return updatedBlog
    }
}
