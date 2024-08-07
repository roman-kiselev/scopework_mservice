import {
    ConflictException,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Item } from 'src/name_list/dto/create/create-name-list-by-name.dto';
import { CreateNameListDto } from 'src/name_list/dto/create/create-name-list.dto';
import { NameList } from 'src/name_list/entities/name-list.model';
import { NameListService } from 'src/name_list/name_list.service';
import { CreateListDto } from './dto/create/create-list.dto';
import { GetOneListNameWorkByDto } from './dto/get/get-one-list-namework-by.dto';
import { ListNameWorkFullDto } from './dto/response/list-name-work.dto';
import { ListNameWorkEditDto } from './dto/update/list-name-work-edit.dto';
import { ListNameWork } from './entities/list-name-work.model';

@Injectable()
export class ListNameWorkService {
    constructor(
        @InjectModel(ListNameWork)
        private listNameWorkRepository: typeof ListNameWork,
        @Inject(forwardRef(() => NameListService))
        private nameListService: NameListService,
    ) {}

    async getOneBy(
        dto: GetOneListNameWorkByDto,
        organizationId: number,
        params: { withDelete?: boolean } = {},
    ) {
        const listNameWork = await this.listNameWorkRepository.findOne({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDelete || null,
            },
            include: dto.relations || [],
        });

        if (!listNameWork) {
            throw new NotFoundException(
                'ListNameWork with this criteria not found',
            );
        }

        return listNameWork;
    }

    async getAllBy(
        dto: GetOneListNameWorkByDto,
        organizationId: number,
        params: { withDelete?: boolean } = {},
    ) {
        const listNameWork = await this.listNameWorkRepository.findAll({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDelete || null,
            },
            include: dto.relations || [],
        });

        return listNameWork;
    }

    // TODO изменить include и изменить наименование
    /**
     * Метод возвращает все списки по массиву scopeworkID.
     * @returns Возвращает list
     */
    async getListTest(arr: number[]) {
        const listNameWorkArr = await this.listNameWorkRepository.findAll({
            where: { id: arr },
            include: { all: true },
        });

        return listNameWorkArr;
    }

    // TOODO возможно требуется тестирование
    private async formNameAsItem(nameListId: number, organizationId: number) {
        // const nameList = await this.getOneBy(
        //     {
        //         criteria: {
        //             id: nameListId,
        //         },
        //         relations: ['nameWorks'],
        //     },
        //     organizationId,
        // );
        // const x = JSON.stringify(nameList.nameWorks);
        // const cleanObj = JSON.parse(x);
        // const arrItem: Item[] = cleanObj.map((item) => {
        //     return {
        //         id: item.id,
        //         index: item.id,
        //         key: item.id,
        //         name: item.name,
        //         quntity: item.NameList.quntity,
        //     } as Item;
        // });
        const nameList = await this.getOneById(
            nameListId.toString(),
            organizationId,
        );
        const arrItem: Item[] = nameList.nameWorks.map((item) => {
            return {
                id: item.id,
                index: item.id,
                key: item.id.toString(),
                name: item.name,
                quntity: item.NameList.quntity,
            } as Item;
        });

        return arrItem;
    }

    /**
     * Creates a new list with the provided data.
     *
     * @param {CreateListDto} dto - The data for the list.
     * @param {number} organizationId - The ID of the organization.
     * @return {Promise<ListNameWork | NameList>} The created list or the created name list.
     */
    async createList(
        dto: CreateListDto,
        organizationId: number,
    ): Promise<ListNameWork | NameList> {
        // После получения данных создаём список
        const listNameWork = await this.listNameWorkRepository.create({
            name: dto.name,
            organizationId,
            description: dto.description ?? null,
            typeWorkId: dto.typeWorkId,
        });

        if (dto.list && dto.list.length > 0) {
            // Далее создаём наименования и количество
            const finishedList = await this.nameListService.createByName({
                list: dto.list,
                listNameWorkId: listNameWork.id,
            });

            if (finishedList) {
                const newNameList = await this.listNameWorkRepository.findByPk(
                    listNameWork.id,
                    { include: { all: true } },
                );

                return newNameList;
            }
        } else {
            return listNameWork;
        }
    }

    /**
     * Get all lists.
     *
     * @param {number} organizationId - The ID of the organization.
     * @return {Promise<ListNameWork[]>} A promise that resolves to an array of ListNameWork objects representing the lists.
     */
    async getAllList(organizationId: number): Promise<ListNameWork[]> {
        const allList = await this.listNameWorkRepository.findAll({
            where: { organizationId },
            include: { all: true },
        });
        return allList;
    }

    /**
     * Retrieves a single list by its ID and organization ID.
     *
     * @param {string} id - The ID of the list to retrieve.
     * @param {number} organizationId - The ID of the organization associated with the list.
     * @return {Promise<ListNameWorkFullDto>} A promise that resolves to the retrieved ListNameWork object.
     */
    async getOneById(
        id: string,
        organizationId: number,
    ): Promise<ListNameWorkFullDto> {
        const result = await this.getOneBy(
            {
                criteria: {
                    id: +id,
                },
                relations: ['nameWorks'],
            },
            organizationId,
        );
        const data: ListNameWorkFullDto = JSON.parse(JSON.stringify(result));

        return data;
    }

    private async updateOnlyList(
        dto: Partial<ListNameWorkEditDto>,
        idNumber: number,
        organizationId: number,
    ) {
        const editFields = await this.getOneBy(
            {
                criteria: {
                    id: idNumber,
                },
                relations: ['nameWorks'],
            },
            organizationId,
        );

        editFields.description = dto.description;
        editFields.name = dto.name;
        const result = await editFields.save();
        if (!result) {
            throw new ConflictException('Failed to edit list');
        }

        return result;
    }

    /**
     * Edits a list by updating the list itself, adding or deleting items, and returning the updated list.
     *
     * @param {ListNameWorkEditDto} dto - The DTO containing the list and idNumber.
     * @param {number} organizationId - The organization ID.
     * @return {Promise<ListNameWorkFullDto>} The updated list.
     */
    async editList(
        dto: ListNameWorkEditDto,
        idNumber: number,
        organizationId: number,
    ) {
        const { list } = dto;

        // Редактируем лист
        const updatedList = await this.updateOnlyList(
            dto,
            idNumber,
            organizationId,
        );

        const cleanEditFields = await this.formNameAsItem(
            updatedList.id,
            organizationId,
        );

        const dataForEdit = list.filter((item) =>
            updatedList.nameWorks.some((el) => el.id === item.id),
        );
        const dataForAdd = list.filter(
            (item) => !updatedList.nameWorks.some((el) => el.id === item.id),
        );
        const dataForDel = cleanEditFields.filter(
            (item) => !list.some((el) => el.id === item.id),
        );

        const newEditArrPromise = this.nameListService.editArr(
            dataForEdit.map(
                ({ id, quntity }: Item) =>
                    ({
                        listNameWorkId: idNumber,
                        nameWorkId: id,
                        quntity: quntity,
                    } as CreateNameListDto),
            ),
        );
        const newDelArrPromise = this.nameListService.delArr(
            dataForDel.map(
                ({ id, quntity }: Item) =>
                    ({
                        listNameWorkId: idNumber,
                        nameWorkId: id,
                        quntity: quntity,
                    } as CreateNameListDto),
            ),
        );

        const newAddPromise = this.nameListService.createArr(
            dataForAdd.map(
                ({ id, quntity }: Item) =>
                    ({
                        listNameWorkId: idNumber,
                        nameWorkId: id,
                        quntity,
                    } as CreateNameListDto),
            ),
        );

        await Promise.all([newEditArrPromise, newDelArrPromise, newAddPromise]);

        const newNameList = await this.getOneById(
            idNumber.toString(),
            organizationId,
        );

        return newNameList;
    }

    /**
     * Retrieves a list of ListNameWork objects based on the provided typeWorkId and organizationId.
     *
     * @param {string} id - The typeWorkId to filter the ListNameWork objects by.
     * @param {number} organizationId - The organizationId to filter the ListNameWork objects by.
     * @return {Promise<ListNameWork[]>} A promise that resolves to an array of ListNameWork objects.
     * If no ListNameWork objects are found, an empty array is returned.
     */
    async getListNameWorksByTypeWorkId(
        id: string,
        organizationId: number,
    ): Promise<ListNameWork[]> {
        const listNameWorks = await this.getAllBy(
            {
                criteria: { typeWorkId: +id },
                relations: ['nameWorks'],
            },
            organizationId,
        );

        if (!listNameWorks || listNameWorks.length === 0) {
            return [];
        }

        return listNameWorks;
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async delList(id: string) {
        try {
            const findedList = await this.listNameWorkRepository.findByPk(id, {
                include: {
                    all: true,
                },
            });
            if (!findedList) {
                throw new HttpException(
                    'Список не найден',
                    HttpStatus.NOT_FOUND,
                );
            }

            const delList = await this.listNameWorkRepository.destroy({
                where: {
                    id,
                },
            });
            if (!delList) {
                throw new HttpException(
                    'Не удалось удалить список',
                    HttpStatus.BAD_REQUEST,
                );
            }

            return findedList;
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new HttpException(
                'Ошибка сервера общая',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Copies a list by its ID and organization ID.
     *
     * @param {string} id - The ID of the list to copy.
     * @param {number} organizationId - The ID of the organization.
     * @return {Promise<any>} A promise that resolves to the copied list.
     */
    async copyList(id: string, organizationId: number) {
        const originalList = await this.getOneById(id, organizationId);
        const { name, description, typeWorkId, nameWorks } = originalList;

        const copyName = `${name}(копия)`;
        const copyDescription = `${description}(копия)`;

        //Подготовим лист
        const listItem = nameWorks.map((item) => {
            const { id, name, NameList } = item;
            return {
                id: id,
                index: id,
                key: id.toString(),
                name,
                quntity: NameList.quntity,
            };
        });
        const copiedList = await this.createList(
            {
                description: copyDescription,
                name: copyName,
                list: listItem,
                typeWorkId,
            },
            organizationId,
        );

        return copiedList;
    }

    // TODO Нужно реализовать метод
    async getProgressForOneList(id: number) {}

    // ------------------------------------------------//

    /**
     * Retrieves all short records from the listNameWorkRepository for a given organization ID.
     *
     * @param {number} organizationId - The ID of the organization to retrieve records for.
     * @return {Promise<ListNameWork[]>} - A promise that resolves to an array of ListNameWork objects.
     */
    async getAllShort(organizationId: number): Promise<ListNameWork[]> {
        const list = await this.listNameWorkRepository.findAll({
            where: { organizationId },
        });
        return list;
    }

    // TODO Нужно повторное тестированеи
    /**
     * Retrieves all records from the listNameWorkRepository for a given scopeWorkId and organizationId.
     *
     * @param {number} id - The ID of the scopeWork to retrieve records for.
     * @param {number} organizationId - The ID of the organization to retrieve records for.
     * @return {Promise<ListNameWork[]>} - A promise that resolves to an array of ListNameWork objects.
     */
    async getAllListByScopeWorkId(
        id: number,
        organizationId: number,
    ): Promise<ListNameWork[]> {
        const result = await this.getAllBy(
            {
                criteria: {
                    scopeWorkId: id,
                },
                relations: [],
            },
            organizationId,
        );
        return result;
    }

    // Получим список наименований в одном списке по id списка
}
