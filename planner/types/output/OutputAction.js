"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputAction = void 0;
class OutputAction {
    constructor(action, start, end, resource, capacity, inputList, outputList) {
        this.action = action;
        this.start = start;
        this.end = end;
        this.resource = resource;
        this.capacity = capacity;
        this.inputList = inputList;
        this.outputList = outputList;
    }
}
exports.OutputAction = OutputAction;
