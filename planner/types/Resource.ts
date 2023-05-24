import {Role} from "./Role";

export class Resource {
    name: string;
    roles: Role[];
    capacity: number;
    availabilityStart: number;
    availabilityEnd: number;

    public constructor(name: string, roles: Role[] = [], capacity: number, availabilityStart: number = 0, availabilityEnd: number = Infinity) {
        this.name = name;
        this.roles = roles;
        this.capacity = capacity;
        this.availabilityStart = availabilityStart;
        this.availabilityEnd = availabilityEnd;
    }

    public satisfies(role: Role, NoP: number, time: number, duration: number): boolean {
            return this.roles.includes(role) && NoP <= this.capacity && time >= this.availabilityStart && time + duration <= this.availabilityEnd;
    }
}