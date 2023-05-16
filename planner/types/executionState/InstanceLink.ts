import {DataObjectInstance} from "./DataObjectInstance";

export class InstanceLink {
    first: DataObjectInstance;
    second: DataObjectInstance;

    public constructor(first: DataObjectInstance, second: DataObjectInstance) {
        this.first = first;
        this.second = second;
    }
}