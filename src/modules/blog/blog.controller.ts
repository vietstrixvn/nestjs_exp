import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CreateBlogDto, UpdateBlogDto } from "src/dots/blog.dto";
import { AuthStrategy } from "../auth/guards/guard";
import { LuaScriptService } from "../redis/lua.script";
import { RedisCacheService } from "../redis/redis.service";
import { BlogService } from "./blog.service";


@Controller("blogs")
export class BlogController {

    constructor(
        private readonly blogService: BlogService,
        private readonly redisService: RedisCacheService,
        private readonly luaService: LuaScriptService,


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

    @Get('lua')
    async getAllLua(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('categoryId') categoryId?: string
    ) {
        const cachedKey = `blog:test:${startDate || 'all'}: ${endDate || 'all'}:${categoryId || 'all'}`;

        const cached = await this.luaService.get<any>(cachedKey)
        if (cached) {
            return { source: 'cache', ...cached }
        }

        const data = this.blogService.generateFakeBlogs(1000)
        const total = data.length

        await this.luaService.set(cachedKey, { data, total }, 3600)
        return { source: 'db', data, total };
    }

    @Get('reset')
    async resetRedis() {
        await this.luaService.reset()
        return { status: 'Ok' }
    }

    @Get('test')
    async getAllTrad(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('categoryId') categoryId?: string
    ) {
        const cachedKey = `blog:test:${startDate || 'all'}: ${endDate || 'all'}:${categoryId || 'all'}`;

        const cached = await this.redisService.get<any>(cachedKey)
        if (cached) {
            return { source: 'cache', ...cached }
        }

        const data = this.blogService.generateFakeBlogs(1000)
        const total = data.length

        await this.redisService.set(cachedKey, { data, total }, 3600)
        return { source: 'db', data, total };
    }



    @Get('delete-trad')
    async deleteTraditional() {
        const keys = Array.from({ length: 1000 }, (_, i) => `blog:${i + 1}`);
        const start = Date.now();

        for (const key of keys) {
            await this.redisService.del(key);
            Logger.log(`[TRADITIONAL] Deleted key: ${key}`);
        }

        const duration = Date.now() - start;
        return { method: 'traditional', deleted: keys.length, durationMs: duration };
    }



    @Get('delete-lua')
    async deleteLua() {
        const pattern = 'blog:*';
        const start = Date.now();

        let cursor = '0';
        const keysToDelete: string[] = [];

        do {
            const result = await this.luaService.scanKeys(cursor, { match: pattern, count: 1000 });
            cursor = result.cursor;
            keysToDelete.push(...result.keys);
        } while (cursor !== '0');

        keysToDelete.forEach((key) => Logger.log(`[LUA] Will delete key: ${key}`));

        const deleted = await this.luaService.delByPattern(pattern);

        const duration = Date.now() - start;
        return { method: 'lua', deleted, durationMs: duration };
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
