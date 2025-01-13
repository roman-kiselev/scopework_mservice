import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateNameWorkRowDto {
    @ApiProperty({ example: 'Товар', description: 'Наименование товара' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: '1', description: 'id еденицы измерения' })
    @IsNotEmpty()
    @IsNumber()
    unitId: number;

    @ApiProperty({ example: '1', description: 'id Типа работ' })
    @IsNotEmpty()
    @IsNumber()
    typeWorkId: number;

    @ApiProperty({ example: '1', description: '№ Строки' })
    @IsNotEmpty()
    @IsNumber()
    row: number;

    @ApiProperty({ example: '1', description: 'Количество' })
    @IsNotEmpty()
    @IsNumber()
    quntity: number;
}
