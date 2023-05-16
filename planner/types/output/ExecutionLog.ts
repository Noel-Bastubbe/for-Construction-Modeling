import {OutputAction} from "./OutputAction";
import {DataObjectInstance} from "../executionState/DataObjectInstance";

export class ExecutionLog {
    actionList: OutputAction[];
    workSpaces: DataObjectInstance[];

    public constructor() {
        this.actionList = [];
        this.workSpaces = [];
    }
}