import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UnpinListNameWorkDto {
    @ApiProperty({
        example: 1,
        description: 'Уникальный идентификатор объёма',
    })
    @IsNotEmpty()
    @IsNumber()
    scopeWorkId: number;
}
