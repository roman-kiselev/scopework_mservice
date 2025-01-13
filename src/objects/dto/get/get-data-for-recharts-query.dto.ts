import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class GetDataForRechartsQueryDto {
    @ApiProperty({ example: 1, title: 'Лимит', required: false })
    @IsOptional()
    @IsNumberString()
    limit?: number;

    @ApiProperty({ example: 1, title: 'Пропуск', required: false })
    @IsOptional()
    @IsNumberString()
    offset?: number;

    // @ApiProperty({ example: 1, title: 'Страница', required: false })
    // @IsOptional()
    // @IsNumberString()
    // page?: number;
}
