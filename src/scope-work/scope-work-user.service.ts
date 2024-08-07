import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { GetUserScopeWorkDto } from './dto/get/get-user-scopework.dto';
import { UserScopeWork } from './entities/user-scope-work.model';

@Injectable()
export class ScopeWorkUserService {
    constructor(
        @InjectModel(UserScopeWork)
        private userScopeWorkRepository: typeof UserScopeWork,
    ) {}
    async getOneBy(dto: GetUserScopeWorkDto) {
        const userScopeWork = await this.userScopeWorkRepository.findOne({
            where: {
                ...dto.criteria,
            },
            include: dto.relations || [],
        });
        if (!userScopeWork) {
            throw new NotFoundException(
                'UserScopeWork with this criteria not found',
            );
        }
        return userScopeWork;
    }

    async findAllBy(dto: GetUserScopeWorkDto) {
        const userScopeWork = await this.userScopeWorkRepository.findAll({
            where: {
                ...dto.criteria,
            },
            include: dto.relations || [],
        });
        if (!userScopeWork) {
            throw new NotFoundException(
                'UserScopeWork with this criteria not found',
            );
        }
        return userScopeWork;
    }

    /**
     * Метод список пользователей в заданной рабочей области.
     * @returns Возвращает список.
     */
    async getAllUsersInScopeWork(scopeWorkId: number[]) {
        const userScopeWork = await this.userScopeWorkRepository.findAll({
            where: {
                scopeWorkId: {
                    [Op.in]: scopeWorkId,
                },
            },
            group: ['userId'],
            attributes: ['userId'],
        });

        if (!userScopeWork) {
            throw new NotFoundException(
                'UserScopeWork with this criteria not found',
            );
        }
        return userScopeWork;
    }

    /**
     * Метод для создания пользователя в рабочей области.
     * @returns Возвращает объект.
     */
    async createUserScopeWork(userId: number, scopeWorkId: number) {
        const userScopeWork = await this.userScopeWorkRepository.create({
            userId,
            scopeWorkId,
        });
        if (!userScopeWork) {
            throw new ConflictException(
                'UserScopeWork not created, please try again',
            );
        }

        return userScopeWork;
    }
}
