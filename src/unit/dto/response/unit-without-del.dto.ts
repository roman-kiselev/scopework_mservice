import { OmitType } from '@nestjs/swagger';
import { UnitDto } from './unit.dto';

export class UnitWithoutDelDto extends OmitType(UnitDto, ['deletedAt']) {}
