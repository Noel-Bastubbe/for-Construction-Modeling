import {Instance} from "../executionState/Instance";
import {Resource} from "../Resource";
import {Activity} from "../fragments/Activity";

export class ScheduledAction {
    activity: Activity;
    start: number;
    end: number;
    resource: Resource | null;
    capacity: number;
    inputList: Instance[];
    outputList: Instance[];

    public constructor(activity: Activity, start: number, end: number, resource: Resource | null, capacity: number, inputList: Instance[], outputList: Instance[]) {
        this.activity = activity;
        this.start = start;
        this.end = end;
        this.resource = resource;
        this.capacity = capacity;
        this.inputList = inputList;
        this.outputList = outputList;
    }
}