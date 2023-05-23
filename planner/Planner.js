"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Planner = void 0;
const ExecutionLog_1 = require("./types/output/ExecutionLog");
class Planner {
    constructor(startState, goal, actions) {
        this.startState = startState;
        this.goal = goal;
        this.actions = actions;
    }
    generatePlan() {
        this.setUpStartState(this.startState);
        let queue = [this.startState];
        while (queue.length > 0) {
            let test = queue.shift();
            let node;
            if (test) {
                node = test;
            }
            else {
                node = this.startState;
            }
            if (this.goal.isFulfilledBy(node)) {
                return new ExecutionLog_1.ExecutionLog(node.actionHistory, node.allExecutionDataObjectInstances().map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance));
            }
            let newNodes = node.getSuccessors(this.actions);
            queue.push(...newNodes);
        }
        return new ExecutionLog_1.ExecutionLog();
    }
    simulateUntil(startState, goal, activities, resources) {
        this.goal = goal;
        this.setUpStartState(startState);
        let queue = [startState];
        while (queue.length > 0) {
            let test = queue.shift();
            let node;
            if (test) {
                node = test;
            }
            else {
                node = startState;
            }
            if (goal.isFulfilledBy(node)) {
                return new ExecutionLog_1.ExecutionLog(node.actionHistory, node.allExecutionDataObjectInstances().map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance));
            }
            let newNodes = node.getSuccessors(activities);
            queue.push(...newNodes);
        }
        return new ExecutionLog_1.ExecutionLog();
    }
    setUpStartState(startState) {
        this.goal.objectives.forEach(objective => {
            startState.objectives.push(false);
        });
    }
}
exports.Planner = Planner;
