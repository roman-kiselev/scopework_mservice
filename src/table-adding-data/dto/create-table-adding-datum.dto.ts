import { ApiProperty } from '@nestjs/swagger';

export class CreateTableAddingDatumDto {
  @ApiProperty({ example: 20, description: 'Количество' })
  readonly quntity: number;
  readonly nameWorkId?: number;
  readonly nameListId?: number;
  readonly scopeWorkId?: number;
  readonly userId: number;
}
