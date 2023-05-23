"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOSet = void 0;
class IOSet {
    constructor(set) {
        this.set = set;
    }
    isSatisfiedBy(executionDataObjectInstances) {
        for (let dataObjectReference of this.set) {
            let foundCorrespondingDataObjectInstance = false;
            for (let executionDataObjectInstance of executionDataObjectInstances) {
                if (dataObjectReference.isMatchedBy(executionDataObjectInstance)) {
                    foundCorrespondingDataObjectInstance = true;
                    break;
                }
            }
            if (!foundCorrespondingDataObjectInstance) {
                return false;
            }
        }
        return true;
    }
}
exports.IOSet = IOSet;
