import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {Activity} from "../fragments/Activity";
import {Resource} from "../Resource";

export class ExecutionAction {
    activity: Activity;
    runningTime: number;
    resource: Resource | null
    inputList: DataObjectInstance[];
    outputList: DataObjectInstance[];

    public constructor(activity: Activity, runningTime: number, resource: Resource, inputList: DataObjectInstance[], outputList: DataObjectInstance[]) {
        this.activity = activity;
        this.runningTime = runningTime;
        this.resource = resource;
        this.inputList = inputList;
        this.outputList = outputList;
    }

    public canFinish(): boolean {
        return this.runningTime >= this.activity.duration;
    }
}