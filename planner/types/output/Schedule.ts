import {ScheduledAction} from "./ScheduledAction";
import {Instance} from "../executionState/Instance";
import {Resource} from "../Resource";

export class Schedule {
    scheduledActions: ScheduledAction[];
    workSpaces: Instance[]; //hier noch umbenennen?
    resources: Resource[];

    public constructor(scheduledActions: ScheduledAction[] = [], workSpaces: Instance[] = [], resources: Resource[] = []) {
        this.scheduledActions = scheduledActions;
        this.workSpaces = workSpaces;
        this.resources = resources;
    }
}