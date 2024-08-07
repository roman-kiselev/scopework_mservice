import {
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUniteDto } from './dto/create/create-unit.dto';
import { GetOneUnitBy } from './dto/get/get-one-unit-by.dto';
import { Unit } from './entities/unit.model';

@Injectable()
export class UnitService {
    constructor(@InjectModel(Unit) private unitRepository: typeof Unit) {}

    /**
     * Универсальный метод для получения одного объекта.
     * @returns Возвращает объект.
     */
    async getOneUnitBy(
        dto: GetOneUnitBy,
        organizationId: number,
        params: { rejectOnEmpty?: boolean; withDeleted?: boolean } = {},
    ) {
        const unit = await this.unitRepository.findOne({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDeleted ? params.withDeleted : null,
            },
            include: dto.relations || [],
            rejectOnEmpty: params.rejectOnEmpty || false,
        });

        if (!unit) {
            throw new NotFoundException('Unit with this criteria not found');
        }

        return unit;
    }

    /**
     * Универсальный метод для получения .
     * @returns Возвращает объект.
     */
    async getAllUnitsBy(
        dto: GetOneUnitBy,
        organizationId: number,
        params: { withDeleted?: boolean } = {},
    ) {
        const units = await this.unitRepository.findAll({
            where: {
                ...dto.criteria,
                organizationId,
                deletedAt: params.withDeleted ? params.withDeleted : null,
            },
        });

        return units;
    }

    /**
     * Проверка существования еденицы измерения.
     * @returns Возвращает объект или null.
     */
    async checkUnit(dto: GetOneUnitBy, organizationId: number) {
        try {
            const unit = await this.getOneUnitBy(
                { criteria: { name: dto.criteria.name }, relations: [] },
                organizationId,
            );

            return unit;
        } catch (e) {
            return null;
        }
    }

    /**
     * Метод создания еденицы измерения.
     * @returns Возвращает объект.
     */
    async createUnit(dto: CreateUniteDto, organizationId: number) {
        const unit = await this.checkUnit(
            { criteria: { name: dto.name }, relations: [] },
            organizationId,
        );
        if (unit) {
            throw new ConflictException('Unit with this name already exists');
        }
        const newUnit = await this.unitRepository.create({
            ...dto,
            organizationId,
        });

        if (!newUnit) {
            throw new ConflictException('Unit with this name already exists');
        }
        return newUnit;
    }

    /**
     * Метод получения едениц измерения.
     * @returns Возвращает список.
     */
    async getAllUnit(organizationId: number) {
        const units = await this.getAllUnitsBy(
            { criteria: {}, relations: [] },
            organizationId,
        );
        if (!units) {
            throw new HttpException('Произошла ошибка', HttpStatus.BAD_REQUEST);
        }
        return units;
    }

    /**
     * Метод получения имени единицы измерения.
     * @returns Возвращает наименование.
     */
    // Возвращает значение
    async getUnitName(id: number, organizationId: number) {
        const unit = await this.getOneUnitBy(
            { criteria: { id }, relations: [] },
            organizationId,
        );

        return {
            name: unit.name,
        };
    }

    /**
     * Метод создаёт или создаёт и возвращает unit.
     * @returns Возвращает объект.
     */
    async getDefaultUnit(organizationId: number) {
        const unit = await this.checkUnit(
            { criteria: { name: 'шт' }, relations: [] },
            organizationId,
        );

        if (!unit) {
            const newUnit = await this.createUnit(
                { name: 'шт', description: 'Штуки' },
                organizationId,
            );
            return newUnit;
        }
        return unit;
    }

    async createUnitByName(name: string, organizationId: number) {
        const unit = await this.checkUnit(
            { criteria: { name }, relations: [] },
            organizationId,
        );
        if (unit) {
            return unit;
        }
        const newUnit = await this.createUnit(
            { name, description: 'Пусто' },
            organizationId,
        );
        return newUnit;
    }
}

// TODO
// /**
//  * @deprecated This method is deprecated and will be removed in the future.
//  * Please use newMethod instead.
//  */
// async createUniteOrPieces(id?: number, organizationId?: number) {
//     try {
//         const dtoUnit: CreateUniteDto = {
//             name: 'шт',
//             description: 'Штуки',
//         };
//         // Если нет id
//         if (!id) {
//             const checkUnit = this.checkByName(dtoUnit.name);
//             if (!checkUnit) {
//                 const unit = await this.createUnit(dtoUnit);
//                 return unit;
//             }
//         }
//         // Если есть id
//         const foundUnit = this.getOneUnitById(id);
//         return foundUnit;
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
