 import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from '../configs/refresh.jwt';

 export async function generateToken(
    _id: string,
    jwtService: JwtService,
    refreshRokenConfig: ConfigType<typeof refreshJwtConfig>
 ) {
    const payload = { sub: _id };

    const [accessToken, refreshToken] = await Promise.all([
        jwtService.signAsync(payload),
        jwtService.signAsync(payload, refreshRokenConfig)
    ])

    return {
        accessToken,
        refreshToken
    }
    }
