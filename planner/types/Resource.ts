import {Role} from "./Role";

export class Resource {
    name: string;
    role: Role;
    capacity: number;
    isBlocked: boolean;

    public constructor(name: string, role: Role, capacity: number, isBlocked: boolean = false) {
        this.name = name;
        this.role = role;
        this.capacity = capacity;
        this.isBlocked = isBlocked;
    }

    public satisfies(role: Role | null, NoP: number): boolean {
        return role === this.role && NoP <= this.capacity;
    }
}