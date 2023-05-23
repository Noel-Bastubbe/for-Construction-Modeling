import {DataObjectInstance} from "../types/executionState/DataObjectInstance";
import {ExecutionState} from "../types/executionState/ExecutionState";
import {IOSet} from "../types/fragments/IOSet";
import {DataObjectReference} from "../types/fragments/DataObjectReference";
import {Role} from "../types/Role";
import {Resource} from "../types/Resource";
import {Dataclass} from "../types/Dataclass";
import {InstanceLink} from "../types/executionState/InstanceLink";
import {Planner} from "../Planner";
import {Objective} from "../types/goal/Objective";
import {ObjectiveNode} from "../types/goal/ObjectiveNode";
import {Goal} from "../types/goal/Goal";
import {Action} from "../types/fragments/Action";
import {ExecutionDataObjectInstance} from "../types/executionState/ExecutionDataObjectInstance";
import {ExecutionLog} from "../types/output/ExecutionLog";
import {OutputAction} from "../types/output/OutputAction";

// Dataclasses
let house: Dataclass;
let wall: Dataclass;
let cable: Dataclass;

// Instances
let mapleStreet: DataObjectInstance;
let bakerStreet: DataObjectInstance;
// let mapleStreetPainted: DataObjectInstance;
// let mapleStreetTiled: DataObjectInstance;
// let mapleStreetPlastered: DataObjectInstance;

let mapleStreetInit: ExecutionDataObjectInstance;
let bakerStreetInit: ExecutionDataObjectInstance;

let wallNorthAvailable: DataObjectInstance;
let wallNorthStanding: DataObjectInstance;
let wallSouthAvailable: DataObjectInstance;
let wallSouthStanding: DataObjectInstance;

let redCableAvailable: DataObjectInstance;

// Instance links

let wallNorthMapleStreetLink: InstanceLink;
let wallSouthMapleStreetLink: InstanceLink;

// Roles
let painter: Role;
let tiler: Role;
let electrician: Role;
let builder: Role;

// Resources
let picasso: Resource;
let michelangelo: Resource;
let tesla: Resource;
let bob: Resource;

// DataObjectReferences
let houseInit: DataObjectReference;
let housePainted: DataObjectReference;
let housePlastered: DataObjectReference;
let houseTiled: DataObjectReference;
let cableAvailable: DataObjectReference;
let wallAvailable: DataObjectReference;
let wallStanding: DataObjectReference;

// IOSets
let inputSetPaint: IOSet;
let outputSetPaint: IOSet;

let inputSetPlaster: IOSet;
let outputSetPlaster: IOSet;

let inputSetPutWalls: IOSet;
let outputSetPutWalls: IOSet;

let inputSetTile: IOSet;
let outputSetTile: IOSet;

let inputSetLay: IOSet;
let outputSetLay: IOSet;



let outputSetBuyCables: IOSet;

// Activities
let paint: Action;
let plaster: Action;
let putWalls: Action;
let tile: Action;
let lay: Action;
let buyCables: Action;

// ObjectiveNodes
let objectiveNode: ObjectiveNode;
let objectiveNode2: ObjectiveNode;
let objectiveNode3: ObjectiveNode;

// Objectives
let objective: Objective;
let objective2: Objective;

// Goal
let goal : Goal;

// Project State
let actions: Action[];
let resources: Resource[];
let currentState: ExecutionState;


beforeEach(() => {
    //reset all dataclasses
    house = new Dataclass("house");
    wall = new Dataclass("wall");
    cable = new Dataclass("cable");

    //reset all instances
    mapleStreet = new DataObjectInstance("house:1", house);
    bakerStreet = new DataObjectInstance("house:2", house);
    // mapleStreetPainted = new DataObjectInstance("house:1", house, "painted");
    // mapleStreetTiled = new DataObjectInstance("house:1", house, "tiled");
    // mapleStreetPlastered = new DataObjectInstance("house:1", house, "plastered");

    mapleStreetInit = new ExecutionDataObjectInstance(mapleStreet,"init");
    bakerStreetInit = new ExecutionDataObjectInstance(bakerStreet,"init");

    // wallNorthAvailable = new DataObjectInstance("wall:1", wall, "available");
    // wallNorthStanding = new DataObjectInstance("wall:1", wall, "standing");
    // wallSouthAvailable = new DataObjectInstance("wall:2", wall, "available");
    // wallSouthStanding = new DataObjectInstance("wall:2", wall, "standing");
    //
    // redCableAvailable = new DataObjectInstance("cable:1", cable, "available");

    //reset all links
    // wallNorthMapleStreetLink = new InstanceLink(wallNorthStanding,mapleStreetPlastered);
    // wallSouthMapleStreetLink = new InstanceLink(wallSouthStanding,mapleStreetPlastered);

    //reset all roles
    painter = new Role("painter");
    tiler = new Role("tiler");
    electrician = new Role("electrician");
    builder = new Role("builder");

    //reset all resources
    picasso = new Resource("Picasso", [painter], 1);
    michelangelo = new Resource("Michelangelo", [tiler], 1);
    tesla = new Resource("Tesla", [electrician], 1);
    bob = new Resource("Bob",[builder],1);

    //reset all dataObjectReferences
    houseInit = new DataObjectReference(house,"init",false);
    housePainted = new DataObjectReference(house,"painted", false);
    housePlastered = new DataObjectReference(house,"plastered", false);
    houseTiled = new DataObjectReference(house,"tiled", false);
    cableAvailable = new DataObjectReference( cable,"available",false);
    wallAvailable = new DataObjectReference(wall,"available",true);
    wallStanding = new DataObjectReference(wall,"standing",true);

    //reset all IOSets
    inputSetPaint = new IOSet([houseInit]);
    outputSetPaint = new IOSet([housePainted]);

    inputSetPlaster = new IOSet([wallStanding]);
    outputSetPlaster = new IOSet([housePlastered]);

    inputSetPutWalls = new IOSet([wallAvailable]);
    outputSetPutWalls = new IOSet([wallStanding]);

    inputSetTile = new IOSet([housePainted]);
    outputSetTile = new IOSet([houseTiled]);

    inputSetLay = new IOSet([housePainted, cableAvailable]);
    outputSetLay = new IOSet([]);

    outputSetBuyCables = new IOSet([cableAvailable]);

    //reset ObjectiveNodes
    objectiveNode = new ObjectiveNode(mapleStreet, ["painted"]);
    objectiveNode2 = new ObjectiveNode(mapleStreet, ["tiled"]);
    objectiveNode3 = new ObjectiveNode(bakerStreet, ["painted"]);

    //reset Objectives
    objective = new Objective("",[objectiveNode], []);

    //reset Goal
    goal = new Goal([objective]);

    //reset all activities
    paint = new Action("paint", 1, 1, painter, inputSetPaint, outputSetPaint);
    // plaster = new Activity("plaster", 1, 1, painter, [inputSetPlaster], outputSetPlaster);
    // putWalls = new Activity("putWalls", 1, 1, builder, [inputSetPutWalls], outputSetPutWalls);
    tile = new Action("tile", 1, 1, tiler, inputSetTile, outputSetTile);
    // lay = new Activity("lay", 1, 1, electrician, [inputSetLay], outputSetLay);
    // buyCables = new Activity("buyCables", 1, 1, electrician, [], outputSetBuyCables);

    //reset all project states
    actions = [paint];
    resources = [picasso];
    currentState = new ExecutionState([mapleStreetInit],[],[],[picasso],0,[],[],[]);
});

// describe('determining executable Activities', () => {
//
//     test('activity with one inputSet set should be executable', () => {
//         expect(currentState.executableActivities(activities)).toEqual([paint]);
//     });
//
//     test('activity with many inputSets sets should be executable', () => {
//         activities = [paint, tile];
//         currentState.resources = [picasso, michelangelo];
//         expect(currentState.executableActivities(activities)).toEqual([paint, tile]);
//     });
//
//     test('activity with many data objects within one set should be executable', () => {
//         activities = [paint, lay];
//         currentState.resources = [picasso, tesla];
//         currentState.dataObjectInstances = [mapleStreetPainted, redCableAvailable];
//         expect(currentState.executableActivities(activities)).toEqual([lay]);
//     });
// });
//
// describe('executing Activities', () => {
//
//     test('activity with one inputSet is executable', () => {
//         paint.execute(currentState,[mapleStreetInit]);
//         expect(currentState.dataObjectInstances).toEqual([mapleStreetPainted]);
//     });
//
//     test('activity with many inputSets is executable', () => {
//         tile.execute(currentState,[mapleStreetInit]);
//         expect(currentState.dataObjectInstances).toEqual([mapleStreetTiled]);
//     });
//
//     test('activity that creates a new instance is executable', () => {
//         buyCables.execute(currentState,[]);
//         expect(currentState.dataObjectInstances).toEqual([mapleStreetInit, redCableAvailable]);
//     });
//
//     test('activity that creates a new instance links the new instance to the input', () => {
//         currentState.dataObjectInstances = [wallNorthStanding,wallSouthStanding];
//         plaster.execute(currentState,[wallNorthStanding,wallSouthStanding]);
//         expect(currentState.dataObjectInstances).toEqual([wallNorthStanding,wallSouthStanding, mapleStreetPlastered]);
//         expect(currentState.instanceLinks).toEqual([wallNorthMapleStreetLink,wallSouthMapleStreetLink]);
//     });
//
//     test('activity with a list input is executable', () => {
//         currentState.dataObjectInstances = [mapleStreetInit,wallNorthAvailable,wallSouthAvailable];
//         putWalls.execute(currentState,[wallNorthAvailable,wallSouthAvailable]);
//         expect(currentState.dataObjectInstances).toEqual([mapleStreetInit, wallNorthStanding, wallSouthStanding]);
//     });
// });

describe('generating plans', () => {



    test('plan one activity', () => {
        let outputAction = new OutputAction(paint,0,1,picasso,1,[mapleStreet],[mapleStreet]);
        let executionLog = new ExecutionLog([outputAction],[mapleStreet]);
        let planner = new Planner(currentState,goal,[paint]);
        expect(planner.simulateUntil(currentState, goal, [paint], [picasso])).toEqual(executionLog);
    });

    test('plan two activities', () => {
        let outputAction = new OutputAction(paint,0,1,picasso,1,[mapleStreet],[mapleStreet]);
        let outputAction2 = new OutputAction(tile,1,2,michelangelo,1,[mapleStreet],[mapleStreet]);
        let executionLog = new ExecutionLog([outputAction,outputAction2],[mapleStreet]);
        objective2 = new Objective("2",[objectiveNode2], []);
        goal = new Goal([objective,objective2]);
        currentState.resources = [picasso,michelangelo];
        let planner = new Planner(currentState,goal,[paint,tile]);
        expect(planner.simulateUntil(currentState, goal, [paint,tile], [picasso,michelangelo])).toEqual(executionLog);
    });

    test('plan one activity on two objects', () => {
        let outputAction = new OutputAction(paint,0,1,picasso,1,[mapleStreet],[mapleStreet]);
        let outputAction2 = new OutputAction(paint,1,2,picasso,1,[bakerStreet],[bakerStreet]);
        let executionLog = new ExecutionLog([outputAction,outputAction2],[mapleStreet,bakerStreet]);
        objective = new Objective("",[objectiveNode,objectiveNode3], []);
        currentState.availableExecutionDataObjectInstances = [mapleStreetInit,bakerStreetInit];
        goal = new Goal([objective]);
        let planner = new Planner(currentState,goal,[paint,tile]);
        expect(planner.simulateUntil(currentState, goal, [paint,tile], [picasso])).toEqual(executionLog);
    });
});