import {Resource} from "../Resource";
import {ExecutionState} from "./ExecutionState";
import {ScheduledAction} from "../output/ScheduledAction";
import {InstanceLink} from "./InstanceLink";
import {Activity} from "../fragments/Activity";
import {StateInstance} from "./StateInstance";

export class Action {
    action: Activity;
    runningTime: number;
    resource: Resource | null;
    inputList: StateInstance[];
    outputList: StateInstance[];
    addedInstanceLinks: InstanceLink[];

    public constructor(action: Activity, runningTime: number, resource: Resource | null, inputList: StateInstance[],
                       outputList: StateInstance[], addedInstanceLinks: InstanceLink[]) {
        this.action = action;
        this.runningTime = runningTime;
        this.resource = resource;
        this.inputList = inputList;
        this.outputList = outputList;
        this.addedInstanceLinks = addedInstanceLinks;
    }

    public start(executionState: ExecutionState): ExecutionState {
        if(this.action.duration == 0) {
            return this.finishInstantAction(executionState);
        }
        let changedExecutionDataObjectInstances: StateInstance[] = this.getChangedExecutionDataObjectInstances();
        let availableDataObjects: StateInstance[] = executionState.availableStateInstances.filter(executionDataObjectInstance =>
            !changedExecutionDataObjectInstances.some(it => it.instance === executionDataObjectInstance.instance)
        );
        let blockedDataObjects: StateInstance[] = executionState.blockedExecutionDataObjectInstances.concat(changedExecutionDataObjectInstances);
        let instanceLinks: InstanceLink[] = executionState.instanceLinks;
        let resources: Resource[] = this.getBlockedResources(executionState.resources);
        let time: number = executionState.time;
        let runningActions: Action[] = executionState.runningActions.concat([this]);
        let actionHistory: ScheduledAction[] = executionState.actionHistory;
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
            let action: Action = new Action(this.action, this.runningTime + 1, this.resource, this.inputList, this.outputList, this.addedInstanceLinks);
            let runningActions: Action[] = executionState.runningActions.filter(action => action !== this);
            runningActions.push(action);
            return new ExecutionState(executionState.availableStateInstances, executionState.blockedExecutionDataObjectInstances,
                executionState.instanceLinks, executionState.resources, executionState.time, runningActions, executionState.actionHistory, executionState.objectives
            );
        }
    }

    private finish(executionState: ExecutionState): ExecutionState {
        let availableDataObjects: StateInstance[] = this.outputList.concat(executionState.availableStateInstances);
        let blockedDataObjects: StateInstance[] = this.getNewBlockedDataObjects(executionState);
        let instanceLinks: InstanceLink[] = this.addedInstanceLinks.concat(executionState.instanceLinks);
        let resources: Resource[] = this.getNewResources(executionState);
        let time: number = executionState.time;
        let runningActions: Action[] = executionState.runningActions.filter(action => action !== this);
        let actionHistory: ScheduledAction[] = this.getNewActionHistory(executionState);
        let objectiveArray: boolean[] = executionState.objectives.slice();
        return new ExecutionState(availableDataObjects, blockedDataObjects, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }

    private getNewBlockedDataObjects(executionState: ExecutionState): StateInstance[] {
        let changedDataObjectInstances: StateInstance[] = this.getChangedExecutionDataObjectInstances();
        return executionState.blockedExecutionDataObjectInstances.filter(executionDataObjectInstance =>
            !changedDataObjectInstances.some(it => it.instance === executionDataObjectInstance.instance)
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

    private getNewActionHistory(executionState: ExecutionState): ScheduledAction[] {
        let oldActionHistory = executionState.actionHistory;
        return oldActionHistory.concat(
            new ScheduledAction(this.action, executionState.time - this.action.duration, executionState.time, this.resource, this.action.NoP,
                this.inputList.map(executionDataObjectInstance => executionDataObjectInstance.instance),
                this.outputList.map(executionDataObjectInstance => executionDataObjectInstance.instance)
            )
        );
    }

    private getChangedExecutionDataObjectInstances(): StateInstance[] {
        let changedExecutionDataObjectInstances: StateInstance[] = [];
        for (let input of this.inputList) {
            if (this.outputList.some(output => output.instance === input.instance)) {
                changedExecutionDataObjectInstances.push(input);
            }
        }
        return changedExecutionDataObjectInstances;
    }

    private finishInstantAction(executionState: ExecutionState): ExecutionState {
        let changedExecutionDataObjectInstances = this.getChangedExecutionDataObjectInstances();
        let availableDataObjects = executionState.availableExecutionDataObjectInstances.filter(executionDataObjectInstance => !changedExecutionDataObjectInstances.some(it => it.dataObjectInstance === executionDataObjectInstance.dataObjectInstance));
        availableDataObjects = availableDataObjects.concat(this.outputList);
        let blockedDataObjects = executionState.blockedExecutionDataObjectInstances.slice();
        let instanceLinks = executionState.instanceLinks.concat(this.addedInstanceLinks);
        let resources = executionState.resources.slice();
        let time = executionState.time;
        let runningActions = executionState.runningActions.slice();
        let actionHistory = this.getNewActionHistory(executionState);
        let objectiveArray = executionState.objectives.slice();
        return new ExecutionState(availableDataObjects, blockedDataObjects, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }
}