import { TableAddingData } from '../entities/table-adding-data.model';

export class GetAllByDto {
    criteria: Partial<TableAddingData>;
    relations?: (keyof TableAddingData)[];
    sort?: string[];
}
