import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';
import { DatabaseModule } from 'src/database/database.module';
import { IamModule } from 'src/iam/iam.module';
import { ListNameWorkModule } from 'src/list-name-work/list-name-work.module';
import { NameListModule } from 'src/name_list/name_list.module';
import { ObjectsModule } from 'src/objects/objects.module';
import { TableAddingDataModule } from 'src/table-adding-data/table-adding-data.module';
import { TypeWorkModule } from 'src/type-work/type-work.module';
import { ScopeWork } from './entities/scope-work.model';
import { UserScopeWork } from './entities/user-scope-work.model';
import { ScopeWorkUserService } from './scope-work-user.service';
import { ScopeWorkController } from './scope-work.controller';
import { ScopeWorkService } from './scope-work.service';

@Module({
    controllers: [ScopeWorkController],
    providers: [ScopeWorkService, ScopeWorkUserService],
    imports: [
        forwardRef(() => IamModule),
        forwardRef(() =>
            ClientsModule.register([
                {
                    name: 'USER_MAIN_SERVICE',
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
        SequelizeModule.forFeature([ScopeWork, UserScopeWork]),
        DatabaseModule,
        TableAddingDataModule,
        forwardRef(() => ObjectsModule),
        NameListModule,
        ListNameWorkModule,
        TypeWorkModule,
    ],
    exports: [
        ScopeWorkUserService,
        ScopeWorkService,
        SequelizeModule.forFeature([ScopeWork, UserScopeWork]),
    ],
})
export class ScopeWorkModule {}
