import {Resource} from "../Resource";
import {ExecutionState} from "./ExecutionState";
import {ScheduledAction} from "../output/ScheduledAction";
import {InstanceLink} from "./InstanceLink";
import {Activity} from "../fragments/Activity";
import {StateInstance} from "./StateInstance";

export class Action {
    activity: Activity;
    runningTime: number;
    resource: Resource | null;
    inputList: StateInstance[];
    outputList: StateInstance[];
    addedInstanceLinks: InstanceLink[];

    public constructor(activity: Activity, runningTime: number, resource: Resource | null, inputList: StateInstance[],
                       outputList: StateInstance[], addedInstanceLinks: InstanceLink[]) {
        this.activity = activity;
        this.runningTime = runningTime;
        this.resource = resource;
        this.inputList = inputList;
        this.outputList = outputList;
        this.addedInstanceLinks = addedInstanceLinks;
    }

    public start(executionState: ExecutionState): ExecutionState {
        let changedStateInstances: StateInstance[] = this.getChangedStateInstances();
        let availableStateInstances: StateInstance[] = executionState.availableExecutionDataObjectInstances.filter(stateInstance =>
            !changedStateInstances.some(it => it.dataObjectInstance === stateInstance.dataObjectInstance)
        );
        let blockedStateInstances: StateInstance[] = executionState.blockedExecutionDataObjectInstances.concat(changedStateInstances);
        let instanceLinks: InstanceLink[] = executionState.instanceLinks;
        let resources: Resource[] = this.getBlockedResources(executionState.resources);
        let time: number = executionState.time;
        let runningActions: Action[] = executionState.runningActions.concat([this]);
        let actionHistory: ScheduledAction[] = executionState.actionHistory;
        let objectiveArray: boolean[] = executionState.objectives.slice();
        return new ExecutionState(availableStateInstances, blockedStateInstances, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }

    private getBlockedResources(resources: Resource[]): Resource[] {
        if (this.resource === null) {
            return resources;
        }
        let result: Resource[] = resources.filter(resource => resource !== this.resource);
        let changedResource: Resource = new Resource(this.resource.name, this.resource.roles, this.resource.capacity - this.activity.NoP);
        result.push(changedResource);
        return result;
    }

    private canFinish(): boolean {
        return this.runningTime + 1 == this.activity.duration;
    }


    public tryToFinish(executionState: ExecutionState): ExecutionState {
        if (this.canFinish()) {
            return this.finish(executionState);
        } else {
            let action: Action = new Action(this.activity, this.runningTime + 1, this.resource, this.inputList, this.outputList, this.addedInstanceLinks);
            let runningActions: Action[] = executionState.runningActions.filter(action => action !== this);
            runningActions.push(action);
            return new ExecutionState(executionState.availableExecutionDataObjectInstances, executionState.blockedExecutionDataObjectInstances,
                executionState.instanceLinks, executionState.resources, executionState.time, runningActions, executionState.actionHistory, executionState.objectives
            );
        }
    }

    private finish(executionState: ExecutionState): ExecutionState {
        let availableStateInstances: StateInstance[] = this.outputList.concat(executionState.availableExecutionDataObjectInstances);
        let blockedStateInstances: StateInstance[] = this.getNewBlockedStateInstances(executionState);
        let instanceLinks: InstanceLink[] = this.addedInstanceLinks.concat(executionState.instanceLinks);
        let resources: Resource[] = this.getNewResources(executionState);
        let time: number = executionState.time;
        let runningActions: Action[] = executionState.runningActions.filter(action => action !== this);
        let actionHistory: ScheduledAction[] = this.getNewScheduledActions(executionState);
        let objectiveArray: boolean[] = executionState.objectives.slice();
        return new ExecutionState(availableStateInstances, blockedStateInstances, instanceLinks, resources, time, runningActions, actionHistory, objectiveArray);
    }

    private getNewBlockedStateInstances(executionState: ExecutionState): StateInstance[] {
        let changedStateInstances: StateInstance[] = this.getChangedStateInstances();
        return executionState.blockedExecutionDataObjectInstances.filter(stateInstance =>
            !changedStateInstances.some(it => it.dataObjectInstance === stateInstance.dataObjectInstance)
        );
    }

    private getNewResources(executionState: ExecutionState): Resource[] {
        let oldResources: Resource[] = executionState.resources;
        return oldResources.map(resource => {
            if (resource.name === this.resource?.name && resource.roles === this.resource?.roles) {
                return new Resource(resource.name, resource.roles, resource.capacity + this.activity.NoP);
            } else {
                return resource;
            }
        });
    }

    private getNewScheduledActions(executionState: ExecutionState): ScheduledAction[] {
        let oldScheduledActions = executionState.actionHistory;
        return oldScheduledActions.concat(
            new ScheduledAction(this.activity, executionState.time - this.activity.duration, executionState.time, this.resource, this.activity.NoP,
                this.inputList.map(stateInstance => stateInstance.dataObjectInstance),
                this.outputList.map(stateInstance => stateInstance.dataObjectInstance)
            )
        );
    }

    private getChangedStateInstances(): StateInstance[] {
        let changedStateInstances: StateInstance[] = [];
        for (let input of this.inputList) {
            if (this.outputList.some(output => output.dataObjectInstance === input.dataObjectInstance)) {
                changedStateInstances.push(input);
            }
        }
        return changedStateInstances;
    }
}