import {ObjectiveObject} from "./ObjectiveObject";
import {InstanceLink} from "../executionState/InstanceLink";

export class NodeLink {
    first: ObjectiveObject;
    second: ObjectiveObject;

    public constructor(first: ObjectiveObject, second: ObjectiveObject) {
        this.first = first;
        this.second = second;
    }

    public isMatchedBy(instanceLink: InstanceLink) {
        return (this.first.dataObjectInstance === instanceLink.first && this.second.dataObjectInstance === instanceLink.second)
            || (this.second.dataObjectInstance === instanceLink.first && this.first.dataObjectInstance === instanceLink.second);
    }
}