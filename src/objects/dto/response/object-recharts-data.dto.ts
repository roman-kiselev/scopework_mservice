import { ApiProperty } from '@nestjs/swagger';
import { IGetDataObjectsForRecharts } from 'src/objects/interfaces/IGetDataObjectsForRecharts';
import { ObjectInfoDto } from './object-info.dto';

export class ObjectRechartsDataDto {
    @ApiProperty({ example: 1, description: 'Id объекта' })
    id: number;

    @ApiProperty({ example: 'Кантри 1.2', description: 'Наименование объекта' })
    name: string;
    @ApiProperty({ type: ObjectInfoDto, isArray: true })
    data: ObjectInfoDto[];

    static getData(data: IGetDataObjectsForRecharts[] | undefined) {
        const newData: ObjectRechartsDataDto[] = [];
        if (data) {
            data.forEach((item) => {
                const findedIndex = newData.findIndex(
                    ({ name }) => item.name === name,
                );
                if (findedIndex === -1) {
                    newData.push({
                        id: item.id,
                        name: item.name,
                        data: [
                            {
                                year: item.year,
                                monthName: item.monthName,
                                quntity: item.quntity,
                            },
                        ],
                    });
                } else {
                    newData[findedIndex].data.push({
                        year: item.year,
                        monthName: item.monthName,
                        quntity: item.quntity,
                    });
                }
            });
        }

        return newData;
    }

    static getNewData(
        data: IGetDataObjectsForRecharts[] | undefined,
    ): ObjectRechartsDataDto[] {
        if (!data) return [];

        const dataMap = new Map<string, ObjectRechartsDataDto>();

        for (const item of data) {
            let obj = dataMap.get(item.name);
            if (!obj) {
                obj = {
                    id: item.id,
                    name: item.name,
                    data: [],
                };
                dataMap.set(item.name, obj);
            }
            obj.data.push({
                year: item.year,
                monthName: item.monthName,
                quntity: item.quntity,
            });
        }

        return Array.from(dataMap.values());
    }
}
