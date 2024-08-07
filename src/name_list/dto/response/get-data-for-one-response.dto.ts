// [
//     {
//       "nameListId": 5,
//       "quntity": 10,
//       "nameWorkId": 1,
//       "listNameWorkId": 1,
//       "count": 0,
//       "percent": "0.0",
//       "tableAddingData": [],
//       "users": []
//     }
//   ]

import { ApiProperty } from '@nestjs/swagger';

export class GetDataForOneResponseDto {
    @ApiProperty({ example: 1, description: 'id списка с наименованиями' })
    nameListId: number;

    @ApiProperty({ example: 10, description: 'количество' })
    quntity: number;

    @ApiProperty({ example: 1, description: 'id наименования' })
    nameWorkId: number;

    @ApiProperty({ example: 1, description: 'id списка' })
    listNameWorkId: number;

    @ApiProperty({ example: 0, description: 'количество изменений' })
    count: number;

    @ApiProperty({ example: '0.0', description: 'процент выполнения' })
    percent: string;

    // TODO: Добавить данные для пользователя
    @ApiProperty({ example: [], description: 'данные для пользователя' })
    tableAddingData: any[];

    // TODO: Добавить данные для пользователя
    @ApiProperty({ example: [], description: 'данные для пользователя' })
    users: any[];
}
