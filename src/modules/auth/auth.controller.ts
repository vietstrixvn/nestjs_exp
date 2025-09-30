import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "src/dots/user.dto";
import { AuthService } from "./auth.service";
import { Roles } from "./decorator/role";
import { AuthStrategy } from "./guards/guard";
import { RolesGuard } from "./guards/role.guard";

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) { }

    @Post('login')
    async login(
        @Body() dto: any
    ) {
        const loginResult = await this.authService.login(dto);
        return loginResult;
    }

    @Post('create-user')
    @UseGuards(AuthStrategy, RolesGuard)
    @Roles('admin')
    async create(
        @Body() dto: CreateUserDto
    ) {
        const user = await this.authService.createManager(dto);
        return user;
    }
}
