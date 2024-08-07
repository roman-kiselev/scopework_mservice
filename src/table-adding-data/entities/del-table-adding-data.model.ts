import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { TableAddingData } from './table-adding-data.model';

interface DelTableAddingDataAttr {
    tableAddingDataId: number;
    userId: number;
}

@Table({ tableName: 'del_table_adding_data', paranoid: true })
export class DelTableAddingData extends Model<
    DelTableAddingData,
    DelTableAddingDataAttr
> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    })
    id: number;

    @Column({
        type: DataType.DATE,
    })
    deletedAt?: any;

    @ApiProperty({ example: 1, description: 'id из таблицы добавления' })
    @ForeignKey(() => TableAddingData)
    tableAddingDataId: number;

    @Column({ type: DataType.INTEGER })
    userId: number;
}
