import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateScopeWorkDto } from '../create/create-scope-work.dto';

export class EditScopeWorkDto extends CreateScopeWorkDto {
    @ApiProperty({ example: 1, description: 'id Объёма работ' })
    @IsNotEmpty()
    @IsNumber()
    scopeWorkId: number;
}
