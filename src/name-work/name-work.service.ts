import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DatabaseService } from 'src/database/database.service';
import { TypeWork } from 'src/type-work/entities/type-work.model';
import { TypeWorkService } from 'src/type-work/type-work.service';
import { UnitService } from 'src/unit/unit.service';
import { CreateNameWorkArrDto } from './dto/create/create-name-work-arr.dto';
import { CreateNameWorkRowDto } from './dto/create/create-name-work-row.dto';
import { CreateNameWorkDto } from './dto/create/create-name-work.dto';
import { CreateNameworkWithNameUnitDto } from './dto/create/create-namework-with-name-unit';
import { GetOneNameWorkByDto } from './dto/get/get-one-namework-by.dto';
import { UpdateNameWorkDto } from './dto/update/update-name-work.dto';
import { NameWork } from './entities/name-work.model';

@Injectable()
export class NameWorkService {
    constructor(
        @InjectModel(NameWork) private nameWorkRepository: typeof NameWork,
        private readonly unitService: UnitService,
        private readonly typeWorkService: TypeWorkService,
        private databaseService: DatabaseService,
    ) {}

    /**
     * Универсальный метод для получения одного объекта.
     * @returns Возвращает объект.
     */
    async getOneNameWorkBy(
        dto: GetOneNameWorkByDto,
        organizationId: number,
        params: {
            rejectOnEmpty?: boolean;
            withDeleted?: boolean;
        } = {},
    ) {
        const nameWork = await this.nameWorkRepository.findOne({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDeleted ? params.withDeleted : null,
            },
            include: dto.relations || [],
            rejectOnEmpty: params.rejectOnEmpty || false,
        });

        if (!nameWork) {
            throw new NotFoundException(
                'NameWork with this criteria not found',
            );
        }

        return nameWork;
    }

    /**
     * Универсальный метод для получения списка.
     * @returns Возвращает список.
     */
    async getAllNameWorkBy(
        dto: GetOneNameWorkByDto,
        organizationId: number,
        params: { withDeleted?: boolean } = {},
    ) {
        const nameWorks = await this.nameWorkRepository.findAll({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDeleted ? params.withDeleted : null,
            },
            include: dto.relations || [],
        });

        return nameWorks;
    }

    async checkNameWorkByName(name: string, organizationId: number) {
        try {
            const nameWork = await this.getOneNameWorkBy(
                {
                    criteria: { name: name.trim() },
                    relations: [],
                },
                organizationId,
            );

            return nameWork;
        } catch (e) {
            return null;
        }
    }

    /**
     * Проверка на существование имени.
     * @returns Возвращает true/false.
     */
    async checkNameWithDto(dto: CreateNameWorkDto, organizationId: number) {
        const { name, typeWorkId, unitId } = dto;

        const isName = await this.getOneNameWorkBy(
            {
                criteria: { name: name.trim() },
                relations: [],
            },
            organizationId,
        );

        const promises = typeWorkId.map((item) => {
            return this.typeWorkService.getOneBy(
                {
                    criteria: { id: item },
                    relations: [],
                },
                organizationId,
            );
        });
        const isTypeWorkArr = await Promise.allSettled(promises);
        const promisesReject = isTypeWorkArr.filter(
            (item) => item.status === 'rejected',
        );

        const isUnit = await this.unitService.getOneUnitBy(
            { criteria: { id: unitId }, relations: [] },
            organizationId,
        );
        if (!isName || promisesReject.length > 0 || !isUnit) {
            return false;
        }
        return true;
    }

    /**
     * Создание если есть unit.
     * @returns Возвращает созданный объект.
     */
    private async createNameWorkWithUnit(
        dto: CreateNameWorkDto,
        organizationId: number,
    ) {
        const unit = await this.unitService.getOneUnitBy(
            { criteria: { id: dto.unitId }, relations: [] },
            organizationId,
            { rejectOnEmpty: false },
        );

        const nameWork = await this.nameWorkRepository.create({
            name: dto.name,
            unitId: unit.id,
            organizationId,
        });

        const { promisesResolve, promisesReject } =
            await this.typeWorkService.checkTypeWorksByIds(
                dto.typeWorkId,
                organizationId,
            );

        const promises = promisesResolve.map((item) => {
            return nameWork.$add('typeWorks', [item.id]);
        });
        const result = await Promise.all(promises);
        if (!result || !nameWork) {
            throw new ConflictException('NameWork not created');
        }

        return nameWork;
    }

    /**
     * Создают с unit по умолчанию (шт.).
     * @returns Возвращает созданный объект.
     */
    private async createNameWorkWithoutUnit(
        dto: Omit<CreateNameWorkDto, 'unitId'>,
        organizationId: number,
    ) {
        const unit = await this.unitService.getDefaultUnit(organizationId);

        const nameWork = this.createNameWorkWithUnit(
            {
                name: dto.name.trim(),
                typeWorkId: dto.typeWorkId,
                unitId: unit.id,
            },
            organizationId,
        );
        if (!nameWork) {
            throw new ConflictException('NameWork not created');
        }

        return nameWork;
    }

    /**
     * Создаёт unit по наименованию и создаёт namework
     * @returns Возвращает созданный объект.
     */
    private async createNameWorkWithUnitByName(
        dto: CreateNameworkWithNameUnitDto,
        organizationId: number,
    ) {
        const unit = await this.unitService.createUnitByName(
            dto.unitName.trim(),
            organizationId,
        );

        const nameWork = await this.nameWorkRepository.create({
            name: dto.name,
            unitId: unit.id,
            organizationId,
        });

        const { promisesResolve } =
            await this.typeWorkService.checkTypeWorksByIds(
                dto.typeWorkId,
                organizationId,
            );

        const promises = promisesResolve.map((item) => {
            return nameWork.$add('typeWorks', [item.id]);
        });
        const result = await Promise.all(promises);
        if (!result || !nameWork) {
            throw new ConflictException('NameWork not created');
        }

        return nameWork;
    }

    /**
     * Создание наименования по умолчанию со штуками.
     * @returns объект наименования.
     */
    async createNameWorkDefault(
        dto: CreateNameWorkDto,
        organizationId: number,
    ) {
        const isName = await this.checkNameWorkByName(dto.name, organizationId);

        if (isName) {
            throw new ConflictException('NameWork already exists');
        }

        if (!dto.unitId) {
            return this.createNameWorkWithoutUnit(dto, organizationId);
        }
        return this.createNameWorkWithUnit(dto, organizationId);
    }

    /**
     * Обновление наименования.
     * @returns объект наименования.
     */
    async updateNameWork(
        id: number,
        dto: UpdateNameWorkDto,
        organizationId: number,
    ) {
        const nameWork = await this.getOneNameWorkBy(
            { criteria: { id }, relations: [] },
            organizationId,
        );
        const updated = await nameWork.update({ ...dto });
        return updated;
    }

    // TODO Непонятное что то, переписать или удалить
    // async createNoChecks(dto: CreateNameWorkDto) {
    //     try {
    //         console.log(dto);
    //         const { name, typeWorkId, unitId } = dto;

    //         // Создаём наименование и связь
    //         // Ищем наименование
    //         const findedNameWork = await this.nameWorkRepository.findOne({
    //             where: { name: name.trim() },
    //         });
    //         // Если есть
    //         if (findedNameWork) {
    //             // Проверяем связь с типом
    //             const findNameAndType =
    //                 await this.nameWorkTypeWorkRepository.findOne({
    //                     where: {
    //                         nameWorkId: findedNameWork.id,
    //                         typeWorkId: typeWorkId,
    //                     },
    //                 });
    //             // Если связи нет , но при этом наименование есть
    //             if (!findNameAndType) {
    //                 // Добавляем тип
    //                 await findedNameWork.$add('typeWorks', typeWorkId);
    //                 const unit = await this.unitService.getOneUnitById(
    //                     findedNameWork.unitId,
    //                 );

    //                 const finishNameWork = {
    //                     id: findedNameWork.id,
    //                     name: findedNameWork.name,
    //                     deletedAt: findedNameWork.deletedAt,
    //                     createdAt: findedNameWork.createdAt,
    //                     updatedAt: findedNameWork.updatedAt,
    //                     unit: unit,
    //                     typeWorks: findedNameWork.typeWorks,
    //                 };

    //                 return finishNameWork;
    //             }
    //         }

    //         const newNameWork = await this.nameWorkRepository.create({
    //             name: name.trim(),
    //             unitId: unitId,
    //         });

    //         await newNameWork.$set('typeWorks', typeWorkId);

    //         const nameWork = await this.nameWorkRepository.findOne({
    //             where: { id: newNameWork.id },
    //             include: [
    //                 {
    //                     model: TypeWork,
    //                     attributes: {
    //                         exclude: ['NameWorkTypeWork'],
    //                     },
    //                     through: { attributes: [] },
    //                 },
    //                 {
    //                     model: TableAddingData,
    //                 },
    //             ],
    //         });
    //         if (!nameWork) {
    //             throw new HttpException(
    //                 'Наименование не найдено',
    //                 HttpStatus.NOT_FOUND,
    //             );
    //         }
    //         const unit = await this.unitService.getOneUnitById(nameWork.unitId);

    //         const finishNameWork = {
    //             id: nameWork.id,
    //             name: nameWork.name,
    //             deletedAt: nameWork.deletedAt,
    //             createdAt: nameWork.createdAt,
    //             updatedAt: nameWork.updatedAt,
    //             unit: unit,
    //             typeWorks: nameWork.typeWorks,
    //         };

    //         return finishNameWork;
    //     } catch (e) {
    //         if (e instanceof HttpException) {
    //             throw e;
    //         }
    //         throw new HttpException(
    //             e.message,
    //             HttpStatus.INTERNAL_SERVER_ERROR,
    //         );
    //     }
    // }

    /**
     * Получаем список наименований, но с изменённым тип.
     * @returns список объектов нового типа.
     */
    async findAllNamesWithTypes(organizationId: number) {
        const units = await this.unitService.getAllUnitsBy(
            { criteria: {}, relations: [] },
            organizationId,
        );
        const names = await this.getAllNameWorkBy(
            { criteria: {}, relations: ['typeWorks'] },
            organizationId,
        );
        const newNames = names.map((name) => {
            const unit = units.find((unit) => unit.id === name.unitId);
            return {
                id: name.id,
                name: name.name,
                deletedAt: name.deletedAt,
                createdAt: name.createdAt,
                updatedAt: name.updatedAt,
                typeWorks: name.typeWorks,
                unit: unit,
            };
        });

        return newNames;
    }

    /**
     * Получаем список наименований.
     * @returns список.
     */
    async getAllData(organizationId: number) {
        const data = await this.getAllNameWorkBy(
            { criteria: {}, relations: [] },
            organizationId,
        );

        return data;
    }

    /**
     * Получаем одно наименование.
     * @returns объект нового типа.
     */
    async getOneById(id: number, organizationId: number) {
        const nameWork = await this.getOneNameWorkBy(
            { criteria: { id }, relations: ['typeWorks'] },
            organizationId,
        );
        const unit = await this.unitService.getOneUnitBy(
            { criteria: { id: nameWork.unitId }, relations: [] },
            organizationId,
        );

        const finishNameWork = {
            id: nameWork.id,
            name: nameWork.name,
            deletedAt: nameWork.deletedAt,
            createdAt: nameWork.createdAt,
            updatedAt: nameWork.updatedAt,
            unit: unit,
            typeWorks: nameWork.typeWorks,
        };
        return finishNameWork;
    }

    /**
     * Получаем одно наименование без зависисмостей.
     * @returns объект.
     */
    async getOneByIdShort(id: number, organizationId: number) {
        const nameWork = await this.getOneNameWorkBy(
            { criteria: { id }, relations: [] },
            organizationId,
        );

        return nameWork;
    }

    // [
    //     {
    //       "id": 78,
    //       "name": "Счетчик воды многоструйный, с импульсным выходом, метрологический класс В  \"Пульсар-М\" Ду-32 (в комплексте установочные присоединители)",
    //       "deletedAt": null,
    //       "createdAt": "2024-02-06T08:45:31.000Z",
    //       "updatedAt": "2024-02-06T08:45:31.000Z",
    //       "unit": {
    //         "id": 1,
    //         "name": "шт",
    //         "organizationId": 2,
    //         "description": "Штуки",
    //         "deletedAt": null,
    //         "createdAt": "2024-02-06T05:26:52.000Z",
    //         "updatedAt": "2024-02-06T05:26:52.000Z"
    //       }
    //     },
    //     {
    //       "id": 80,
    //       "name": "Установка фильтра магнитно-механического фланцевого PN16 ( с учётом фланцев)  DN50",
    //       "deletedAt": null,
    //       "createdAt": "2024-02-06T08:45:31.000Z",
    //       "updatedAt": "2024-02-06T08:45:31.000Z",
    //       "unit": {
    //         "id": 1,
    //         "name": "шт",
    //         "organizationId": 2,
    //         "description": "Штуки",
    //         "deletedAt": null,
    //         "createdAt": "2024-02-06T05:26:52.000Z",
    //         "updatedAt": "2024-02-06T05:26:52.000Z"
    //       }
    //     },
    //     {
    //       "id": 79,
    //       "name": "Установка крана шарового фланцевого PN16 (с учётом фланцев) DN50 (КШ.Ц.Ф.050.050.Н/П.02)",
    //       "deletedAt": null,
    //       "createdAt": "2024-02-06T08:45:31.000Z",
    //       "updatedAt": "2024-02-06T08:45:31.000Z",
    //       "unit": {
    //         "id": 1,
    //         "name": "шт",
    //         "organizationId": 2,
    //         "description": "Штуки",
    //         "deletedAt": null,
    //         "createdAt": "2024-02-06T05:26:52.000Z",
    //         "updatedAt": "2024-02-06T05:26:52.000Z"
    //       }
    //     },

    // Получить наименования по типу
    /**
     * Получаем список наименований по типу.
     * @returns список.
     */
    async getAllByTypeWorkId(typeWorkId: string, organizationId: number) {
        if (typeWorkId === '0') {
            return [];
        }

        const units = await this.unitService.getAllUnitsBy(
            { criteria: { organizationId }, relations: [] },
            organizationId,
        );
        const result = await this.nameWorkRepository.findAll({
            include: [
                {
                    model: TypeWork,
                    where: {
                        id: +typeWorkId,
                    },
                },
            ],
        });
        const newNames = result.map((name) => {
            const unit = units.find((u) => u.id === name.unitId);
            return {
                id: name.id,
                name: name.name,
                deletedAt: name.deletedAt,
                createdAt: name.createdAt,
                updatedAt: name.updatedAt,
                typeWorks: name.typeWorks,
                unit: unit,
            };
        });

        return newNames;
    }

    /**
     * Подготовка массива для добавления.
     * @returns список.
     */
    private async prepareCreateNameWorkArr(
        dto: CreateNameWorkArrDto[],
        organizationId: number,
    ) {
        const arrNames = dto.map((name) => {
            return name.name.trim();
        });

        const names = await this.nameWorkRepository.findAll({
            where: {
                name: arrNames,
                organizationId,
                deletedAt: null,
            },
        });

        const finishArr: CreateNameWorkArrDto[] = [];

        dto.forEach((name) => {
            const findIndex = names.findIndex(
                (n) => n.name === name.name.trim(),
            );
            if (findIndex === -1) {
                finishArr.push(name);
            }
        });

        return finishArr;
    }

    // Создать из excel файла - получаем массив
    /**
     * Создаем массив наименований.
     * @returns список.
     */
    async createArrNameWork(
        dto: CreateNameWorkArrDto[],
        organizationId: number,
    ) {
        const prepareArr = await this.prepareCreateNameWorkArr(
            dto,
            organizationId,
        );

        const t = await this.nameWorkRepository.sequelize.transaction();
        try {
            const typeWorks = await this.typeWorkService.getAllBy(
                { criteria: { organizationId }, relations: [] },
                organizationId,
            );

            const arr = prepareArr.map((nameWork) => {
                const typeWork = typeWorks.find(
                    (t) => t.name === nameWork.typeWork,
                );
                return {
                    name: nameWork.name.trim(),
                    unitName: nameWork.unit.trim(),
                    typeWorkId: typeWork.id,
                    organizationId: organizationId,
                };
            });

            const newArrPromises = arr.map((nameWork) => {
                return this.createNameWorkWithUnitByName(
                    {
                        name: nameWork.name,
                        typeWorkId: [nameWork.typeWorkId],
                        unitName: nameWork.unitName,
                    },
                    nameWork.organizationId,
                );
            });

            const newArr = await Promise.all(newArrPromises);

            await t.commit();
            return newArr;
        } catch (e) {
            await t.rollback();
            throw new BadRequestException(e);
        }
    }

    // Создаём наименования и отдаём список
    // TODO требуется доработать(Протестировать)
    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async createNameWork(dto: CreateNameWorkRowDto[], organizationId: number) {
        // Отдаём в любом случае наименование
        const arrNames = Promise.all(
            dto.map(async (nameWork) => {
                if (
                    !(await this.getOneNameWorkBy(
                        { criteria: { name: nameWork.name }, relations: [] },
                        organizationId,
                    ))
                ) {
                    const newNameWork = await this.createNameWorkWithUnit(
                        {
                            name: nameWork.name,
                            unitId: nameWork.unitId,
                            typeWorkId: [nameWork.typeWorkId],
                        },
                        organizationId,
                    );

                    if (newNameWork) {
                        return {
                            id: newNameWork.id,
                            name: newNameWork.name,
                            typeWorkId: nameWork.typeWorkId,
                            unitId: newNameWork.unitId,
                            row: nameWork.row,
                            quntity: nameWork.quntity,
                        } as CreateNameWorkRowDto;
                    }
                }
                const oldNameWork = await this.nameWorkRepository.findOne({
                    where: {
                        name: nameWork.name,
                    },
                });
                return {
                    ...nameWork,
                    id: oldNameWork.id,
                };
            }),
        );

        return arrNames;
    }

    /**
     * Получаем список наименований по тексту.
     * @returns список.
     */
    async findNameWorksByName(text: string, organizationId: number) {
        // TODO: доработать проблема с базой данных (изменить наименование)
        const query = `
      SELECT * FROM sw.name_work
      WHERE name LIKE :textForFind AND organizationId = :organizationId
      ORDER BY CASE WHEN name LIKE :textStart THEN 0 ELSE 1 END, name
      LIMIT 10;
      `;
        const textArr = text.split(' ');
        const replacements = {
            textForFind: `%${textArr.join('%')}%`,
            textStart: `${textArr.join('%')}%`,
            organizationId: organizationId,
        };
        const result = await this.databaseService.executeQuery(
            query,
            replacements,
        );

        return result;
    }
}

/**
 * @deprecated This method is deprecated and will be removed in the future.
 * Please use newMethod instead.
 */
// async checkOneByName(name: string) {
//     try {
//         const nameWork = await this.nameWorkRepository.findOne({
//             where: {
//                 name,
//             },
//         });

//         if (!nameWork) {
//             return false;
//         }

//         return nameWork;
//     } catch (e) {
//         if (e instanceof HttpException) {
//             throw e;
//         }
//         throw new HttpException(
//             e.message,
//             HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//     }
// }

/**
 * @deprecated This method is deprecated and will be removed in the future.
 * Please use newMethod instead.
 */
// async findOneByName(name: string) {
//     try {
//         const nameWork = await this.nameWorkRepository.findOne({
//             where: {
//                 name,
//                 deletedAt: null,
//             },
//         });
//         if (!nameWork) {
//             throw new HttpException(
//                 'Наименование не найдено',
//                 HttpStatus.NOT_FOUND,
//             );
//         }
//         return nameWork;
//     } catch (e) {
//         if (e instanceof HttpException) {
//             throw e;
//         }
//         throw new HttpException(
//             e.message,
//             HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//     }
// }

// /**
//  * @deprecated This method is deprecated and will be removed in the future.
//  * Please use newMethod instead.
//  */
// private async addTypeWork(id: number, arr: number[]): Promise<void> {
//     // Проверяем существование типа и привязываем
//     const nameWork = await this.nameWorkRepository.findByPk(id);
//     if (nameWork) {
//         for (const item of arr) {
//             const typeWork = await this.typeWorkRepository.findByPk(item);
//             if (typeWork) {
//                 await nameWork.$set('typeWorks', typeWork.id);
//             }
//         }
//     }
// }

/**
 * @deprecated This method is deprecated and will be removed in the future.
 * Please use newMethod instead.
 */
// async create(dto: CreateNameWorkDto) {
//     try {
//         console.log(dto);
//         const { name, typeWorkId, unitId } = dto;
//         // Проверим существование товара
//         if (!this.checkNameWithDto(dto)) {
//             throw new HttpException(
//                 'Не удалось создать наименование',
//                 HttpStatus.BAD_REQUEST,
//             );
//         }
//         // Создаём наименование и связь
//         const newNameWork = await this.nameWorkRepository.create({
//             name: name.trim(),
//             unitId: unitId,
//         });
//         await newNameWork.$set('typeWorks', typeWorkId);

//         const nameWork = await this.nameWorkRepository.findOne({
//             where: { id: newNameWork.id },
//             include: [
//                 {
//                     model: TypeWork,
//                     attributes: {
//                         exclude: ['NameWorkTypeWork'],
//                     },
//                     through: { attributes: [] },
//                 },
//                 {
//                     model: TableAddingData,
//                 },
//             ],
//         });
//         if (!nameWork) {
//             throw new HttpException(
//                 'Наименование не найдено',
//                 HttpStatus.NOT_FOUND,
//             );
//         }
//         const unit = await this.unitService.getOneUnitById(nameWork.unitId);

//         const finishNameWork = {
//             id: nameWork.id,
//             name: nameWork.name,
//             deletedAt: nameWork.deletedAt,
//             createdAt: nameWork.createdAt,
//             updatedAt: nameWork.updatedAt,
//             unit: unit,
//             typeWorks: nameWork.typeWorks,
//         };

//         return finishNameWork;
//     } catch (e) {
//         if (e instanceof HttpException) {
//             throw e;
//         }
//         throw new HttpException(
//             e.message,
//             HttpStatus.INTERNAL_SERVER_ERROR,
//         );
//     }
// }
