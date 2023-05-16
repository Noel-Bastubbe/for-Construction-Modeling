import {Dataclass} from "../Dataclass";

export class DataObjectReference {
    dataclass: Dataclass;
    states: string[];
    isList: boolean;

    public constructor(dataclass: Dataclass, states: string[],  isList: boolean) {
        this.dataclass = dataclass;
        this.states = states;
        this.isList = isList;
    }
}