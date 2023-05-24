import {IOSet} from "./IOSet";
import {Resource} from "../Resource";
import {Instance} from "../executionState/Instance";
import {ExecutionAction} from "../executionState/ExecutionAction";
import {ExecutionState} from "../executionState/ExecutionState";
import {Role} from "../Role";
import {cartesianProduct} from "../../Util";
import {InstanceLink} from "../executionState/InstanceLink";
import {ExecutionDataObjectInstance} from "../executionState/ExecutionDataObjectInstance";

export class Activity {
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
        let possibleResources: Resource[] = executionState.resources.filter(resource => resource.satisfies(this.role, this.NoP));
        let executionActions: ExecutionAction[] = [];

        if (this.inputSet.set.length > 0) {
            let possibleInstances: ExecutionDataObjectInstance[][] = [];
            for (let dataObjectReference of this.inputSet.set) {
                let matchingInstances = executionState.availableExecutionDataObjectInstances.filter(executionDataObjectInstance =>
                    dataObjectReference.isMatchedBy(executionDataObjectInstance)
                );
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
        return this.outputSet.set.map(output => {
            let instance: ExecutionDataObjectInstance | undefined = inputList.find(executionDataObjectInstance =>
                executionDataObjectInstance.dataObjectInstance.dataclass === output.dataclass
            );
            if (instance) {
                return new ExecutionDataObjectInstance(instance.dataObjectInstance, output.state);
            } else {
                let newDataObjectInstance: Instance = executionState.getNewDataObjectInstanceOfClass(output.dataclass);
                return new ExecutionDataObjectInstance(newDataObjectInstance, output.state);
            }
        });
    }

    private isExecutable(executionState: ExecutionState) {
        return this.inputSet.isSatisfiedBy(executionState.availableExecutionDataObjectInstances) && executionState.resources.some(resource => resource.satisfies(this.role, this.NoP));
    }

    private getAddedLinks(inputList: Instance[], outputList: Instance[]): InstanceLink[] {
        let addedLinks: InstanceLink[] = [];
        let addedObjects: Instance[] = this.getAddedObjects(inputList, outputList);
        let readObjects: Instance[] = inputList.filter(inputEntry => !outputList.find(outputEntry => inputEntry.dataclass === outputEntry.dataclass));
        let allObjects: Instance[] = outputList.concat(readObjects);

        for (let addedObject of addedObjects) {
            for (let object of allObjects) {
                if (addedObject != object) {
                    addedLinks.push(new InstanceLink(addedObject, object));
                }
            }
        }

        return addedLinks;
    }

    private getAddedObjects(inputList: Instance[], outputList: Instance[]) {
        return outputList.filter(outputEntry => !inputList.find(inputEntry => inputEntry.dataclass === outputEntry.dataclass));
    }
}
