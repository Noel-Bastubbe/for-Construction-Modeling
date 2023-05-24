import {Dataclass} from "../Dataclass";

export class Instance {
    name: string;
    dataclass: Dataclass;

    public constructor(name: string, dataclass: Dataclass) {
        this.name = name;
        this.dataclass = dataclass;
    }
}