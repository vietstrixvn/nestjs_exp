import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from '@nestjs/config';
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { CreateUserDto } from "src/dots/user.dto";
import { UserDocument, UserEntity } from "src/entities/userEntity";
import { generateToken } from "src/middlewares/generateToken";
import refreshJwtConfig from '../../configs/refresh.jwt';
import { UserService } from "../user/user.service";


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,

        @InjectModel(UserEntity.name)
        private readonly userModel: Model<UserDocument>,


        private readonly jwtService: JwtService,

        @Inject(refreshJwtConfig.KEY)
        private readonly refeshTokenConfig: ConfigType<typeof refreshJwtConfig>
    ) { }

    async onModuleInit() {
        await this.createAuth();
    }

    async createAuth() {
        const admminUsername = 'admin';

        try {
            const exitingAdmin = await this.userModel.findOne({ username: admminUsername }).exec();
            if (exitingAdmin) {
                console.log("Admin user already exists");
                return exitingAdmin;
            }
            const admin = {
                username: "admin",
                password: "admin123",
                email: "hoangphamm2003.strix@gmail.com",
                role: "admin"
            }

            const user = new this.userModel(admin);
            await user.save();
            console.log("Admin user created successfully");
            return user;
        }
        catch (error) {
            console.error("Error creating admin user", error);
            throw error;
        }
    }


    async login(dto: { username: string; password: string }) {
        const { username, password } = dto;
        if (!dto.password || typeof dto.password !== 'string') {
            throw new Error('Invalid password');
        }
        const user = (await this.userModel
            .findOne({
                $or: [{ username: dto.username }],
            })
            .select('+password')) as UserDocument | null;


        const isValidPassword = user ? await user.comparePassword(dto.password) : false;
        if (!user || !isValidPassword) {
            throw new Error('Invalid credentials');
        }


        const { accessToken, refreshToken } = await generateToken(
            { _id: user._id, role: user.role },
            this.jwtService,
            this.refeshTokenConfig
        )

        return {
            accessToken,
            refreshToken,
            user: await this.userService.finOne(user._id.toString())
        }
    }

    async validateUser(_id: string) {
        const user = await this.userService.finOne(_id)
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async createManager(dto: CreateUserDto): Promise<any> {
        const { username, password, email } = dto;

        const exitingUser = await this.userModel.findOne({ username }).exec();
        if (exitingUser) {
            throw new Error('Username already exists');
        }

        const newUser = new this.userModel({
            username,
            password,
            email,
            role: 'user'
        });

        const savedUser = await newUser.save();
        return {
            message: 'User created successfully',
            user: {
                _id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt
            }
        }
    }

}
