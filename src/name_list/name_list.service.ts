import {
    BadRequestException,
    ConflictException,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NameWork } from 'src/name-work/entities/name-work.model';
import { NameWorkService } from 'src/name-work/name-work.service';
import { TableAddingDataService } from 'src/table-adding-data/table-adding-data.service';
import {
    CreateNameListByNameDto,
    Item,
} from './dto/create/create-name-list-by-name.dto';
import { CreateNameListDto } from './dto/create/create-name-list.dto';

import { ListNameWorkService } from 'src/list-name-work/list-name-work.service';
import { GetAllByDto } from './dto/get/get-all-by.dto';
import { GetDataProgressByListResponseDto } from './dto/response/get-data-progress-by-list-response.dto';
import { NameList } from './entities/name-list.model';

@Injectable()
export class NameListService {
    constructor(
        @InjectModel(NameList) private nameListRepository: typeof NameList,
        private readonly tableAddingDataService: TableAddingDataService,
        private readonly nameWorkService: NameWorkService,
        @Inject(forwardRef(() => ListNameWorkService))
        private readonly listNameWorkService: ListNameWorkService,
    ) {}

    async getAllBy(
        dto: GetAllByDto,
        listNameWorkId: number,
        organizationId: number,
    ) {
        const listNameWork = await this.listNameWorkService.getOneBy(
            { criteria: { id: listNameWorkId }, relations: [] },
            organizationId,
        );
        if (listNameWork) {
            const result = await this.nameListRepository.findAll({
                where: { ...dto.criteria, deletedAt: null },
                include: dto.relations || [],
            });

            return result;
        }

        throw new BadRequestException('ListNameWork not found');
    }

    /**
     * Creates a new name list entry in the database.
     *
     * @param {CreateNameListDto} dto - The data transfer object containing the necessary information to create the name list entry.
     * @return {Promise<NameList>} - A promise that resolves to the newly created name list entry.
     * @throws {ConflictException} - If the name list entry already exists in the database.
     */
    async create(dto: CreateNameListDto) {
        const { listNameWorkId, nameWorkId, quntity } = dto;

        const newName = await this.nameListRepository.create({
            listNameWorkId,
            nameWorkId,
            quntity,
        });

        if (!newName) {
            throw new ConflictException('Name list entry already exists');
        }
        return newName;
    }

    /**
     * Edits a name list entry by updating its quantity.
     *
     * @param {CreateNameListDto} dto - The data transfer object containing the listNameWorkId, quntity, and nameWorkId.
     * @return {Promise<boolean>} - Returns true if the name list entry was successfully updated, false otherwise.
     */
    async edit(dto: CreateNameListDto) {
        const { listNameWorkId, quntity, nameWorkId } = dto;
        const updateName = await this.nameListRepository.findOne({
            where: {
                listNameWorkId,
                nameWorkId,
            },
        });
        if (updateName) {
            updateName.quntity = quntity;
            const result = await updateName.save();

            return result;
        } else {
            return false;
        }
    }

    /**
     * Deletes a name list entry by destroying the corresponding record in the database.
     *
     * @param {CreateNameListDto} dto - The data transfer object containing the listNameWorkId and nameWorkId.
     * @return {Promise<boolean>} - Returns true if the name list entry was successfully deleted, false otherwise.
     */
    async del(dto: CreateNameListDto) {
        const { listNameWorkId, nameWorkId } = dto;
        const updateName = await this.nameListRepository.destroy({
            where: {
                listNameWorkId,
                nameWorkId,
            },
            force: true,
        });

        if (!updateName) {
            return false;
        }

        return true;
    }

    // TODO выполнил рефактор, нужно проверить
    /**
     * Edits an array of `CreateNameListDto` objects asynchronously.
     *
     * @param {CreateNameListDto[]} dto - An array of `CreateNameListDto` objects to be edited.
     * @return {Promise<{resultFullfilled: any[], resultRejected: any[], status: boolean}>} - A promise that resolves to an object containing the following properties:
     *   - `resultFullfilled`: An array of values resulting from successful edits.
     *   - `resultRejected`: An array of reasons for unsuccessful edits.
     *   - `status`: A boolean indicating whether all edits were successful (true) or not (false).
     */
    async editArr(dto: CreateNameListDto[]) {
        if (dto.length === 0) {
            return true;
        }
        const promises = dto.map((item) => this.edit(item));
        const results = await Promise.allSettled(promises);
        const resultFullfilled = results
            .filter((item) => item.status === 'fulfilled')
            .map((item) => item.value);
        const resultRejected = results
            .filter((item) => item.status === 'rejected')
            .map((item) => item.reason);

        return {
            resultFullfilled,
            resultRejected,
            status: resultRejected.length === 0,
        };
    }

    /**
     * Deletes an array of name list entries asynchronously.
     *
     * @param {CreateNameListDto[]} dto - An array of data transfer objects containing the listNameWorkId and nameWorkId.
     * @return {Promise<{resultFullfilled: boolean[], resultRejected: any[], status: boolean}>} - A promise that resolves to an object containing the resultFullfilled, resultRejected, and status properties.
     *                                       - resultFullfilled: An array of boolean values indicating whether each name list entry was successfully deleted.
     *                                       - resultRejected: An array of reasons for the rejection of each name list entry deletion.
     *                                       - status: A boolean value indicating whether all name list entries were successfully deleted.
     */
    async delArr(dto: CreateNameListDto[]) {
        if (dto.length === 0) {
            return true;
        }
        const promises = dto.map((item) => this.del(item));
        const results = await Promise.allSettled(promises);
        const resultFullfilled = results
            .filter((item) => item.status === 'fulfilled')
            .map((item) => item.value);
        const resultRejected = results
            .filter((item) => item.status === 'rejected')
            .map((item) => item.reason);

        return {
            resultFullfilled,
            resultRejected,
            status: resultRejected.length === 0,
        };
    }

    /**
     * Creates an array of `CreateNameListDto` objects asynchronously.
     *
     * @param {CreateNameListDto[]} dto - An array of `CreateNameListDto` objects to be created.
     * @return {Promise<{resultFullfilled: any[], resultRejected: any[], status: boolean}>} - A promise that resolves to an object containing the following properties:
     *   - `resultFullfilled`: An array of values resulting from successful creations.
     *   - `resultRejected`: An array of reasons for unsuccessful creations.
     *   - `status`: A boolean indicating whether all creations were successful (true) or not (false).
     */
    async createArr(dto: CreateNameListDto[]) {
        if (dto.length === 0) {
            return true;
        }
        const promises = dto.map((item) => this.create(item));
        const results = await Promise.allSettled(promises);
        const resultFullfilled = results
            .filter((item) => item.status === 'fulfilled')
            .map((item) => item.value);
        const resultRejected = results
            .filter((item) => item.status === 'rejected')
            .map((item) => item.reason);

        return {
            resultFullfilled,
            resultRejected,
            status: resultRejected.length === 0,
        };
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    // Создание по наименованию
    async createByName(dto: CreateNameListByNameDto) {
        try {
            const { list, listNameWorkId } = dto;
            // Проверяем существование наименований по типам
            const checkList = Promise.all(
                list.map(async (item) => {
                    const { id, name, quntity } = item;

                    const newPosition = await this.create({
                        listNameWorkId,
                        nameWorkId: id,
                        quntity: Number(quntity),
                    });
                    return newPosition;
                }),
            );

            return checkList;
            // Если всё верно начинаем создавать
            // передаём в create -> listNameWorkId, nameWorkId, quntity
            // !!! Передать как то процент загрузки !!!
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new HttpException(
                'Ошибка сервера',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async getAll() {
        try {
            const names = await this.nameListRepository.findAll({
                include: { all: true },
            });
            return names;
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new HttpException(
                'Ошибка сервера',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async editList(data: { dataNameWorks: NameWork[]; list: Item[] }) {
        try {
            const { dataNameWorks, list } = data;
            const findedListWork = await this.nameListRepository;
            // const newList = Promise.all(
            //   list.map(async (nameWork) => {
            //     const { id, name, quntity } = nameWork;
            //     const findName = dataNameWorks.find((name) => name.id === id);
            //     if (findName) {
            //       const newquntity = await this.nameListRepository.findByPk(findName)
            //     }
            //   }),
            // );
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new HttpException(
                'Ошибка сервера',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Asynchronously retrieves data by name work ID and list ID.
     *
     * @param {number} nameWorkId - The ID of the name work.
     * @param {number} listId - The ID of the list.
     * @return {Promise<Array<{ nameListId: number, quntity: number, nameWorkId: number, listNameWorkId: number, count: number, percent: string, tableAddingData: Array<TableAddingData>, users: Array<{ userId: number, count: number, percent: string, percentTwo: string }> }>>} - A promise that resolves to an array of objects containing the retrieved data.
     */
    async getDataByNameWorkIdAndListId(
        nameWorkId: number,
        listId: number,
        organizationId: number,
    ) {
        // Ф. получает id Наименования и id списка
        const data = await this.getAllBy(
            {
                criteria: { nameWorkId, listNameWorkId: listId },
                relations: ['tableAddingData'],
            },
            listId,
            organizationId,
        );

        const arr = data.map((item) => {
            const {
                tableAddingData,
                id: nameListId,
                quntity,
                nameWorkId,
                listNameWorkId,
            } = item;

            const users = [];

            // Получим уникальные id пользователей что бы посчитать выполнение
            const uniqueUsers = new Set();
            for (const { userId } of tableAddingData) {
                uniqueUsers.add(userId);
            }

            const uniqueUserIds = Array.from(uniqueUsers);
            const sumEdit = tableAddingData
                .map((item) => Number(item.quntity))
                .reduce(
                    (currentSum, currentNumber) => currentSum + currentNumber,
                    0,
                );

            // Подсчёт данных для пользователя
            for (const userId of uniqueUserIds) {
                const filterOneUser = tableAddingData.filter(
                    (item) => item.userId === userId,
                );

                const countUser = filterOneUser
                    .map((item) => Number(item.quntity))
                    .reduce(
                        (currentSum, currentNumber) =>
                            currentSum + currentNumber,
                        0,
                    );

                users.push({
                    userId: userId,
                    count: countUser,
                    percent: ((countUser / quntity) * 100).toFixed(1),
                    percentTwo: ((countUser / sumEdit) * 100).toFixed(1),
                });
            }

            return {
                nameListId,
                quntity,
                nameWorkId,
                listNameWorkId,
                count: sumEdit,
                percent: ((sumEdit / quntity) * 100).toFixed(1),
                tableAddingData,
                users,
            };
        });

        return arr;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async getDataProgressByList(
        listId: number,
        scopeWorkId: number,
        organizationId: number,
    ) {
        const listArr = await this.getAllBy(
            {
                criteria: { listNameWorkId: listId },
                relations: [],
            },
            listId,
            organizationId,
        );

        let dataList: GetDataProgressByListResponseDto[] = [];

        // Теперь получаем quntity и nameWorkId для получения изменений по этип спискам
        for (const list of listArr) {
            const { id: nameListId, listNameWorkId, quntity } = list;

            const addingTableForOneList =
                await this.tableAddingDataService.getAllBy({
                    criteria: {
                        nameListId,
                        scopeWorkId,
                        deletedAt: null,
                    },
                    relations: [],
                });

            const cloneAddingTableForOneList = [...addingTableForOneList];
            const addingCount = cloneAddingTableForOneList
                .map((item) => Number(item.quntity))
                .reduce((currentItem, nextItem) => currentItem + nextItem, 0);

            dataList.push({
                listNameWorkId,
                nameListId,
                quntity,
                isDifference: addingCount > quntity ? true : false,
                quantityDifference:
                    addingCount > quntity ? addingCount - quntity : 0,
                addingCount,
                percent: Number(((addingCount / quntity) * 100).toFixed(1)),
            });
        }

        return dataList;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    // получение всех наименований работ для одного списка
    async getAllNameWorkByListId(id: number, organizationId: number) {
        const list = await this.nameListRepository.findAll({
            where: {
                listNameWorkId: id,
            },
        });

        const listNames = [];
        for (const { nameWorkId, quntity, id } of list) {
            const nameWork = await this.nameWorkService.getOneNameWorkBy(
                {
                    criteria: { id: nameWorkId },
                    relations: [],
                },
                organizationId,
            );
            listNames.push({
                ...nameWork,
                quntity,
                nameListId: id,
            });
        }

        return listNames;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    // Создаём список из excel документа
    async createListExcel(data: Item[]) {}
}
