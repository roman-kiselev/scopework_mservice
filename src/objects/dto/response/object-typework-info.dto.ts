import { ApiProperty } from '@nestjs/swagger';

export class ObjectTypewWorkInfoDto {
    @ApiProperty({ example: 'Отопление', description: 'Название типа работ' })
    typeWorkName: string;
    @ApiProperty({ example: 20, description: 'Количество' })
    quntity: number;
    @ApiProperty({ example: 20, description: 'Общее количество' })
    total_quntity: number;
    @ApiProperty({ example: 20, description: 'Процент' })
    percent: number;
}
