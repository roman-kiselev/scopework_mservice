import { NameWork } from 'src/name-work/entities/name-work.model';

export class GetOneNameWorkByDto {
    criteria: Partial<NameWork>;
    relations?: (keyof NameWork)[];
}
