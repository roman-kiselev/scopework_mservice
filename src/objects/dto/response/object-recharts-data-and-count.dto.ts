import { ApiProperty } from '@nestjs/swagger';
import { ObjectRechartsDataDto } from './object-recharts-data.dto';

export class ObjectRechartsDataAndCountDto {
    @ApiProperty({ type: ObjectRechartsDataDto, isArray: true })
    rows: ObjectRechartsDataDto[];

    @ApiProperty({ example: 1, description: 'Количество' })
    count: number;
}
