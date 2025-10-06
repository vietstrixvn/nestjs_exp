import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from 'src/types/jwt';
import refreshJwtConfig from '../configs/refresh.jwt';

export async function generateTokens(
    _id: string,
    jwtService: JwtService,
    refreshTokenConfig: ConfigType<typeof refreshJwtConfig>
) {
    const payload: AuthJwtPayload = { sub: _id };

    const [accessToken, refreshToken] = await Promise.all([
        jwtService.signAsync(payload),
        jwtService.signAsync(payload, refreshTokenConfig),
    ]);

    return {
        accessToken,
        refreshToken,
    };
}
