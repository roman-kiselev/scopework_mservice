import { PartialType } from '@nestjs/swagger';
import { CreateListDto } from '../create/create-list.dto';

export class ListNameWorkEditDto extends PartialType(CreateListDto) {}
