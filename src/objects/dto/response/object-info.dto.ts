import { ApiProperty } from '@nestjs/swagger';

export class ObjectInfoDto {
    @ApiProperty({ example: 2024, description: 'Год' })
    year: number;
    @ApiProperty({ example: 'April', description: 'Месяц' })
    monthName: string;
    @ApiProperty({ example: 20, description: 'Количество за месяц' })
    quntity: number;
}
