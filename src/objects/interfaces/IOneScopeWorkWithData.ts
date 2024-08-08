import { IListNamesWithData } from './IListNamesWithData';
import { IMainFinishUserAddingForScopeWork } from './IMainFinishUserAddingForScopeWork';

export interface IOneScopeWorkWithData {
    id: number;
    deletedAt: string | null;
    typeWorkId: number;
    objectId: number;
    createdAt: string;
    updatedAt: string;
    listUsersData: IMainFinishUserAddingForScopeWork[];
    countListNameWorksArr: number;
    countTableAddingData: number;
    percentOneScopeWork: string;
    listNamesWithData: IListNamesWithData[];
}
