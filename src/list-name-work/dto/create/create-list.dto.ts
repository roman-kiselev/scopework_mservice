import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

export class ItemRow {
    @ApiProperty({ example: 1, description: 'Индекс' })
    @IsNotEmpty()
    @IsNumber()
    index: number;

    @ApiProperty({ example: '1', description: 'Ключ' })
    @IsNotEmpty()
    @IsString()
    key: string;

    @ApiProperty({ example: 1, description: 'Идентификатор' })
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty({ example: 'Название', description: 'Наименование' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 1, description: 'Количество' })
    @IsNotEmpty()
    @IsNumber()
    quntity: number;
}
export class CreateListDto {
    @ApiProperty({ example: 'Лист 1', description: 'Наименование' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Для такого то объекта',
        description: 'Описание списка',
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        example: '1',
        description: 'id Типа Работ',
    })
    @IsNotEmpty()
    @IsNumber()
    typeWorkId: number;

    @ApiProperty({ type: () => [ItemRow], description: 'Список наименований' })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ItemRow)
    list?: ItemRow[];
}
