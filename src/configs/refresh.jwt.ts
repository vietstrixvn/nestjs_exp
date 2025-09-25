import { registerAs } from '@nestjs/config';
import { JwtSignOptions } from "@nestjs/jwt";

export default registerAs('refreshToken', (): JwtSignOptions => {
    return {
        secret: '23123353534514123123123',
        expiresIn: '7d',
    }
})
