import {Resource} from "../types/Resource";
import {Role} from "../types/Role";

let painter = new Role("painter");
let picasso = new Resource("Picasso", [painter], 1);
let tiler = new Role("tiler");

describe('satisfies', () => {

    test('resource with required role and enough capacity should satisfy', () => {
        expect(picasso.satisfies(painter, 1, 0, 1)).toEqual(true);
    });

    test('resource with required role and not enough capacity should not satisfy', () => {
        expect(picasso.satisfies(painter, 2, 0, 1)).toEqual(false);
    });

    test('resource without required role and enough capacity should not satisfy', () => {
        expect(picasso.satisfies(tiler, 1, 0, 1)).toEqual(false);
    });
});