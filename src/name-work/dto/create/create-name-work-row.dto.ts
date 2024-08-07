import { ApiProperty } from '@nestjs/swagger';

export class CreateNameWorkRowDto {
  @ApiProperty({ example: 'Товар', description: 'Наименование товара' })
  name: string;
  @ApiProperty({ example: '1', description: 'id еденицы измерения' })
  unitId: number;
  @ApiProperty({ example: '1', description: 'id Типа работ' })
  typeWorkId: number;
  @ApiProperty({ example: '1', description: '№ Строки' })
  row: number;
  @ApiProperty({ example: '1', description: 'Количество' })
  quntity: number;
}
