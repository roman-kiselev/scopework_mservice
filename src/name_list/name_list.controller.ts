import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
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
import { IStatus } from 'src/interfaces/status/IStatus';
import { CreateNameListDto } from './dto/create/create-name-list.dto';
import { GetDataProgressByListDto } from './dto/get/get-data-progress-by-list.dto';
import { GetDateForOneDto } from './dto/get/get-date-for-one.dto';
import { GetDataForOneResponseDto } from './dto/response/get-data-for-one-response.dto';
import { GetOneNameListById } from './dto/response/get-one-name-list-by-id.dto';
import { NameListEditDto } from './dto/update/name-list-edit.dto';
import { NameList } from './entities/name-list.model';
import { NameListService } from './name_list.service';

@ApiTags('Name List')
@ApiBearerAuth()
@Controller('name-list')
export class NameListController {
    constructor(private nameListService: NameListService) {}

    // TODO рассмотреть другую возможность, так как без организации это не безопасно

    // @ApiOperation({ summary: 'Получение всех списков' })
    // @ApiResponse({ status: HttpStatus.OK, type: [NameListDto] })
    // @ApiResponse({ type: HttpException })
    // @Get('/')
    // getAll() {
    //     return this.nameListService.getAll();
    // }

    @ApiOperation({ summary: 'Получение данных по одному наименованию' })
    @ApiResponse({ status: HttpStatus.OK, type: [GetDataForOneResponseDto] })
    @Get('/getDataForOne')
    getDataForOne(
        @Query() dto: GetDateForOneDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.nameListService.getDataByNameWorkIdAndListId(
            dto.nameWorkId,
            dto.listId,
            user.organizationId,
        );
    }

    @ApiOperation({
        summary: 'Получение данных по прогрессу одному наименованию',
    })
    @Get('/getDataProgressByList')
    getDataProgressByList(
        @Query() dto: GetDataProgressByListDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.nameListService.getDataProgressByList(
            dto.listId,
            dto.scopeWorkId,
            user.organizationId,
        );
    }

    @ApiOperation({ summary: 'Наименование для одного списка' })
    @Get('/getNames/:id')
    getAllNameWorkByListId(
        @Param('id') id: number,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.nameListService.getAllNameWorkByListId(
            id,
            user.organizationId,
        );
    }

    @ApiOperation({ summary: 'Создание' })
    @ApiResponse({ status: HttpStatus.OK, type: [NameList] })
    @ApiResponse({ type: HttpException })
    @Post('/')
    create(@Body() dto: CreateNameListDto) {
        return this.nameListService.create(dto);
    }

    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Patch('/edit/:id')
    @ApiOperation({ summary: 'Редактирование' })
    async edit(
        @Param('id') id: string,
        @ActiveUser() user: ActiveUserData,
        @Body() dto: NameListEditDto,
    ) {
        try {
            await this.nameListService.editNameList(
                +id,
                user.organizationId,
                dto,
            );

            const result: IStatus = {
                message: 'Успешно',
                statusCode: HttpStatus.OK,
            };

            return result;
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Get('/:id')
    @ApiOperation({ summary: 'Получение одного значения' })
    @ApiResponse({ status: HttpStatus.OK, type: GetOneNameListById })
    getOneById(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
        return this.nameListService.getOneNameListById(
            +id,
            user.organizationId,
        );
    }
}
