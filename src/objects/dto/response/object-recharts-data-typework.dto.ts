import { ApiProperty } from '@nestjs/swagger';
import { ObjectTypewWorkInfoDto } from './object-typework-info.dto';
import { ResDataForRechartsTypeworkDto } from './res-data-for-recharts-typework.dto';

export class ObjectRechartsDataTypeWorkDto {
    @ApiProperty({ example: 1, description: 'Идентификатор' })
    id: number;
    @ApiProperty({ example: 'Зеландия', description: 'Название' })
    name: string;
    @ApiProperty({ type: ObjectTypewWorkInfoDto, isArray: true })
    data: ObjectTypewWorkInfoDto[];

    static getData(
        data: ResDataForRechartsTypeworkDto[] | undefined,
    ): ObjectRechartsDataTypeWorkDto[] {
        if (!data) return [];

        const dataMap = new Map<number, ObjectRechartsDataTypeWorkDto>();

        for (const item of data) {
            let obj = dataMap.get(item.id);
            if (!obj) {
                obj = {
                    id: item.id,
                    name: item.name,
                    data: [],
                };
                dataMap.set(item.id, obj);
            }
            obj.data.push({
                percent: item.percent,
                quntity: item.quntity,
                total_quntity: item.total_quntity,
                typeWorkName: item.typeWorkName,
            });
        }

        return Array.from(dataMap.values());
    }
}
