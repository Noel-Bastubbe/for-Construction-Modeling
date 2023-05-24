import {ObjectiveObject} from "./ObjectiveObject";
import {ObjectiveLink} from "./ObjectiveLink";
import {ExecutionState} from "../executionState/ExecutionState";

export class Objective {
    dataObjectNodes: ObjectiveObject[];
    objectiveLinks: ObjectiveLink[];
    deadline: number | null;

    public constructor(dataObjectNodes: ObjectiveObject[], links: ObjectiveLink[], deadline: number | null = null) {
        this.dataObjectNodes = dataObjectNodes;
        this.objectiveLinks = links;
        this.deadline = deadline;
    }

    public isFulfilledBy(executionState: ExecutionState) {
        if (this.deadline && executionState.time > this.deadline) {
            return false;
        }
        for (let dataObjectNode of this.dataObjectNodes) {
            if (!executionState.allStateInstances().some(executionDataObjectInstance => dataObjectNode.isMatchedBy(executionDataObjectInstance))) {
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