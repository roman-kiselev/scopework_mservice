import { forwardRef, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';
import { NameWorkModule } from 'src/name-work/name-work.module';
import { UnitModule } from 'src/unit/unit.module';
import { DelTableAddingData } from './entities/del-table-adding-data.model';
import { TableAddingData } from './entities/table-adding-data.model';
import { TableAddingDataController } from './table-adding-data.controller';
import { TableAddingDataService } from './table-adding-data.service';

@Module({
    controllers: [TableAddingDataController],
    providers: [TableAddingDataService],
    imports: [
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
        forwardRef(() =>
            ClientsModule.register([
                {
                    name: 'USER_DESCRIPTION_MAIN_SERVICE',
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
        SequelizeModule.forFeature([TableAddingData, DelTableAddingData]),
        NameWorkModule,
        UnitModule,
    ],
    exports: [
        TableAddingDataService,
        SequelizeModule.forFeature([TableAddingData]),
    ],
})
export class TableAddingDataModule {}
