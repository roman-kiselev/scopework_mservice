import { ApiProperty } from '@nestjs/swagger';
import { Unit } from 'src/unit/entities/unit.model';

export class UnitDto implements Partial<Unit> {
    @ApiProperty({ example: '1', description: 'ID' })
    id: number;

    @ApiProperty({ example: 'шт.', description: 'Описание' })
    name: string;

    @ApiProperty({ example: 'Штуки', description: 'Описание' })
    description: string;

    @ApiProperty({ example: '1', description: 'ID организации' })
    organizationId: number;

    @ApiProperty({ example: null, description: 'Время удаления' })
    deletedAt: Date | null;

    @ApiProperty({
        example: '2021-01-01T00:00:00.000Z',
        description: 'Время создания',
    })
    createdAt: string;

    @ApiProperty({
        example: '2021-01-01T00:00:00.000Z',
        description: 'Время обновления',
    })
    updatedAt: string;
}
