import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RolesGuard } from './authorization/guards/roles/roles.guard';

@Module({
    providers: [RolesGuard],
    imports: [
        forwardRef(() =>
            ClientsModule.register([
                {
                    name: 'IAM_SERVICE',
                    transport: Transport.RMQ,
                    options: {
                        urls: [`${process.env.RABBIT_LINK}`],
                        queue: 'iam_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                },
            ]),
        ),
    ],
    exports: [
        RolesGuard,
        forwardRef(() =>
            ClientsModule.register([
                {
                    name: 'IAM_SERVICE',
                    transport: Transport.RMQ,
                    options: {
                        urls: [`${process.env.RABBIT_LINK}`],
                        queue: 'iam_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                },
            ]),
        ),
    ],
})
export class IamModule {}
