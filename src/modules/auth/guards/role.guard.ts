// roles.guard.ts
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/role';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!roles || roles.length === 0) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user) throw new ForbiddenException('Chưa đăng nhập');
        if (!user.role) throw new ForbiddenException('Không có role trong token');
        if (!roles.includes(user.role))
            throw new ForbiddenException(`Cần quyền: ${roles}, nhưng bạn là: ${user.role}`);

        return true;
    }
}
