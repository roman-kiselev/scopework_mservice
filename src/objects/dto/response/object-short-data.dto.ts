import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ObjectDto } from './object.dto';

export class ObjectShortDataDto extends OmitType(ObjectDto, [
    'updatedAt',
    'deletedAt',
]) {
    @ApiProperty({ example: 100, description: 'Общее кол-во наименований' })
    mainCount: number;

    @ApiProperty({ example: 101, description: 'Общее кол-во уже добавленных' })
    countTableAddingData: number;

    @ApiProperty({ example: 90, description: 'Процент выполнения' })
    percentAll: string;

    @ApiProperty({ type: ObjectShortDataDto, description: 'Данные объекта' })
    dataObject: ObjectShortDataDto[];
}
// TODO переписать на DTO когда станут ясны данные
// (property) dataObject: {
//     id: number;
//     deletedAt: Date;
//     typeWorkId: number;
//     objectId: number;
//     createdAt: any;
//     mainCount: number;
//     countTableAddingData: number;
//     percentAll: number;
//     finishDate: any;
// }[]
