import {ObjectiveNode} from "./ObjectiveNode";
import {InstanceLink} from "../executionState/InstanceLink";

export class NodeLink {
    first: ObjectiveNode;
    second: ObjectiveNode;

    public constructor(first: ObjectiveNode, second: ObjectiveNode) {
        this.first = first;
        this.second = second;
    }

    public isMatchedBy(instanceLink: InstanceLink) {
        return (this.first.dataObjectInstance === instanceLink.first && this.second.dataObjectInstance === instanceLink.second) || (this.second.dataObjectInstance === instanceLink.first && this.first.dataObjectInstance === instanceLink.second);
    }
}