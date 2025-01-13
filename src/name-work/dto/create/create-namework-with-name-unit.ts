import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateNameWorkDto } from './create-name-work.dto';

export class CreateNameworkWithNameUnitDto extends OmitType(CreateNameWorkDto, [
    'unitId',
]) {
    @ApiProperty({
        example: 'шт',
        description: 'Наименование единицы измерения',
    })
    @IsNotEmpty()
    @IsString()
    unitName: string;
}
