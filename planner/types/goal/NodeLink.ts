import {ObjectiveNode} from "./ObjectiveNode";
import {InstanceLink} from "../executionState/InstanceLink";

export class NodeLink {
    id: string;
    first: ObjectiveNode;
    second: ObjectiveNode;

    public constructor(id: string, first: ObjectiveNode, second: ObjectiveNode) {
        this.id = id;
        this.first = first;
        this.second = second;
    }

    public isMatchedBy(instanceLink: InstanceLink) {
        return (this.first.dataObjectInstance === instanceLink.first && this.second.dataObjectInstance === instanceLink.second) || (this.second.dataObjectInstance === instanceLink.first && this.first.dataObjectInstance === instanceLink.second);
    }
}