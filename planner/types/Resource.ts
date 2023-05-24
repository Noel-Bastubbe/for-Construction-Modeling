import {Role} from "./Role";

export class Resource {
    id: string;
    name: string;
    roles: Role[];
    capacity: number;

    public constructor(id:string, name: string, roles: Role[] = [], capacity: number) {
        this.id = id;
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