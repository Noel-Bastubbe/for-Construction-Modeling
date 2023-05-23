import {Resource} from "../types/Resource";
import {Role} from "../types/Role";

let painter = new Role("painter");
let picasso = new Resource("Picasso", [painter], 1);

describe('satisfies', () => {

    test('resource should satisfy', () => {
        expect(picasso.satisfies(painter, 1)).toEqual(true);
    });

    test('resource should not satisfy', () => {
        expect(picasso.satisfies(painter, 2)).toEqual(false);
    });

    test('null should satisfy', () => {
        expect(picasso.satisfies(null, 1)).toEqual(true); // NoP muss später wahrscheinlich noch angepasst werden
    });
});