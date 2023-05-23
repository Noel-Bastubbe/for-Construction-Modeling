import {Resource} from "./types/Resource";
import {ExecutionState} from "./types/executionState/ExecutionState";
import {ExecutionLog} from "./types/output/ExecutionLog";
import {Goal} from "./types/goal/Goal";
import {Action} from "./types/fragments/Action";

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
            let test = queue.shift();
            let node;
            if (test) {
                node = test;
            } else {
                node = this.startState;
            }
            if (this.goal.isFulfilledBy(node)) {
                return new ExecutionLog(node.actionHistory, node.allExecutionDataObjectInstances().map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance));
            }
            let newNodes = node.getSuccessors(this.actions);

            queue.push(...newNodes);
        }
        return new ExecutionLog();
    }

    public simulateUntil(startState: ExecutionState, goal: Goal, activities: Action[], resources: Resource[]): ExecutionLog {
        this.goal = goal;
        this.setUpStartState(startState);
        let queue: ExecutionState[] = [startState];
        while (queue.length > 0) {
            let test = queue.shift();
            let node;
            if (test) {
                node = test;
            } else {
                node = startState;
            }
            if (goal.isFulfilledBy(node)) {
                return new ExecutionLog(node.actionHistory, node.allExecutionDataObjectInstances().map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance));
            }
            let newNodes = node.getSuccessors(activities);

            queue.push(...newNodes);
        }
        return new ExecutionLog();
    }

    private setUpStartState(startState: ExecutionState){
        this.goal.objectives.forEach(objective => {
            startState.objectives.push(false);
        });
    }
}