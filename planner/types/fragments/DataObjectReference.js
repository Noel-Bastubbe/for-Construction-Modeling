"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataObjectReference = void 0;
class DataObjectReference {
    constructor(dataclass, state, isList) {
        this.dataclass = dataclass;
        this.state = state;
        this.isList = isList;
    }
    isMatchedBy(executionDataObjectInstance) {
        return this.dataclass === executionDataObjectInstance.dataObjectInstance.dataclass && this.state === executionDataObjectInstance.state;
    }
}
exports.DataObjectReference = DataObjectReference;
