import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import googleConfig from "src/configs/google.config";
import { UserEntity, UserSchema } from "src/entities/userEntity";
import jwtConfig from '../../configs/jwt.config';
import refreshJwtConfig from '../../configs/refresh.jwt';
import { UserService } from "../user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthStrategy } from "./guards/guard";
import { RolesGuard } from "./guards/role.guard";
import { GoogleStrategy } from "./statergies/google";
import { JwtStrategy } from "./statergies/jwt";


@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([{ name: UserEntity.name, schema: UserSchema }]),
        JwtModule.registerAsync(jwtConfig.asProvider()),
        ConfigModule.forFeature(refreshJwtConfig),
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(googleConfig),

    ],
    controllers: [
        AuthController
    ],
    providers: [AuthService, UserService, JwtStrategy, AuthStrategy, RolesGuard, GoogleStrategy],
    exports: [AuthService, RolesGuard]
})

export class AuthModule { }
