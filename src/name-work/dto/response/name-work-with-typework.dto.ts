import { ApiProperty, OmitType } from '@nestjs/swagger';
import { NameWork } from 'src/name-work/entities/name-work.model';
import { TypeWorkWithNameWorkDto } from 'src/type-work/dto/response/type-work-with-name-work.dto';
import { UnitDto } from 'src/unit/dto/response/unit.dto';

export class NameWorkWithTypeworkDto extends OmitType(NameWork, [
    'tableAddingData',
    'listNameWorks',
    'unitId',
    'typeWorks',
]) {
    @ApiProperty({ example: '22.09.2022', description: 'Время создания' })
    createdAt: string;

    @ApiProperty({ example: '22.09.2022', description: 'Время обновления' })
    updatedAt: string;

    @ApiProperty({ type: () => UnitDto, description: 'Еденица измерения' })
    unit: UnitDto;

    @ApiProperty({
        type: () => [TypeWorkWithNameWorkDto],
        description: 'Список типов работ',
    })
    typeWorks: TypeWorkWithNameWorkDto[];
}
