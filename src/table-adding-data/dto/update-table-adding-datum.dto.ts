import { PartialType } from '@nestjs/swagger';
import { CreateTableAddingDatumDto } from './create-table-adding-datum.dto';

export class UpdateTableAddingDatumDto extends PartialType(CreateTableAddingDatumDto) {}
