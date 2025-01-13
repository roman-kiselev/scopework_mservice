import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { ListNameWork } from 'src/list-name-work/entities/list-name-work.model';
import { NameWorkNameListDto } from 'src/name-work/dto/response/name-work-name-list.dto';

export class ListNameWorkDto extends PartialType(ListNameWork) {
    @ApiProperty({ example: '22.01.2022', description: 'Время создания' })
    @IsNotEmpty()
    createdAt: Date;

    @ApiProperty({ example: '22.01.2022', description: 'Время обновления' })
    @IsNotEmpty()
    updatedAt: Date;
}

export class ListNameWorkFullDto extends OmitType(ListNameWorkDto, [
    'nameWorks',
]) {
    @ApiProperty({
        type: () => [NameWorkNameListDto],
        description: 'Список работ',
    })
    @IsNotEmpty()
    nameWorks: NameWorkNameListDto[];
}

// {
//     "id": 4,
//     "name": "Лист 1",
//     "description": "Для такого то объекта",
//     "organizationId": 2,
//     "deletedAt": null,
//     "createdAt": "2024-07-25T13:11:58.000Z",
//     "updatedAt": "2024-07-25T13:11:58.000Z",
//     "typeWorkId": 1,
//     "scopeWorkId": null,
//     "nameWorks": [
//       {
//         "id": 1,
//         "name": "Товар",
//         "organizationId": 2,
//         "deletedAt": null,
//         "createdAt": "2024-07-24T10:41:04.000Z",
//         "updatedAt": "2024-07-24T10:41:04.000Z",
//         "unitId": 1,
//         "NameList": {
//           "id": 2,
//           "quntity": 1,
//           "createdAt": "2024-07-25T13:11:58.000Z",
//           "updatedAt": "2024-07-25T13:11:58.000Z",
//           "deletedAt": null,
//           "nameWorkId": 1,
//           "listNameWorkId": 4
//         }
//       }
//     ]
//   }
// ]
