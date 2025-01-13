import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UserIdsDto {
    @ApiProperty({ example: 1, description: 'Id пользователя' })
    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
