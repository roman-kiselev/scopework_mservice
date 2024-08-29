import { ApiProperty } from '@nestjs/swagger';

export class UserIdsDto {
    @ApiProperty({ example: 1, description: 'Id пользователя' })
    userId: number;
}
