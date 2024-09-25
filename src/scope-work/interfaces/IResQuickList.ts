import { ListNameWork } from 'src/list-name-work/entities/list-name-work.model';
import { IResQuickOneScopeWorkById } from './IResQuickOneScopeWorkById';

export interface IResQuickList
    extends Pick<
        ListNameWork,
        | 'id'
        | 'name'
        | 'description'
        | 'organizationId'
        | 'deletedAt'
        | 'createdAt'
        | 'updatedAt'
        | 'typeWorkId'
        | 'scopeWorkId'
    > {
    list: IResQuickOneScopeWorkById[];
}
