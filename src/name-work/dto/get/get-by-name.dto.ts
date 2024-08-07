import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetByNameQueryDto {
    @ApiProperty({ example: 'Товар', description: 'Наименование' })
    @IsNotEmpty()
    @IsString()
    name: string;
}
