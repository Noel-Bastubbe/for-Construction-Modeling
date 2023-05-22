"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartesianProduct = void 0;
function cartesianProduct(...list) {
    return list.reduce((list, b) => list.flatMap(d => b.map(e => [d, e].flat())));
}
exports.cartesianProduct = cartesianProduct;
