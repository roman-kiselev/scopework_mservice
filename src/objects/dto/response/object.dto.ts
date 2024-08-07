import { ApiProperty } from '@nestjs/swagger';
import { Objects } from 'src/objects/entities/objects.model';

export class ObjectDto implements Partial<Objects> {
    @ApiProperty({ example: '1', description: 'Идентификатор' })
    id: number;

    @ApiProperty({ example: 'Зеландия', description: 'Название' })
    name?: string;

    @ApiProperty({ example: 'г. Москва', description: 'Адрес' })
    address?: string;

    @ApiProperty({ example: '1', description: 'Идентификатор организации' })
    organizationId?: number;

    @ApiProperty({ example: '12.01.2099', description: 'Дата создания' })
    createdAt?: Date;

    @ApiProperty({ example: '12.01.2099', description: 'Дата обновления' })
    updatedAt?: Date;

    @ApiProperty({ example: '12.01.2099', description: 'Дата удаления' })
    deletedAt?: Date;
}
