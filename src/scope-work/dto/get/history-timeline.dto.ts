import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class HistoryTimelineDto {
    @ApiProperty({ example: 1, description: 'Уникальный идентификатор' })
    @IsNotEmpty()
    @IsNumber()
    readonly idScopeWork: number;

    @ApiProperty({ example: '22.01.2022', description: 'От' })
    @IsNotEmpty()
    @IsDateString()
    readonly dateFrom: string;

    @ApiProperty({ example: '22.01.2022', description: 'До' })
    @IsNotEmpty()
    @IsDateString()
    readonly dateTo: string;
}
