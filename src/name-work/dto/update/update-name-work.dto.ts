import { PartialType } from '@nestjs/swagger';
import { NameWork } from 'src/name-work/entities/name-work.model';

export class UpdateNameWorkDto extends PartialType(NameWork) {}
