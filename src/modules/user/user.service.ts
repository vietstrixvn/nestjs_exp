import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { CreateUserDto, CreateUserGoogleDto } from "src/dots/user.dto";
import { UserEntity } from "src/entities/userEntity";

@Injectable()
export class UserService {

    constructor(
        @InjectModel(UserEntity.name)
        private readonly userModel: Model<UserEntity>
    ) { }


    async create(createUser: CreateUserDto) {
        const user = new this.userModel({
            ...createUser
        })
        return await user.save()
    }

    async findOne(_id: string) {
        const user = await this.userModel.findById(_id).exec()
        return user
    }


    async ggCreate(createUserDto: CreateUserGoogleDto) {
        const user = new this.userModel(createUserDto);
        return await user.save();
    }
}
