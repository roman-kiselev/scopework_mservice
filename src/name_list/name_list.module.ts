import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ListNameWorkModule } from 'src/list-name-work/list-name-work.module';
import { NameWorkModule } from 'src/name-work/name-work.module';
import { TableAddingDataModule } from 'src/table-adding-data/table-adding-data.module';
import { NameList } from './entities/name-list.model';
import { NameListController } from './name_list.controller';
import { NameListService } from './name_list.service';

@Module({
    controllers: [NameListController],
    providers: [NameListService],
    imports: [
        SequelizeModule.forFeature([NameList]),
        forwardRef(() => ListNameWorkModule),
        NameWorkModule,
        TableAddingDataModule,
    ],
    exports: [NameListService, SequelizeModule.forFeature([NameList])],
})
export class NameListModule {}
