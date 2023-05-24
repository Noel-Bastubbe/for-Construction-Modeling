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

    public constructor(availableDataObjects: ExecutionDataObjectInstance[], blockedDataObjects: ExecutionDataObjectInstance[], instanceLinks: InstanceLink[], resources: Resource[], time: number, runningActions: ExecutionAction[] = [], actionHistory: OutputAction[] = [], objectives: boolean[] = []) {
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
        let name = this.allExecutionDataObjectInstances().filter(executionDataObjectInstance => executionDataObjectInstance.dataObjectInstance.dataclass === dataclass).length + 1;
        return new DataObjectInstance(dataclass.name.toString() + "_" + name.toString(), name.toString(), dataclass);
    }

    public getSuccessors(actions: Action[]): ExecutionState[] {
        let successors: ExecutionState[] = [];
        //get ExecutionActions Actions from Actions
        let executionActions = actions.map(action => action.getExecutionActions(this)).flat();
        //for each ExecutionAction, start ExecutionAction and get new ExecutionState
        executionActions.forEach(executionAction => {
            let newState = executionAction.start(this);
            successors.push(newState);
        });
        //waitAction executen and get new ExecutionState
        successors.push(this.wait());
        //push all to successors
        return successors;
    }

    private wait(): ExecutionState {
        let newState = new ExecutionState(this.availableExecutionDataObjectInstances, this.blockedExecutionDataObjectInstances, this.instanceLinks, this.resources, this.time + 1, this.runningActions, this.actionHistory, this.objectives);
        this.runningActions.forEach(action => {
            newState = action.tryToFinish(newState);
        });
        return newState;
    }

    // public executeActiviy(activitiy: Activity, instance: ExecutionDataObjectInstance) {
    //     let indexInInstances = this.dataObjectInstances.indexOf(instance);
    //     let indexInOutput = activitiy.outputSet.map(element => element.dataclass).indexOf(instance.state[0].dataclass);
    //     if (indexInOutput === -1) {
    //         console.error("This Activity does not change the state of this instance.")
    //     }
    //     if (indexInInstances === -1) {
    //         console.error("This instance does not exist at the current state.")
    //     }
    //     this.dataObjectInstances[indexInInstances].state.splice(indexInInstances, 1, activitiy.outputSet[indexInOutput]);
    // }
}