import { ApiProperty, OmitType } from '@nestjs/swagger';
import { NameWork } from 'src/name-work/entities/name-work.model';

export class NameWorkDto extends OmitType(NameWork, [
    'tableAddingData',
    'typeWorks',
    'listNameWorks',
    'deletedAt',
]) {
    @ApiProperty({ example: '12.20.2022', description: 'Дата создания' })
    createdAt: string;
    @ApiProperty({ example: '12.20.2022', description: 'Дата обновления' })
    updatedAt: string;
}
