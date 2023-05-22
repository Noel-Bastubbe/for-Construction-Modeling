"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionAction = void 0;
const Resource_1 = require("../Resource");
const ExecutionState_1 = require("./ExecutionState");
const OutputAction_1 = require("../output/OutputAction");
class ExecutionAction {
    constructor(action, runningTime, resource, inputList, outputList, addedInstanceLinks) {
        this.action = action;
        this.runningTime = runningTime;
        this.resource = resource;
        this.inputList = inputList;
        this.outputList = outputList;
        this.addedInstanceLinks = addedInstanceLinks;
    }
    start(executionState) {
        let changedExecutionDataObjectInstances = this.getChangedExecutionDataObjectInstances();
        let availableDataObjects = executionState.availableExecutionDataObjectInstances.filter(executionDataObjectInstance => !changedExecutionDataObjectInstances.some(it => it.dataObjectInstance === executionDataObjectInstance.dataObjectInstance));
        let blockedDataObjects = executionState.blockedExecutionDataObjectInstances.concat(changedExecutionDataObjectInstances);
        let instanceLinks = executionState.instanceLinks;
        let resources = this.getBlockedResources(executionState.resources);
        let time = executionState.time;
        let runningActions = executionState.runningActions.concat([this]);
        let actionHistory = executionState.actionHistory;
        let objectiveArray = executionState.objectives.slice();
        return new ExecutionState_1.ExecutionState(availableDataObjects, blockedDataObjects, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }
    //todo check if resource should be refactored to ExecutionResource
    getBlockedResources(resources) {
        if (this.resource === null) {
            return resources;
        }
        let result = resources.filter(resource => resource !== this.resource);
        let changedResource = new Resource_1.Resource(this.resource.name, this.resource.roles, this.resource.capacity - this.action.NoP);
        result.push(changedResource);
        return result;
    }
    canFinish() {
        return this.runningTime + 1 == this.action.duration;
    }
    tryToFinish(executionState) {
        if (this.canFinish()) {
            return this.finish(executionState);
        }
        else {
            let action = new ExecutionAction(this.action, this.runningTime + 1, this.resource, this.inputList, this.outputList, this.addedInstanceLinks);
            let runningActions = executionState.runningActions.filter((action) => action !== this);
            runningActions.push(action);
            return new ExecutionState_1.ExecutionState(executionState.availableExecutionDataObjectInstances, executionState.blockedExecutionDataObjectInstances, executionState.instanceLinks, executionState.resources, executionState.time, runningActions, executionState.actionHistory, executionState.objectives);
        }
    }
    finish(executionState) {
        let availableDataObjects = executionState.availableExecutionDataObjectInstances.concat(this.outputList);
        let blockedDataObjects = this.getNewBlockedDataObjects(executionState);
        let instanceLinks = executionState.instanceLinks.concat(this.addedInstanceLinks);
        let resources = this.getNewResources(executionState);
        let time = executionState.time;
        let runningActions = executionState.runningActions.filter((action) => action !== this);
        let actionHistory = this.getNewActionHistory(executionState);
        let objectiveArray = executionState.objectives.slice();
        return new ExecutionState_1.ExecutionState(availableDataObjects, blockedDataObjects, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }
    getNewBlockedDataObjects(executionState) {
        let changedDataObjectInstances = this.getChangedExecutionDataObjectInstances();
        return executionState.blockedExecutionDataObjectInstances.filter(executionDataObjectInstance => !changedDataObjectInstances.some(it => it.dataObjectInstance === executionDataObjectInstance.dataObjectInstance));
    }
    // private getNewInstanceLinks(executionState: ExecutionState): InstanceLink[] {
    //     let oldInstanceLinks = executionState.instanceLinks;
    //     let newInstanceLinks = oldInstanceLinks.filter((instanceLink) => !this.addedInstanceLinks.includes(instanceLink));
    //     newInstanceLinks = newInstanceLinks.concat(this.addedInstanceLinks);
    //     return newInstanceLinks;
    // }
    getNewResources(executionState) {
        let oldResources = executionState.resources;
        let newResources = oldResources.map((resource) => {
            var _a, _b;
            if (resource.name === ((_a = this.resource) === null || _a === void 0 ? void 0 : _a.name) && resource.roles === ((_b = this.resource) === null || _b === void 0 ? void 0 : _b.roles)) {
                return new Resource_1.Resource(resource.name, resource.roles, resource.capacity + this.action.NoP);
            }
            else {
                return resource;
            }
        });
        return newResources;
    }
    getNewActionHistory(executionState) {
        let oldActionHistory = executionState.actionHistory;
        let newActionHistory = oldActionHistory.concat(new OutputAction_1.OutputAction(this.action, executionState.time - this.action.duration, executionState.time, this.resource, this.action.NoP, this.inputList.map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance), this.outputList.map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance)));
        return newActionHistory;
    }
    getChangedExecutionDataObjectInstances() {
        let result = [];
        for (let input of this.inputList) {
            if (this.outputList.some(output => output.dataObjectInstance === input.dataObjectInstance)) {
                result.push(input);
            }
        }
        return result;
    }
}
exports.ExecutionAction = ExecutionAction;
