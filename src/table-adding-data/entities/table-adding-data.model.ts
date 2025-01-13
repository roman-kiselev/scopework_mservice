import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    DataType,
    ForeignKey,
    HasOne,
    Model,
    Table,
} from 'sequelize-typescript';
import { NameWork } from 'src/name-work/entities/name-work.model';
import { NameList } from 'src/name_list/entities/name-list.model';
import { ScopeWork } from 'src/scope-work/entities/scope-work.model';
import { DelTableAddingData } from './del-table-adding-data.model';

interface TableAddingDataAttr {
    quntity: number;
    nameWorkId?: number;
    nameListId?: number;
    scopeWorkId?: number;
    userId: number;
}

@Table({ tableName: 'table-adding-data', paranoid: true })
export class TableAddingData extends Model<
    TableAddingData,
    TableAddingDataAttr
> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    })
    id: number;

    @ApiProperty({ example: 20, description: 'Количество' })
    @Column({
        type: DataType.FLOAT,
    })
    quntity: number;

    @ApiProperty({ example: '12.01.2099', description: 'Дата удаления' })
    @Column({
        type: DataType.DATE,
    })
    deletedAt?: any;

    @ApiProperty({ example: 1, description: 'id наименования' })
    @ForeignKey(() => NameWork)
    nameWorkId: number;

    @ApiProperty({ example: 1, description: 'id списка' })
    @ForeignKey(() => NameList)
    nameListId: number;

    @ApiProperty({ example: 1, description: 'id объёма' })
    @ForeignKey(() => ScopeWork)
    scopeWorkId: number;

    @ApiProperty({ example: 1, description: 'id пользователя' })
    @Column({ type: DataType.INTEGER })
    userId: number;

    @ApiProperty({ type: () => DelTableAddingData })
    @HasOne(() => DelTableAddingData)
    delTableAddingData: DelTableAddingData;
}
