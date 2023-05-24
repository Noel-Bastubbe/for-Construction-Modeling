import {Instance} from "../executionState/Instance";
import {Resource} from "../Resource";
import {Activity} from "../fragments/Activity";

export class OutputAction {
    action: Activity;
    start: number;
    end: number;
    resource: Resource | null;
    capacity: number;
    inputList: Instance[];
    outputList: Instance[];

    public constructor(action: Activity, start: number, end: number, resource: Resource | null, capacity: number, inputList: Instance[], outputList: Instance[]) {
        this.action = action;
        this.start = start;
        this.end = end;
        this.resource = resource;
        this.capacity = capacity;
        this.inputList = inputList;
        this.outputList = outputList;
    }
}