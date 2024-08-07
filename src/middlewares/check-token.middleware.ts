import {
    Inject,
    Injectable,
    NestMiddleware,
    UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { NextFunction, Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CheckToken implements NestMiddleware {
    constructor(@Inject('IAM_SERVICE') private readonly client: ClientProxy) {}

    private async checkToken(accessToken: string) {
        try {
            const token = await firstValueFrom(
                this.client.send('check-token', accessToken),
            );
            return token;
        } catch (e) {
            throw new UnauthorizedException('Not authorized');
        }
    }

    async use(req: Request, res: Response, next: NextFunction) {
        if (!req.headers.authorization) {
            throw new UnauthorizedException('Not authorized');
        }
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            new UnauthorizedException('Not authorized');
        }
        await this.checkToken(token);
        next();
    }
}
