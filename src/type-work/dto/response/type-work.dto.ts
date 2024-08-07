import { ApiProperty } from '@nestjs/swagger';
import { TypeWork } from 'src/type-work/entities/type-work.model';
export class TypeWorkDto implements Partial<TypeWork> {
    @ApiProperty({ example: '1', description: 'Идентификатор' })
    id: number;

    @ApiProperty({ example: 'АСКУЭ', description: 'Название' })
    name: string;

    @ApiProperty({
        example: 'Автоматизированная система',
        description: 'Описание',
    })
    description: string;

    @ApiProperty({ example: '1', description: 'Идентификатор организации' })
    organizationId?: number;

    @ApiProperty({ example: '2024-07-24T07:41:10.439Z', description: 'Дата' })
    updatedAt?: string;

    @ApiProperty({ example: '2024-07-24T07:41:10.439Z', description: 'Дата' })
    createdAt?: string;
}
