import { ApiProperty } from '@nestjs/swagger';
import { ModelAttributeColumnOptions } from 'sequelize';
import {
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { TypeWork } from 'src/type-work/entities/type-work.model';
import { NameWork } from './name-work.model';

@Table({ tableName: 'namework_typework' })
export class NameWorkTypeWork extends Model<NameWorkTypeWork> {
    @ApiProperty({ example: '1', description: 'ID' })
    @Column({
        type: DataType.INTEGER,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    } as ModelAttributeColumnOptions)
    id: number;

    @ApiProperty({ example: '1', description: 'ID наименования' })
    @ForeignKey(() => NameWork)
    nameWorkId: number;

    @ApiProperty({ example: '1', description: 'ID типа работ' })
    @ForeignKey(() => TypeWork)
    typeWorkId: number;
}
