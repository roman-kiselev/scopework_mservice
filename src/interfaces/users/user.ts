import { Organization } from '../organizations/organization';
import { Role } from '../roles/role';
import { UserDescription } from '../user-description/user-description';

export class User {
    readonly id: number;
    readonly email: string;
    readonly password: string;
    readonly banned: boolean;
    readonly deletedAt: Date;
    readonly organizationId: number;
    readonly organization: Organization[];
    readonly roles: Role[];
    readonly description: UserDescription;
}
