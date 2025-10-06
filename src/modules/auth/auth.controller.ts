import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "src/dots/user.dto";
import { AuthService } from "./auth.service";
import { Roles } from "./decorator/role";
import { GoogleAuthGuard } from "./guards/google.guard";
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


    @Get('google/login')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() { }

    @UseGuards(GoogleAuthGuard)
    @Get('google/callback')
    async GGCallback(
        @Req() req,
        @Res() res
    ) {
        const response = await this.authService.OAuthLogin(req.user.id)
        return res.send(`Login successfully: ${response.accessToken}`)
    }
}
