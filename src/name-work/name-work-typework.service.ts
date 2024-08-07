import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NameWorkTypeWork } from './entities/name-work-typework.model';

@Injectable()
export class NameWorkTypeWorkService {
    constructor(
        @InjectModel(NameWorkTypeWork)
        private nameWorkTypeWorkRepository: typeof NameWorkTypeWork,
    ) {}
}
