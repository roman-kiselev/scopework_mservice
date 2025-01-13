import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { NameListWithoutTadDto } from 'src/name_list/dto/response/name-list-without-tad.dto';
import { NameWorkWithDelDto } from './name-work-with-del.dto';

export class NameWorkNameListDto extends PartialType(NameWorkWithDelDto) {
    @ApiProperty({
        type: () => NameListWithoutTadDto,
        description: 'Список наименований',
    })
    @IsOptional()
    NameList: NameListWithoutTadDto;
}
