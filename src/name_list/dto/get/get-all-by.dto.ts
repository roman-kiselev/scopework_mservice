import { NameList } from 'src/name_list/entities/name-list.model';

export class GetAllByDto {
    criteria: Partial<NameList>;
    relations?: (keyof NameList)[];
}
