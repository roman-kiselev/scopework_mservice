import { Module } from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';
import { IamModule } from 'src/iam/iam.module';
import { ListNameWorkModule } from 'src/list-name-work/list-name-work.module';
import { NameListModule } from 'src/name_list/name_list.module';
import { RedisModule } from 'src/redis/redis.module';
import { ScopeWorkModule } from 'src/scope-work/scope-work.module';
import { TableAddingDataModule } from 'src/table-adding-data/table-adding-data.module';
import { TypeWorkModule } from 'src/type-work/type-work.module';
import { ObjectTypeWork } from './entities/objects-type_work.model';
import { Objects } from './entities/objects.model';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';

@Module({
    controllers: [ObjectsController],
    providers: [ObjectsService],
    imports: [
        forwardRef(() => TableAddingDataModule),
        forwardRef(() => NameListModule),
        SequelizeModule.forFeature([Objects, ObjectTypeWork]),
        IamModule,
        forwardRef(() =>
            ClientsModule.register([
                {
                    name: 'USER_MAIN_SERVICE',
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
        RedisModule,
        forwardRef(() => ListNameWorkModule),
        TypeWorkModule,
        forwardRef(() => ScopeWorkModule),
    ],
    exports: [
        ObjectsService,
        SequelizeModule.forFeature([Objects, ObjectTypeWork]),
    ],
})
export class ObjectsModule {}
