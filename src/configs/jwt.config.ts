import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs('jwt', (): JwtModuleOptions => {

  return {
    secret: '23123353534514123123123',
    signOptions: {
      expiresIn: '20m',
    },
  };
});
