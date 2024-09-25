import {
    ConflictException,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import * as ExcelJS from 'exceljs';
import { firstValueFrom } from 'rxjs';
import sequelize, { Op, QueryTypes } from 'sequelize';
import { DatabaseService } from 'src/database/database.service';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { User } from 'src/interfaces/users/user';
import { ListNameWork } from 'src/list-name-work/entities/list-name-work.model';
import { ListNameWorkService } from 'src/list-name-work/list-name-work.service';
import { NameWork } from 'src/name-work/entities/name-work.model';
import { NameListService } from 'src/name_list/name_list.service';
import { IListNamesWithData } from 'src/objects/interfaces/IListNamesWithData';
import { ObjectsService } from 'src/objects/objects.service';
import { TableAddingData } from 'src/table-adding-data/entities/table-adding-data.model';
import { TableAddingDataService } from 'src/table-adding-data/table-adding-data.service';
import { TypeWorkService } from 'src/type-work/type-work.service';
import { Unit } from 'src/unit/entities/unit.model';
import { UnitService } from 'src/unit/unit.service';
import * as stream from 'stream';
import { CreateScopeWorkDto } from './dto/create/create-scope-work.dto';
import { GetOneBy } from './dto/get/get-one-by.dto';
import { HistoryTimelineDto } from './dto/get/history-timeline.dto';
import { GetOneScopeworkResDto } from './dto/response/get-one-scopework-res.dto';
import { EditScopeWorkDto } from './dto/update/edit-scope-work.dto';
import { ScopeWork } from './entities/scope-work.model';
import { UserScopeWork } from './entities/user-scope-work.model';
import { IResQuickList } from './interfaces/IResQuickList';
import { IResQuickOneScopeWorkById } from './interfaces/IResQuickOneScopeWorkById';
import { IResScopeWorkByUserAndObject } from './interfaces/IResScopeWorkByUserAndObject';
import { IScopeworkShort } from './interfaces/IScopeworkShort';
import { ResHistoryTimeline } from './interfaces/ResHistoryTimeline';
import { ScopeWorkUserService } from './scope-work-user.service';

@Injectable()
export class ScopeWorkService {
    constructor(
        @InjectModel(ScopeWork) private scopeWorkRepository: typeof ScopeWork,
        @InjectModel(UserScopeWork)
        private userScopeWorkRepository: typeof UserScopeWork,
        @Inject('USER_MAIN_SERVICE') private readonly clientUsers: ClientProxy,
        @Inject(forwardRef(() => ListNameWorkService))
        private readonly listNameWorkService: ListNameWorkService,
        @Inject(forwardRef(() => TableAddingDataService))
        private readonly tableAddingDataService: TableAddingDataService,
        @Inject(forwardRef(() => ObjectsService))
        private readonly objectService: ObjectsService,
        private readonly databaseService: DatabaseService,
        @Inject(forwardRef(() => NameListService))
        private readonly nameListService: NameListService,
        private readonly typeWorkService: TypeWorkService,
        private readonly userScopeWorkService: ScopeWorkUserService,
        private readonly unitService: UnitService,
    ) {}

    async getScopeWorkBy(
        dto: GetOneBy,
        organizationId: number,
        params: { withDelete?: boolean; raw?: boolean } = {},
    ) {
        const scopeWork = await this.scopeWorkRepository.findOne({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDelete ? params.withDelete : null,
            },
            include: dto.relations || [],
            raw: params.raw || false,
        });
        if (!scopeWork) {
            throw new NotFoundException(
                'ScopeWork with this criteria not found',
            );
        }

        return scopeWork;
    }

    async getScopeWorksAllBy(
        dto: GetOneBy,
        organizationId: number,
        params: { withDelete?: boolean } = {},
    ) {
        const scopeWork = await this.scopeWorkRepository.findAll({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDelete ? params.withDelete : null,
            },
            include: dto.relations || [],
        });

        return scopeWork;
    }

    /**
     * Метод делает подсчёт для одного объёма.
     * {
     * "countListNameWorksArr": 3227,
     * "countTableAddingData": 3188,
     * "percentOneScopeWork": "98.8",
     * "listNamesWithData": [
     *  {
     *    "id": 1,
     *    "name": "Установка подоконного приточного клапана Домвент Оптима",
     *    "deletedAt": "null",
     *    "createdAt": "2024-02-06T08:44:53.000Z",
     *    "updatedAt": "2024-02-06T08:44:53.000Z",
     *    "unitId": 1,
     *    "nameListId": 1,
     *    "quntity": 138,
     *    "finishUserAdding": [
     *      {
     *        "quntity": 138,
     *        "percentForOneName": "100.0",
     *        "userId": 2,
     *        "nameListId": 1,
     *        "scopeWorkId": 2
     *      }
     *    ]
     *  },
     * @returns Возвращает итог подсчёта
     */
    async getFullDataForOneScopeWork(
        idScopeWork: number,
        organizationId: number,
        userIdArr?: number[],
    ) {
        const scopeWork = await this.getScopeWorkBy(
            {
                criteria: { id: idScopeWork },
                relations: ['listNameWork', 'tableAddingData'],
            },
            organizationId,
        );
        // TODO желательно исправить метод
        const listNameWorkArr = await this.listNameWorkService.getListTest(
            scopeWork.listNameWork.map((item) => item.id),
        );
        const arr = listNameWorkArr.map((item) => item.nameWorks).flat();
        const nameWorksArr = arr.map((item) => {
            return {
                id: item.id,
                name: item.name,
                deletedAt: item.deletedAt,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                unitId: item.unitId,
                nameListId: item['NameList'].id,
                quntity: item['NameList'].quntity,
            };
        });

        const { tableAddingData } = scopeWork;
        // общее количество
        const countListNameWorksArr: number = nameWorksArr
            .map((item) => item.quntity)
            .reduce((currentItem, nextItem) => currentItem + nextItem, 0);
        // Количество внесённых изменений
        const countTableAddingData: number = tableAddingData
            .map((item) => item.quntity)
            .reduce((currentItem, nextItem) => currentItem + nextItem, 0);
        // Получим процент выполнения
        const percentOneScopeWork: string = (
            (countTableAddingData * 100) /
            countListNameWorksArr
        ).toFixed(1);

        const listNamesWithData: IListNamesWithData[] = [];
        for (const item of nameWorksArr) {
            const { nameListId } = item;
            let userAdding = [];
            for (const item of userIdArr) {
                // TODO этот метод тоже требует исправления
                // Здесь куча запросов, нужно оптимизировать
                const tableAddingUser =
                    await this.tableAddingDataService.getAnything(
                        idScopeWork,
                        nameListId,
                        item,
                    );

                userAdding = [
                    ...userAdding,
                    ...tableAddingUser.filter(({ userId }) => userId !== null),
                ];
            }

            const finishUserAdding = userAdding.map((oneUser) => {
                return {
                    quntity: oneUser.quntity,
                    percentForOneName: (
                        (oneUser.quntity * 100) /
                        item.quntity
                    ).toFixed(1),
                    userId: oneUser.userId,
                    nameListId: oneUser.nameListId,
                    scopeWorkId: oneUser.scopeWorkId,
                };
            });
            listNamesWithData.push({
                ...item,
                deletedAt: `${item.deletedAt}`,
                finishUserAdding,
            });
        }

        // Теперь сделаем подсчёт по пользователям

        return {
            countListNameWorksArr,
            countTableAddingData,
            percentOneScopeWork,
            listNamesWithData,
        };
        //return testArr;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    private async _getDataCount(arr: ScopeWork[], organizationId: number) {
        const dataProgress = [];

        for (const scopeWork of arr) {
            const { id: idScopeWork, listNameWork } = scopeWork;
            const arr = [];

            for (const { id: listNameWorkId } of listNameWork) {
                const item = await this.nameListService.getDataProgressByList(
                    listNameWorkId,
                    idScopeWork,
                    organizationId,
                );
                const itemClone = [...item];
                const quntityNumber = itemClone
                    .map((item) => item.quntity)
                    .reduce(
                        (currentItem, nextItem) => currentItem + nextItem,
                        0,
                    );
                const quantityDifferenceNumber = itemClone
                    .map((item) => item.quantityDifference)
                    .reduce(
                        (currentItem, nextItem) => currentItem + nextItem,
                        0,
                    );
                const addingCountNumber = itemClone
                    .map((item) => item.addingCount)
                    .reduce(
                        (currentItem, nextItem) => currentItem + nextItem,
                        0,
                    );
                const dataCount = {
                    listNameWorkId,
                    idScopeWork,
                    quntity: quntityNumber,
                    isDifference: itemClone.find(
                        (item) => item.isDifference === true,
                    )
                        ? true
                        : false,
                    quantityDifference: quantityDifferenceNumber,
                    addingCount: addingCountNumber,
                    percent: (
                        (addingCountNumber / quntityNumber) *
                        100
                    ).toFixed(1),
                };
                arr.push(dataCount);
            }

            const quntityMain = arr
                .map((item) => item.quntity)
                .reduce((currentItem, nextItem) => currentItem + nextItem, 0);
            const addingCountMain = arr
                .map((item) => item.addingCount)
                .reduce((currentItem, nextItem) => currentItem + nextItem, 0);
            const mainCountData = {
                listNameWorkId: arr.map((item) => item.listNameWorkId),
                idScopeWork: arr.map((item) => item.idScopeWork),
                quntity: quntityMain,
                isDifference: arr.find((item) => item.isDifference === true)
                    ? true
                    : false,
                quantityDifference: arr
                    .map((item) => item.quantityDifference)
                    .reduce(
                        (currentItem, nextItem) => currentItem + nextItem,
                        0,
                    ),
                addingCount: addingCountMain,
                percent: ((addingCountMain / quntityMain) * 100).toFixed(1),
            };

            dataProgress.push({ ...scopeWork, ...mainCountData });
        }
        return dataProgress;
    }
    private async getDataCount(
        arr: GetOneScopeworkResDto[],
        organizationId: number,
    ) {
        const dataProgress = [];

        for (const scopeWork of arr) {
            let quntityMain = 0;
            let addingCountMain = 0;
            const dataCounts = [];

            for (const { id: listNameWorkId } of scopeWork.listNameWork) {
                const item = await this.nameListService.getDataProgressByList(
                    listNameWorkId,
                    scopeWork.id,
                    organizationId,
                );

                const quntityNumber = item.reduce(
                    (acc, cur) => acc + cur.quntity,
                    0,
                );
                const quantityDifferenceNumber = item.reduce(
                    (acc, cur) => acc + cur.quantityDifference,
                    0,
                );
                const addingCountNumber = item.reduce(
                    (acc, cur) => acc + cur.addingCount,
                    0,
                );
                const isDifference = item.some((item) => item.isDifference);

                quntityMain += quntityNumber;
                addingCountMain += addingCountNumber;

                const percent = (
                    (addingCountNumber / quntityNumber) *
                    100
                ).toFixed(1);

                dataCounts.push({
                    listNameWorkId,
                    idScopeWork: scopeWork.id,
                    quntity: quntityNumber,
                    isDifference,
                    quantityDifference: quantityDifferenceNumber,
                    addingCount: addingCountNumber,
                    percent,
                });
            }

            const mainCountData = {
                listNameWorkId: dataCounts.map((item) => item.listNameWorkId),
                idScopeWork: scopeWork.id,
                quntity: quntityMain,
                isDifference: dataCounts.some((item) => item.isDifference),
                quantityDifference: dataCounts.reduce(
                    (acc, cur) => acc + cur.quantityDifference,
                    0,
                ),
                addingCount: addingCountMain,
                percent: ((addingCountMain / quntityMain) * 100).toFixed(1),
            };

            dataProgress.push({ ...scopeWork, ...mainCountData });
        }

        return dataProgress;
    }

    // TODO Реализовать получение пользователей
    /**
     * Asynchronously checks if any user in the given array does not exist in the system.
     *
     * @param {number[]} arr - An array of user IDs to check.
     * @param {number} organizationId - The ID of the organization to check users against.
     * @return {Promise<boolean>} A Promise that resolves to true if any user in the array does not exist, false otherwise.
     */
    private async checkArrUsers(arr: number[], organizationId: number) {
        const listUsers: User[] = await firstValueFrom(
            this.clientUsers.send('get-all-users', organizationId),
        );

        const isAllUsersExist = arr.every((userId) => {
            return listUsers.some((user) => user.id === userId);
        });

        return isAllUsersExist;
    }

    /**
     * Checks if all the elements in the given array of numbers exist in the list of name works.
     *
     * @param {number[]} arr - The array of numbers to check.
     * @param {number} organizationId - The ID of the organization.
     * @return {Promise<boolean>} A promise that resolves to a boolean indicating if all the elements in the array exist.
     */
    private async checkArrListNameWork(arr: number[], organizationId: number) {
        const promises = arr.map((item) => {
            return this.listNameWorkService.getOneBy(
                {
                    criteria: {
                        id: item,
                    },
                    relations: [],
                },
                organizationId,
            );
        });

        const result = await Promise.allSettled(promises);
        const rejected = result.filter((item) => item.status === 'rejected');

        return rejected.length === 0;
    }

    /**
     * Creates an array of users associated with a scope work.
     *
     * @param {number[]} arr - An array of user IDs to be associated with the scope work.
     * @param {number} scopeWorkId - The ID of the scope work to associate the users with.
     * @return {Promise<ScopeWork>} A Promise that resolves to the updated scope work object.
     */
    private async createArrUsers(arr: number[], scopeWorkId: number) {
        const scopeWork = await this.scopeWorkRepository.findByPk(scopeWorkId);

        const usersPromise = arr.map((item) => {
            return this.userScopeWorkService.createUserScopeWork(
                item,
                scopeWorkId,
            );
        });

        await Promise.all(usersPromise);
        return scopeWork;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    private async editArrUsers(arr: number[], scopeWorkId: number) {
        const users = await this.userScopeWorkService.getAllUsersInScopeWork([
            scopeWorkId,
        ]);

        const userIds = users.map((item) => item.userId);
        const arrForAdd = arr.filter((item) => !userIds.includes(item));
        const arrForDelete = userIds.filter((item) => !arr.includes(item));

        if (arrForAdd.length > 0) {
            const addPromise = arrForAdd.map((item) =>
                this.userScopeWorkService.createUserScopeWork(
                    item,
                    scopeWorkId,
                ),
            );

            await Promise.all(addPromise);
        }

        if (arrForDelete.length > 0) {
            const deletePromise = arrForDelete.map((item) =>
                this.userScopeWorkService.deleteUserScopeWork(
                    item,
                    scopeWorkId,
                ),
            );

            await Promise.all(deletePromise);
        }

        return users;
    }

    /**
     * Creates an array of listNameWork entities associated with the given scopeWorkId.
     *
     * @param {number[]} arr - An array of listNameWork ids to be added to the scopeWork.
     * @param {number} scopeWorkId - The id of the scopeWork to which the listNameWork entities will be associated.
     * @return {Promise<ScopeWork>} - A promise that resolves to the updated scopeWork entity.
     */
    private async createArrListNameWork(arr: number[], scopeWorkId: number) {
        const scopeWork = await this.scopeWorkRepository.findByPk(scopeWorkId);
        for (const item of arr) {
            await scopeWork.$add('listNameWork', item);
        }
        return scopeWork;
    }

    /**
     * Creates a new scope work.
     *
     * @param {CreateScopeWorkDto} dto - The data transfer object containing the details of the scope work.
     * @param {number} organizationId - The ID of the organization.
     * @return {Promise<ScopeWork>} A promise that resolves to the created scope work.
     * @throws {ConflictException} If the scope work cannot be created due to conflicting data.
     */
    async createScopeWork(dto: CreateScopeWorkDto, organizationId: number) {
        const { listNameWork, objectId, typeWorkId, users } = dto;

        const objectPromise = this.objectService.getOneBy(
            { criteria: { id: objectId }, relations: [] },
            organizationId,
        );
        const typeWorkPromise = this.typeWorkService.getOneBy(
            {
                criteria: { id: typeWorkId },
                relations: [],
            },
            organizationId,
        );
        await Promise.all([objectPromise, typeWorkPromise]);

        const isNameWork = await this.checkArrListNameWork(
            listNameWork,
            organizationId,
        );
        const isUser = await this.checkArrUsers(users, organizationId);

        if (!isNameWork || !isUser) {
            throw new ConflictException('Dont create scopeWork');
        }

        const newScopeWork = await this.scopeWorkRepository.create({
            typeWorkId: typeWorkId,
            objectId: objectId,
            organizationId: organizationId,
        });

        await this.createArrUsers(users, newScopeWork.id);
        await this.createArrListNameWork(listNameWork, newScopeWork.id);
        await newScopeWork.save();

        const dataScopeWork = await this.getScopeWorkBy(
            {
                criteria: {
                    id: newScopeWork.id,
                },
                relations: ['listNameWork', 'tableAddingData'],
            },
            organizationId,
        );
        return dataScopeWork;
    }

    // TODO используется SQL
    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    // Получение списка работ по id пользователя и объекта
    async getScopeWorkByUserIdAndObjectId(dto: {
        userId: string;
        objectId: string;
    }) {
        const query = `
      SELECT 
      sw.id AS id,
      sw.typeWorkId AS typeWorkId,
      tw.name AS nameTypeWork,
      sw.objectId AS objectId,
      so.name AS name,
      swu.userId AS userId,
      swu.scopeWorkId AS scopeWorkId
  FROM
      \`${process.env.MYSQL_DATABASE}\`.scope_work sw
          INNER JOIN
      \`${process.env.MYSQL_DATABASE}\`.\`user-scope-work\` swu ON swu.scopeWorkId = sw.id
          INNER JOIN
      \`${process.env.MYSQL_DATABASE}\`.\`type_work\` tw ON tw.id = sw.typeWorkId
          INNER JOIN
      \`${process.env.MYSQL_DATABASE}\`.objects so ON so.id = sw.objectId
  WHERE
      objectId = :objectId AND swu.userId = :userId;
      `;

        const replacements = {
            userId: dto.userId,
            objectId: dto.objectId,
        };

        const data: IResScopeWorkByUserAndObject[] =
            await this.databaseService.executeQuery(query, replacements);

        return data;
    }

    // TODO не тестировался

    async getOneScopeWork(id: string, organizationId: number) {
        console.log(id, organizationId);
        const scopeWork = await this.getScopeWorkBy(
            {
                criteria: { id: +id },
                relations: ['listNameWork', 'tableAddingData'],
            },
            organizationId,
        );

        const users = await this.userScopeWorkService.getAllUsersInScopeWork([
            scopeWork.id,
        ]);

        const { typeWorkId, objectId, listNameWork } = scopeWork;

        const [findTypeWork, findObject] = await Promise.all([
            this.typeWorkService.getOneBy(
                {
                    criteria: { id: typeWorkId },
                    relations: [],
                },
                organizationId,
            ),
            this.objectService.getOneBy(
                { criteria: { id: objectId }, relations: [] },
                organizationId,
            ),
        ]);

        if (!findTypeWork || !findObject || !listNameWork) {
            throw new NotFoundException('ScopeWork not found');
        }

        const findListPromises = listNameWork.map((item) => {
            return this.listNameWorkService.getOneBy(
                {
                    criteria: { id: item.id },
                    relations: ['nameWorks'],
                },
                organizationId,
            );
        });

        const findList = await Promise.all(findListPromises);
        // const findListCopy = JSON.parse(JSON.stringify(findList));

        const changedScopeWork = {
            id: scopeWork.id,
            // ...findListCopy[0],
            users: users,
            object: findObject,
            typeWork: findTypeWork,
            listNameWork: findList,
        };

        return changedScopeWork;
    }

    /**
     * Calculates the progress for a given scope work and organization.
     *
     * @param {ScopeWork} scopeWork - The scope work object containing the list of name work items.
     * @param {number} organizationId - The ID of the organization.
     * @return {Promise<Object>} The main count data containing the list of name work IDs, scope work ID, quantity,
     * isDifference flag, quantity difference, adding count, and percentage.
     */
    private async getProgressForScopeWork(
        scopeWork: ScopeWork,
        organizationId: number,
    ) {
        const { id: idScopeWork, listNameWork } = scopeWork;

        const promises = listNameWork.map((item) => {
            return this.getProgressForListNameWork(
                item.id,
                idScopeWork,
                organizationId,
            );
        });
        const data = await Promise.all(promises);

        const quntityMain = data.reduce(
            (currentItem, nextItem) => currentItem + nextItem.quantity,
            0,
        );
        const addingCountMain = data.reduce(
            (currentItem, nextItem) => currentItem + nextItem.addingCount,
            0,
        );

        const mainCountData = {
            listNameWorkId: data.map((item) => item.listNameWorkId),
            idScopeWork: data.map((item) => item.idScopeWork),
            quantity: quntityMain,
            isDifference: data.some((item) => item.isDifference),
            quantityDifference: data.reduce(
                (currentItem, nextItem) =>
                    currentItem + nextItem.quantityDifference,
                0,
            ),
            addingCount: addingCountMain,
            percent: ((addingCountMain / quntityMain) * 100).toFixed(1),
        };

        return mainCountData;
    }

    /**
     * Calculates the progress for a given list name work.
     *
     * @param {number} listNameWorkId - The ID of the list name work.
     * @param {number} idScopeWork - The ID of the scope work.
     * @param {number} organizationId - The ID of the organization.
     * @return {Promise<{
     *   listNameWorkId: number,
     *   idScopeWork: number,
     *   quantity: number,
     *   isDifference: boolean,
     *   quantityDifference: number,
     *   addingCount: number,
     *   percent: string
     * }>} The progress data for the list name work.
     */
    private async getProgressForListNameWork(
        listNameWorkId: number,
        idScopeWork: number,
        organizationId: number,
    ) {
        const item = await this.nameListService.getDataProgressByList(
            listNameWorkId,
            idScopeWork,
            organizationId,
        );

        const quntityNumber = item.reduce(
            (currentItem, nextItem) => currentItem + nextItem.quntity,
            0,
        );
        const quantityDifferenceNumber = item.reduce(
            (currentItem, nextItem) =>
                currentItem + nextItem.quantityDifference,
            0,
        );
        const addingCountNumber = item.reduce(
            (currentItem, nextItem) => currentItem + nextItem.addingCount,
            0,
        );

        const dataCount = {
            listNameWorkId,
            idScopeWork,
            quantity: quntityNumber,
            isDifference: item.some((item) => item.isDifference),
            quantityDifference: quantityDifferenceNumber,
            addingCount: addingCountNumber,
            percent: ((addingCountNumber / quntityNumber) * 100).toFixed(1),
        };

        return dataCount;
    }

    /**
     * Retrieves all scope works for a given organization.
     *
     * @param {number} organizationId - The ID of the organization.
     * @return {Promise<Array<Object>>} - A promise that resolves to an array of objects containing the progress data for each scope work.
     */
    async getAllScopeWork(organizationId: number) {
        const scopeWorks = await this.getScopeWorksAllBy(
            {
                criteria: {},
                //relations: ['tableAddingData', 'listNameWork'],
            },
            organizationId,
        );
        // TODO Исправить!!! Выдаёт прогресс для каждого scopeWork
        // const promises = scopeWorks.map((scopeWork) => {
        //     return this.getProgressForScopeWork(scopeWork, organizationId);
        // });
        // const data = await Promise.all(promises);

        return scopeWorks;
    }

    // TODO сделан небольшой рефактор
    /**
     * Retrieves all scope works for a given user ID and organization ID.
     *
     * @param {string} id - The ID of the user. If '1', all scope works will be returned.
     * @param {number} organizationId - The ID of the organization.
     * @return {Promise<Array<Object>>} - A promise that resolves to an array of objects containing the progress data for each scope work.
     */
    async getAllScopeWorkByUserId(id: string, organizationId: number) {
        const userCondition = id === '1' ? {} : { where: { userId: id } };

        const getAllScopeWork = await this.userScopeWorkRepository.findAll({
            attributes: [
                [
                    sequelize.fn('DISTINCT', sequelize.col('scopeWorkId')),
                    'scopeWorkId',
                ],
            ],
            ...userCondition,
        });

        const listScopeWorkPromises = getAllScopeWork.map((item) => {
            return this.getOneScopeWork(
                item.scopeWorkId.toString(),
                organizationId,
            );
        });

        const listScopeWork = await Promise.all(listScopeWorkPromises);

        const data = await this.getDataCount(listScopeWork, organizationId);

        return data;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    // Получение статистики
    async getAllListWorkForEditByScopeWorkId(
        id: string,
        organizationId: number,
    ) {
        // Получаем объём
        const scopeWork = await this.scopeWorkRepository.findByPk(id, {
            include: { all: true },
        });
        const scopeWorkFinish = JSON.parse(JSON.stringify(scopeWork));
        let listNames = [];
        const { listNameWork } = scopeWorkFinish;
        // Получаем весь список наименований
        // Учесть что списков с работами может быть несколько
        for (const { id: idListNameWork } of listNameWork) {
            // const oneList = await this.listNameWorkRepository.findByPk(
            //     idListNameWork,
            //     {
            //         include: { all: true },
            //     },
            // );
            const oneList = await this.listNameWorkService.getOneBy(
                {
                    criteria: { id: idListNameWork },
                    relations: ['nameWorks'],
                },
                organizationId,
            );

            const { nameWorks } = oneList;
            const finishNameWorks = JSON.parse(JSON.stringify(nameWorks));

            for (const { id: nameWorkId, name, unitId } of finishNameWorks) {
                const findedData =
                    await this.nameListService.getDataByNameWorkIdAndListId(
                        nameWorkId,
                        idListNameWork,
                        organizationId,
                    );

                const newFindedData = findedData.map((item) => {
                    return {
                        ...item,
                        scopeWorkId: id,
                        name,
                        unitId,
                    };
                });

                listNames = [...listNames, ...newFindedData];
            }
        }

        return listNames;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    // Редактировать объём
    async editScopeWork(dto: EditScopeWorkDto) {
        const { listNameWork, users, scopeWorkId } = dto;
        const scopeWork = await this.scopeWorkRepository.findByPk(scopeWorkId);

        // const arr = await this.editArrUsers(users, scopeWorkId);
        await this.editArrUsers(users, scopeWork.id);
        await this.createArrListNameWork(listNameWork, scopeWork.id);
        const dataScopeWork = await this.scopeWorkRepository.findByPk(
            scopeWork.id,
            { include: { all: true } },
        );
        return dataScopeWork;
    }

    // TODO используется SQL
    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async getAllScopeWorkSqlShort(id: string, organizationId: number) {
        const query2 = `
      SELECT 
      sw.id,
      sw.deletedAt,
      sw.nameTypework,
      sw.nameObject,
      sw.sum,
      sw.sumCurrent,
      sw.percent,
      sw.organizationId
  FROM
      \`${process.env.MYSQL_DATABASE}\`.\`user-scope-work\` usw
          INNER JOIN
      (SELECT 
              sw.id,
              sw.deletedAt,
              sw.organizationId,
              tw.name AS nameTypework,
              obj.name AS nameObject,
              SUM(sumSw.t1Quntity) AS sum,
              SUM(sumSw.t2Quntity) AS sumCurrent,
              ROUND(sumSw.t2Quntity / sumSw.t1Quntity * 100, 1) AS percent
      FROM
          \`${process.env.MYSQL_DATABASE}\`.scope_work AS sw
      LEFT JOIN (SELECT 
         \`${process.env.MYSQL_DATABASE}\`.\`scope_work\`.id AS scope_workId,
              SUM(t1.quntity) AS t1Quntity,
              SUM(t2.quntitySum) AS t2Quntity
      FROM
          \`${process.env.MYSQL_DATABASE}\`.\`scope_work\`
      LEFT JOIN \`${process.env.MYSQL_DATABASE}\`.\`list_name_work\` lnw ON lnw.scopeWorkId = \`${process.env.MYSQL_DATABASE}\`.\`scope_work\`.id
      LEFT JOIN (SELECT 
          listNameWorkId, ROUND(SUM(quntity), 1) AS quntity
      FROM
          \`${process.env.MYSQL_DATABASE}\`.\`name-list\`
      GROUP BY \`${process.env.MYSQL_DATABASE}\`.\`name-list\`.listNameWorkId) t1 ON t1.listNameWorkId = lnw.id
      LEFT JOIN (SELECT 
          SUM(tad.quntity) AS quntitySum,
              nl.listNameWorkId AS listNameWorkId
      FROM
          \`${process.env.MYSQL_DATABASE}\`.\`table-adding-data\` tad
      LEFT JOIN \`${process.env.MYSQL_DATABASE}\`.\`name-list\` nl ON nl.id = tad.nameListId
      WHERE
          tad.deletedAt IS NULL
      GROUP BY listNameWorkId) t2 ON t2.listNameWorkId = lnw.id
      GROUP BY \`${process.env.MYSQL_DATABASE}\`.\`scope_work\`.id) sumSw ON sumSw.scope_workId = sw.id
      INNER JOIN \`${process.env.MYSQL_DATABASE}\`.type_work tw ON tw.id = sw.typeWorkId
      INNER JOIN \`${process.env.MYSQL_DATABASE}\`.objects obj ON obj.id = sw.objectId
      GROUP BY id) sw ON sw.id = usw.scopeWorkId
  WHERE
      userId = :userId AND organizationId = :organizationId;
      `;
        const replacements = {
            userId: id,
            organizationId: organizationId,
        };

        const data: IScopeworkShort[] =
            await this.scopeWorkRepository.sequelize.query(query2, {
                type: QueryTypes.SELECT,
                replacements,
            });

        return data;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async getHistoryTimeline(dto: HistoryTimelineDto) {
        try {
            // const query = `
            // SELECT *
            // FROM scopework.\`table-adding-data\` tad
            // WHERE tad.scopeWorkId = :idScopeWork AND tad.createdAt BETWEEN :dateFrom AND :dateTo AND tad.deletedAt IS NULL
            // ORDER BY tad.createdAt ASC;
            // `;
            const query2 = `
      SELECT 
	tad.scopeWorkId as scopeWorkId,
  tad.createdAt as createdAt,
    tad.nameListId as nameListId,
    CONCAT(ud.lastname, ' ' ,ud.firstname) as userName,
    SUM(tad.quntity) as quntity,
    sw.name as nameTypeWork,
    nw.name as nameWork,
    nw.unitName as unitName
FROM
    \`${process.env.MYSQL_DATABASE}\`.\`table-adding-data\` tad
    INNER JOIN (
		SELECT 
			sw.id as id,
			tw.name
        FROM \`${process.env.MYSQL_DATABASE}\`.scope_work sw
        INNER JOIN
        \`${process.env.MYSQL_DATABASE}\`.type_work tw ON tw.id  = sw.typeWorkId
    ) sw ON sw.id = tad.scopeWorkId
    INNER JOIN (
		SELECT 
			\`${process.env.MYSQL_DATABASE}\`.\`name_work\`.id as id,
            \`${process.env.MYSQL_DATABASE}\`.\`name_work\`.name as name,
            u.name as unitName
		FROM \`${process.env.MYSQL_DATABASE}\`.\`name_work\`
        INNER JOIN 
        \`${process.env.MYSQL_DATABASE}\`.unit u ON u.id = \`${process.env.MYSQL_DATABASE}\`.\`name_work\`.unitId
    ) nw ON nw.id = tad.nameWorkId
    INNER JOIN
    \`${process.env.MYSQL_DATABASE}\`.\`user-description\` ud ON ud.userId = tad.userId
WHERE
    tad.scopeWorkId = :idScopeWork
        AND tad.createdAt BETWEEN :dateFrom AND :dateTo
        AND tad.deletedAt IS NULL
        AND tad.quntity IS NOT NULL
        GROUP BY tad.scopeWorkId, tad.nameListId, tad.createdAt,ud.lastname, ud.firstname, sw.name, nw.name, nw.unitName
ORDER BY nameWork ASC;
      `;

            const replacements = {
                idScopeWork: dto.idScopeWork,
                dateFrom: dto.dateFrom,
                dateTo: dto.dateTo,
            };

            // const data: ResHistoryTimeline[] =
            //   await this.scopeWorkRepository.sequelize.query(query2, {
            //     type: QueryTypes.SELECT,
            //     replacements,
            //   });

            const data: ResHistoryTimeline[] =
                await this.databaseService.executeQuery(query2, replacements);

            //const data = await this.scopeWorkRepository.findAll();

            return data;
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
    async createExcelForScopeWork(
        dto: HistoryTimelineDto,
    ): Promise<stream.Readable> {
        try {
            //
            const data = await this.getHistoryTimeline(dto);
            if (data) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Sheet 1');

                // Добявляем заголовки
                worksheet.addRow([
                    '№ Объёма',
                    'Дата добавления',
                    'Тип работ',
                    'Пользователь',
                    'Наименование',
                    'Количество',
                    'Ед.',
                ]);
                data.forEach((item) => {
                    worksheet.addRow([
                        item.scopeWorkId,
                        item.createdAt,
                        item.nameTypeWork,
                        item.userName,
                        item.nameWork,
                        item.quntity,
                        item.unitName,
                    ]);
                });
                // Создаем поток для записи данных в файл
                const streamEx = new stream.PassThrough();

                await workbook.xlsx.write(streamEx);
                streamEx.end();

                return streamEx;
            }
            throw new HttpException('Нет данных', HttpStatus.BAD_REQUEST);
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

    // TODO используется SQL
    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    // Без повторяющихся наименований(без группировки)
    async quickOneScopeWorkById(id: string) {
        try {
            const query = `
      SELECT 
    nl.id AS id,
    nl.nameWorkId AS nameWorkId,
    nw.name AS name,
    u.name AS unitName,
    ROUND(SUM(nl.quntity), 2) AS quntityMain,
    ROUND(SUM(tadQ.quntitySum), 2) AS quntityCompleted,
    ROUND(SUM(nl.quntity) - SUM(tadQ.quntitySum),
            2) AS remainderQuntity,
    ROUND(tadQ.quntitySum / nl.quntity * 100, 1) AS percent,
    nl.listNameWorkId AS listNameWorkId
FROM
    \`${process.env.MYSQL_DATABASE}\`.\`name-list\` nl
        INNER JOIN
    \`${process.env.MYSQL_DATABASE}\`.\`name_work\` nw ON nw.id = nl.nameWorkId
        LEFT JOIN
    (SELECT 
        tad.nameListId AS nameListId,
            ROUND(SUM(quntity), 2) AS quntitySum
    FROM
        \`${process.env.MYSQL_DATABASE}\`.\`table-adding-data\` tad
    WHERE
        tad.deletedAt IS NULL
            AND quntity IS NOT NULL
    GROUP BY tad.nameListId) tadQ ON tadQ.nameListId = nl.id
        INNER JOIN
    \`${process.env.MYSQL_DATABASE}\`.unit u ON nw.unitId = u.id
WHERE
    nl.listNameWorkId IN (SELECT 
            id
        FROM
            \`${process.env.MYSQL_DATABASE}\`.\`list_name_work\`
        WHERE
            scopeWorkId = :id)
        AND nl.deletedAt IS NULL
GROUP BY nl.id, nl.nameWorkId, nw.name, u.id, u.name, nl.quntity, tadQ.quntitySum, nl.quntity
ORDER BY nw.name ASC;
      `;
            const replacements = {
                id: id,
            };

            const data: IResQuickOneScopeWorkById[] =
                await this.databaseService.executeQuery(query, replacements);

            return data;
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

    private countForOneList(
        nameWorks: NameWork,
        units: Unit[],
    ): IResQuickOneScopeWorkById {
        const { id, name, nameList, tableAddingData } = nameWorks;
        const mainCount = nameList.quntity;
        const countTableAddingData = tableAddingData.reduce((acc, item) => {
            return acc + item.quntity;
        }, 0);

        const percent = (countTableAddingData / mainCount) * 100;
        const remainderQuntity = mainCount - countTableAddingData;

        return {
            id: nameWorks.nameList.id,
            nameWorkId: nameList.nameWorkId,
            name: name,
            unitId: nameWorks.unitId,
            unitName: units.find((item) => item.id === nameWorks.unitId).name,
            quntityMain: Number(mainCount.toFixed(2)),
            quntityCompleted: Number(countTableAddingData.toFixed(2)),
            remainderQuntity: Number(remainderQuntity.toFixed(2)),
            percent: Number(percent.toFixed(1)),
            listNameWorkId: nameList.listNameWorkId,
        };
    }

    private async countObjectScopeWork(list: ListNameWork) {
        const unitSet = new Set<number>();
        list.nameWorks.forEach((item) => {
            unitSet.add(item.unitId);
        });
        const unitArrPromise = [...unitSet.values()].map(async (item) => {
            return this.unitService.getOneUnitBy(
                {
                    criteria: { id: item },
                    relations: [],
                },
                list.organizationId,
            );
        });
        const unitArr = await Promise.all(unitArrPromise);

        console.log(JSON.parse(JSON.stringify(list.nameWorks)));
        const newList = list.nameWorks.map((item) => {
            return this.countForOneList(item, unitArr);
        });
        // console.log(JSON.parse(JSON.stringify(newList)));
        return newList;
    }

    async quickOneScopeWorkByIdList(id: number, user: ActiveUserData) {
        const sw = await this.scopeWorkRepository.findOne({
            where: { id: id, organizationId: user.organizationId },
            include: [
                {
                    model: ListNameWork,
                    as: 'listNameWork',
                    where: { deletedAt: null },
                    include: [
                        {
                            model: NameWork,
                            as: 'nameWorks',
                            where: {
                                deletedAt: null,
                            },
                            through: {
                                as: 'nameList',
                            },
                            include: [
                                {
                                    model: TableAddingData,
                                    as: 'tableAddingData',
                                    where: {
                                        deletedAt: null,
                                        nameListId: {
                                            [Op.eq]: sequelize.col(
                                                'listNameWork.nameWorks.nameList.id',
                                            ),
                                        },
                                    },
                                    required: false,
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        const arr: IResQuickList[] = [];
        for (const item of sw.listNameWork) {
            const arrCount = await this.countObjectScopeWork(item);

            arr.push({
                id: item.id,
                name: item.name,
                description: item.description,
                organizationId: item.organizationId,
                deletedAt: item.deletedAt,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                typeWorkId: item.typeWorkId,
                scopeWorkId: item.scopeWorkId,
                // oldList: item.nameWorks,
                list: arrCount,
            });
        }

        return arr;
    }
}
