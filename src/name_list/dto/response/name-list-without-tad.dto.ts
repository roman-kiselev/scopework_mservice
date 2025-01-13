import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { NameListDto } from './name-list.dto';

export class NameListWithoutTadDto extends OmitType(NameListDto, [
    'tableAddingData',
]) {
    @ApiProperty({ example: null, description: 'Время удаления' })
    @IsOptional()
    deletedAt: Date | null;
}
