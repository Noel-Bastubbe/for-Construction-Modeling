import {Dataclass} from "../Dataclass";

export class DataObjectInstance {
    name: string;
    dataclass: Dataclass;
    state: string;
    isBlocked: boolean = false;

    public constructor(name: string, dataclass: Dataclass, state: string) {
        this.name = name;
        this.dataclass = dataclass;
        this.state = state;
    }
}