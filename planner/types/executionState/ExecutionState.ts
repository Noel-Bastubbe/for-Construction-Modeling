import {Resource} from "../Resource";
import {StateInstance} from "./StateInstance";
import {InstanceLink} from "./InstanceLink";
import {Action} from "./Action";
import {ScheduledAction} from "../output/ScheduledAction";
import {Activity} from "../fragments/Activity";
import {Dataclass} from "../Dataclass";
import {Instance} from "./Instance";

export class ExecutionState {
    availableExecutionDataObjectInstances: StateInstance[];
    blockedExecutionDataObjectInstances: StateInstance[];
    instanceLinks: InstanceLink[];
    resources: Resource[];
    time: number;
    objectives: boolean[] = [];
    runningActions: Action[];
    actionHistory: ScheduledAction[];

    public constructor(availableDataObjects: StateInstance[], blockedDataObjects: StateInstance[],
                       instanceLinks: InstanceLink[], resources: Resource[], time: number, runningActions: Action[] = [],
                       actionHistory: ScheduledAction[] = [], objectives: boolean[] = []) {
        this.availableExecutionDataObjectInstances = availableDataObjects;
        this.blockedExecutionDataObjectInstances = blockedDataObjects;
        this.instanceLinks = instanceLinks;
        this.resources = resources;
        this.time = time;
        this.runningActions = runningActions;
        this.actionHistory = actionHistory;
        this.objectives = objectives;
    }

    public allExecutionDataObjectInstances(): StateInstance[] {
        return this.availableExecutionDataObjectInstances.concat(this.blockedExecutionDataObjectInstances);
    }

    public getNewDataObjectInstanceOfClass(dataclass: Dataclass): Instance {
        let name: string = (this.allExecutionDataObjectInstances().filter(executionDataObjectInstance =>
            executionDataObjectInstance.dataObjectInstance.dataclass === dataclass
        ).length + 1).toString();
        return new Instance(name, dataclass);
    }

    public getSuccessors(actions: Activity[]): ExecutionState[] {
        let successors: ExecutionState[] = [];
        let executionActions: Action[] = actions.map(action => action.getExecutionActions(this)).flat();
        executionActions.forEach(executionAction => {
            let newState: ExecutionState = executionAction.start(this);
            successors.push(newState);
        });
        successors.push(this.wait());
        return successors;
    }

    private wait(): ExecutionState {
        let newState: ExecutionState = new ExecutionState(this.availableExecutionDataObjectInstances, this.blockedExecutionDataObjectInstances, this.instanceLinks, this.resources,
            this.time + 1, this.runningActions, this.actionHistory, this.objectives
        );
        this.runningActions.forEach(action => {
            newState = action.tryToFinish(newState);
        });
        return newState;
    }
}