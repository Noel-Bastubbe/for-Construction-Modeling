"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goal = void 0;
class Goal {
    constructor(objectives = []) {
        this.objectives = objectives;
    }
    isFulfilledBy(node) {
        for (let i = 0; i < this.objectives.length; i++) {
            if (!node.objectives[i]) {
                if (this.objectives[i].isFulfilledBy(node)) {
                    node.objectives[i] = true;
                }
                else {
                    return false;
                }
            }
        }
        return true;
    }
}
exports.Goal = Goal;
