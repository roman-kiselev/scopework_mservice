import { IFinishUserAdding } from './IFinishUserAdding';

export interface IListNamesWithData {
    id: number;
    name: string;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
    unitId: number;
    nameListId: number;
    quntity: number;
    finishUserAdding: IFinishUserAdding[];
}
