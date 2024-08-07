import { ApiProperty, PartialType } from '@nestjs/swagger';
import { NameListWithoutTadDto } from 'src/name_list/dto/response/name-list-without-tad.dto';
import { NameWorkWithDelDto } from './name-work-with-del.dto';

export class NameWorkNameListDto extends PartialType(NameWorkWithDelDto) {
    @ApiProperty({
        type: () => NameListWithoutTadDto,
        description: 'Список наименований',
    })
    NameList: NameListWithoutTadDto;
}
