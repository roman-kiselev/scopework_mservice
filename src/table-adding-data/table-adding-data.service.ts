import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { firstValueFrom } from 'rxjs';
import sequelize, { Op, QueryTypes, Sequelize } from 'sequelize';
import { NameWorkService } from 'src/name-work/name-work.service';
import { ScopeWorkService } from 'src/scope-work/scope-work.service';
import { UnitService } from 'src/unit/unit.service';
import { CreateDelTableDto } from './dto/create-deltable.dto';
import { CreateTableAddingDatumDto } from './dto/create-table-adding-datum.dto';
import { GetAllByDto } from './dto/get-all-by.dto';
import { DelTableAddingData } from './entities/del-table-adding-data.model';
import { TableAddingData } from './entities/table-adding-data.model';
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
        private readonly scopeWorkService: ScopeWorkService,
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

    /**
     * Возвращает
     * @param idTableAddingData
     * @param idOrganization
     * @returns
     */
    async isOrganization(idTableAddingData: number, idOrganization: number) {
        const tableAddingData = await this.tableAddingDataRepository.findOne({
            where: { id: idTableAddingData },
        });
        const scopework = await this.scopeWorkService.getScopeWorkBy(
            {
                criteria: {
                    id: tableAddingData.scopeWorkId,
                },
                relations: [],
            },
            idOrganization,
        );

        return scopework ? tableAddingData : null;
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
            // const finishDateFromPlusOne = dateFrom
            //     ? dateFrom
            //     : `${year}-${monthFrom}-${Number(day)}`;
            const finishDateTo = dateTo ? dateTo : `${year}-${monthTo}-${day}`;
            // const finishDateTest = dateFrom
            //     ? dateFrom
            //     : `${year}-${monthFrom}-${Number(day) - 1}`;
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
                // const finishDate = createdAt.toString().split('T')[0];

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

    // export interface IDataGetHistoryForNameWorkId {
    //     id: number;
    //     quntity: number;
    //     userId: number;
    //     createdAt: Date;
    //     deletedAt: Date | null;
    //     delCandidate: number | null;
    // }

    async getHistoryForNameWorkId(organizatonId: number, params: IGetHistory) {
        const isScopeWork = await this.scopeWorkService.getScopeWorkBy(
            {
                criteria: {
                    id: params.scopeWorkId,
                },
                relations: [],
            },
            organizatonId,
        );
        if (!isScopeWork) {
            throw new NotFoundException('ScopeWork not found');
        }
        const result = await this.tableAddingDataRepository.findAll({
            attributes: [
                'id',
                'quntity',
                'createdAt',
                'deletedAt',
                'userId',
                [sequelize.col(`delTableAddingData.id`), 'delCandidate'],
            ],
            include: [
                {
                    model: DelTableAddingData,
                    as: `delTableAddingData`,
                    required: false,
                    where: {
                        deletedAt: {
                            [Op.is]: null,
                        },
                    },
                    attributes: ['id'],
                },
            ],
            where: {
                nameWorkId: params.nameWorkId,
                nameListId: params.nameListId,
                scopeWorkId: isScopeWork.id,
            },
            order: [['createdAt', 'ASC']],
        });

        return result;
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
    async remove(id: number, organizatonId: number) {
        const tableAddingData = await this.isOrganization(id, organizatonId);
        if (!tableAddingData) {
            throw new NotFoundException('TableAddingData not found');
        }

        try {
            const result = await this.tableAddingDataRepository.update(
                {
                    deletedAt: `${new Date()}`,
                },
                {
                    where: { id },
                },
            );

            if (!result) {
                throw new BadRequestException('TableAddingData not deleted');
            }
            return tableAddingData;
        } catch (error) {
            console.error('Error saving TableAddingData:', error);
            throw new BadRequestException('TableAddingData not deleted');
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
          \`${process.env.MYSQL_DATABASE}\`.\`table-adding-data\`
      WHERE
          id = :id;`;

            const queryUpdateRemove = `
      UPDATE \`${process.env.MYSQL_DATABASE}\`.\`table-adding-data\` 
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
    async createCandidateDel(dto: CreateDelTableDto, userId: number) {
        const data = await this.delTableAddingDataRepository.create({
            tableAddingDataId: dto.tableAddingDataId,
            userId: userId,
        });

        return data;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async confirmDelCandidate(
        tableAddingDataId: number,
        idDelCandidate: number,
        organizationId: number,
    ) {
        const removeData = await this.remove(tableAddingDataId, organizationId);
        const delTableAddingData =
            await this.delTableAddingDataRepository.findOne({
                where: { id: idDelCandidate, tableAddingDataId: removeData.id },
            });
        delTableAddingData.deletedAt = new Date();
        const result = await delTableAddingData.save();

        return result;
    }

    async softDel(nameListId: number) {
        const result = await this.tableAddingDataRepository.update(
            {
                deletedAt: new Date(),
            },
            {
                where: { nameListId: nameListId },
            },
        );
        return result;
    }

    async softDelForArray(nameListIds: number[]) {
        const result = await this.tableAddingDataRepository.update(
            {
                deletedAt: new Date(),
            },
            {
                where: {
                    nameListId: {
                        [Op.in]: nameListIds,
                    },
                },
            },
        );
        return result;
    }

    async restore(nameListId: number) {
        const result = await this.tableAddingDataRepository.update(
            {
                deletedAt: null,
            },
            {
                where: { nameListId: nameListId },
            },
        );
        return result;
    }

    async restoreForArray(nameListIds: number[]) {
        const result = await this.tableAddingDataRepository.update(
            {
                deletedAt: null,
            },
            {
                where: {
                    nameListId: {
                        [Op.in]: nameListIds,
                    },
                },
            },
        );
        return result;
    }

    async cancel(delTableAddingDataId: number, userId: number) {
        try {
            const result = await this.delTableAddingDataRepository.destroy({
                where: { id: delTableAddingDataId, userId: userId },
            });

            return result;
        } catch (error) {
            console.error('Error saving TableAddingData:', error);
            throw new BadRequestException('TableAddingData not deleted');
        }
    }
}
