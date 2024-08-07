import { TypeWork } from '../../entities/type-work.model';

export class GetOneByDto {
    criteria: Partial<TypeWork>;
    relations?: string[];
}
