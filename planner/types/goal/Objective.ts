import {ObjectiveObject} from "./ObjectiveObject";
import {ObjectiveLink} from "./ObjectiveLink";
import {ExecutionState} from "../executionState/ExecutionState";

export class Objective {
    id: string;
    dataObjectNodes: ObjectiveObject[];
    objectiveLinks: ObjectiveLink[];
    deadline: number | null;

    public constructor(id: string, dataObjectNodes: ObjectiveObject[], links: ObjectiveLink[], deadline: number | null = null) {
        this.id = id;
        this.dataObjectNodes = dataObjectNodes;
        this.objectiveLinks = links;
        this.deadline = deadline;
    }

    public isFulfilledBy(executionState: ExecutionState) {
        if (this.deadline && executionState.time > this.deadline) {
            return false;
        }
        for (let dataObjectNode of this.dataObjectNodes) {
            if (!executionState.allExecutionDataObjectInstances().some(executionDataObjectInstance => dataObjectNode.isMatchedBy(executionDataObjectInstance))) {
                return false;
            }
        }
        for (let objectiveLink of this.objectiveLinks) {
            if (!executionState.instanceLinks.some(instanceLink => objectiveLink.isMatchedBy(instanceLink))) {
                return false;
            }
        }
        return true;
    }
}