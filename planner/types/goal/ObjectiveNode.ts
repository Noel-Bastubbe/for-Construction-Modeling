import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {ExecutionDataObjectInstance} from "../executionState/ExecutionDataObjectInstance";

export class ObjectiveNode {
    id: string;
    dataObjectInstance: DataObjectInstance;
    states: string[];

    public constructor(id: string, dataObjectInstance: DataObjectInstance, states: string[]) {
        this.id = id;
        this.dataObjectInstance = dataObjectInstance;
        this.states = states;
    }

    public isMatchedBy (executionDataObjectInstance: ExecutionDataObjectInstance) {
        return this.dataObjectInstance.dataclass == executionDataObjectInstance.dataObjectInstance.dataclass && this.dataObjectInstance.name == executionDataObjectInstance.dataObjectInstance.name && this.states.includes(executionDataObjectInstance.state);
    }
}