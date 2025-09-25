import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { UserEntity, UserSchema } from "src/entities/userEntity";
import jwtConfig from '../../configs/jwt.config';
import refreshJwtConfig from '../../configs/refresh.jwt';
import { UserService } from "../user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";


@Module({
    imports: [
        MongooseModule.forFeature([ { name: UserEntity.name, schema: UserSchema}]),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(refreshJwtConfig),
        ConfigModule.forFeature(jwtConfig),

],
    controllers: [
        AuthController
    ],
    providers: [AuthService,UserService],
    exports: [AuthService]
})

export class AuthModule {}
