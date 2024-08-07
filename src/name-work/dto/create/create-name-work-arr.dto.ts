import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNameWorkArrDto {
    @ApiProperty({ example: 'Товар', description: 'Название' })
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @ApiProperty({ example: 'АСКУЭ', description: 'Нименование Типа' })
    @IsNotEmpty()
    @IsString()
    readonly typeWork: string;

    @ApiProperty({ example: 'шт.', description: 'Еденица измерения' })
    @IsNotEmpty()
    @IsString()
    readonly unit: string;

    // TODO проверить для чего создана
    // @ApiProperty({ example: '1', description: 'Номер строки' })
    // readonly row: number;
}
