import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";


@Schema()
export class CategoryEntity {

    @Prop({ type: String, default: () => new Types.ObjectId().toString() })
    _id: string;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ default: () => new Date()})
    createdAt: Date;

    @Prop({ default: () => new Date()})
    updatedAt: Date;
}

export type CategoryDocument = CategoryEntity & Document;
export const CategorySchema = SchemaFactory.createForClass(CategoryEntity);
CategorySchema.set('collection', 'categories');
