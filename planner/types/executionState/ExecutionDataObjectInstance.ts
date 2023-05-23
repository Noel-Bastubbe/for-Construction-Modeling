import {DataObjectInstance} from "./DataObjectInstance";

export class ExecutionDataObjectInstance {
    dataObjectInstance: DataObjectInstance;
    state: string;

    public constructor(dataObjectInstance: DataObjectInstance, state: string) {
        this.dataObjectInstance = dataObjectInstance;
        this.state = state;
    }
}