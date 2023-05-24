import {Instance} from "../executionState/Instance";
import {StateInstance} from "../executionState/StateInstance";

export class ObjectiveObject {
    dataObjectInstance: Instance;
    states: string[];

    public constructor(dataObjectInstance: Instance, states: string[]) {
        this.dataObjectInstance = dataObjectInstance;
        this.states = states;
    }

    public isMatchedBy(executionDataObjectInstance: StateInstance) {
        return this.dataObjectInstance.dataclass == executionDataObjectInstance.instance.dataclass
            && this.dataObjectInstance.name == executionDataObjectInstance.instance.name
            && this.states.includes(executionDataObjectInstance.state);
    }
}