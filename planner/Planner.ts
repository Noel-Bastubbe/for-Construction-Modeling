import {DataObjectInstance} from "./types/executionState/DataObjectInstance";
import {Activity} from "./types/fragments/Activity";
import {Resource} from "./types/Resource";
import {ExecutionState} from "./types/executionState/ExecutionState";

export class Planner {
    public simulateUntil(startState: ExecutionState, goal: DataObjectInstance[], activities: Activity[], resources: Resource[]): boolean {
        let queue: ExecutionState[] = [];
        if (this.isFulfilledBy(startState, goal)) {
            return true;
        } else {
            queue.push(startState);
        }
        while (queue.length > 0) {
            let test = queue.pop();
            let node;
            if (test) {
                node = test;
            } else {
                node = startState;
            }
            if (this.isFulfilledBy(node, goal)) {
                return true;
            }
            for (let activity of node.executableActivities(activities)) {
                let simulatedState = startState;
                activity.execute(simulatedState, simulatedState.dataObjectInstances);
                queue.push(simulatedState);
            }
        }
        return false;
    }

    public isFulfilledBy(state: ExecutionState, goal: DataObjectInstance[]): boolean {
        return state.dataObjectInstances[0].dataclass === goal[0].dataclass && state.dataObjectInstances[0].state === goal[0].state;
    }
}