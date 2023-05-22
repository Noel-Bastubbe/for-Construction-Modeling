"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionDataObjectInstance = void 0;
class ExecutionDataObjectInstance {
    constructor(dataObjectInstance, state) {
        this.dataObjectInstance = dataObjectInstance;
        this.state = state;
    }
    isArray() {
        return false;
    }
}
exports.ExecutionDataObjectInstance = ExecutionDataObjectInstance;
