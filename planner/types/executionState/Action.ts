import {DataObjectInstance} from "./DataObjectInstance";
import {Activity} from "../fragments/Activity";
import {Resource} from "../Resource";

export class Action {
    activity: Activity;
    start: number;
    end: number;
    resource: Resource;
    capacity: number;
    inputList: DataObjectInstance[];
    outputList: DataObjectInstance[];

    public constructor(activity: Activity, start: number, end: number, resource: Resource, capacity: number, inputList: DataObjectInstance[], outputList: DataObjectInstance[]) {
        this.activity = activity;
        this.start = start;
        this.end = end;
        this.resource = resource;
        this.capacity = capacity;
        this.inputList = inputList;
        this.outputList = outputList;
    }
}