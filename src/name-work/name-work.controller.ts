import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/iam/authorization/guards/roles/roles.guard';
import { ActiveUser } from 'src/iam/decorators/active-user.decorator';
import { Roles } from 'src/iam/decorators/roles-auth.decorator';
import { RoleName } from 'src/iam/enums/RoleName';
import { ActiveUserData } from 'src/iam/interfaces/active-user-data.interface';
import { CreateNameWorkArrDto } from './dto/create/create-name-work-arr.dto';
import { CreateNameWorkRowDto } from './dto/create/create-name-work-row.dto';
import { CreateNameWorkDto } from './dto/create/create-name-work.dto';
import { GetByNameQueryDto } from './dto/get/get-by-name.dto';
import { GetNameWorkByTypeWorkIdQueryDto } from './dto/get/get-namework-by-typework.dto';
import { NameWorkWithDelDto } from './dto/response/name-work-with-del.dto';
import { NameWorkWithTypeworkDto } from './dto/response/name-work-with-typework.dto';
import { NameWorkDto } from './dto/response/name-work.dto';
import { NameWorkService } from './name-work.service';

@ApiTags('Name-Work')
@ApiBearerAuth()
@Roles(RoleName.ADMIN, RoleName.MASTER, RoleName.MANAGER)
@UseGuards(RolesGuard)
@Controller('name-work')
export class NameWorkController {
    constructor(private nameWorkService: NameWorkService) {}

    @ApiOperation({ summary: 'Получить все' })
    @ApiResponse({ status: HttpStatus.OK, type: [NameWorkDto] })
    @ApiResponse({ type: HttpException })
    @Get('/')
    getAll(@ActiveUser() user: ActiveUserData) {
        return this.nameWorkService.findAllNamesWithTypes(user.organizationId);
    }

    @ApiOperation({ summary: 'Получить все целиком' })
    @ApiResponse({ status: HttpStatus.OK, type: [NameWorkWithDelDto] })
    @ApiResponse({ type: HttpException })
    @Get('/getAll')
    getAllC(@ActiveUser() user: ActiveUserData) {
        return this.nameWorkService.getAllData(user.organizationId);
    }

    @ApiOperation({ summary: 'Поиск по имени' })
    @ApiResponse({ status: HttpStatus.OK, type: [NameWorkWithDelDto] })
    @ApiQuery({ name: 'name', type: String })
    @Get('/findByName')
    findByName(
        @Query() dto: GetByNameQueryDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.nameWorkService.findNameWorksByName(
            dto.name,
            user.organizationId,
        );
    }

    @ApiOperation({ summary: 'Получить по типу' })
    @ApiResponse({ status: HttpStatus.OK, type: [NameWorkWithTypeworkDto] })
    @ApiQuery({ name: 'typeWorkId', type: String })
    @Get('/byTypeWork')
    getAllByTypeWork(
        @Query() dto: GetNameWorkByTypeWorkIdQueryDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.nameWorkService.getAllByTypeWorkId(
            dto.typeWorkId,
            user.organizationId,
        );
    }

    @ApiOperation({ summary: 'Получить по id' })
    @ApiResponse({ status: HttpStatus.OK, type: NameWorkWithTypeworkDto })
    @Get('/:id')
    getById(@Param('id') id: number, @ActiveUser() user: ActiveUserData) {
        return this.nameWorkService.getOneById(id, user.organizationId);
    }

    @ApiOperation({ summary: 'Получить по id (коротко))' })
    @ApiResponse({ status: HttpStatus.OK, type: NameWorkWithDelDto })
    @Get('/short/:id')
    getOneByIdShort(
        @Param('id') id: number,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.nameWorkService.getOneByIdShort(id, user.organizationId);
    }

    @ApiOperation({ summary: 'Создание нового наименования' })
    @ApiResponse({ status: HttpStatus.OK, type: NameWorkDto })
    @ApiConflictResponse({ type: HttpException })
    @Post('/')
    create(@Body() dto: CreateNameWorkDto, @ActiveUser() user: ActiveUserData) {
        return this.nameWorkService.createNameWorkDefault(
            dto,
            user.organizationId,
        );
    }

    @ApiOperation({ summary: 'Создание массива' })
    @ApiResponse({ status: HttpStatus.OK, type: [NameWorkDto] })
    @ApiBody({ type: [CreateNameWorkArrDto] })
    @Post('/arr')
    createArr(
        @Body() dto: CreateNameWorkArrDto[],
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.nameWorkService.createArrNameWork(dto, user.organizationId);
    }

    // TODO требуется тестирование
    @ApiOperation({ summary: 'Создание массива из excel' })
    @ApiResponse({ status: HttpStatus.OK, type: [CreateNameWorkRowDto] })
    @ApiResponse({ type: HttpException })
    @ApiBody({ type: [CreateNameWorkRowDto] })
    @Post('/createExcel')
    createExcel(
        @Body() dto: CreateNameWorkRowDto[],
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.nameWorkService.createNameWork(dto, user.organizationId);
    }
}
