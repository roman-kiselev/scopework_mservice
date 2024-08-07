import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { firstValueFrom } from 'rxjs';
import { Op, QueryTypes, Sequelize } from 'sequelize';
import { NameWorkService } from 'src/name-work/name-work.service';
import { UnitService } from 'src/unit/unit.service';
import { CreateDelTableDto } from './dto/create-deltable.dto';
import { CreateTableAddingDatumDto } from './dto/create-table-adding-datum.dto';
import { GetAllByDto } from './dto/get-all-by.dto';
import { UpdateTableAddingDatumDto } from './dto/update-table-adding-datum.dto';
import { DelTableAddingData } from './entities/del-table-adding-data.model';
import { TableAddingData } from './entities/table-adding-data.model';
import { IDataGetHistoryForNameWorkId } from './interfaces/IDataGetHistoryForNameWorkId';
import { IGetHistory } from './interfaces/IGetHistory';

@Injectable()
export class TableAddingDataService {
    constructor(
        @InjectModel(DelTableAddingData)
        private delTableAddingDataRepository: typeof DelTableAddingData,
        @InjectModel(TableAddingData)
        private tableAddingDataRepository: typeof TableAddingData,

        @Inject('USER_MAIN_SERVICE') private readonly clientUser: ClientProxy,
        @Inject('USER_DESCRIPTION_MAIN_SERVICE')
        private readonly clientDescriptionUser: ClientProxy,
        private readonly unitService: UnitService,
        private readonly nameWorkService: NameWorkService,
    ) {}

    /**
     * Универсальный метод для получения добавлененых значений.
     * @returns Возвращает список.
     */
    async getAllBy(dto: GetAllByDto, params: { withDeleted?: boolean } = {}) {
        const list = await this.tableAddingDataRepository.findAll({
            where: {
                ...dto.criteria,
                deletedAt: params.withDeleted ? params.withDeleted : null,
            },
            include: dto.relations || [],
            order: [['id', 'ASC']], // TODO добавить сортировку
        });

        return list;
    }

    /**
     * Возвращает список людей которые учавствовали в создании данной таблицы.
     * @param idScopeWork
     * @returns Возвращает список id Users
     */
    async getParticipats(idScopeWork: number[]) {
        const list = await this.tableAddingDataRepository.findAll({
            where: { scopeWorkId: { [Op.in]: idScopeWork } },
            // distinct: true,
            attributes: ['userId'],
            group: ['userId'],
        });
        return list;
    }

    // TODO изменить наименование и вероятно сделать рефактор
    /**
     * Выполняет подсчёт на основе предоставленных параметров.
     * @param {number} idScopeWork - Идентификатор рабочей области.
     * @param {number} nameListId - Идентификатор списка имён.
     * @param {number} item - Некоторый элемент для подсчёта.
     * @returns {number} Результат подсчёта.
     */
    async getAnything(idScopeWork: number, nameListId: number, item: number) {
        const tableAddingUser = await this.tableAddingDataRepository.findAll({
            where: {
                scopeWorkId: idScopeWork,
                nameListId,
                userId: item,
                deletedAt: null,
            },
            attributes: [
                [Sequelize.fn('SUM', Sequelize.col('quntity')), 'quntity'],
                'userId',
                'nameListId',
                'scopeWorkId',
            ],
        });

        return tableAddingUser;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    // TODO внести изменения
    async getListParticipats() {
        return [];
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    // TODO внести изменения
    async getList() {
        return [];
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async create(createTableAddingDatumDto: CreateTableAddingDatumDto) {
        try {
            const newData = await this.tableAddingDataRepository.create(
                createTableAddingDatumDto,
            );

            return newData;
        } catch (e) {
            if (e instanceof HttpException) {
                return e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async findAll() {
        try {
            const findedList = await this.tableAddingDataRepository.findAll({
                include: { all: true },
            });
            return findedList;
        } catch (e) {
            if (e instanceof HttpException) {
                return e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async findAllString(
        organizationId: number,
        page: string,
        limit: string,
        dateFrom?: string,
        dateTo?: string,
    ) {
        try {
            const currentDate = new Date();
            const day =
                currentDate.getDate() < 10
                    ? `0${currentDate.getDate()}`
                    : `${currentDate.getDate()}`;
            const monthFrom =
                currentDate.getMonth() + 1 < 10
                    ? `0${currentDate.getMonth() + 1}`
                    : `${currentDate.getMonth() + 1}`;
            const monthTo =
                currentDate.getMonth() < 10
                    ? `0${currentDate.getMonth()}`
                    : `${currentDate.getMonth()}`;
            const year = currentDate.getFullYear();
            const dayPlusOne = Number(dateFrom.split('-')[2]) + 1;

            const finishDateFrom = dateFrom
                ? `${dateFrom.split('-')[0]}-${
                      dateFrom.split('-')[1]
                  }-${dayPlusOne}`
                : `${year}-${monthFrom}-${Number(dayPlusOne)}`;
            const finishDateFromPlusOne = dateFrom
                ? dateFrom
                : `${year}-${monthFrom}-${Number(day)}`;
            const finishDateTo = dateTo ? dateTo : `${year}-${monthTo}-${day}`;
            const finishDateTest = dateFrom
                ? dateFrom
                : `${year}-${monthFrom}-${Number(day) - 1}`;
            console.log(dateFrom, dateTo);
            console.log(finishDateFrom, finishDateTo);

            const { count, rows } =
                await this.tableAddingDataRepository.findAndCountAll({
                    where: {
                        createdAt: {
                            [Op.between]: [finishDateTo, finishDateFrom],
                        },
                    },
                    order: [['id', 'DESC']],
                    limit: Number(limit),
                    offset: (Number(page) - 1) * Number(limit),
                });
            const pagination = {
                count,
                page,
                limit,
            };

            const arr = [];
            for (const item of rows) {
                const {
                    id,
                    quntity,
                    createdAt,
                    userId,
                    nameListId,
                    nameWorkId,
                    scopeWorkId,
                } = item;
                // Получим пользователя
                const user = await firstValueFrom(
                    this.clientDescriptionUser.send('test-test', {
                        where: { userId },
                    }),
                );
                const userName = `${user.lastname} ${user.firstname}`;

                // Получим наименование работ
                // const oneNameWork = await this.nameWorkRepository.findByPk(
                //     nameWorkId,
                // );
                const oneNameWork = await this.nameWorkService.getOneNameWorkBy(
                    {
                        criteria: { id: nameWorkId },
                        relations: [],
                    },
                    organizationId,
                );
                const nameWork = oneNameWork.name;
                const finishDate = createdAt.toString().split('T')[0];

                const unitName = await this.unitService.getOneUnitBy(
                    { criteria: { id: oneNameWork.unitId }, relations: [] },
                    organizationId,
                );
                const log = {
                    id,
                    userId,
                    scopeWorkId,
                    nameWorkId,
                    nameListId,
                    createdAt,
                    text: `Пользователь ${userName} добавил в Объём №${scopeWorkId}: "${nameWork}" - ${quntity} ${unitName.name}.`,
                };
                arr.push(log);
            }

            return { pagination: pagination, rows: arr };
        } catch (e) {
            if (e instanceof HttpException) {
                return e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async getHistory(nameListId: number) {
        try {
            const findedList = await this.tableAddingDataRepository.findAll({
                where: { nameListId },
            });
            let count = 0;
            const arr = [];
            findedList.forEach((item) => {
                if (count < 90) {
                    count += item.quntity;
                }
                arr.push(count);
            });

            return findedList;
        } catch (e) {
            if (e instanceof HttpException) {
                return e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async getHistoryForNameWorkId(params: IGetHistory) {
        try {
            const query = `
      SELECT 
      \`table-adding-data\`.id,
      \`user-description\`.firstname AS \`firstname\`,
      \`user-description\`.lastname AS \`lastname\`,
      \`table-adding-data\`.quntity,
      \`table-adding-data\`.createdAt,
      \`table-adding-data\`.deletedAt,
      \`del_table_adding_data\`.id AS \`delCandidate\`
  FROM
      scopework.\`table-adding-data\`
          INNER JOIN
      \`user-description\` ON \`user-description\`.userId = scopework.\`table-adding-data\`.userId
          LEFT JOIN
      \`del_table_adding_data\` ON \`del_table_adding_data\`.tableAddingDataId = scopework.\`table-adding-data\`.id
          AND \`del_table_adding_data\`.deletedAt IS NULL
  WHERE
              nameWorkId = :nameWorkId AND nameListId = :nameListId
              ORDER BY createdAt ASC;
      `;
            const replacements = {
                nameListId: params.nameListId,
                nameWorkId: params.nameWorkId,
                scopeWorkId: params.scopeWorkId,
            };

            const data: IDataGetHistoryForNameWorkId[] =
                await this.tableAddingDataRepository.sequelize.query(query, {
                    type: QueryTypes.SELECT,
                    replacements,
                });

            return data;
        } catch (e) {
            if (e instanceof HttpException) {
                return e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    findOne(id: number) {
        return `This action returns a #${id} tableAddingDatum`;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    update(id: number, updateTableAddingDatumDto: UpdateTableAddingDatumDto) {
        return `This action updates a #${id} tableAddingDatum`;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async remove(id: number) {
        try {
            const querySelect = `
      SELECT 
          *
      FROM
          scopework.\`table-adding-data\`
      WHERE
          id = :id;`;

            const queryUpdateRemove = `
      UPDATE scopework.\`table-adding-data\` 
      SET 
          deletedAt = CURRENT_TIMESTAMP
      WHERE
          id = :id;
      
      `;

            const replacements = {
                id,
            };
            const dataSelect: TableAddingData[] =
                await this.tableAddingDataRepository.sequelize.query(
                    querySelect,
                    {
                        type: QueryTypes.SELECT,
                        replacements,
                    },
                );
            const data = await this.tableAddingDataRepository.sequelize.query(
                queryUpdateRemove,
                {
                    type: QueryTypes.UPDATE,
                    replacements,
                },
            );

            if (data) {
                return dataSelect;
            }
        } catch (e) {
            if (e instanceof HttpException) {
                return e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async recovery(id: number) {
        try {
            const querySelect = `
      SELECT 
          *
      FROM
          scopework.\`table-adding-data\`
      WHERE
          id = :id;`;

            const queryUpdateRemove = `
      UPDATE scopework.\`table-adding-data\` 
      SET 
          deletedAt = null
      WHERE
          id = :id;
      
      `;

            const replacements = {
                id,
            };
            const dataSelect: TableAddingData[] =
                await this.tableAddingDataRepository.sequelize.query(
                    querySelect,
                    {
                        type: QueryTypes.SELECT,
                        replacements,
                    },
                );
            const data = await this.tableAddingDataRepository.sequelize.query(
                queryUpdateRemove,
                {
                    type: QueryTypes.UPDATE,
                    replacements,
                },
            );

            if (data) {
                return dataSelect;
            }
        } catch (e) {
            if (e instanceof HttpException) {
                return e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async createCandidateDel(dto: CreateDelTableDto) {
        try {
            const data = await this.delTableAddingDataRepository.create({
                tableAddingDataId: dto.tableAddingDataId,
                userId: dto.userId,
            });

            return data;
        } catch (e) {
            if (e instanceof HttpException) {
                return e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async confirmDelCandidate(
        tableAddingDataId: number,
        idDelCandidate: number,
    ) {
        try {
            const removeData = await this.remove(tableAddingDataId);
            const queryConfirmDel = `
      UPDATE scopework.\`del_table_adding_data\` 
      SET 
          deletedAt = CURRENT_TIMESTAMP
      WHERE
          id = :idDelCandidate;
      
      `;
            const replacements = {
                idDelCandidate,
            };
            const data =
                await this.delTableAddingDataRepository.sequelize.query(
                    queryConfirmDel,
                    {
                        type: QueryTypes.UPDATE,
                        replacements,
                    },
                );

            return removeData;
        } catch (e) {
            if (e instanceof HttpException) {
                return e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
