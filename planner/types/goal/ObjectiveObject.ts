import {Instance} from "../executionState/Instance";
import {StateInstance} from "../executionState/StateInstance";

export class ObjectiveObject {
    id: string;
    dataObjectInstance: Instance;
    states: string[];

    public constructor(id: string, dataObjectInstance: Instance, states: string[]) {
        this.id = id;
        this.dataObjectInstance = dataObjectInstance;
        this.states = states;
    }

    public isMatchedBy(executionDataObjectInstance: StateInstance) {
        return this.dataObjectInstance.dataclass == executionDataObjectInstance.dataObjectInstance.dataclass
            && this.dataObjectInstance.name == executionDataObjectInstance.dataObjectInstance.name
            && this.states.includes(executionDataObjectInstance.state);
    }
}