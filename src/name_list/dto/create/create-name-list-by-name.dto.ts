import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { ItemRow } from 'src/list-name-work/dto/create/create-list.dto';

export interface Item {
    index: number;
    key: string;
    id: number;
    name: string;
    quntity: number;
}

export class CreateNameListByNameDto {
    @ApiProperty({ example: 4, description: 'Идентификатор списка' })
    @IsNotEmpty()
    @IsNumber()
    listNameWorkId: number;

    @ApiProperty({ type: () => [ItemRow], description: 'Список наименований' })
    @ValidateNested({ each: true })
    @Type(() => ItemRow)
    list: ItemRow[];
}
