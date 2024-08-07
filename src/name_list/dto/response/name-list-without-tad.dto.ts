import { ApiProperty, OmitType } from '@nestjs/swagger';
import { NameListDto } from './name-list.dto';

export class NameListWithoutTadDto extends OmitType(NameListDto, [
    'tableAddingData',
]) {
    @ApiProperty({ example: null, description: 'Время удаления' })
    deletedAt: Date | null;
}
