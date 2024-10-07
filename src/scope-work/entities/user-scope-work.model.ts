import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from 'sequelize-typescript';
import { ScopeWork } from './scope-work.model';

interface UserScopeWorkAttr {
    userId: number;
    scopeWorkId: number;
}
@Table({ tableName: 'user-scope-work' })
export class UserScopeWork extends Model<UserScopeWork, UserScopeWorkAttr> {
    @ApiProperty({ example: '1', description: 'Уникальный идентификатор' })
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
    })
    id: number;

    @ApiProperty({ example: '1', description: 'Идентификатор пользователя' })
    @Column({ type: DataType.INTEGER })
    userId: number;

    @ApiProperty({ example: '1', description: 'Идентификатор объёма работы' })
    @Column({ type: DataType.INTEGER })
    @ForeignKey(() => ScopeWork)
    scopeWorkId: number;
}
