export interface IGetHistory {
  scopeWorkId: number;
  nameListId: number;
  nameWorkId: number;
}

export interface IGetHistoryForOneUser extends IGetHistory {
  userId: number;
}
