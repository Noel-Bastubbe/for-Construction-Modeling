import {Instance} from "../executionState/Instance";
import {StateInstance} from "../executionState/StateInstance";

export class ObjectiveNode {
    dataObjectInstance: Instance;
    states: string[];

    public constructor(dataObjectInstance: Instance, states: string[]) {
        this.dataObjectInstance = dataObjectInstance;
        this.states = states;
    }

    public isMatchedBy(executionDataObjectInstance: StateInstance) {
        return this.dataObjectInstance.dataclass == executionDataObjectInstance.dataObjectInstance.dataclass
            && this.dataObjectInstance.name == executionDataObjectInstance.dataObjectInstance.name
            && this.states.includes(executionDataObjectInstance.state);
    }
}