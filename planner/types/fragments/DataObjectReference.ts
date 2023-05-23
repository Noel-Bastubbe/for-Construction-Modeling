import {Dataclass} from "../Dataclass";
import {ExecutionDataObjectInstance} from "../executionState/ExecutionDataObjectInstance";

export class DataObjectReference {
    dataclass: Dataclass;
    state: string;
    isList: boolean;

    public constructor(dataclass: Dataclass, state: string,  isList: boolean) {
        this.dataclass = dataclass;
        this.state = state;
        this.isList = isList;
    }

    public isMatchedBy (executionDataObjectInstance: ExecutionDataObjectInstance) {
        return this.dataclass === executionDataObjectInstance.dataObjectInstance.dataclass && this.state === executionDataObjectInstance.state;
    }
}