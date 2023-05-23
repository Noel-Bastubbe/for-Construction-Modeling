"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeLink = void 0;
class NodeLink {
    constructor(first, second) {
        this.first = first;
        this.second = second;
    }
    isMatchedBy(instanceLink) {
        return (this.first.dataObjectInstance === instanceLink.first && this.second.dataObjectInstance === instanceLink.second) || (this.second.dataObjectInstance === instanceLink.first && this.first.dataObjectInstance === instanceLink.second);
    }
}
exports.NodeLink = NodeLink;
