import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAssignDto {
    @ApiProperty({ example: 1, description: 'Id объекта' })
    @IsNotEmpty()
    @IsNumber()
    readonly idObject: number;

    @ApiProperty({ example: 1, description: 'Id типа работ' })
    @IsNotEmpty()
    @IsNumber()
    readonly idTypeWork: number;
}
