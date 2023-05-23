import {Resource} from "../types/Resource";
import {Role} from "../types/Role";

let painter = new Role("painter");
let picasso = new Resource("Picasso", [painter], 1);
let tiler = new Role("tiler");

describe('satisfies function', () => {

    test('resource that has the required role and a big enough capacity should satisfy the conditions', () => {
        expect(picasso.satisfies(painter, 1)).toEqual(true);
    });

    test('resource that has the required role but a too low capacity should not satisfy the conditions', () => {
        expect(picasso.satisfies(painter, 2)).toEqual(false);
    });

    test('resource that has a big enough capacity but not the required role should not satisfy the conditions', () => {
        expect(picasso.satisfies(tiler, 1)).toEqual(false);
    });

    test('role null should satisfy the conditions', () => {
        expect(picasso.satisfies(null, 1)).toEqual(true); // NoP muss später wahrscheinlich noch angepasst werden
    });
});