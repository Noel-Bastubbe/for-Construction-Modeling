import {Resource} from "../Resource";
import {StateInstance} from "./StateInstance";
import {InstanceLink} from "./InstanceLink";
import {Action} from "./Action";
import {ScheduledAction} from "../output/ScheduledAction";
import {Activity} from "../fragments/Activity";
import {Dataclass} from "../Dataclass";
import {Instance} from "./Instance";

export class ExecutionState {
    availableStateInstances: StateInstance[];
    blockedStateInstances: StateInstance[];
    instanceLinks: InstanceLink[];
    resources: Resource[];
    time: number;
    objectives: boolean[] = [];
    runningActions: Action[];
    actionHistory: ScheduledAction[];

    public constructor(availableStateInstances: StateInstance[], blockedStateInstances: StateInstance[],
                       instanceLinks: InstanceLink[], resources: Resource[], time: number, runningActions: Action[] = [],
                       actionHistory: ScheduledAction[] = [], objectives: boolean[] = []) {
        this.availableStateInstances = availableStateInstances;
        this.blockedStateInstances = blockedStateInstances;
        this.instanceLinks = instanceLinks;
        this.resources = resources;
        this.time = time;
        this.runningActions = runningActions;
        this.actionHistory = actionHistory;
        this.objectives = objectives;
    }

    public allStateInstances(): StateInstance[] {
        return this.availableStateInstances.concat(this.blockedStateInstances);
    }

    public getNewInstanceOfClass(dataclass: Dataclass): Instance {
        let name: string = (this.allStateInstances().filter(stateInstances =>
            stateInstances.dataObjectInstance.dataclass === dataclass
        ).length + 1).toString();
        return new Instance(name, dataclass);
    }

    public getSuccessors(activities: Activity[]): ExecutionState[] {
        let successors: ExecutionState[] = [];
        let actions: Action[] = activities.map(activity => activity.getExecutionActions(this)).flat();
        actions.forEach(action => {
            let newState: ExecutionState = action.start(this);
            successors.push(newState);
        });
        successors.push(this.wait());
        return successors;
    }

    private wait(): ExecutionState {
        let newState: ExecutionState = new ExecutionState(this.availableStateInstances, this.blockedStateInstances, this.instanceLinks, this.resources,
            this.time + 1, this.runningActions, this.actionHistory, this.objectives
        );
        this.runningActions.forEach(action => {
            newState = action.tryToFinish(newState);
        });
        return newState;
    }
}