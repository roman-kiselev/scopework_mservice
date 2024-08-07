import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTypeWorkDto {
    @ApiProperty({ example: 'АСКУЭ', description: 'Наименование' })
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @ApiProperty({
        example: 'Автоматизированная система',
        description: 'Описание',
    })
    @IsOptional()
    @IsString()
    readonly description?: string;
}
