import { ApiProperty } from '@nestjs/swagger';

export class UserDescription {
    @ApiProperty({ example: 1, description: 'id пользователя' })
    readonly id: number;

    @ApiProperty({ example: 'Иван', description: 'Имя пользователя' })
    readonly firstname: string;

    @ApiProperty({ example: 'Иванов', description: 'Фамилия пользователя' })
    readonly lastname: string;

    @ApiProperty({ example: '12.01.2099', description: 'Дата создания' })
    readonly createdAt: Date;

    @ApiProperty({ example: '12.01.2099', description: 'Дата обновления' })
    readonly deletedAt: Date;
}
