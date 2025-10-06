
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
    @IsString()
    username: string

    @IsString()
    password: string

    @IsString()
    email: string
}



export class CreateUserGoogleDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    sub: string;

}
