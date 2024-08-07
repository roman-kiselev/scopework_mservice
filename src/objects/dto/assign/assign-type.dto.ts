import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssignDto {
    @ApiProperty({ example: '1', description: 'Идентификатор типа' })
    @IsNotEmpty()
    @IsNumber()
    typeWorkId: number;
}
