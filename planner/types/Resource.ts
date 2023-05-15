import {Role} from "./Role";

export class Resource {
    name: string;
    role: Role;
    capacity: number;

    public constructor(name: string, role: Role, capacity: number) {
        this.name = name;
        this.role = role;
        this.capacity = capacity;
    }

    public satisfies(role: Role | null, NoP: number): boolean {
        return role === this.role && NoP <= this.capacity;
    }
}