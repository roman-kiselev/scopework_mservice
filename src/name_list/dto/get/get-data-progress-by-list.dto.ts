import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetDataProgressByListDto {
    @ApiProperty({ example: 1, description: 'id списка' })
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    listId: number;

    @ApiProperty({ example: 1, description: 'id объёма работы' })
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    scopeWorkId: number;
}
