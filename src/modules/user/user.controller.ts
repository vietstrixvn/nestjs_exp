import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { AuthStrategy } from "../auth/guards/guard";
import { UserService } from "./user.service";


@Controller('users')
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) {}


    @UseGuards(AuthStrategy)
    @Get('profile')
    async getProfile(
        @Req() req
    ): Promise<any> {
        const user = await this.userService.finOne(req.user._id);
        return user
    }

}
