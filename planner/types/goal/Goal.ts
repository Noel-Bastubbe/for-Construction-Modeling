import {Objective} from "./Objective";

export class Goal {
    objectives: Objective[];

    public constructor(objectives: Objective[]) {
        this.objectives = objectives;
    }
}