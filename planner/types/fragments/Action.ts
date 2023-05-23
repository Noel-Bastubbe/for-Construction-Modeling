import {IOSet} from "./IOSet";
import {Resource} from "../Resource";
import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {ExecutionAction} from "../executionState/ExecutionAction";
import {ExecutionState} from "../executionState/ExecutionState";
import {Role} from "../Role";
import {cartesianProduct} from "../../Util";
import {InstanceLink} from "../executionState/InstanceLink";
import {ExecutionDataObjectInstance} from "../executionState/ExecutionDataObjectInstance";

export class Action {
    name: string;
    duration: number;
    NoP: number;
    role: Role | null;
    inputSet: IOSet;
    outputSet: IOSet;

    public constructor(name: string, duration: number = 1, NoP: number = 1, role: Role | null = null, inputSet: IOSet, outputSet: IOSet) {
        this.name = name;
        this.duration = duration;
        this.NoP = NoP;
        this.role = role;
        this.inputSet = inputSet;
        this.outputSet = outputSet;
    }

    public getExecutionActions(executionState: ExecutionState): ExecutionAction[] {
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
            let inputs = cartesianProduct(...possibleInstances);
            for (let input of inputs) {
                for (let resource of possibleResources) {
                    executionActions.push(this.getExecutionActionForInput([].concat(input), resource, executionState));
                }
            }
        } else {
            for (let resource of possibleResources) {
                executionActions.push(this.getExecutionActionForInput([], resource, executionState));
            }
        }
        return executionActions;
    }

    private getExecutionActionForInput(inputList: ExecutionDataObjectInstance[], resource: Resource, executionState: ExecutionState) {
        let outputList = this.getOutputForInput(inputList, executionState);
        let addedLinks = this.getAddedLinks(inputList.map(input => input.dataObjectInstance), outputList.map(output => output.dataObjectInstance));
        return new ExecutionAction(this, 0, resource, inputList, outputList, addedLinks);
    }

    private getOutputForInput(inputList: ExecutionDataObjectInstance[], executionState: ExecutionState): ExecutionDataObjectInstance[] {
        let output = this.outputSet.set.map(output => {
            let instance = inputList.find(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance.dataclass === output.dataclass);
            if (instance) {
                return new ExecutionDataObjectInstance(instance.dataObjectInstance, output.state);
            } else {
                let newDataObjectInstance = executionState.getNewDataObjectInstanceOfClass(output.dataclass);
                return new ExecutionDataObjectInstance(newDataObjectInstance, output.state);
            }
        });
        return output;
    }

    private isExecutable(executionState: ExecutionState) {
        return this.inputSet.isSatisfiedBy(executionState.availableExecutionDataObjectInstances) && executionState.resources.some(resource => resource.satisfies(this.role, this.NoP));
    }

    private getAddedLinks(inputList: DataObjectInstance[], outputList: DataObjectInstance[]): InstanceLink[] {
        let addedLinks: InstanceLink[] = [];
        let addedObjects: DataObjectInstance[] = this.getAddedObjects(inputList, outputList);
        let readObjects = inputList.filter(inputEntry => !outputList.find(outputEntry => inputEntry.dataclass === outputEntry.dataclass));
        let allObjects = outputList.concat(readObjects);

        for (let output of addedObjects) {
            for (let object of allObjects) {
                //todo check if equality check works
                if (output != object) {
                    addedLinks.push(new InstanceLink(output, object));
                }
            }
        }

        return addedLinks;
    }

    private getAddedObjects(inputList: DataObjectInstance[], outputList: DataObjectInstance[]) {
        return outputList.filter(outputEntry => !inputList.find(inputEntry => inputEntry.dataclass === outputEntry.dataclass));
    }
}
