import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from "../auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private authService: AuthService
    ) {
        super({
            clientID: configService.get<string>('googleOAuth.clientID'),
            clientSecret: configService.get<string>('googleOAuth.clientSecret'),
            callbackURL: configService.get<string>('googleOAuth.callbackURL'),
            scope: ['email', 'profile'],
        })
    }

    async vilidate(profile: any) {
        console.log({ profile })

        const user = await this.authService.ValidateGoogle({
            email: profile.emails[0].value,
            sub: profile.id
        })

        return user
    }
}
