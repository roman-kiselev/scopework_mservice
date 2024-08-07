import { Injectable } from '@nestjs/common';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class DatabaseService {
  constructor(private readonly sequelize: Sequelize) {}

  async executeQuery<T>(sql: string, replacements?: any): Promise<T> {
    const data = await this.sequelize.query(sql, {
      type: QueryTypes.SELECT,
      replacements,
    });

    return data as T;
  }
}
