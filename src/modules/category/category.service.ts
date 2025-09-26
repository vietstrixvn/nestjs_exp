import { Injectable } from "@nestjs/common";
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
        const {title}= dto
        if (!title || title.trim() === '') {
            throw new Error('Title is required');
        }
        const existingCategory = await this.categoryModel.findOne({
            $or: [{title}]
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

}
