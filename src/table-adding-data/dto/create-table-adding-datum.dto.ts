import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateTableAddingDatumDto {
    @ApiProperty({ example: 20, description: 'Количество' })
    @IsNotEmpty()
    @IsNumber()
    readonly quntity: number;

    @ApiProperty({ example: 1, description: 'id наименования' })
    @IsOptional()
    @IsNumber()
    readonly nameWorkId?: number;

    @ApiProperty({ example: 1, description: 'id списка' })
    @IsOptional()
    @IsNumber()
    readonly nameListId?: number;

    @ApiProperty({ example: 1, description: 'id объёма' })
    @IsOptional()
    @IsNumber()
    readonly scopeWorkId?: number;

    @ApiProperty({ example: 1, description: 'id пользователя' })
    @IsNotEmpty()
    @IsNumber()
    readonly userId: number;
}
