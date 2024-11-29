import { GetShortQueryDto } from '../dto/get/get-short-query.dto';

interface IData<T> {
    [key: string]: T;
}

export class PrepareScopeWorkQuery {
    private prepareReplacementsWhere<T>(dto: IData<T>) {
        const whereData = {};
        for (const key in dto) {
            if (whereData[key] !== undefined && whereData[key] !== null) {
                whereData[key] = dto[key];
            }
        }

        return whereData;
    }

    prepareQueryGetShortForUser(replacements: GetShortQueryDto): string {
        const replacementsData = GetShortQueryDto.getObj(replacements);
        const whereData = this.prepareReplacementsWhere(replacementsData);
        let index = 0;
        let stringWhere = '';

        for (const key in whereData) {
            if (index === 0) {
                stringWhere += `${key} = :${key}`;
                index++;
            } else {
                stringWhere += ` AND ${key} = :${key}`;
                index++;
            }
        }

        const query = `
            SELECT
    sw2.scopeWorkId,
    sw2.listNameWorkName,
    sw2.listNameWorkDescription,
    sw2.listNameWorkId,
    ROUND(sw2.quntity, 2) as quntity,
    ROUND(sw2.tadQuntity, 2) as tadQuntity,
    ROUND(sw2.remains, 2) as remains,
    ROUND(sw2.verfulfilment, 2) as verfulfilment,
    ROUND(sw2.percent, 2) as totalPercentage,
    ROUND(
        IF(
            sw2.verfulfilment = 0,
            sw2.tadQuntity / sw2.quntity * 100,
            (
                sw2.tadQuntity - sw2.verfulfilment
            ) / sw2.quntity * 100
        ),
        2
    ) as percent
FROM (
        SELECT
            sw.id as scopeWorkId, lnw.name as listNameWorkName, lnw.description as listNameWorkDescription, lnw.id as listNameWorkId, SUM(IFNULL(nl.quntity, 0)) as quntity, SUM(IFNULL(tad.quntity, 0)) as tadQuntity, SUM(
                IF(
                    IFNULL(nl.quntity, 0) > IFNULL(tad.quntity, 0), IFNULL(nl.quntity, 0) - IFNULL(tad.quntity, 0), 0
                )
            ) as remains, SUM(
                IF(
                    IFNULL(tad.quntity, 0) > IFNULL(nl.quntity, 0), IFNULL(tad.quntity, 0) - IFNULL(nl.quntity, 0), 0
                )
            ) as verfulfilment, SUM(IFNULL(tad.quntity, 0)) / SUM(IFNULL(nl.quntity, 0)) * 100 as percent
        FROM
            \`user-scope-work\` usw
            LEFT JOIN scope_work sw ON sw.id = usw.scopeWorkId
            AND sw.deletedAt IS NULL
            LEFT JOIN list_name_work lnw ON lnw.scopeWorkId = sw.id
            AND lnw.deletedAt IS NULL
            LEFT JOIN name-list nl ON nl.listNameWorkId = lnw.id
            AND nl.deletedAt IS NULL
            LEFT JOIN (
                SELECT tad2.userId, tad2.nameListId, tad2.deletedAt, SUM(tad2.quntity) as quntity
                FROM \`table-adding-data\` tad2
                GROUP BY
                    tad2.nameListId, tad2.userId, tad2.deletedAt
            ) tad ON tad.nameListId = nl.id
            AND tad.deletedAt IS NULL
            LEFT JOIN name_work nw ON nw.id = nl.nameWorkId
            AND nw.deletedAt IS NULL
        WHERE
            usw.userId = :userId
            AND sw.organizationId = :organizationId
        GROUP BY
            lnw.id, sw.id, lnw.name, lnw.description
    ) as sw2
WHERE ${stringWhere};
        `;

        return query;
    }
}
