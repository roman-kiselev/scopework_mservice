import { ApiProperty, PartialType } from '@nestjs/swagger';
import { NameList } from 'src/name_list/entities/name-list.model';

export class NameListDto extends PartialType(NameList) {
    @ApiProperty({ example: '22.01.2022', description: 'Время создания' })
    createdAt: string;
    @ApiProperty({ example: '22.01.2022', description: 'Время обновления' })
    updatedAt: string;
}
