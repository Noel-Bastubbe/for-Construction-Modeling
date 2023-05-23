import {DataObjectReference} from "./DataObjectReference";
import {ExecutionDataObjectInstance} from "../executionState/ExecutionDataObjectInstance";

export class IOSet {
    set: DataObjectReference[];

    public constructor(set: DataObjectReference[]) {
        this.set = set;
    }

    public isSatisfiedBy(executionDataObjectInstances: ExecutionDataObjectInstance[]): boolean {
        for (let dataObjectReference of this.set) {
            let foundCorrespondingDataObjectInstance: boolean = false;
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