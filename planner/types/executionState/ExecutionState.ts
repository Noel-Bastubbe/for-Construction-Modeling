import {Resource} from "../Resource";
import {ExecutionDataObjectInstance} from "./ExecutionDataObjectInstance";
import {InstanceLink} from "./InstanceLink";
import {ExecutionAction} from "./ExecutionAction";
import {OutputAction} from "../output/OutputAction";
import {Action} from "../fragments/Action";
import {Dataclass} from "../Dataclass";
import {DataObjectInstance} from "./DataObjectInstance";

export class ExecutionState {
    availableExecutionDataObjectInstances: ExecutionDataObjectInstance[];
    blockedExecutionDataObjectInstances: ExecutionDataObjectInstance[];
    instanceLinks: InstanceLink[];
    resources: Resource[];
    time: number;
    objectives: boolean[] = [];
    runningActions: ExecutionAction[];
    actionHistory: OutputAction[];

    public constructor(availableDataObjects: ExecutionDataObjectInstance[], blockedDataObjects: ExecutionDataObjectInstance[],
                       instanceLinks: InstanceLink[], resources: Resource[], time: number, runningActions: ExecutionAction[] = [],
                       actionHistory: OutputAction[] = [], objectives: boolean[] = []) {
        this.availableExecutionDataObjectInstances = availableDataObjects;
        this.blockedExecutionDataObjectInstances = blockedDataObjects;
        this.instanceLinks = instanceLinks;
        this.resources = resources;
        this.time = time;
        this.runningActions = runningActions;
        this.actionHistory = actionHistory;
        this.objectives = objectives;
    }

    public allExecutionDataObjectInstances(): ExecutionDataObjectInstance[] {
        return this.availableExecutionDataObjectInstances.concat(this.blockedExecutionDataObjectInstances);
    }

    public getNewDataObjectInstanceOfClass(dataclass: Dataclass): DataObjectInstance {
        let name: string = (this.allExecutionDataObjectInstances().filter(executionDataObjectInstance =>
            executionDataObjectInstance.dataObjectInstance.dataclass === dataclass
        ).length + 1).toString();
        return new DataObjectInstance(name, dataclass);
    }

    public getSuccessors(actions: Action[]): ExecutionState[] {
        let successors: ExecutionState[] = [];
        let executionActions: ExecutionAction[] = actions.map(action => action.getExecutionActions(this)).flat();
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