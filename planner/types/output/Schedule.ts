import {ScheduledAction} from "./ScheduledAction";
import {Instance} from "../executionState/Instance";
import {Resource} from "../Resource";

export class Schedule {
    actionList: ScheduledAction[];
    workSpaces: Instance[];
    resources: Resource[];

    public constructor(actionList: ScheduledAction[] = [], workSpaces: Instance[] = [], resources: Resource[] = []) {
        this.actionList = actionList;
        this.workSpaces = workSpaces
        this.resources = resources;
    }
}