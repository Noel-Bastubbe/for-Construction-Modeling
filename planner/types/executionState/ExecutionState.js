"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionState = void 0;
const DataObjectInstance_1 = require("./DataObjectInstance");
class ExecutionState {
    constructor(availableDataObjects, blockedDataObjects, instanceLinks, resources, time, runningActions = [], actionHistory = [], objectives = []) {
        this.objectives = [];
        this.availableExecutionDataObjectInstances = availableDataObjects;
        this.blockedExecutionDataObjectInstances = blockedDataObjects;
        this.instanceLinks = instanceLinks;
        this.resources = resources;
        this.time = time;
        this.runningActions = runningActions;
        this.actionHistory = actionHistory;
        this.objectives = objectives;
    }
    allExecutionDataObjectInstances() {
        return this.availableExecutionDataObjectInstances.concat(this.blockedExecutionDataObjectInstances);
    }
    getNewDataObjectInstanceOfClass(dataclass) {
        let name = this.allExecutionDataObjectInstances().filter(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance.dataclass === dataclass).length + 1;
        return new DataObjectInstance_1.DataObjectInstance(name.toString(), dataclass);
    }
    getSuccessors(actions) {
        let successors = [];
        //get ExecutionActions Actions from Actions
        let executionActions = actions.map(action => action.getExecutionActions(this)).flat();
        //for each ExecutionAction, start ExecutionAction and get new ExecutionState
        executionActions.forEach(executionAction => {
            let newState = executionAction.start(this);
            successors.push(newState);
        });
        //waitAction executen and get new ExecutionState
        successors.push(this.wait());
        //push all to successors
        return successors;
    }
    wait() {
        let newState = new ExecutionState(this.availableExecutionDataObjectInstances, this.blockedExecutionDataObjectInstances, this.instanceLinks, this.resources, this.time + 1, this.runningActions, this.actionHistory, this.objectives);
        this.runningActions.forEach(action => {
            newState = action.tryToFinish(newState);
        });
        return newState;
    }
}
exports.ExecutionState = ExecutionState;
