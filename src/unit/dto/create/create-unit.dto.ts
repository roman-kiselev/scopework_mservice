import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUniteDto {
    @ApiProperty({ example: 'шт.', description: 'Единица' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'Штуки', description: 'Описание' })
    @IsNotEmpty()
    @IsString()
    description: string;
}
