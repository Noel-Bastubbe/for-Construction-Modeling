import {IOSet} from "./IOSet";
import {Resource} from "../Resource";
import {Instance} from "../executionState/Instance";
import {Action} from "../executionState/Action";
import {ExecutionState} from "../executionState/ExecutionState";
import {Role} from "../Role";
import {cartesianProduct} from "../../Util";
import {InstanceLink} from "../executionState/InstanceLink";
import {StateInstance} from "../executionState/StateInstance";

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

    public getExecutionActions(executionState: ExecutionState): Action[] {

        let executionActions: Action[] = [];
        let needsInput: boolean = this.inputSet.set.length > 0;
        let needsResources: boolean = this.role != null;

        if (!needsInput && !needsResources) {
            executionActions.push(this.getExecutionActionForInput([], null, executionState));
        } else if (!needsInput && needsResources) {
            let possibleResources: Resource[] = this.getPossibleResources(executionState);
            for (let resource of possibleResources) {
                executionActions.push(this.getExecutionActionForInput([], resource, executionState));
            }
        } else if (needsInput && !needsResources) {
            let inputs: any[] = this.getPossibleInputs(executionState);
            for (let input of inputs) {
                executionActions.push(this.getExecutionActionForInput([].concat(input), null, executionState));
            }
        } else {
            let inputs: any[] = this.getPossibleInputs(executionState);
            let possibleResources: Resource[] = this.getPossibleResources(executionState);
            for (let input of inputs) {
                for (let resource of possibleResources) {
                    executionActions.push(this.getExecutionActionForInput([].concat(input), resource, executionState));
                }
            }
        }
        return executionActions;
    }

    private getPossibleResources(executionState: ExecutionState) {
        return executionState.resources.filter(resource => resource.satisfies(this.role, this.NoP));
    }

    private getPossibleInputs(executionState: ExecutionState): any[] {
        let possibleInstances: StateInstance[][] = [];
        for (let dataObjectReference of this.inputSet.set) {
            let matchingInstances = executionState.availableStateInstances.filter(executionDataObjectInstance =>
                dataObjectReference.isMatchedBy(executionDataObjectInstance)
            );
            possibleInstances.push(matchingInstances);
        }
        return cartesianProduct(...possibleInstances);
    }


    private getExecutionActionForInput(inputList: StateInstance[], resource: Resource | null, executionState: ExecutionState) {
        let outputList = this.getOutputForInput(inputList, executionState);
        let addedLinks = this.getAddedLinks(inputList.map(input => input.instance), outputList.map(output => output.instance));
        return new Action(this, 0, resource, inputList, outputList, addedLinks);
    }

    private getOutputForInput(inputList: StateInstance[], executionState: ExecutionState): StateInstance[] {
        return this.outputSet.set.map(output => {
            let instance: StateInstance | undefined = inputList.find(executionDataObjectInstance =>
                executionDataObjectInstance.instance.dataclass === output.dataclass
            );
            if (instance) {
                return new StateInstance(instance.instance, output.state);
            } else {
                let newDataObjectInstance: Instance = executionState.getNewDataObjectInstanceOfClass(output.dataclass);
                return new StateInstance(newDataObjectInstance, output.state);
            }
        });
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
