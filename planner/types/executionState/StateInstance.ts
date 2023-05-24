import {Instance} from "./Instance";

export class StateInstance {
    dataObjectInstance: Instance;
    state: string;

    public constructor(dataObjectInstance: Instance, state: string) {
        this.dataObjectInstance = dataObjectInstance;
        this.state = state;
    }
}