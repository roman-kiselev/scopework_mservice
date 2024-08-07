import { ListNameWork } from 'src/list-name-work/entities/list-name-work.model';

export class GetOneListNameWorkByDto {
    criteria: Partial<ListNameWork>;
    relations: (keyof ListNameWork)[];
}
