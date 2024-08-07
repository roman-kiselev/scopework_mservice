import { User } from '../users/user';

export class Role {
    private readonly id: number;
    private readonly name: string;
    private readonly description: string;
    private readonly users: User[];
}
