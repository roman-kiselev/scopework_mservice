import { ApiProperty } from '@nestjs/swagger';

export class GetOneNameListById {
    @ApiProperty({ example: 1, description: 'id списка' })
    id: number;
    @ApiProperty({ example: 1, description: 'Количество' })
    quntity: number;
    @ApiProperty({ example: 'Лист 1', description: 'Наименование' })
    name: string;
    @ApiProperty({ example: 1, description: 'id Единицы измерения' })
    unitId: number;
}
