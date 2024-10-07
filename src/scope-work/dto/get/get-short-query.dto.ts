import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GetShortQueryDto {
    @IsOptional()
    @Transform(({ value }) => (value === 'true' ? true : false))
    @IsBoolean()
    onlyCompleted?: boolean;

    @IsOptional()
    @Transform(({ value }) => (value === 'true' ? true : false))
    @IsBoolean()
    onlyNotCompleted?: boolean;

    @IsOptional()
    @IsString()
    objectName?: string;

    @IsOptional()
    @IsString()
    typeWorkName?: string;
}
