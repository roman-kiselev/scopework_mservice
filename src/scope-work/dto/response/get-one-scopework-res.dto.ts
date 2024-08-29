import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UserIdsDto } from 'src/interfaces/users/user-ids.dto';
import { ObjectDto } from 'src/objects/dto/response/object.dto';
import { ScopeWork } from 'src/scope-work/entities/scope-work.model';
import { TypeWorkDto } from 'src/type-work/dto/response/type-work.dto';

export class GetOneScopeworkResDto extends PartialType(ScopeWork) {
    @ApiProperty({ type: ObjectDto, description: 'Объект' })
    object: ObjectDto;

    @ApiProperty({ type: TypeWorkDto, description: 'Тип работы' })
    typeWork: TypeWorkDto;

    @ApiProperty({ type: [UserIdsDto], description: 'Пользователи' })
    users: UserIdsDto[];

    //listNameWork: ListNameWorkDto[];
}
