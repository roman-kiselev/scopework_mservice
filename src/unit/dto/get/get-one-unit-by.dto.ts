import { Unit } from '../../entities/unit.model';

export class GetOneUnitBy {
    criteria: Partial<Unit>;
    relations: string[];
}
