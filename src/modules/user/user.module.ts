import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import jwtConfig from "src/configs/jwt.config";
import refreshJwt from "src/configs/refresh.jwt";
import { UserEntity, UserSchema } from "src/entities/userEntity";
import { AuthModule } from "../auth/auth.module";
import { AuthService } from "../auth/auth.service";
import { JwtStrategy } from "../auth/statergies/jwt";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";


@Module({
    imports: [
        MongooseModule.forFeature([ { name: UserEntity.name, schema: UserSchema}]),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(refreshJwt),
        ConfigModule.forFeature(jwtConfig),
        AuthModule,
    ],
    controllers: [UserController],
    providers: [UserService,JwtStrategy, AuthService],
    exports: [UserService]
})

export class UserModule {}
