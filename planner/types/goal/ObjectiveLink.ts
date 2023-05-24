import {ObjectiveObject} from "./ObjectiveObject";
import {InstanceLink} from "../executionState/InstanceLink";

export class ObjectiveLink {
    first: ObjectiveObject;
    second: ObjectiveObject;

    public constructor(first: ObjectiveObject, second: ObjectiveObject) {
        this.first = first;
        this.second = second;
    }

    public isMatchedBy(instanceLink: InstanceLink) {
        return (this.first.instance === instanceLink.first && this.second.instance === instanceLink.second)
            || (this.second.instance === instanceLink.first && this.first.instance === instanceLink.second);
    }
}