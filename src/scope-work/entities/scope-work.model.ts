import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from 'sequelize-typescript';
import { ListNameWork } from 'src/list-name-work/entities/list-name-work.model';
import { Objects } from 'src/objects/entities/objects.model';
import { TableAddingData } from 'src/table-adding-data/entities/table-adding-data.model';
import { TypeWork } from 'src/type-work/entities/type-work.model';

// interface ScopeWorkAttr {
//   number: number;
// }

@Table({ tableName: 'scope_work', paranoid: true })
export class ScopeWork extends Model<ScopeWork> {
    @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    // @ApiProperty({ example: '100', description: 'Порядковый номер' })
    // @Column({
    //   type: DataType.INTEGER,
    //   unique: true,
    // })
    // number: number;

    @ApiProperty({ example: '1', description: 'Идентификатор организации' })
    @Column({ type: DataType.INTEGER })
    organizationId: number;

    @ApiProperty({ example: '12.01.2099', description: 'Дата удаления' })
    @Column({ type: DataType.DATE })
    deletedAt!: Date;

    @ApiProperty({ example: '1', description: 'Идентификатор типа работы' })
    @ForeignKey(() => TypeWork)
    @Column({ type: DataType.INTEGER })
    typeWorkId: number;

    @ApiProperty({ example: '1', description: 'Идентификатор объекта' })
    @ForeignKey(() => Objects)
    @Column({ type: DataType.INTEGER })
    objectId: number;

    @ApiProperty({ type: () => [ListNameWork], description: 'Список работ' })
    @HasMany(() => ListNameWork)
    listNameWork: ListNameWork[];

    // @BelongsToMany(() => User, () => UserScopeWork)
    // users: User[];
    // @Column({ type: DataType.INTEGER })
    // userId: number;

    @ApiProperty({
        type: () => [TableAddingData],
        description: 'Таблица данных',
    })
    @HasMany(() => TableAddingData)
    tableAddingData: TableAddingData[];
}
