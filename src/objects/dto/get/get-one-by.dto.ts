import { Objects } from 'src/objects/entities/objects.model';

export class GetOneDto {
    criteria: Partial<Objects>;
    relations?: (keyof Objects)[];
}
