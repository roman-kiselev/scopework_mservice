import { ApiProperty } from '@nestjs/swagger';
import { ModelAttributeColumnOptions } from 'sequelize';
import {
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from 'sequelize-typescript';
import { ListNameWork } from 'src/list-name-work/entities/list-name-work.model';
import { NameWork } from 'src/name-work/entities/name-work.model';

import { TableAddingData } from 'src/table-adding-data/entities/table-adding-data.model';

interface NameListAttr {
    quntity: number;
    listNameWorkId: number;
    nameWorkId: number;
}

@Table({ tableName: 'name-list', paranoid: true })
export class NameList
    extends Model<NameList, NameListAttr>
    implements NameListAttr
{
    @ApiProperty({ example: 6, description: 'Количество товарв' })
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
    } as ModelAttributeColumnOptions)
    id: number;

    @ApiProperty({ example: 6, description: 'Количество' })
    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    quntity: number;

    @ApiProperty({ example: 1, description: 'Идентификатор списка' })
    @ForeignKey(() => ListNameWork)
    listNameWorkId: number;

    @ApiProperty({
        example: 1,
        description: 'Идентификатор наименования работы',
    })
    @ForeignKey(() => NameWork)
    nameWorkId: number;

    @ApiProperty({
        type: () => [TableAddingData],
        description: 'Список выполненных работ',
    })
    @HasMany(() => TableAddingData)
    tableAddingData: TableAddingData[];
}
