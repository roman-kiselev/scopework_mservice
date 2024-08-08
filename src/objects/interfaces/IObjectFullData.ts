import { IMainFinishUserAddingForScopeWork } from './IMainFinishUserAddingForScopeWork';
import { IOneScopeWorkWithData } from './IOneScopeWorkWithData';

export interface IObjectFullData {
    id: number;
    name: string;
    address: string;
    deletedAt: string | null;
    createdAt: string;
    countListNameWorksObject: number;
    countTableAddingDataObject: number;
    mainListUserNoRepetitions: IMainFinishUserAddingForScopeWork[];
    objectData: IOneScopeWorkWithData[];
}
