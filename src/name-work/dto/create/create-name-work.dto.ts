import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayNotEmpty,
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateNameWorkDto {
    @ApiProperty({ example: 'Товар', description: 'Наименование товара' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: [1, 2], description: 'id Типа работ' })
    @IsNotEmpty()
    @ArrayNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    typeWorkId: number[];

    @ApiProperty({ example: '1', description: 'id еденицы измерения' })
    @IsOptional()
    @IsNumber()
    unitId?: number;
}
