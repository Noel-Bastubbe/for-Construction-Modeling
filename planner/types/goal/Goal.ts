import {Objective} from "./Objective";
import {ExecutionState} from "../executionState/ExecutionState";

export class Goal {
    objectives: Objective[];

    public constructor(objectives: Objective[] = []) {
        this.objectives = objectives;
    }

    isFulfilledBy(node: ExecutionState) {
        for (let i = 0; i < this.objectives.length; i++) {
            if (!node.objectives[i]) {
                if (this.objectives[i].isFulfilledBy(node)) {
                    node.objectives[i] = true;
                } else {
                    return false;
                }
            }
        }
        return true;
    }

    filterNodes(nodes: ExecutionState[]) {
        return nodes.filter(node => this.isFulfillableBy(node));
    }

    private isFulfillableBy(node: ExecutionState): boolean {
        for (let i = 0; i < this.objectives.length; i++) {
            if (!node.objectives[i] && this.objectives[i].deadline != null && node.time > this.objectives[i].deadline!) {
                return false
            }
        }
        return true;
    }
}