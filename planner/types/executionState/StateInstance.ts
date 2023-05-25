import {Instance} from "./Instance";

export class StateInstance {
    instance: Instance;
    state: string;

    public constructor(dataObjectInstance: Instance, state: string) {
        this.instance = dataObjectInstance;
        this.state = state;
    }
}