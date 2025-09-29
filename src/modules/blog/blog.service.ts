import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { CreateBlogDto, UpdateBlogDto } from "src/dots/blog.dto";
import { BlogDocument, BlogEntity } from "src/entities/blog.entity";
import { CategoryService } from "../category/category.service";



@Injectable()
export class BlogService {
  constructor(
    @InjectModel(BlogEntity.name)
    private readonly blogModel: Model<BlogDocument>,
    private readonly categoryService: CategoryService
  ) { }

  async create(dto: CreateBlogDto): Promise<any> {
    const { title, content, categoryId } = dto;
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }

    const [exits, isValidCategory] = await Promise.all([

      this.blogModel.findOne({ title }),
      this.categoryService.validateCategory(categoryId)
    ])

    if (exits) {
      throw new Error('Blog already exists');
    }

    if (!isValidCategory) {
      throw new Error('Invalid category');
    }

    const newBlog = new this.blogModel
      ({ title, content, categoryId });

    try {
      const saved = await newBlog.save();
      return saved;
    }
    catch (error) {
      throw new Error('Error saving blog: ' + error.message);
    }
  }

  async findAll(
    startDate?: string,
    endDate?: string,
    categoryId?: string
  ): Promise<{ data: any[]; total: number }> {

    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (categoryId) {
      const isValidCategory = await this.categoryService.validateCategory(categoryId);
      if (!isValidCategory) {
        throw new Error('Invalid category');
      }
      filter.categoryId = categoryId;
    }

    const data = await this.blogModel
      .find(filter)
      .populate('categoryId', '_id , title')
      .sort({ createAt: -1 })
      .exec();
    const total = await this.blogModel.countDocuments(filter);
    return { data, total };
  }

  async findById(id: string): Promise<any> {

    const blog = await this.blogModel.findOne({ _id: id }).exec();

    if (!blog) {
      throw new Error('Blog not found');
    }

    const result = await this.blogModel
      .findById(id)
      .populate('categoryId', '_id , title')
      .exec();

    return result;
  }


  async delete(id: string): Promise<void> {
    const result = await this.blogModel.findByIdAndDelete(id)
    return Logger.debug(`Delete blog successfully! ${result} `)
  }


  async update(
    id: string,
    updateData: UpdateBlogDto
  ): Promise<BlogDocument> {
    const blog = await this.blogModel.findById(id);

    if (!blog) {
      throw new Error('Blog not found');
    }

    if (updateData.title && updateData.title.trim() === '') {
      throw new Error('Title is required');
    }

    const promises: Promise<any>[] = [
      updateData.title && updateData.title !== blog.title
        ? this.blogModel.findOne({ title: updateData.title }).exec()
        : Promise.resolve(null),

      updateData.categoryId && updateData.categoryId !== blog.categoryId
        ? this.categoryService.validateCategory(updateData.categoryId)
        : Promise.resolve(true),
    ];

    const [exitingBlog, isValidCategory] = await Promise.all(promises);



    if (exitingBlog) {
      throw new Error('Blog title already exists');
    }

    if (!isValidCategory) {
      throw new Error('Invalid category');
    }

    try {
      const updatedBlog = await this.blogModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true }
      ).exec();
      if (!updatedBlog) {
        throw new Error('Failed to update blog');
      }
      return updatedBlog;
    } catch (error) {
      throw new Error('Error updating blog: ' + error.message);
    }
  }

}
