import { OmitType } from '@nestjs/swagger';
import { ListNameWorkShortDto } from './list-name-work-short.dto';

export class ListNameWorkWithoutDelDto extends OmitType(ListNameWorkShortDto, [
    'deletedAt',
]) {}
