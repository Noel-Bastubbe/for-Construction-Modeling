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

    public constructor(action: Action, runningTime: number, resource: Resource | null, inputList: ExecutionDataObjectInstance[], outputList: ExecutionDataObjectInstance[], addedInstanceLinks: InstanceLink[]) {
        this.action = action;
        this.runningTime = runningTime;
        this.resource = resource;
        this.inputList = inputList;
        this.outputList = outputList;
        this.addedInstanceLinks = addedInstanceLinks;
    }

    public start(executionState: ExecutionState): ExecutionState {
        let changedExecutionDataObjectInstances = this.getChangedExecutionDataObjectInstances();
        let availableDataObjects = executionState.availableExecutionDataObjectInstances.filter(executionDataObjectInstance => !changedExecutionDataObjectInstances.some(it => it.dataObjectInstance === executionDataObjectInstance.dataObjectInstance));
        let blockedDataObjects = executionState.blockedExecutionDataObjectInstances.concat(changedExecutionDataObjectInstances);
        let instanceLinks = executionState.instanceLinks;
        let resources = this.getBlockedResources(executionState.resources);
        let time = executionState.time;
        let runningActions = executionState.runningActions.concat([this]);

        let actionHistory = executionState.actionHistory;
        let objectiveArray = executionState.objectives.slice();
        return new ExecutionState(availableDataObjects, blockedDataObjects, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }

    //todo check if resource should be refactored to ExecutionResource
    private getBlockedResources(resources: Resource[]): Resource[] {
        if(this.resource === null) {
            return resources;
        }
        let result = resources.filter(resource => resource !== this.resource);
        let changedResource = new Resource(this.resource.id, this.resource.name, this.resource.roles, this.resource.capacity - this.action.NoP);
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
            let action = new ExecutionAction(this.action, this.runningTime + 1, this.resource, this.inputList, this.outputList, this.addedInstanceLinks);
            let runningActions = executionState.runningActions.filter((action) => action !== this);
            runningActions.push(action);
            return new ExecutionState(executionState.availableExecutionDataObjectInstances, executionState.blockedExecutionDataObjectInstances, executionState.instanceLinks, executionState.resources, executionState.time, runningActions, executionState.actionHistory, executionState.objectives);
        }
    }

    private finish(executionState: ExecutionState): ExecutionState {
        let availableDataObjects = executionState.availableExecutionDataObjectInstances.concat(this.outputList);
        let blockedDataObjects = this.getNewBlockedDataObjects(executionState);
        let instanceLinks = executionState.instanceLinks.concat(this.addedInstanceLinks);
        let resources = this.getNewResources(executionState);
        let time = executionState.time;
        let runningActions = executionState.runningActions.filter((action) => action !== this);
        let actionHistory = this.getNewActionHistory(executionState);
        let objectiveArray = executionState.objectives.slice();
        return new ExecutionState(availableDataObjects, blockedDataObjects, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }

    private getNewBlockedDataObjects(executionState: ExecutionState): ExecutionDataObjectInstance[] {
        let changedDataObjectInstances = this.getChangedExecutionDataObjectInstances();
        return executionState.blockedExecutionDataObjectInstances.filter(executionDataObjectInstance => !changedDataObjectInstances.some(it => it.dataObjectInstance === executionDataObjectInstance.dataObjectInstance));
    }

    // private getNewInstanceLinks(executionState: ExecutionState): InstanceLink[] {
    //     let oldInstanceLinks = executionState.instanceLinks;
    //     let newInstanceLinks = oldInstanceLinks.filter((instanceLink) => !this.addedInstanceLinks.includes(instanceLink));
    //     newInstanceLinks = newInstanceLinks.concat(this.addedInstanceLinks);
    //     return newInstanceLinks;
    // }

    private getNewResources(executionState: ExecutionState): Resource[] {
        let oldResources = executionState.resources;
        let newResources = oldResources.map((resource) => {
            if (resource.name === this.resource?.name && resource.roles === this.resource?.roles) {
                return new Resource(resource.id, resource.name, resource.roles, resource.capacity + this.action.NoP);
            } else {
                return resource;
            }
        });
        return newResources;
    }

    private getNewActionHistory(executionState: ExecutionState): OutputAction[] {
        let oldActionHistory = executionState.actionHistory;
        let newActionHistory = oldActionHistory.concat(new OutputAction(this.action, executionState.time - this.action.duration, executionState.time, this.resource, this.action.NoP, this.inputList.map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance), this.outputList.map(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance)));
        return newActionHistory;
    }

    private getChangedExecutionDataObjectInstances():ExecutionDataObjectInstance[] {
        let result = [];
        for(let input of this.inputList) {
            if(this.outputList.some(output => output.dataObjectInstance === input.dataObjectInstance)) {
                result.push(input);
            }
        }
        return result;
    }
}