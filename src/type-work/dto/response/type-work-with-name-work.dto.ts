import { ApiProperty, PartialType } from '@nestjs/swagger';
import { NameWorkTypeWorkDto } from 'src/name-work/dto/response/name-work-typework.dto';
import { TypeWorkDto } from './type-work.dto';

export class TypeWorkWithNameWorkDto extends PartialType(TypeWorkDto) {
    @ApiProperty({ example: null, description: 'Время удаления' })
    deletedAt: Date | null;

    @ApiProperty({
        type: () => NameWorkTypeWorkDto,
        description: 'Список типов работ',
    })
    NameWorkTypeWork: NameWorkTypeWorkDto;
}
