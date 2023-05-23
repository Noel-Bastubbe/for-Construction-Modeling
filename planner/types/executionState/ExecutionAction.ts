import {Resource} from "../Resource";
import {ExecutionState} from "./ExecutionState";
import {OutputAction} from "../output/OutputAction";
import {InstanceLink} from "./InstanceLink";
import {Action} from "../fragments/Action";
import {ExecutionDataObjectInstance} from "./ExecutionDataObjectInstance";

export class ExecutionAction {
    action: Action;
    runningTime: number;
    resource: Resource | null;
    inputList: ExecutionDataObjectInstance[];
    outputList: ExecutionDataObjectInstance[];
    addedInstanceLinks: InstanceLink[];

    public constructor(action: Action, runningTime: number, resource: Resource | null, inputList: ExecutionDataObjectInstance[],
                       outputList: ExecutionDataObjectInstance[], addedInstanceLinks: InstanceLink[]) {
        this.action = action;
        this.runningTime = runningTime;
        this.resource = resource;
        this.inputList = inputList;
        this.outputList = outputList;
        this.addedInstanceLinks = addedInstanceLinks;
    }

    public start(executionState: ExecutionState): ExecutionState {
        let changedExecutionDataObjectInstances: ExecutionDataObjectInstance[] = this.getChangedExecutionDataObjectInstances();
        let availableDataObjects: ExecutionDataObjectInstance[] = executionState.availableExecutionDataObjectInstances.filter(executionDataObjectInstance =>
            !changedExecutionDataObjectInstances.some(it => it.dataObjectInstance === executionDataObjectInstance.dataObjectInstance)
        );
        let blockedDataObjects: ExecutionDataObjectInstance[] = executionState.blockedExecutionDataObjectInstances.concat(changedExecutionDataObjectInstances);
        let instanceLinks: InstanceLink[] = executionState.instanceLinks;
        let resources: Resource[] = this.getBlockedResources(executionState.resources);
        let time: number = executionState.time;
        let runningActions: ExecutionAction[] = executionState.runningActions.concat([this]);
        let actionHistory: OutputAction[] = executionState.actionHistory;
        let objectiveArray: boolean[] = executionState.objectives.slice();
        return new ExecutionState(availableDataObjects, blockedDataObjects, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }

    private getBlockedResources(resources: Resource[]): Resource[] {
        if (this.resource === null) {
            return resources;
        }
        let result: Resource[] = resources.filter(resource => resource !== this.resource);
        let changedResource: Resource = new Resource(this.resource.name, this.resource.roles, this.resource.capacity - this.action.NoP);
        result.push(changedResource);
        return result;
    }

    private canFinish(): boolean {
        return this.runningTime + 1 == this.action.duration;
    }


    public tryToFinish(executionState: ExecutionState): ExecutionState {
        if (this.canFinish()) {
            return this.finish(executionState);
        } else {
            let action: ExecutionAction = new ExecutionAction(this.action, this.runningTime + 1, this.resource, this.inputList, this.outputList, this.addedInstanceLinks);
            let runningActions: ExecutionAction[] = executionState.runningActions.filter(action => action !== this);
            runningActions.push(action);
            return new ExecutionState(executionState.availableExecutionDataObjectInstances, executionState.blockedExecutionDataObjectInstances,
                executionState.instanceLinks, executionState.resources, executionState.time, runningActions, executionState.actionHistory, executionState.objectives
            );
        }
    }

    private finish(executionState: ExecutionState): ExecutionState {
        let availableDataObjects: ExecutionDataObjectInstance[] = this.outputList.concat(executionState.availableExecutionDataObjectInstances);
        let blockedDataObjects: ExecutionDataObjectInstance[] = this.getNewBlockedDataObjects(executionState);
        let instanceLinks: InstanceLink[] = this.addedInstanceLinks.concat(executionState.instanceLinks);
        let resources: Resource[] = this.getNewResources(executionState);
        let time: number = executionState.time;
        let runningActions: ExecutionAction[] = executionState.runningActions.filter(action => action !== this);
        let actionHistory: OutputAction[] = this.getNewActionHistory(executionState);
        let objectiveArray: boolean[] = executionState.objectives.slice();
        return new ExecutionState(availableDataObjects, blockedDataObjects, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }

    private getNewBlockedDataObjects(executionState: ExecutionState): ExecutionDataObjectInstance[] {
        let changedDataObjectInstances: ExecutionDataObjectInstance[] = this.getChangedExecutionDataObjectInstances();
        return executionState.blockedExecutionDataObjectInstances.filter(executionDataObjectInstance =>
            !changedDataObjectInstances.some(it => it.dataObjectInstance === executionDataObjectInstance.dataObjectInstance)
        );
    }

    private getNewResources(executionState: ExecutionState): Resource[] {
        let oldResources: Resource[] = executionState.resources;
        return oldResources.map(resource => {
            if (resource.name === this.resource?.name && resource.roles === this.resource?.roles) {
                return new Resource(resource.name, resource.roles, resource.capacity + this.action.NoP);
            } else {
                return resource;
            }
        });
    }

    private getNewActionHistory(executionState: ExecutionState): OutputAction[] {
        let oldActionHistory = executionState.actionHistory;
        return oldActionHistory.concat(
            new OutputAction(this.action, executionState.time - this.action.duration, executionState.time, this.resource, this.action.NoP,
                this.inputList.map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance),
                this.outputList.map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance)
            )
        );
    }

    private getChangedExecutionDataObjectInstances(): ExecutionDataObjectInstance[] {
        let changedExecutionDataObjectInstances: ExecutionDataObjectInstance[] = [];
        for (let input of this.inputList) {
            if (this.outputList.some(output => output.dataObjectInstance === input.dataObjectInstance)) {
                changedExecutionDataObjectInstances.push(input);
            }
        }
        return changedExecutionDataObjectInstances;
    }
}