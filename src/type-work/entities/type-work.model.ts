import { ApiProperty } from '@nestjs/swagger';
import {
    BelongsToMany,
    Column,
    DataType,
    HasMany,
    Model,
    Table,
} from 'sequelize-typescript';
import { ListNameWork } from 'src/list-name-work/entities/list-name-work.model';
import { NameWorkTypeWork } from 'src/name-work/entities/name-work-typework.model';
import { NameWork } from 'src/name-work/entities/name-work.model';

import { ObjectTypeWork } from 'src/objects/entities/objects-type_work.model';
import { Objects } from 'src/objects/entities/objects.model';
import { ScopeWork } from 'src/scope-work/entities/scope-work.model';

interface TypeWorkAttr {
    id: number;
    name: string;
    description?: string;
    deletedAt?: Date;
    organizationId: number;
}

@Table({ tableName: 'type_work' })
export class TypeWork extends Model<TypeWork, TypeWorkAttr> {
    @ApiProperty({ example: '1', description: 'Идентификатор' })
    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    })
    id: number;

    @ApiProperty({ example: 'АСКУЭ', description: 'Название' })
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name: string;

    @ApiProperty({ example: 'Работы', description: 'Описание' })
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    description: string;

    @ApiProperty({ example: '1', description: 'Идентификатор организации' })
    @Column({ type: DataType.INTEGER })
    organizationId: number;

    @ApiProperty({ example: '12.01.2099', description: 'Дата' })
    @Column({ type: DataType.DATE })
    deletedAt!: Date;

    @ApiProperty({ type: () => [Objects], description: 'Список объектов' })
    @BelongsToMany(() => Objects, () => ObjectTypeWork)
    objects: Objects[];

    @ApiProperty({ type: () => [NameWork], description: 'Список названий' })
    @BelongsToMany(() => NameWork, () => NameWorkTypeWork)
    nameWorks: NameWork[];

    @ApiProperty({ type: () => [ScopeWork], description: 'Список объёмов' })
    @HasMany(() => ScopeWork)
    scopeWork: ScopeWork[];

    @ApiProperty({
        type: () => [ListNameWork],
        description: 'Список листов названий',
    })
    @HasMany(() => ListNameWork)
    listNameWork: ListNameWork[];
}
