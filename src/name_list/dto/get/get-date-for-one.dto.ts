import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetDateForOneDto {
    @ApiProperty({ example: 1, description: 'id наименования' })
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    nameWorkId: number;

    @ApiProperty({ example: 1, description: 'id списка' })
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    listId: number;
}
