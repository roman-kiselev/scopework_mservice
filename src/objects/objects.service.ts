import {
    BadRequestException,
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
import { ListNameWorkService } from 'src/list-name-work/list-name-work.service';
import { NameListService } from 'src/name_list/name_list.service';
import { RedisService } from 'src/redis/redis.service';
import { ScopeWorkUserService } from 'src/scope-work/scope-work-user.service';
import { ScopeWorkService } from 'src/scope-work/scope-work.service';
import { TableAddingDataService } from 'src/table-adding-data/table-adding-data.service';
import { TypeWorkService } from 'src/type-work/type-work.service';
import { CreateAssignDto } from './dto/create/create-assign.dto';
import { CreateObjectDto } from './dto/create/create-object.dto';
import { GetOneDto } from './dto/get/get-one-by.dto';
import { Objects } from './entities/objects.model';
import { IOneScopeWorkWithData } from './interfaces/IOneScopeWorkWithData';

@Injectable()
export class ObjectsService {
    constructor(
        @InjectModel(Objects)
        private objectsRepository: typeof Objects,
        @Inject('USER_MAIN_SERVICE') private readonly clientUser: ClientProxy,
        @Inject(forwardRef(() => ScopeWorkService))
        private readonly scopeWorkService: ScopeWorkService,
        private readonly listNameWorkService: ListNameWorkService,
        private readonly tableAddingDataService: TableAddingDataService,
        private readonly typeWorkService: TypeWorkService,
        private readonly nameListService: NameListService,
        private readonly scopeWorkUserService: ScopeWorkUserService,
        private redisService: RedisService,
    ) {}

    /**
     * Универсальный метод для получения одного объекта.
     * @returns Возвращает объект.
     */
    async getOneBy(
        dto: GetOneDto,
        organizationId: number,
        params: { rejectOnEmpty?: boolean; withDeleted?: boolean } = {},
    ) {
        const object = await this.objectsRepository.findOne({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDeleted ? params.withDeleted : null,
            },
            include: dto.relations || [],
            rejectOnEmpty: params.rejectOnEmpty || false,
        });

        if (!object) {
            throw new NotFoundException('Object with this criteria not found');
        }

        return object;
    }

    /**
     * Универсальный метод для получения всех объектов.
     * @returns Возвращает список.
     */
    async getAllByWith(
        dto: GetOneDto,
        organizationId: number,
        params: { rejectOnEmpty?: boolean; withDeleted?: boolean } = {},
    ) {
        const objects = await this.objectsRepository.findAll({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDeleted ? params.withDeleted : null,
            },
            include: dto.relations || [],
        });

        if (!objects) {
            throw new NotFoundException('Objects with this criteria not found');
        }

        return objects;
    }

    async getAll(organizationId: number) {
        const objects = await this.getAllByWith(
            { criteria: {}, relations: [] },
            organizationId,
        );

        return objects;
    }

    async getOneObjectById(id: number, organizationId: number) {
        const object = await this.getOneBy(
            { criteria: { id } },
            organizationId,
        );

        return object;
    }

    /**
     * Метод для создания объекта.
     * @returns Возвращает объект.
     */
    async createObject(dto: CreateObjectDto, organizationId: number) {
        const object = await this.objectsRepository.create({
            name: dto.name,
            address: dto.address,
            organizationId,
        });
        if (!object) {
            throw new ConflictException('Failed to create an object');
        }

        return object;
    }

    /**
     * Получение списка оьъектов с зависимыми данными.
     * @param organizationId The identifier of the organization associated with the data.
     * @returns Возвращает список.
     */
    async getAllObjectsWith(organizationId: number) {
        const objects = await this.getAllByWith(
            {
                criteria: {},
                relations: ['typeWorks', 'scopeWorks'],
            },
            organizationId,
        );
        if (!objects) {
            throw new BadRequestException('Not found objects');
        }

        return objects;
    }

    /**
     * Метод для создания связи типа работы с объектом.
     * @returns Возвращает объект.
     */
    async assignTypeWorkById(dto: CreateAssignDto, organizationId: number) {
        const isType = await this.typeWorkService.getOneBy(
            {
                criteria: { id: dto.idTypeWork },
            },
            organizationId,
        );
        const isObject = await this.getOneBy(
            {
                criteria: { id: dto.idObject },
            },
            organizationId,
            { rejectOnEmpty: false },
        );

        if (!isObject || !isType) {
            throw new HttpException(
                'Не удалось создать связь',
                HttpStatus.BAD_REQUEST,
            );
        }
        await isObject.$set('typeWorks', [isType.id]);
        return isObject;
    }

    /**
     * Метод для удаления связи типа работы с объектом.
     * @returns Возвращает объект.
     */
    async deleteAssignById(dto: CreateAssignDto, organizationId: number) {
        const isType = await this.typeWorkService.getOneBy(
            {
                criteria: { id: dto.idTypeWork },
            },
            organizationId,
        );
        const isObject = await this.getOneBy(
            {
                criteria: { id: dto.idObject },
            },
            organizationId,
            { rejectOnEmpty: false },
        );

        if (!isObject || !isType) {
            throw new HttpException(
                'Не удалось создать связь',
                HttpStatus.BAD_REQUEST,
            );
        }
        const result = await isObject.$remove('typeWorks', [isType.id]);
        return result ? isObject : null;
    }

    /**
     * Рассчёт для обного объёма.
     * @param idObject The identifier of the object for which data is fetched.
     * @param organizationId The identifier of the organization associated with the data.
     * @param description Optional. A description of the request.
     * @returns Возвращает какое общее количество в одном объёме, процент выполнения и т.д.
     */
    async getDataForOneScopeWorkShort(
        idScopeWork: number,
        organizationId: number,
    ) {
        const scopeWork = await this.scopeWorkService.getScopeWorkBy(
            {
                criteria: { id: idScopeWork, organizationId },
                relations: ['listNameWork', 'tableAddingData'],
            },
            organizationId,
        );

        const tableAddingDataSort = await this.tableAddingDataService.getAllBy({
            criteria: { scopeWorkId: idScopeWork },
            relations: [],
        });

        const { listNameWork, tableAddingData } = scopeWork;

        const promises = listNameWork.map(async (item) => {
            return this.nameListService.getAllBy(
                {
                    criteria: { listNameWorkId: item.id },
                    relations: [],
                },
                item.id,
                organizationId,
            );
        });

        const results = await Promise.all(promises);
        const arrNames = results.flat();

        const mainCount = arrNames
            .map((item) => item.quntity)
            .reduce((currentItem, nextItem) => currentItem + nextItem, 0);

        // Получим общее количество изменений
        const countTableAddingData = tableAddingData
            .map((item) => item.quntity)
            .reduce((currentItem, nextItem) => currentItem + nextItem, 0);
        const percent = ((countTableAddingData / mainCount) * 100).toFixed(1);

        return {
            id: scopeWork.id,
            deletedAt: scopeWork.deletedAt,
            typeWorkId: scopeWork.typeWorkId,
            objectId: scopeWork.objectId,
            createdAt: scopeWork.createdAt,
            mainCount,
            countTableAddingData: Number(countTableAddingData.toFixed(2)),
            percentAll: Number(percent),
            finishDate:
                Number(percent) >= 100
                    ? tableAddingDataSort[0].createdAt
                    : null,
        };
    }

    /**
     * Рассчёт для обного объекта.
     * @param idObject The identifier of the object for which data is fetched.
     * @param organizationId The identifier of the organization associated with the data.
     * @returns Возвращает общий подсчёт по объекту и dataObject в котором по одному описан объём.
     */
    async getDataByObjectId(idObject: number, organizationId: number) {
        const oneObject = await this.getOneBy(
            {
                criteria: { id: idObject },
                relations: ['scopeWorks'],
            },
            organizationId,
            { rejectOnEmpty: false },
        );

        const { scopeWorks } = oneObject;

        const promises = scopeWorks.map(async (item) => {
            return this.getDataForOneScopeWorkShort(item.id, organizationId);
        });

        const results = await Promise.allSettled(promises);
        const fulfilledResult = results
            .filter((item) => item.status === 'fulfilled')
            .map((item) => item.value);

        const dataObject = fulfilledResult.flat();
        const mainCount = dataObject
            .map((item) => item.mainCount)
            .reduce((currentItem, nextItem) => currentItem + nextItem, 0);
        const countTableAddingData = dataObject
            .map((item) => item.countTableAddingData)
            .reduce((currentItem, nextItem) => currentItem + nextItem, 0);

        return {
            id: oneObject.id,
            name: oneObject.name,
            address: oneObject.address,
            createdAt: oneObject.createdAt,
            mainCount,
            countTableAddingData,
            percentAll: ((countTableAddingData / mainCount) * 100).toFixed(1),
            dataObject,
        };
    }

    /**
     * Метод возвращает все объекты с расчётами.
     * @returns Возвращает список.
     */
    async getListObjectWithShortData(organizationId: number) {
        const objects = await this.getAllByWith(
            { criteria: {}, relations: [] },
            organizationId,
        );

        const promises = objects.map(async (item) => {
            return this.getDataByObjectId(item.id, organizationId);
        });
        const results = await Promise.allSettled(promises);
        const fulfilledResult = results
            .filter((item) => item.status === 'fulfilled')
            .map((item) => item.value);

        return fulfilledResult;
    }

    /**
     * Метод получает список пользователей участвующих на объекте.
     * @returns Возвращает два массива [прикреплённые к объету, не прикреплённые].
     */
    async getUsersByObjectId(idObject: number, organizationId: number) {
        const { scopeWorks } = await this.getOneBy(
            { criteria: { id: idObject }, relations: ['scopeWorks'] },
            organizationId,
        );
        if (scopeWorks.length === 0) {
            return { pinnedUserIds: [], notAssignedUser: [] };
        }

        const scopeWorksIdArr: number[] = scopeWorks.map((item) => item.id);
        const usersPromise =
            this.tableAddingDataService.getParticipats(scopeWorksIdArr);

        const pinnedUserPromise =
            this.scopeWorkUserService.getAllUsersInScopeWork(scopeWorksIdArr);

        const [users, pinnedUser] = await Promise.all([
            usersPromise,
            pinnedUserPromise,
        ]);

        const idUsers = users.map((item) => item.userId);
        const pinnedUserIds = pinnedUser.map((item) => item.userId);
        const notAssignedUser = idUsers.filter(
            (item) => !pinnedUserIds.includes(item),
        );

        return { pinnedUserIds, notAssignedUser };
    }

    // TODO временно оставляю нужно разобраться, удалить если замена работает нормально
    // async getFullDataForObject(idObject: number, organizationId: number) {
    //     // TODO Проверить кэширование
    //     const dataRedis = await this.redisService.get(`oneObject:${idObject}`);
    //     if (dataRedis) {
    //         return JSON.parse(dataRedis);
    //     }

    //     const { scopeWorks } = await this.getOneBy(
    //         { criteria: { id: idObject }, relations: ['scopeWorks'] },
    //         organizationId,
    //     );
    //     const filteredScopeWorks = scopeWorks.filter(
    //         (item) => item.organizationId !== null,
    //     );
    //     const { pinnedUserIds, notAssignedUser } =
    //         await this.getUsersByObjectId(idObject, organizationId);
    //     const usersId = [...pinnedUserIds, ...notAssignedUser];
    //     const data: IOneScopeWorkWithData[] = [];
    //     const scopeWorkIdArr = filteredScopeWorks.map((item) => item.id);

    //     const dataOneScopeWorkPromise = scopeWorkIdArr.map((item) => {
    //         return this.scopeWorkService.getFullDataForOneScopeWork(
    //             item,
    //             organizationId,
    //             usersId,
    //         );
    //     });
    //     const dataOneScopeWork = await Promise.all(dataOneScopeWorkPromise);

    //     let finishUserAddingMain = [];
    //     const usersIdArr = [];
    //     for (let i = 0; i < dataOneScopeWork.length; i++) {
    //         const { countListNameWorksArr } = dataOneScopeWork[i];
    //         for (const j of dataOneScopeWork[i].listNamesWithData) {
    //             const { finishUserAdding } = j;
    //             finishUserAdding.forEach((item) => {
    //                 finishUserAddingMain.push({
    //                     quntity: item.quntity,
    //                     percentMain: (
    //                         (Number(item.quntity) * 100) /
    //                         countListNameWorksArr
    //                     ).toFixed(1),
    //                     userId: item.userId,
    //                 });
    //             });
    //             finishUserAdding.forEach((item) => {
    //                 if (!usersIdArr.includes(item.userId)) {
    //                     usersIdArr.push(item.userId);
    //                 }
    //             });
    //         }
    //         let arr = [];
    //         for (const item of usersIdArr) {
    //             const filterUser = finishUserAddingMain
    //                 .filter((user) => user.userId === item)
    //                 .map((item) => Number(item.quntity))
    //                 .reduce(
    //                     (currentItem, nextItem) => currentItem + nextItem,
    //                     0,
    //                 );
    //             arr = [
    //                 ...arr,
    //                 {
    //                     userId: item,
    //                     quntity: filterUser,
    //                     percent: (
    //                         (Number(filterUser) * 100) /
    //                         countListNameWorksArr
    //                     ).toFixed(2),
    //                 },
    //             ];
    //         }
    //         const oneScopeWork: IOneScopeWorkWithData = {
    //             id: filteredScopeWorks[i].id,
    //             deletedAt: `${filteredScopeWorks[i].deletedAt}`,
    //             typeWorkId: filteredScopeWorks[i].typeWorkId,
    //             objectId: filteredScopeWorks[i].objectId,
    //             createdAt: filteredScopeWorks[i].createdAt,
    //             updatedAt: filteredScopeWorks[i].updatedAt,
    //             ...dataOneScopeWork[i],
    //             listUsersData: arr,
    //         };

    //         data.push(oneScopeWork);
    //     }

    //     await this.redisService.set(
    //         `oneObject:${idObject}`,
    //         JSON.stringify(data),
    //         3600,
    //     );
    //     //await this.redisService.expire(`oneObject:${idObject}`, 3600);

    //     return data;
    // }

    /**
     * Возвращает полную информацию по объекту.
     * @returns Возвращает массив.
     */
    async getFullDataForObject(idObject: number, organizationId: number) {
        const cacheKey = `oneObject:${idObject}`;
        const dataRedis = await this.redisService.get(cacheKey);
        if (dataRedis) {
            return JSON.parse(dataRedis);
        }

        const dataObject = await this.getOneBy(
            { criteria: { id: idObject }, relations: ['scopeWorks'] },
            organizationId,
        );

        const filteredScopeWorks = dataObject.scopeWorks.filter(
            (item) => item.organizationId !== null,
        );
        const { pinnedUserIds, notAssignedUser } =
            await this.getUsersByObjectId(idObject, organizationId);
        const usersId = [...pinnedUserIds, ...notAssignedUser];

        const promises = filteredScopeWorks.map(async (item) => {
            const { id: scopeWorkId } = item;
            const { listNamesWithData, countListNameWorksArr } =
                await this.scopeWorkService.getFullDataForOneScopeWork(
                    item.id,
                    organizationId,
                    usersId,
                );

            let finishUserAddingMain: any[] = [];
            const usersIdSet = new Set<number>();

            listNamesWithData.forEach(({ finishUserAdding }) => {
                finishUserAdding.forEach((user) => {
                    finishUserAddingMain.push({
                        quntity: user.quntity,
                        percentMain: (
                            (Number(user.quntity) * 100) /
                            countListNameWorksArr
                        ).toFixed(1),
                        userId: user.userId,
                    });
                    usersIdSet.add(user.userId);
                });
            });

            const arr = Array.from(usersIdSet).map((userId) => {
                const filterUser = finishUserAddingMain
                    .filter((user) => user.userId === userId)
                    .map((user) => Number(user.quntity))
                    .reduce((prev, curr) => prev + curr, 0);

                return {
                    userId,
                    quntity: filterUser,
                    percent: (
                        (Number(filterUser) * 100) /
                        countListNameWorksArr
                    ).toFixed(2),
                };
            });

            return {
                id: scopeWorkId,
                deletedAt: `${item.deletedAt}`,
                typeWorkId: item.typeWorkId,
                objectId: item.objectId,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                listNamesWithData,
                listUsersData: arr,
            };
        });

        const data = await Promise.all(promises);

        await this.redisService.set(cacheKey, JSON.stringify(data), 3600);

        return data;
    }

    /**
     * {
     *  "id": 1,
     *  "name": "Кантри 1.2",
     *  "address": "г. Пенза",
     *  "deletedAt": null,
     *  "createdAt": "2024-02-06T08:44:17.000Z",
     *  "countListNameWorksObject": 19305.47,
     *  "countTableAddingDataObject": 19263.47,
     *  "mainListUserNoRepetitions": [
     *    {
     *      "userId": 2,
     *      "quntity": 35338.93999993801,
     *      "percent": "183.05"
     *    }
     *  ],
     *  "objectData": [
     *    {
     *      "id": 1,
     *      "deletedAt": "null",
     *      "typeWorkId": 2,
     *      "objectId": 1,
     *      "createdAt": "2024-02-06T08:49:28.000Z",
     *      "updatedAt": "2024-02-06T08:49:28.000Z",
     *      "countListNameWorksArr": 16078.47,
     *      "countTableAddingData": 16075.470000000001,
     *      "percentOneScopeWork": "100.0",
     *      "listNamesWithData": [
     *        {
     *          "id": 77,
     *          "name": "Установка счетчика воды многоструйного, с импульсным выходом, метрологический *класс В  \"Пульсар-М\" Ду-32 (в комплексте установочные присоединители)",
     *          "deletedAt": "null",
     *          "createdAt": "2024-02-06T08:45:31.000Z",
     *          "updatedAt": "2024-02-06T08:45:31.000Z",
     *          "unitId": 1,
     *          "nameListId": 77,
     *          "quntity": 1,
     *          "finishUserAdding": [
     *            {
     *              "quntity": 1,
     *              "percentForOneName": "100.0",
     *              "userId": 2,
     *              "nameListId": 77,
     *              "scopeWorkId": 1
     *            }
     *          ]
     *        },
     * Возвращает полную информацию по объекту.
     * @returns Возвращает объект.
     */
    // TODO рефактор не сделан
    async getAllScopeWorksWithFullData(
        idObject: number,
        organizationId: number,
    ) {
        const object = await this.getOneBy(
            { criteria: { id: idObject } },
            organizationId,
        );

        const objectData: IOneScopeWorkWithData[] =
            await this.getFullDataForObject(idObject, organizationId);

        let countListNameWorksObject = 0;
        let countTableAddingDataObject = 0;
        let mainListUserWithRepeats = [];
        // Подсчитаем данные для объекта
        for (const item of objectData) {
            const {
                countListNameWorksArr,
                countTableAddingData,
                listUsersData,
            } = item;
            mainListUserWithRepeats = [
                ...mainListUserWithRepeats,
                ...listUsersData,
            ];
            countListNameWorksObject =
                countListNameWorksObject + countListNameWorksArr;
            countTableAddingDataObject =
                countTableAddingDataObject + countTableAddingData;
        }
        // Теперь нужно избавиться от повторов в mainListUserWithRepeats
        let uniqueUserId = [
            ...new Set(mainListUserWithRepeats.map((item) => item.userId)),
        ];
        let mainListUserNoRepetitions = [];
        for (const item of uniqueUserId) {
            const filterUser = mainListUserWithRepeats
                .filter((user) => user.userId === item)
                .map((item) => Number(item.quntity))
                .reduce((currentItem, nextItem) => currentItem + nextItem, 0);
            mainListUserNoRepetitions = [
                ...mainListUserNoRepetitions,
                {
                    userId: item,
                    quntity: filterUser,
                    percent: (
                        (Number(filterUser) * 100) /
                        countListNameWorksObject
                    ).toFixed(2),
                },
            ];
        }

        return {
            id: object.id,
            name: object.name,
            address: object.address,
            deletedAt: object.deletedAt,
            createdAt: object.createdAt,
            countListNameWorksObject,
            countTableAddingDataObject,
            mainListUserNoRepetitions,
            objectData,
        };
    }
}

// TODO удалить если не требуется
// присвоим тип работ по id типа и наименованию работ
// async assignTypeWorkWithName(idTypeWork: number, nameObject: string) {
//     // Проверяем существование объекта и типа работ
//     const isObject = await this.objectsRepository.findOne({
//         where: {
//             name: nameObject,
//         },
//     });
//     // const isType = await this.typeWorkRepository.findByPk(idTypeWork);
//     const isType = await this.typeWorkService.getOneBy({
//         criteria: { id: idTypeWork },
//     });
//     if (!isObject || !isType) {
//         throw new HttpException(
//             'Не удалось создать связь',
//             HttpStatus.BAD_REQUEST,
//         );
//     }
//     await isObject.$set('typeWorks', [isType.id]);
//     return isObject;
// }

// // Получим один объект
// async getOneObject(id: number) {
//     try {
//         const oneObject = await this.objectsRepository.findByPk(id, {
//             include: { all: true },
//         });
//         return oneObject;
//     } catch (e) {
//         if (e instanceof HttpException) {
//             throw e;
//         }
//         throw new HttpException(
//             'Ошибка сервера',
//             HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//     }
// }

//   // Получим пользователей по id объекта
//   async getUsersByObjectId(idObject: number, organizationId: number) {
//     const { scopeWorks } = await this.getOneBy(
//         { criteria: { id: idObject }, relations: ['scopeWorks'] },
//         organizationId,
//     );
//     const scopeWorksIdArr: number[] = scopeWorks.map((item) => item.id);
//     const users = await this.tableAddingDataService.getParticipats(
//         scopeWorksIdArr,
//     );
//     const pinnedUserTest =
//         await this.scopeWorkUserService.getAllUsersInScopeWork(
//             scopeWorksIdArr,
//         );

//     // теперь получим пользователей которые закреплены за объектом
//     // и пользователи которые учавствовали в работах
//     // так же получим историю внесённых изменений

//     // Перебираем и добавляем закреплённых пользователей на объекте
//     for (const item of scopeWorksIdArr) {
//         // TODO внести изменения
//         // const { users } = await this.scopeWorkRepository.findByPk(
//         //     item,
//         //     // TODO внести изменния
//         //     // {
//         //     //     include: [
//         //     //         {
//         //     //             model: User,
//         //     //         },
//         //     //     ],
//         //     // },
//         // );
//         // users.forEach((user) => {
//         //     const findedUser = pinnedUser.find(
//         //         (item) => item.id === user.id,
//         //     );
//         //     if (!findedUser) {
//         //         pinnedUser.push(user);
//         //     }
//         // });
//     }
//     // TODO внести изменения
//     // Теперь получаем пользователей которых открепили от объекта
//     // Для начала получим список участвующих на объекте
//     // const users = await this.tableAddingDataRepository.findAll({
//     //     where: {
//     //         [Op.or]: scopeWorksIdArr.map((id) => {
//     //             return {
//     //                 scopeWorkId: Sequelize.literal(`"${id}"`),
//     //             };
//     //         }),
//     //     },
//     //     attributes: ['userId'],
//     //     group: ['userId'],
//     // });
//     // const users =
//     //     await this.tableAddingDataService.getListParticipats();
//     // for (const { userId } of users) {
//     //     const findedUser = pinnedUser.find(
//     //         (item) => item.id === userId,
//     //     );
//     //     if (!findedUser) {
//     //         const user = await firstValueFrom(
//     //             this.clientUser.send('test-test', userId),
//     //         );
//     //         notAssignedUser.push(user);
//     //     }
//     // }

//     //return { pinnedUser, notAssignedUser };
//     return pinnedUserTest;
// }
