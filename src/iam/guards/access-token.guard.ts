import {
    CanActivate,
    ExecutionContext,
    Inject,
    UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { REQUEST_USER_KEY } from '../iam.constants';
import { ActiveUserData } from '../interfaces/active-user-data.interface';

export class AccessTokenGuards implements CanActivate {
    constructor(@Inject('IAM_SERVICE') private readonly client: ClientProxy) {}

    private async getUserDto(accessToken: string) {
        try {
            const user: ActiveUserData = await firstValueFrom(
                this.client.send('get-user', accessToken),
            );
            return user;
        } catch (e) {
            throw new UnauthorizedException('Not authorized');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [, token] = request.headers.authorization?.split(' ') ?? [];
        return token;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.getUserDto(token);

            request[REQUEST_USER_KEY] = payload;
        } catch (e) {
            throw new UnauthorizedException();
        }

        return true;
    }
}
