import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
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
import { CreateTypeWorkDto } from './dto/create/create-type-work.dto';
import { TypeWorkWithDeletedDto } from './dto/response/type-work-with-del.dto';
import { TypeWorkDto } from './dto/response/type-work.dto';
import { TypeWork } from './entities/type-work.model';
import { TypeWorkService } from './type-work.service';

@ApiTags('TypeWork')
@ApiBearerAuth()
@Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.MASTER, RoleName.USER)
@UseGuards(RolesGuard)
@Controller('type-work')
export class TypeWorkController {
    constructor(private typeWorkService: TypeWorkService) {}

    @ApiOperation({ summary: 'Создание типа работ' })
    @ApiResponse({ status: HttpStatus.OK, type: TypeWorkDto })
    @ApiResponse({ type: HttpException })
    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Post('/')
    createObject(
        @Body() dto: CreateTypeWorkDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.typeWorkService.createTypeWork(dto, user.organizationId);
    }

    @ApiOperation({ summary: 'Получить весь список' })
    @ApiResponse({ status: HttpStatus.OK, type: [TypeWork] })
    @ApiResponse({ type: HttpException })
    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Get('/')
    getAll() {
        return this.typeWorkService.findAllTypeWork();
    }

    @ApiOperation({ summary: 'Получить список коротко' })
    @ApiResponse({ status: HttpStatus.OK, type: [TypeWorkWithDeletedDto] })
    @ApiResponse({ type: HttpException })
    @Get('/short')
    getAllShort() {
        return this.typeWorkService.getAllTypeWorksShort();
    }

    @ApiOperation({ summary: 'Получить один тип с данными' })
    @ApiResponse({ status: HttpStatus.OK, type: [TypeWork] })
    @ApiResponse({ type: HttpException })
    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Get('/:id')
    getAllTypesInObject(@Param('id') id: number) {
        return this.typeWorkService.findAllTypeWorkInObject(id);
    }
}
