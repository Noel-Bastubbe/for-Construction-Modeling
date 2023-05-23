import {Action} from "./types/fragments/Action";
import {ExecutionState} from "./types/executionState/ExecutionState";
import {ExecutionLog} from "./types/output/ExecutionLog";
import {Goal} from "./types/goal/Goal";

export class Planner {
    startState: ExecutionState;
    goal: Goal;
    actions: Action[];

    public constructor(startState: ExecutionState, goal: Goal, actions: Action[]) {
        this.startState = startState;
        this.goal = goal;
        this.actions = actions;
    }

    public generatePlan(): ExecutionLog {
        this.setUpStartState(this.startState);
        let queue: ExecutionState[] = [this.startState];
        while (queue.length > 0) {
            let node = queue.shift();
            if (this.goal.isFulfilledBy(node!)) {
                return new ExecutionLog(node!.actionHistory, node!.allExecutionDataObjectInstances().map(executionDataObjectInstance =>
                    executionDataObjectInstance.dataObjectInstance), node!.resources
                );
            }
            let newNodes = node!.getSuccessors(this.actions);
            queue.push(...newNodes);
        }
        return new ExecutionLog();
    }

    private setUpStartState(startState: ExecutionState) {
        this.goal.objectives.forEach(() => {
            startState.objectives.push(false);
        });
    }
}