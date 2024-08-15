import {
    Body,
    Controller,
    Get,
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
import { CreateDelTableDto } from './dto/create-deltable.dto';
import { CreateTableAddingDatumDto } from './dto/create-table-adding-datum.dto';
import { IDataGetHistoryForNameWorkId } from './interfaces/IDataGetHistoryForNameWorkId';
import { TableAddingDataService } from './table-adding-data.service';

@ApiTags('Table Adding Data')
@ApiBearerAuth()
@Controller('table-adding-data')
export class TableAddingDataController {
    constructor(
        private readonly tableAddingDataService: TableAddingDataService,
    ) {}

    @Post()
    create(@Body() createTableAddingDatumDto: CreateTableAddingDatumDto) {
        return this.tableAddingDataService.create(createTableAddingDatumDto);
    }

    @Get()
    findAll() {
        return this.tableAddingDataService.findAll();
    }

    @Get('/strings')
    findAllString(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.tableAddingDataService.findAllString(
            user.organizationId,
            page,
            limit,
            dateFrom,
            dateTo,
        );
    }

    @ApiOperation({ summary: 'Получить историю добавления данных' })
    @ApiResponse({ status: 200, type: [IDataGetHistoryForNameWorkId] })
    @Get('/historyForName')
    getHistoryForNameWorkId(
        @Query('nameListId') nameListId: number,
        @Query('nameWorkId') nameWorkId: number,
        @Query('scopeWorkId') scopeWorkId: number,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.tableAddingDataService.getHistoryForNameWorkId(
            user.organizationId,
            {
                nameListId,
                nameWorkId,
                scopeWorkId,
            },
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tableAddingDataService.findOne(+id);
    }

    @Get('/history/:id')
    getHistory(@Param('id') id: string) {
        return this.tableAddingDataService.getHistory(Number(id));
    }

    @Post('/createCandidateDel')
    createCandidateDel(
        @Body() dto: CreateDelTableDto,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.tableAddingDataService.createCandidateDel(dto, user.sub);
    }

    // TODO внести изменения
    // @Patch(':id')
    // update(
    //     @Param('id') id: string,
    //     @Body() updateTableAddingDatumDto: UpdateTableAddingDatumDto,
    // ) {
    //     return this.tableAddingDataService.update(
    //         +id,
    //         updateTableAddingDatumDto,
    //     );
    // }

    @Roles(RoleName.ADMIN)
    @UseGuards(RolesGuard)
    @Patch('/remove/:id')
    remove(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
        return this.tableAddingDataService.remove(+id, user.organizationId);
    }

    @Patch('/recovery/:id')
    recover(@Param('id') id: string) {
        return this.tableAddingDataService.recovery(+id);
    }

    @Patch('/confirm/:id')
    confirmDelCandidate(
        @Param('id') id: string,
        @Query('idDelCandidate') idDelCandidate: number,
        @ActiveUser() user: ActiveUserData,
    ) {
        return this.tableAddingDataService.confirmDelCandidate(
            +id,
            idDelCandidate,
            user.organizationId,
        );
    }
}
