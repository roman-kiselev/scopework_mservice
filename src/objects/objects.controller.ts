import {
    ConflictException,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { Param, UseGuards } from '@nestjs/common/decorators';
import { Body, Patch } from '@nestjs/common/decorators/http';
import { EventPattern } from '@nestjs/microservices';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/iam/authorization/guards/roles/roles.guard';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { Roles } from 'src/iam/decorators/roles-auth.decorator';
import { RoleName } from 'src/iam/enums/RoleName';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { AssignDto } from './dto/assign/assign-type.dto';
import { CreateObjectDto } from './dto/create/create-object.dto';
import { ObjectShortDataDto } from './dto/response/object-short-data.dto';
import { ObjectWithoutDelDto } from './dto/response/object-without-del.dto';
import { ObjectDto } from './dto/response/object.dto';
import { Objects } from './entities/objects.model';
import { ObjectsService } from './objects.service';

@ApiTags('Objects')
@ApiBearerAuth()
@Controller('objects')
export class ObjectsController {
    constructor(private objectsService: ObjectsService) {}

    @ApiOperation({ summary: 'Получение всех объектов' })
    @ApiResponse({ status: HttpStatus.OK, type: [ObjectDto] })
    @ApiResponse({ type: HttpException })
    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Get('/')
    getAllObjects(@ActiveUser() user: ActiveUserData) {
        return this.objectsService.getAll(user.organizationId);
    }

    @ApiOperation({ summary: 'Получение всех объектов' })
    @ApiResponse({ status: HttpStatus.OK, type: [ObjectShortDataDto] })
    @ApiResponse({ status: HttpStatus.CONFLICT, type: ConflictException })
    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Get('/shortData')
    async getAllDataShort(@ActiveUser() user: ActiveUserData) {
        return this.objectsService.getListObjectWithShortData(
            user.organizationId,
        );
    }

    @ApiOperation({ summary: 'Получение одного объекта' })
    @ApiResponse({ status: HttpStatus.OK, type: ObjectDto })
    @ApiResponse({ type: HttpException })
    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Get('/:id')
    getOneObject(@Param('id') id: number, @ActiveUser() user: ActiveUserData) {
        return this.objectsService.getOneObjectById(id, user.organizationId);
    }

    @ApiOperation({ summary: 'Получение одного объекта с данными' })
    @ApiResponse({ status: HttpStatus.OK, type: ObjectShortDataDto })
    @ApiResponse({ type: HttpException })
    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Get('/getData/:id')
    getDataForOneObject(
        @Param('id') id: number,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.objectsService.getDataByObjectId(id, user.organizationId);
    }

    @ApiOperation({ summary: 'Получение одного объекта с полными данными' })
    @ApiResponse({ status: HttpStatus.OK, type: ObjectShortDataDto })
    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Get('/fullData/:id')
    async getWithFullData(
        @Param('id') id: number,
        @ActiveUser() user: ActiveUserData,
    ) {
        console.log('id', id);
        return this.objectsService.getAllScopeWorksWithFullData(
            id,
            user.organizationId,
        );
    }

    @ApiOperation({ summary: 'Создание объектов' })
    @ApiResponse({ status: HttpStatus.OK, type: ObjectWithoutDelDto })
    @ApiResponse({ status: HttpStatus.CONFLICT, type: ConflictException })
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Post('/')
    async createOneObject(
        @Body() dto: CreateObjectDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.objectsService.createObject(dto, user.organizationId);
    }

    @ApiOperation({ summary: 'Добавляем связь с типом работ' })
    @ApiResponse({ status: HttpStatus.OK, type: Objects })
    @ApiResponse({ type: HttpException })
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Patch('/addAssign/:id')
    async addAssignTypeWork(
        @Param('id') id: number,
        @Body() dto: AssignDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.objectsService.assignTypeWorkById(
            {
                idObject: id,
                idTypeWork: dto.typeWorkId,
            },
            user.organizationId,
        );
    }

    @ApiOperation({ summary: 'Удаляем связь с типом работ' })
    @ApiResponse({ status: HttpStatus.OK, type: Objects })
    @ApiResponse({ type: HttpException })
    @Roles('admin')
    @UseGuards(RolesGuard)
    @Patch('/delete-assign/:id')
    async deleteAssignTypeWork(
        @Param('id') id: number,
        @Body() dto: AssignDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.objectsService.deleteAssignById(
            {
                idObject: id,
                idTypeWork: dto.typeWorkId,
            },
            user.organizationId,
        );
    }

    // TODO добавить dto в котором будут organizationId и idObject
    @EventPattern('getObjectById')
    async eventGetObjectById(id: string, organizationId: number) {
        return this.objectsService.getOneBy(
            {
                criteria: { id: +id },
                relations: [],
            },
            organizationId,
        );
    }
}

// @ApiOperation({ summary: 'Получение всех объектов(без зависимостей)' })
// @ApiResponse({ status: HttpStatus.OK, type: [Objects] })
// @ApiResponse({ type: HttpException })
// @Get('/shortAllObjects')
// async getAllShortData(@ActiveUser() user: ActiveUserData) {
//     return this.objectsService.getShortAllObjects(user.organizationId);
// }
