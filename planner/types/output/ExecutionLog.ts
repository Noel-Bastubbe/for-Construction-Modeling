import {OutputAction} from "./OutputAction";
import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {Resource} from "../Resource";

export class ExecutionLog {
    actionList: OutputAction[];
    workSpaces: DataObjectInstance[];
    resources: Resource[];

    public constructor(actionList: OutputAction[] = [], workSpaces: DataObjectInstance[] = [], resources: Resource[] = []) {
        this.actionList = actionList;
        this.workSpaces = workSpaces
        this.resources = resources;
    }
}