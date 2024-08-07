import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetNameWorkByTypeWorkIdQueryDto {
    @ApiProperty({ example: '1', description: 'id типа работ' })
    @IsNotEmpty()
    @IsString()
    typeWorkId: string;
}
