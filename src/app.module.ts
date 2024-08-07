import {
    forwardRef,
    MiddlewareConsumer,
    Module,
    ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule } from '@nestjs/throttler';
import { Redis } from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { DatabaseModule } from './database/database.module';
import { HttpExceptionFilter } from './exception-filters/http.exception-filter';
import { ValidationExceptionFilter } from './exception-filters/validation-exception.filter';
import { AccessTokenGuards } from './iam/guards/access-token.guard';
import { IamModule } from './iam/iam.module';
import { ListNameWorkModule } from './list-name-work/list-name-work.module';
import { CheckToken } from './middlewares/check-token.middleware';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { NameWorkModule } from './name-work/name-work.module';
import { NameListModule } from './name_list/name_list.module';
import { ObjectsModule } from './objects/objects.module';
import { RedisModule } from './redis/redis.module';
import { ScopeWorkModule } from './scope-work/scope-work.module';
import { TableAddingDataModule } from './table-adding-data/table-adding-data.module';
import { TypeWorkModule } from './type-work/type-work.module';
import { UnitModule } from './unit/unit.module';

@Module({
    imports: [
        // CacheModule.register({
        //   ttl: 60,
        //   isGlobal: true,
        // }),
        ConfigModule.forRoot({
            envFilePath: `${process.env.NODE_ENV}.env`,
        }),
        SequelizeModule.forRoot({
            dialect: 'mysql',
            host: process.env.MYSQL_HOST,
            port: Number(process.env.MYSQL_PORT),
            username: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            timezone: '+03:00',
            models: [],
            autoLoadModels: true,
            synchronize: true,
            // sync: { force: true },
        }),
        forwardRef(() =>
            ClientsModule.register([
                {
                    name: 'IAM_SERVICE',
                    transport: Transport.RMQ,
                    options: {
                        urls: ['amqp://localhost:5672'],
                        queue: 'iam_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                },
            ]),
        ),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60,
                    limit: 10,
                },
            ],
            storage: new ThrottlerStorageRedisService(
                new Redis({
                    host: process.env.REDIS_HOST,
                    port: Number(process.env.REDIS_PORT),
                }),
            ),
        }),
        ObjectsModule,
        TypeWorkModule,
        ScopeWorkModule,
        NameWorkModule,
        UnitModule,
        ListNameWorkModule,
        NameListModule,
        TableAddingDataModule,
        DatabaseModule,
        RedisModule,
        IamModule,
    ],

    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AccessTokenGuards,
        },
        {
            provide: APP_PIPE,
            useClass: ValidationPipe,
        },
        {
            provide: APP_FILTER,
            useClass: ValidationExceptionFilter,
        },
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
        // {
        //     provide: APP_GUARD,
        //     useClass: ThrottlerBehindProxyGuard,
        // },
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware, CheckToken).forRoutes('*');
    }
}
