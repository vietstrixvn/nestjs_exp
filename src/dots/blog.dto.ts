import { IsNotEmpty, IsString } from 'class-validator';


export class CreateBlogDto {
    @IsNotEmpty()
    @IsString()
    title: string


    @IsNotEmpty()
    @IsString()
    content: string

    @IsString()
    categoryId: string
}


export class UpdateBlogDto {
    @IsString()
    title?: string

    @IsString()
    content?: string

    @IsString()
    categoryId?: string
}
