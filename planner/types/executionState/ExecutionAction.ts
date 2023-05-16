import {DataObjectInstance} from "./DataObjectInstance";
import {Activity} from "../fragments/Activity";
import {Resource} from "../Resource";
import {ExecutionState} from "./ExecutionState";
import {OutputAction} from "../output/OutputAction";
import {InstanceLink} from "./InstanceLink";

export class ExecutionAction {
    activity: Activity;
    runningTime: number;
    resource: Resource | null
    inputList: DataObjectInstance[];
    outputList: DataObjectInstance[];
    //todo: newLinks: InstanceLink[];

    public constructor(activity: Activity, runningTime: number, resource: Resource, inputList: DataObjectInstance[], outputList: DataObjectInstance[]) {
        this.activity = activity;
        this.runningTime = runningTime;
        this.resource = resource;
        this.inputList = inputList;
        this.outputList = outputList;
    }

    private canFinish(): boolean {
        return this.runningTime >= this.activity.duration;
    }

    public tryToFinish(executionState: ExecutionState): ExecutionState | null {
        if (this.canFinish()) {
            return this.finish(executionState);
        } else {
            return null;
        }
    }

    private finish(executionState: ExecutionState): ExecutionState {
        let dataObjects = this.getNewDataObjects(executionState);
        let instanceLinks = this.getNewInstanceLinks(executionState);
        let resources = this.getNewResources(executionState);
        let time = executionState.time;
        let runningActions = executionState.runningActions.filter((action) => action !== this);

        let actionHistory = this.getNewActionHistory(executionState);
        return new ExecutionState(dataObjects, instanceLinks, resources, time, runningActions, actionHistory,);
    }

    private getNewDataObjects(executionState: ExecutionState): DataObjectInstance[] {
        let oldDataObjects = executionState.dataObjectInstances;
        let newDataObjects = oldDataObjects.filter((dataObject) => !this.outputList.includes(dataObject));
        newDataObjects = newDataObjects.concat(this.outputList);
        return newDataObjects;
    }

    private getNewInstanceLinks(executionState: ExecutionState): InstanceLink[] {
        let oldInstanceLinks = executionState.instanceLinks;
        let newInstanceLinks = oldInstanceLinks.filter((instanceLink) => !this.newLinks.includes(instanceLink));
        newInstanceLinks = newInstanceLinks.concat(this.newLinks);
        return newInstanceLinks;
    }

    private getNewResources(executionState: ExecutionState): Resource[] {
        let oldResources = executionState.resources;
        let newResources = oldResources.map((resource) => {
            if (resource === this.resource) {
                return new Resource(resource.name, resource.role, resource.capacity + this.activity.NoP);
            } else {
                return resource;
            }
        });
        return newResources;
    }

    private getNewActionHistory(executionState: ExecutionState): OutputAction[] {
        let oldActionHistory = executionState.actionHistory;
        let newActionHistory = oldActionHistory.concat(new OutputAction(this.activity, executionState.time - this.activity.duration, executionState.time, this.resource, this.activity.NoP, this.inputList, this.outputList));
        return newActionHistory;
    }
}