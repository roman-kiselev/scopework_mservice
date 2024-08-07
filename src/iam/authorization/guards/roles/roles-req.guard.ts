import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { RoleName } from 'src/iam/enums/RoleName';
import { ROLES_KEY } from '../../decorators/roles.decorator';

@Injectable()
export class RolesReqGuard implements CanActivate {
    constructor(
        @Inject('IAM_SERVICE') private readonly client: ClientProxy,
        private reflector: Reflector,
    ) {}

    private async getRoles(accessToken: string) {
        try {
            const roles = await firstValueFrom(
                this.client.send('get-roles', accessToken),
            );
            return roles;
        } catch (e) {
            throw new UnauthorizedException('Not authorized');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const contextRoles = this.reflector.getAllAndOverride<RoleName[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!contextRoles) return true;
        const req = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(req);
        const rolesToken: RoleName[] = await this.getRoles(token);

        return contextRoles.some((role) => {
            return rolesToken.some((userRole) => userRole === role);
        });
    }
}
