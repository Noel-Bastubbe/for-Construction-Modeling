import {ObjectiveNode} from "./ObjectiveNode";
import {NodeLink} from "./NodeLink";
import {ExecutionState} from "../executionState/ExecutionState";

export class Objective {
    dataObjectNodes: ObjectiveNode[];
    objectiveLinks: NodeLink[];
    deadline: number | null;

    public constructor(dataObjectNodes: ObjectiveNode[], links: NodeLink[], deadline: number | null = null) {
        this.dataObjectNodes = dataObjectNodes;
        this.objectiveLinks = links;
        this.deadline = deadline;
    }

    public isFulfilledBy(state: ExecutionState) {
        if (this.deadline && state.time > this.deadline) {
            return false;
        }
        for (let dataObjectNode of this.dataObjectNodes) {
            if (!state.dataObjectInstances.some(dataObjectInstance => dataObjectNode.isMatchedBy(dataObjectInstance))) {
                return false;
            }
        }
        for (let objectiveLinks of this.objectiveLinks) {
            if (!state.instanceLinks.some(instanceLink => objectiveLinks.isMatchedBy(instanceLink))) {
                return false;
            }
        }
        return true;
    }
}