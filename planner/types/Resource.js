"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
class Resource {
    constructor(name, roles = [], capacity) {
        this.name = name;
        this.roles = roles;
        this.capacity = capacity;
    }
    satisfies(role, NoP) {
        if (!role) {
            return true;
        }
        else {
            return this.roles.includes(role) && NoP <= this.capacity;
        }
    }
}
exports.Resource = Resource;
