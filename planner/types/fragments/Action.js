"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
const ExecutionAction_1 = require("../executionState/ExecutionAction");
const Util_1 = require("../../Util");
const InstanceLink_1 = require("../executionState/InstanceLink");
const ExecutionDataObjectInstance_1 = require("../executionState/ExecutionDataObjectInstance");
class Action {
    constructor(name, duration = 1, NoP = 1, role = null, inputSet, outputSet) {
        this.name = name;
        this.duration = duration;
        this.NoP = NoP;
        this.role = role;
        this.inputSet = inputSet;
        this.outputSet = outputSet;
    }
    getExecutionActions(executionState) {
        if (!this.isExecutable(executionState)) {
            return [];
        }
        let possibleResources = executionState.resources.filter(resource => resource.satisfies(this.role, this.NoP));
        let executionActions = [];
        if (this.inputSet.set.length > 0) {
            let possibleInstances = [];
            for (let dataObjectReference of this.inputSet.set) {
                let matchingInstances = executionState.availableExecutionDataObjectInstances.filter(executionDataObjectInstance => dataObjectReference.isMatchedBy(executionDataObjectInstance));
                possibleInstances.push(matchingInstances);
            }
            let inputs = (0, Util_1.cartesianProduct)(...possibleInstances);
            for (let input of inputs) {
                for (let resource of possibleResources) {
                    executionActions.push(this.getExecutionActionForInput([].concat(input), resource, executionState));
                }
            }
        }
        else {
            for (let resource of possibleResources) {
                executionActions.push(this.getExecutionActionForInput([], resource, executionState));
            }
        }
        return executionActions;
    }
    getExecutionActionForInput(inputList, resource, executionState) {
        let outputList = this.getOutputForInput(inputList, executionState);
        let addedLinks = this.getAddedLinks(inputList.map(input => input.dataObjectInstance), outputList.map(output => output.dataObjectInstance));
        return new ExecutionAction_1.ExecutionAction(this, 0, resource, inputList, outputList, addedLinks);
    }
    getOutputForInput(inputList, executionState) {
        let output = this.outputSet.set.map(output => {
            let instance = inputList.find(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance.dataclass === output.dataclass);
            if (instance) {
                return new ExecutionDataObjectInstance_1.ExecutionDataObjectInstance(instance.dataObjectInstance, output.state);
            }
            else {
                let newDataObjectInstance = executionState.getNewDataObjectInstanceOfClass(output.dataclass);
                return new ExecutionDataObjectInstance_1.ExecutionDataObjectInstance(newDataObjectInstance, output.state);
            }
        });
        return output;
    }
    isExecutable(executionState) {
        return this.inputSet.isSatisfiedBy(executionState.availableExecutionDataObjectInstances) && executionState.resources.some(resource => resource.satisfies(this.role, this.NoP));
    }
    getAddedLinks(inputList, outputList) {
        let addedLinks = [];
        let addedObjects = this.getAddedObjects(inputList, outputList);
        let readObjects = inputList.filter(inputEntry => !outputList.find(outputEntry => inputEntry.dataclass === outputEntry.dataclass));
        let allObjects = outputList.concat(readObjects);
        for (let output of addedObjects) {
            for (let object of allObjects) {
                //todo check if equality check works
                if (output != object) {
                    addedLinks.push(new InstanceLink_1.InstanceLink(output, object));
                }
            }
        }
        return addedLinks;
    }
    getAddedObjects(inputList, outputList) {
        return outputList.filter(outputEntry => !inputList.find(inputEntry => inputEntry.dataclass === outputEntry.dataclass));
    }
}
exports.Action = Action;
