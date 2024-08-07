import { OmitType } from '@nestjs/swagger';
import { ListNameWorkDto } from './list-name-work.dto';

export class ListNameWorkShortDto extends OmitType(ListNameWorkDto, [
    'nameWorks',
    // 'scopeWorkId',
]) {}
