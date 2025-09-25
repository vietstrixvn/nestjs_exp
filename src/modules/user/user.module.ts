import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserEntity, UserSchema } from "src/entities/userEntity";
import { UserService } from "./user.service";


@Module({
    imports: [
        MongooseModule.forFeature([ { name: UserEntity.name, schema: UserSchema}])
    ],
    controllers: [],
    providers: [UserService],
    exports: [UserService]
})

export class UserModule {}
