import { UserScopeWork } from 'src/scope-work/entities/user-scope-work.model';

export class GetUserScopeWorkDto {
    criteria: Partial<UserScopeWork>;
    relations: (keyof UserScopeWork)[];
}
