import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class NameListEditDto {
    @ApiProperty({ example: 4, description: 'Количество', title: 'Количество' })
    @IsNotEmpty()
    @IsNumber()
    quntity: number;
}
