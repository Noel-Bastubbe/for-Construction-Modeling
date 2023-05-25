import {ObjectiveObject} from "./ObjectiveObject";
import {InstanceLink} from "../executionState/InstanceLink";

export class ObjectiveLink {
    id: string;
    first: ObjectiveObject;
    second: ObjectiveObject;

    public constructor(id: string, first: ObjectiveObject, second: ObjectiveObject) {
        this.id = id;
        this.first = first;
        this.second = second;
    }

    public isMatchedBy(instanceLink: InstanceLink) {
        return (this.first.dataObjectInstance === instanceLink.first && this.second.dataObjectInstance === instanceLink.second)
            || (this.second.dataObjectInstance === instanceLink.first && this.first.dataObjectInstance === instanceLink.second);
    }
}