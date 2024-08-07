import { ApiProperty } from '@nestjs/swagger';
import { TypeWorkDto } from './type-work.dto';

export class TypeWorkWithDeletedDto extends TypeWorkDto {
    @ApiProperty({ example: null, description: 'Дата' })
    deletedAt: Date | null;
}
