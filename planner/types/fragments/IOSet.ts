import {DataObjectReference} from "./DataObjectReference";
import {DataObjectInstance} from "../executionState/DataObjectInstance";

export class IOSet {
    set: DataObjectReference[];

    public constructor(set: DataObjectReference[]) {
        this.set = set;
    }

    public isSatisfiedBy(executionState: DataObjectInstance[]): boolean {
        for (let dataObjectReference of this.set) {
            let foundCorrespondingDataObjectInstance = false;
            for (let dataObjectInstance of executionState) {
                if (dataObjectInstance.dataclass == dataObjectReference.dataclass && dataObjectReference.states.includes(dataObjectInstance.state)) {
                    foundCorrespondingDataObjectInstance =  true;
                }
            }
            if (!foundCorrespondingDataObjectInstance) {
                return false;
            }
        }
        return true;
    }
}