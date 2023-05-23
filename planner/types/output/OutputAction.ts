import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {Resource} from "../Resource";
import {Action} from "../fragments/Action";

export class OutputAction {
    action: Action;
    start: number;
    end: number;
    resource: Resource | null;
    capacity: number;
    inputList: DataObjectInstance[];
    outputList: DataObjectInstance[];

    public constructor(action: Action, start: number, end: number, resource: Resource | null, capacity: number, inputList: DataObjectInstance[], outputList: DataObjectInstance[]) {
        this.action = action;
        this.start = start;
        this.end = end;
        this.resource = resource;
        this.capacity = capacity;
        this.inputList = inputList;
        this.outputList = outputList;
    }
}