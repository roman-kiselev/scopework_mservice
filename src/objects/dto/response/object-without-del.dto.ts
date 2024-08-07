import { OmitType } from '@nestjs/swagger';
import { ObjectDto } from './object.dto';

export class ObjectWithoutDelDto extends OmitType(ObjectDto, ['deletedAt']) {}
