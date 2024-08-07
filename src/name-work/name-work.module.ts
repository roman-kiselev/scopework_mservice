import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DatabaseModule } from 'src/database/database.module';
import { TypeWorkModule } from 'src/type-work/type-work.module';
import { UnitModule } from 'src/unit/unit.module';
import { NameWorkTypeWork } from './entities/name-work-typework.model';
import { NameWork } from './entities/name-work.model';
import { NameWorkController } from './name-work.controller';
import { NameWorkService } from './name-work.service';

@Module({
    controllers: [NameWorkController],
    providers: [NameWorkService],
    imports: [
        SequelizeModule.forFeature([NameWork, NameWorkTypeWork]),
        UnitModule,
        TypeWorkModule,
        DatabaseModule,
    ],
    exports: [
        NameWorkService,
        SequelizeModule.forFeature([NameWork, NameWorkTypeWork]),
    ],
})
export class NameWorkModule {}
