import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as argon2 from 'argon2';
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class UserEntity {
  @Prop({ type: String, default: () => new Types.ObjectId().toString() })
  _id: string;

  @Prop({ type: String, unique: true, sparse: true })
  username?: string

  @Prop({ type: String, required: false })
  password?: string

  @Prop({ type: String, required: true })
  email: string


  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: string

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop({ default: () => new Date() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserEntity)
UserSchema.set('collection', 'users')

UserSchema.pre<UserEntity & Document>('save', async function (next) {
  if (this.isModified('password')) {
    if (!this.password) return next(new Error('Password is required'));
    this.password = await argon2.hash(this.password);
  }
  next();
});


UserSchema.methods.comparePassword = async function (
  this: UserEntity & Document,
  attempt: string
): Promise<boolean> {
  if (!attempt || !this.password) return false;
  return await argon2.verify(this.password, attempt);
};


export interface UserDocument extends Document {
  _id: string,
  role: string,
  username: string,
  password: string,
  email: string,
  createdAt: Date,
  updatedAt: Date,
  comparePassword(attempt: string): Promise<boolean>;
}
