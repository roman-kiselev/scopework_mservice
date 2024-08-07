import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Unit } from './entities/unit.model';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

@Module({
    controllers: [UnitController],
    providers: [UnitService],
    imports: [SequelizeModule.forFeature([Unit])],
    exports: [UnitService, SequelizeModule.forFeature([Unit])],
})
export class UnitModule {}
