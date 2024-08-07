import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateNameListDto {
    @ApiProperty({ example: 4, description: 'Количество', title: 'Количество' })
    @IsNotEmpty()
    @IsNumber()
    quntity: number;

    @ApiProperty({ example: 4, description: 'Идентификатор наименования' })
    @IsNotEmpty()
    @IsNumber()
    nameWorkId: number;

    @ApiProperty({ example: 4, description: 'Идентификатор списка' })
    @IsNotEmpty()
    @IsNumber()
    listNameWorkId: number;
}
