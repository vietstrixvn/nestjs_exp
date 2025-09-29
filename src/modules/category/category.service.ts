import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { CreateCategoryDto } from "src/dots/category.dto";
import { CategoryDocument, CategoryEntity } from "src/entities/category.entity";


@Injectable()
export class CategoryService {

  constructor(
    @InjectModel(CategoryEntity.name)
    private readonly categoryModel: Model<CategoryDocument>
  ) { }

  async create(dto: CreateCategoryDto): Promise<any> {
    const { title } = dto
    if (!title || title.trim() === '') {
      throw new Error('Title is required');
    }
    const existingCategory = await this.categoryModel.findOne({
      $or: [{ title }]
    })
    if (existingCategory) {
      throw new Error('Category already exists');
    }
    const newCategory = new this.categoryModel({ title });
    try {
      const saved = await newCategory.save();
      return saved;
    } catch (error) {
      throw new Error('Error saving category: ' + error.message);
    }
  }


  async findAll(
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: any[]; total: number }> {
    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    const data = await this.categoryModel
      .find(filter)
      .sort({ _id: -1 })
      .exec();
    const total = await this.categoryModel.countDocuments(filter);
    return { data, total };
  }


  async validateCategory(categoryId: string): Promise<boolean> {
    try {
      const category = await this.categoryModel.findById(categoryId).exec();
      return !!category;
    }
    catch (error) {
      return false;
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id)
    return Logger.debug(`Delete blog successfully! ${result} `)
  }

  async update(
    _id: string,
    updateData: { title: string }
  ): Promise<CategoryDocument> {
    const category = await this.categoryModel.findById(_id);
    if (!category) {
      throw new Error('Category not found'
      );
    }

    if (!updateData.title || updateData.title.trim() === '') {
      throw new Error('Category name is required'
      );
    }

    const normalizedName = updateData.title.trim();
    if (normalizedName === category.title) {
      return category;
    }

    const existingCategory = await this.categoryModel.findOne({
      _id: { $ne: _id },
      name: normalizedName,
    });

    if (existingCategory) {
      throw new Error('Category name already exists'
      );
    }
    try {
      const updateResult = await this.categoryModel.findByIdAndUpdate(
        _id,
        { title: normalizedName, updatedAt: new Date() },
        { new: true }
      );

      if (!updateResult) {
        throw new Error('Failed to update category'
        );
      }

      return updateResult;
    } catch (err) {
      if (err.code === 11000) {
        throw new Error('Category name already exists'
        );
      }
      throw err;
    }
  }
}
