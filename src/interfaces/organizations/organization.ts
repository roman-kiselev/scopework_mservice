import { User } from '../users/user';

export class Organization {
    private readonly id: number;
    private readonly address: string;
    private readonly description: string;
    private readonly users: User[];
}
