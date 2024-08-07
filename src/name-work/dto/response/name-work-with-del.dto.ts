import { ApiProperty } from '@nestjs/swagger';
import { NameWorkDto } from './name-work.dto';

export class NameWorkWithDelDto extends NameWorkDto {
    @ApiProperty({ example: null, description: 'Время удаления' })
    deletedAt: Date | null;
}
