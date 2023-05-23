import {Role} from "./Role";

export class Resource {
    name: string;
    roles: Role[];
    capacity: number;

    public constructor(name: string, roles: Role[] = [], capacity: number) {
        this.name = name;
        this.roles = roles;
        this.capacity = capacity;
    }

    public satisfies(role: Role | null, NoP: number): boolean {
        if (!role) {
            return true;
        } else {
            return this.roles.includes(role) && NoP <= this.capacity;
        }
    }
}