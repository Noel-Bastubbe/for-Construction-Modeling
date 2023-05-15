import {ObjectiveNode} from "./ObjectiveNode";
import {DataObjectInstance} from "../executionState/DataObjectInstance";
import {InstanceLink} from "../executionState/InstanceLink";

export class NodeLink {
    first: ObjectiveNode;
    second: ObjectiveNode;

    public constructor(first: ObjectiveNode, second: ObjectiveNode) {
        this.first = first;
        this.second = second;
    }

    public isMatchedBy (instanceLink: InstanceLink) {
        return (this.first.name === instanceLink.first.name && this.second.name === instanceLink.second.name) || (this.second.name === instanceLink.first.name && this.first.name === instanceLink.second.name);
    }
}