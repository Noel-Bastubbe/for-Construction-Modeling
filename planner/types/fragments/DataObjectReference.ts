import {Dataclass} from "../Dataclass";
import {StateInstance} from "../executionState/StateInstance";

export class DataObjectReference {
    dataclass: Dataclass;
    state: string;
    isList: boolean;

    public constructor(dataclass: Dataclass, state: string,  isList: boolean) {
        this.dataclass = dataclass;
        this.state = state;
        this.isList = isList;
    }

    public isMatchedBy (executionDataObjectInstance: StateInstance) {
        return this.dataclass === executionDataObjectInstance.dataObjectInstance.dataclass && this.state === executionDataObjectInstance.state;
    }
}