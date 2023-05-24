import {OutputAction} from "./OutputAction";
import {Instance} from "../executionState/Instance";
import {Resource} from "../Resource";

export class ExecutionLog {
    actionList: OutputAction[];
    workSpaces: Instance[];
    resources: Resource[];

    public constructor(actionList: OutputAction[] = [], workSpaces: Instance[] = [], resources: Resource[] = []) {
        this.actionList = actionList;
        this.workSpaces = workSpaces
        this.resources = resources;
    }
}