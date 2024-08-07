import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateTypeWorkDto } from './dto/create/create-type-work.dto';
import { GetOneByDto } from './dto/get/get-one-by.dto';
import { TypeWork } from './entities/type-work.model';

@Injectable()
export class TypeWorkService {
    constructor(
        @InjectModel(TypeWork) private typeWorkRepository: typeof TypeWork,
    ) {}

    /**
     * Метод для получения одного типа.
     * @returns Возвращает тип
     */
    async getOneBy(
        dto: GetOneByDto,
        organizationId: number,
        params: { withDeleted?: boolean } = {},
    ) {
        const type = await this.typeWorkRepository.findOne({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDeleted ? params.withDeleted : null,
            },
            include: dto.relations || [],
        });

        if (!type) {
            throw new NotFoundException('Type with this criteria not found');
        }

        return type;
    }

    /**
     * Метод для получения списка типов.
     * @returns Возвращает список
     */
    async getAllBy(
        dto: GetOneByDto,
        organizationId: number,
        params: { withDeleted?: boolean } = {},
    ) {
        const types = await this.typeWorkRepository.findAll({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDeleted ? params.withDeleted : null,
            },
            include: dto.relations || [],
        });

        return types;
    }

    /**
     * Метод для проверки наличия типа в базе.
     * @returns Возвращает созданный тип
     */
    async checkOneBy(dto: GetOneByDto, organizationId: number) {
        try {
            const type = await this.getOneBy(
                {
                    criteria: dto.criteria,
                    relations: [],
                },
                organizationId,
            );

            return type;
        } catch (e) {
            return null;
        }
    }

    async checkTypeWorksByIds(ids: number[], organizationId: number) {
        const promisesTypeWork = ids.map((item) => {
            return this.getOneBy(
                {
                    criteria: { id: item },
                    relations: [],
                },
                organizationId,
            );
        });
        const typeWorkArr = await Promise.allSettled(promisesTypeWork);
        const promisesResolve = typeWorkArr
            .filter((item) => item.status === 'fulfilled')
            .map((item) => item.value);
        const promisesReject = typeWorkArr
            .filter((item) => item.status === 'rejected')
            .map((item) => item.reason);
        return { promisesResolve, promisesReject };
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async checkOneObjectByName(name: string) {
        try {
            const object = await this.typeWorkRepository.findOne({
                where: {
                    name,
                },
            });
            if (object) {
                return true;
            }
            return false;
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
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
    async findAllTypeWork() {
        try {
            const objects = this.typeWorkRepository.findAll({
                where: {
                    deletedAt: null,
                },
                include: { all: true },
            });
            if (!objects) {
                throw new HttpException(
                    'Не удалось получить список',
                    HttpStatus.BAD_REQUEST,
                );
            }

            return objects;
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
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
    async findAllTypeWorkInObject(idObject: number) {
        try {
            const objects = this.typeWorkRepository.findByPk(idObject, {
                include: {
                    all: true,
                    where: {
                        deletedAt: null,
                    },
                },
            });
            if (!objects) {
                throw new HttpException(
                    'Не удалось получить список',
                    HttpStatus.BAD_REQUEST,
                );
            }

            return objects;
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Метод для создания типа работ.
     * @returns Возвращает созданный тип
     */
    async createTypeWork(dto: CreateTypeWorkDto, organizationId: number) {
        const isType = await this.checkOneBy(
            { criteria: { name: dto.name }, relations: [] },
            organizationId,
        );

        if (isType) {
            throw new ConflictException(
                'Typework with this name already exists',
            );
        }

        try {
            const typeWork = await this.typeWorkRepository.create({
                name: dto.name,
                description: dto.description,
                organizationId: organizationId,
            });

            return typeWork;
        } catch (error) {
            throw new ConflictException(
                'Filed create TypeWork. Please try again',
            );
        }
    }

    /**
     * @deprecated This method is deprecated and will be removed in the future.
     * Please use newMethod instead.
     */
    async findTypeWorkByName(name: string) {
        try {
            const typeWork = await this.typeWorkRepository.findOne({
                rejectOnEmpty: true,
                where: {
                    name,
                },
            });
            if (!typeWork) {
                throw new HttpException(
                    'Такого типа не существует',
                    HttpStatus.NOT_FOUND,
                );
            }
            return typeWork;
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
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
    async getAllTypeWorksShort() {
        try {
            const types = await this.typeWorkRepository.findAll();

            return types;
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new HttpException(
                e.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
