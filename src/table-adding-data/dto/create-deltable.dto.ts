import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDelTableDto {
    @ApiProperty({ example: 1, description: 'id таблицы' })
    @IsNotEmpty()
    @IsNumber()
    tableAddingDataId: number;
}
