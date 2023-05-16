import {IOSet} from "./IOSet";
import {Role} from "../Role";
import {Resource} from "../Resource";
import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {ExecutionState} from "../executionState/ExecutionState";
import {DataObjectReference} from "./DataObjectReference";
import {InstanceLink} from "../executionState/InstanceLink";
import {ExecutionAction} from "../executionState/ExecutionAction";

export class Activity {
    name: string;
    duration: number;
    NoP: number;
    role: Role | null;
    inputSets: IOSet[];
    outputSet: IOSet;

    public constructor(name: string, duration: number = 1, NoP: number = 1, role: Role | null = null, input: IOSet[], output: IOSet) {
        this.name = name;
        this.duration = duration;
        this.NoP = NoP;
        this.role = role;
        this.inputSets = input;
        this.outputSet = output;
    }

    public isExecutable(executionState: DataObjectInstance[], resources: Resource[]): boolean {
        return this.inputSets.some(inputSet => inputSet.isSatisfiedBy(executionState)) && resources.some(resource => resource.satisfies(this.role, this.NoP));
    }

    public getMatchingInputSet(DataObjectInstances: DataObjectInstance[]): IOSet | undefined {
        return this.inputSets.find(inputSet => inputSet.isSatisfiedBy(DataObjectInstances));
    }

    public createdDataObjectReferences(): DataObjectReference[] {
        let inputSet: DataObjectReference[] = [];
        if (this.inputSets.length > 0) {
            inputSet = this.inputSets[0].set;
        }
        let outputSet = this.outputSet.set;
        let createdDataObjectReferences: DataObjectReference[] = [];
        outputSet.forEach(function (DataObjectReference) {
                if (!inputSet.find(element => element.dataclass === DataObjectReference.dataclass)) {
                    createdDataObjectReferences.push(DataObjectReference);
                }
            }
        )
        return createdDataObjectReferences;
    }

    public changedDataObjectReferences(): DataObjectReference[] {
        let inputSet: DataObjectReference[] = [];
        if (this.inputSets.length > 0) {
            inputSet = this.inputSets[0].set;
        }
        let outputSet = this.outputSet.set;
        let changedDataObjectReferences: DataObjectReference[] = [];
        for (let dataObjectReference of outputSet) {
            if (inputSet.find(element => element.dataclass === dataObjectReference.dataclass)) {
                changedDataObjectReferences.push(dataObjectReference);
            }
        }
        return changedDataObjectReferences;
    }

    public execute(executionState: ExecutionState, relevantDataObjectInstances: DataObjectInstance[]) {
        let inputSet = this.getMatchingInputSet(relevantDataObjectInstances);
        if (!inputSet && relevantDataObjectInstances.length > 0) {
            console.error("Activity was not executable.");
        }
        let createdDataObjectReferences: DataObjectReference[] = this.createdDataObjectReferences();
        let changedDataObjectReferences: DataObjectReference[] = this.changedDataObjectReferences();
        for (let dataObjectReference of createdDataObjectReferences) {
            let newDataObjectInstanceName: string = dataObjectReference.dataclass.name + ":" + (executionState.getDataObjectInstancesOfClass(dataObjectReference.dataclass).length + 1);
            let newDataObjectInstance: DataObjectInstance = new DataObjectInstance(newDataObjectInstanceName, dataObjectReference.dataclass, dataObjectReference.states[0]);

            // This creates links to every DataObjectInstance that is part of the input and does not respect the restriction by the fcM to only link when there exists an association between the dataclasses
            for (let dataObjectInstance of relevantDataObjectInstances) {
                let newInstanceLink = new InstanceLink(dataObjectInstance, newDataObjectInstance);
                executionState.instanceLinks.push(newInstanceLink);
            }
            executionState.dataObjectInstances.push(newDataObjectInstance);
        }

        for (let dataObjectReference of changedDataObjectReferences) {
            if (dataObjectReference.isList) {
                let affectedDataObjectInstances = relevantDataObjectInstances.filter(dataObjectInstance => dataObjectInstance.dataclass === dataObjectReference.dataclass);
                for (let dataObjectInstance of affectedDataObjectInstances) {
                    dataObjectInstance.state = dataObjectReference.states[0];
                }
            } else {
                let affectedDataObjectInstance = relevantDataObjectInstances.find(dataObjectInstance => dataObjectInstance.dataclass === dataObjectReference.dataclass);
                if (affectedDataObjectInstance) {
                    affectedDataObjectInstance.state = dataObjectReference.states[0];
                } else {
                    console.error("Could not match a DataObjectReference to an affected DataObjectInstance")
                }
            }
        }
    }

    private getExecutionActionForInput(inputList: DataObjectInstance[], resource: Resource) {
        let outputList = this.getOutputForInput(inputList);
        return new ExecutionAction(this, 0, resource, inputList, outputList);
    }

    private getOutputForInput(inputList: DataObjectInstance[]): DataObjectInstance[] {
        let output = this.outputSet.set.map(dataObjectReference => {
            let instance = inputList.find(dataObjectInstance => dataObjectInstance.dataclass === dataObjectReference.dataclass);
            if (instance) {
                return new DataObjectInstance(instance.name, instance.dataclass, dataObjectReference.states[0]);
            } else {
                return new DataObjectInstance("new", dataObjectReference.dataclass, dataObjectReference.states[0]);
            }
        });
        return output;
    }
}
