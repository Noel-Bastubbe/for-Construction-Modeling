"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionLog = void 0;
class ExecutionLog {
    constructor(actionList = [], workSpaces = [], resources = []) {
        this.actionList = actionList;
        this.workSpaces = workSpaces;
        this.resources = resources;
    }
}
exports.ExecutionLog = ExecutionLog;
