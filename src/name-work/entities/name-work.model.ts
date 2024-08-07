import { ApiProperty } from '@nestjs/swagger';
import {
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from 'sequelize-typescript';
import { ListNameWork } from 'src/list-name-work/entities/list-name-work.model';
import { NameList } from 'src/name_list/entities/name-list.model';
import { TableAddingData } from 'src/table-adding-data/entities/table-adding-data.model';
import { TypeWork } from 'src/type-work/entities/type-work.model';
import { Unit } from 'src/unit/entities/unit.model';
import { NameWorkTypeWork } from './name-work-typework.model';

interface NameWorkAttr {
    id: number;
    name: string;
    unitId: number;
    typeWork: number;
    organizationId: number;
}

@Table({ tableName: 'name_work', paranoid: true })
export class NameWork extends Model<NameWork, NameWorkAttr> {
    @ApiProperty({ example: '1', description: 'id' })
    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @ApiProperty({ example: 'Товар', description: 'Товар' })
    @Column({
        type: DataType.STRING,
        unique: true,
    })
    name: string;

    @ApiProperty({ example: '1', description: 'Индефикатор организации' })
    @Column({
        type: DataType.INTEGER,
    })
    organizationId: number;

    @ApiProperty({ example: '22.09.2022', description: 'Дата удаления' })
    @Column({
        type: DataType.DATE,
    })
    deletedAt?: Date;

    @ApiProperty({ example: '1', description: 'Индефикатор еденицы измерения' })
    @ForeignKey(() => Unit)
    unitId: number;

    @ApiProperty({
        type: () => [TableAddingData],
        description: 'Таблица добавления данных',
    })
    @HasMany(() => TableAddingData)
    tableAddingData: TableAddingData[];

    @ApiProperty({ type: () => [TypeWork], description: 'Тип работы' })
    @BelongsToMany(() => TypeWork, () => NameWorkTypeWork)
    typeWorks: TypeWork[];

    @ApiProperty({ type: () => [ListNameWork], description: 'Список работ' })
    @BelongsToMany(() => ListNameWork, () => NameList)
    listNameWorks: ListNameWork[];
}
