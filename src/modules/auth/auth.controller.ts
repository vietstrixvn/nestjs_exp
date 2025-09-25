import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ){}

    @Post('login')
    async login(
        @Body() dto: any
    ) {
    const loginResult = await this.authService.login(dto);
    return loginResult;
}

}
