import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { NameListModule } from 'src/name_list/name_list.module';
import { TableAddingDataModule } from 'src/table-adding-data/table-adding-data.module';
import { ListNameWork } from './entities/list-name-work.model';
import { ListNameWorkController } from './list-name-work.controller';
import { ListNameWorkService } from './list-name-work.service';

@Module({
    controllers: [ListNameWorkController],
    providers: [ListNameWorkService],
    imports: [
        SequelizeModule.forFeature([ListNameWork]),
        forwardRef(() => NameListModule),
        TableAddingDataModule,
    ],
    exports: [ListNameWorkService, SequelizeModule.forFeature([ListNameWork])],
})
export class ListNameWorkModule {}
