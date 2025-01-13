import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GetShortQueryDto {
    @ApiProperty({
        example: 'true',
        description: 'Показать только выполненные',
    })
    @IsOptional()
    @Transform(({ value }) => (value === 'true' ? true : false))
    @IsBoolean()
    onlyCompleted?: boolean;

    @ApiProperty({
        example: 'true',
        description: 'Показать только не выполненные',
    })
    @IsOptional()
    @Transform(({ value }) => (value === 'true' ? true : false))
    @IsBoolean()
    onlyNotCompleted?: boolean;

    @ApiProperty({ example: 'Зеландия', description: 'Наименование объекта' })
    @IsOptional()
    @IsString()
    objectName?: string;

    @ApiProperty({
        example: 'Зеландия',
        description: 'Наименование типа работы',
    })
    @IsOptional()
    @IsString()
    typeWorkName?: string;

    @ApiProperty({ example: 'true', description: 'Показать удалённые' })
    @IsOptional()
    @IsString()
    isDel?: boolean;

    static getObj(dto: GetShortQueryDto) {
        return {
            onlyCompleted: dto.onlyCompleted,
            onlyNotCompleted: dto.onlyNotCompleted,
            objectName: dto.objectName,
            typeWorkName: dto.typeWorkName,
        };
    }
}
