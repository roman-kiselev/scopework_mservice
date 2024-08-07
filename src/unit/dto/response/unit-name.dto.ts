import { ApiProperty } from '@nestjs/swagger';

export class UnitNameDto {
    @ApiProperty({ example: 'шт.', description: 'Единица' })
    name: string;
}
