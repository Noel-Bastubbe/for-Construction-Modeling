import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {ExecutionDataObjectInstance} from "../executionState/ExecutionDataObjectInstance";

export class ObjectiveNode {
    dataObjectInstance: DataObjectInstance;
    states: string[];

    public constructor(dataObjectInstance: DataObjectInstance, states: string[]) {
        this.dataObjectInstance = dataObjectInstance;
        this.states = states;
    }

    public isMatchedBy (executionDataObjectInstance: ExecutionDataObjectInstance) {
        return this.dataObjectInstance.dataclass == executionDataObjectInstance.dataObjectInstance.dataclass && this.dataObjectInstance.name == executionDataObjectInstance.dataObjectInstance.name && this.states.includes(executionDataObjectInstance.state);
    }
}