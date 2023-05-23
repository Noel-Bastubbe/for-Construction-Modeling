import {Resource} from "../types/Resource";
import {Role} from "../types/Role";
import {Action} from "../types/fragments/Action";
import {IOSet} from "../types/fragments/IOSet";
import {DataObjectReference} from "../types/fragments/DataObjectReference";
import {Dataclass} from "../types/Dataclass";

let painter = new Role("painter");
let picasso = new Resource("Picasso", [painter], 1);

let house = new Dataclass("house");
let houseInit = new DataObjectReference(house,"init",false);
let housePainted = new DataObjectReference(house,"painted", false);


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