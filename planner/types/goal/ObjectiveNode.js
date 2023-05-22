"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectiveNode = void 0;
class ObjectiveNode {
    constructor(dataObjectInstance, states) {
        this.dataObjectInstance = dataObjectInstance;
        this.states = states;
    }
    isMatchedBy(executionDataObjectInstance) {
        return this.dataObjectInstance.dataclass == executionDataObjectInstance.dataObjectInstance.dataclass && this.dataObjectInstance.name == executionDataObjectInstance.dataObjectInstance.name && this.states.includes(executionDataObjectInstance.state);
    }
}
exports.ObjectiveNode = ObjectiveNode;
