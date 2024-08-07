import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TypeWork } from './entities/type-work.model';
import { TypeWorkController } from './type-work.controller';
import { TypeWorkService } from './type-work.service';

@Module({
    controllers: [TypeWorkController],
    providers: [TypeWorkService],
    imports: [SequelizeModule.forFeature([TypeWork])],
    exports: [TypeWorkService, SequelizeModule.forFeature([TypeWork])],
})
export class TypeWorkModule {}
