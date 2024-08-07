import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CreateNameWorkDto } from './create-name-work.dto';

export class CreateNameworkWithNameUnitDto extends OmitType(CreateNameWorkDto, [
    'unitId',
]) {
    @ApiProperty({
        example: 'шт',
        description: 'Наименование единицы измерения',
    })
    unitName: string;
}
