import { ApiProperty } from '@nestjs/swagger';

export class GetDataProgressByListResponseDto {
    @ApiProperty({ example: 1, description: 'id списка' })
    listNameWorkId: number;

    @ApiProperty({ example: 1, description: 'id Списка' })
    nameListId: number;

    @ApiProperty({ example: 1, description: 'количество' })
    quntity: number;

    @ApiProperty({ example: true, description: 'выполнения' })
    isDifference: boolean;

    @ApiProperty({ example: 1, description: 'разница' })
    quantityDifference: number;

    @ApiProperty({ example: 1, description: 'добавлено' })
    addingCount: number;

    @ApiProperty({ example: 1, description: 'процент выполнения' })
    percent: number;
}
