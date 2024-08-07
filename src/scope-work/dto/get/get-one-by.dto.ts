import { ScopeWork } from 'src/scope-work/entities/scope-work.model';

type relationsKey = keyof ScopeWork;

export class GetOneBy {
    criteria: Partial<ScopeWork>;
    relations?: relationsKey[];
}
