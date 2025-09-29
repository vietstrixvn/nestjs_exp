


import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { CategoryEntity } from "./category.entity";


@Schema()
export class BlogEntity {
    @Prop({ type: String, default: () => new Types.ObjectId().toString() })
    _id: string;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ default: () => new Date()})
    createdAt: Date;

    @Prop({ default: () => new Date()})
    updatedAt: Date;

    @Prop({ type: String, ref: CategoryEntity.name})
    categoryId: string;
}

export type BlogDocument = BlogEntity & Document;
export const BlogSchema = SchemaFactory.createForClass(BlogEntity);
BlogSchema.set('collection', 'blogs');
