import {Dataclass} from "../Dataclass";

export class DataObjectInstance {
    id: string;
    name: string;
    dataclass: Dataclass;

    public constructor(id: string, name: string, dataclass: Dataclass) {
        this.id = id;
        this.name = name;
        this.dataclass = dataclass;
    }
}