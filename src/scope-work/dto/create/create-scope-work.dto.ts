import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateScopeWorkDto {
    @ApiProperty({ example: 1, description: 'id Типа работы' })
    @IsNotEmpty()
    @IsNumber()
    typeWorkId: number;

    @ApiProperty({ example: [1, 2], description: 'id Списка работ' })
    @IsNotEmpty()
    @IsNumber({}, { each: true })
    listNameWork: number[];

    @ApiProperty({ example: 1, description: 'id Объекта' })
    objectId: number;

    @ApiProperty({ example: [1, 2], description: 'id Пользователя' })
    @IsNotEmpty()
    @IsNumber({}, { each: true })
    users: number[];
}
