import {Instance} from "../executionState/Instance";
import {StateInstance} from "../executionState/StateInstance";

export class ObjectiveObject {
    instance: Instance;
    states: string[];

    public constructor(instance: Instance, states: string[]) {
        this.instance = instance;
        this.states = states;
    }

    public isMatchedBy(stateInstance: StateInstance) {
        return this.instance.dataclass == stateInstance.instance.dataclass
            && this.instance.name == stateInstance.instance.name
            && this.states.includes(stateInstance.state);
    }
}