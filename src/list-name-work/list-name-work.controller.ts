import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { CreateListDto } from './dto/create/create-list.dto';
import { ListNameWorkShortDto } from './dto/response/list-name-work-short.dto';
import { ListNameWorkFullDto } from './dto/response/list-name-work.dto';
import { ListNameWorkEditDto } from './dto/update/list-name-work-edit.dto';
import { ListNameWork } from './entities/list-name-work.model';
import { ListNameWorkService } from './list-name-work.service';

@ApiTags('List Name Work')
@ApiBearerAuth()
@Controller('list-name-work')
export class ListNameWorkController {
    constructor(private listNameWorkService: ListNameWorkService) {}

    @ApiOperation({ summary: 'Получение всех наименований списков' })
    // TODO рассмотреть добавления в dto - name-work-dto
    @ApiResponse({ status: HttpStatus.OK, type: [ListNameWorkFullDto] })
    @Get('/')
    getAllList(@ActiveUser() user: ActiveUserData) {
        return this.listNameWorkService.getAllList(user.organizationId);
    }

    @ApiOperation({ summary: 'Получение всех наименований без связных' })
    @ApiResponse({ status: HttpStatus.OK, type: [ListNameWorkShortDto] })
    @Get('/short')
    getAllListShort(@ActiveUser() user: ActiveUserData) {
        return this.listNameWorkService.getAllShort(user.organizationId);
    }

    @ApiOperation({ summary: 'Получить один' })
    @ApiResponse({ status: HttpStatus.OK, type: ListNameWorkFullDto })
    @Get('/:id')
    getOneById(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
        return this.listNameWorkService.getOneById(id, user.organizationId);
    }

    @ApiOperation({ summary: 'Копируем один' })
    @ApiResponse({ status: HttpStatus.OK, type: ListNameWork })
    @ApiResponse({ type: HttpException })
    @Get('/copy/:id')
    copyListById(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
        return this.listNameWorkService.copyList(id, user.organizationId);
    }

    @ApiOperation({ summary: 'Получаем списки по id объёма' })
    @ApiResponse({ status: HttpStatus.OK, type: ListNameWork })
    @ApiResponse({ type: HttpException })
    @Get('/getByScopeWork/:id')
    getByScopeWork(
        @Param('id') id: number,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.listNameWorkService.getAllListByScopeWorkId(
            id,
            user.organizationId,
        );
    }

    @ApiOperation({ summary: 'Получение списка по тип работ' })
    @ApiResponse({ status: HttpStatus.OK, type: [ListNameWorkFullDto] })
    @Get('/byTypeWork/:id')
    getListByTypeId(
        @Param('id') id: string,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.listNameWorkService.getListNameWorksByTypeWorkId(
            id,
            user.organizationId,
        );
    }

    // TODO метод не реализован
    @ApiOperation({ summary: 'Получение прогресса для одного списка' })
    @Get('/getProgressForOneList/:id')
    getProgressForOnуId(@Param('id') id: number) {
        return this.listNameWorkService.getProgressForOneList(id);
    }

    @ApiOperation({ summary: 'Создание' })
    @ApiResponse({ status: HttpStatus.OK, type: ListNameWorkFullDto })
    @ApiResponse({ type: HttpException })
    @Post('/')
    createNameList(
        @Body() dto: CreateListDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.listNameWorkService.createList(dto, user.organizationId);
    }

    @ApiOperation({ summary: 'Редактирование' })
    @ApiResponse({ status: HttpStatus.OK, type: ListNameWorkFullDto })
    @ApiResponse({ type: HttpException })
    @Patch('/edit/:id')
    editNameList(
        @Param('id') id: string,
        @Body() dto: ListNameWorkEditDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.listNameWorkService.editList(dto, +id, user.organizationId);
    }

    // TODO метод не тестировался
    @ApiOperation({ summary: 'Удаление' })
    @ApiResponse({ status: HttpStatus.OK, type: ListNameWork })
    @ApiResponse({ type: HttpException })
    @Delete('/del/:id')
    delList(@Param('id') id: string) {
        return this.listNameWorkService.delList(id);
    }
}
