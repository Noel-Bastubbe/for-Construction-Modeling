import {Dataclass} from "../Dataclass";
import {DataObjectInstance} from "../executionState/DataObjectInstance";

export class ObjectiveNode {
    name: string;
    dataclass: Dataclass;
    states: string[];

    public constructor (name: string, dataclass: Dataclass, states: string[]) {
        this.name = name;
        this.dataclass = dataclass;
        this.states = states;
    }

    public isMatchedBy (dataObjectInstance: DataObjectInstance) {
        return this.name === dataObjectInstance.name && this.dataclass === dataObjectInstance.dataclass && this.states.includes(dataObjectInstance.state);
    }
}