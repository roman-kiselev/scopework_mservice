import { ApiProperty } from '@nestjs/swagger';
import { ModelAttributeColumnOptions } from 'sequelize';
import {
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { NameWork } from 'src/name-work/entities/name-work.model';
import { NameList } from 'src/name_list/entities/name-list.model';
import { ScopeWork } from 'src/scope-work/entities/scope-work.model';
import { TypeWork } from 'src/type-work/entities/type-work.model';

interface ListNameWorkAttr {
    name: string;
    typeWorkId: number;
    organizationId: number;
    description?: string;
    scopeWorkId?: number;
}

@Table({ tableName: 'list_name_work', paranoid: true })
export class ListNameWork extends Model<ListNameWork, ListNameWorkAttr> {
    @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
    } as ModelAttributeColumnOptions)
    id: number;

    @ApiProperty({ example: 'Лист 1', description: 'Наименование' })
    @Column({
        type: DataType.STRING,
        allowNull: false,
    } as ModelAttributeColumnOptions)
    name?: string;

    @ApiProperty({
        example: 'Для такого то объета',
        description: 'Описание списка',
    })
    @Column({
        type: DataType.STRING,
        allowNull: false,
    } as ModelAttributeColumnOptions)
    description?: string;

    @ApiProperty({ example: '1', description: 'Идентификатор организации' })
    @Column({
        type: DataType.INTEGER,
    })
    organizationId: number;

    @ApiProperty({
        example: '12.01.2099',
        description: 'Дата удаления',
    })
    @Column({
        type: DataType.DATE,
    } as ModelAttributeColumnOptions)
    deletedAt!: Date;

    @ApiProperty({ example: 1, description: 'Идентификатор типа работы' })
    @ForeignKey(() => TypeWork)
    typeWorkId: number;

    @ApiProperty({ type: () => [NameWork], description: 'Список работ' })
    @BelongsToMany(() => NameWork, () => NameList)
    nameWorks: NameWork[];

    @ApiProperty({ example: 1, description: 'Идентификатор объёма' })
    @ForeignKey(() => ScopeWork)
    scopeWorkId: number;
}
