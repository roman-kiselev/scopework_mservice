import { ApiProperty, PartialType } from '@nestjs/swagger';
import { NameWorkTypeWork } from 'src/name-work/entities/name-work-typework.model';

export class NameWorkTypeWorkDto extends PartialType(NameWorkTypeWork) {
    @ApiProperty({ example: '22.09.2022', description: 'Время создания' })
    createdAt: string;

    @ApiProperty({ example: '22.09.2022', description: 'Время обновления' })
    updatedAt: string;
}
