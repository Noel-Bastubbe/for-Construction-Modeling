import {Instance} from "../types/executionState/Instance";
import {ExecutionState} from "../types/executionState/ExecutionState";
import {IOSet} from "../types/fragments/IOSet";
import {DataObjectReference} from "../types/fragments/DataObjectReference";
import {Role} from "../types/Role";
import {Resource} from "../types/Resource";
import {Dataclass} from "../types/Dataclass";
import {Planner} from "../Planner";
import {Objective} from "../types/goal/Objective";
import {ObjectiveObject} from "../types/goal/ObjectiveObject";
import {Goal} from "../types/goal/Goal";
import {Activity} from "../types/fragments/Activity";
import {StateInstance} from "../types/executionState/StateInstance";
import {Schedule} from "../types/output/Schedule";
import {ScheduledAction} from "../types/output/ScheduledAction";

// Dataclasses
let house: Dataclass;
let wall: Dataclass;
let cable: Dataclass;

// Instances
let mapleStreet: Instance;
let bakerStreet: Instance;

// ExecutionDataObjectInstances
let mapleStreetInit: StateInstance;
let bakerStreetInit: StateInstance;

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
let paint: Activity;
let tile: Activity;

// ObjectiveObjects
let objectiveObject: ObjectiveObject;
let objectiveObject2: ObjectiveObject;
let objectiveObject3: ObjectiveObject;

// Objectives
let objective: Objective;
let objective2: Objective;

// Goal
let goal: Goal;

// Project State
let activities: Activity[];
let resources: Resource[];
let currentState: ExecutionState;


beforeEach(() => {
    //reset all dataclasses
    house = new Dataclass("house");
    wall = new Dataclass("wall");
    cable = new Dataclass("cable");

    //reset all instances
    mapleStreet = new Instance("house:1", house);
    bakerStreet = new Instance("house:2", house);

    //reset all stateInstance
    mapleStreetInit = new StateInstance(mapleStreet, "init");
    bakerStreetInit = new StateInstance(bakerStreet, "init");

    //reset all roles
    painter = new Role("painter");
    tiler = new Role("tiler");
    electrician = new Role("electrician");
    builder = new Role("builder");

    //reset all resources
    picasso = new Resource("Picasso", [painter], 1);
    michelangelo = new Resource("Michelangelo", [tiler], 1);
    tesla = new Resource("Tesla", [electrician], 1);
    bob = new Resource("Bob", [builder], 1);

    //reset all dataObjectReferences
    houseInit = new DataObjectReference(house, "init", false);
    housePainted = new DataObjectReference(house, "painted", false);
    housePlastered = new DataObjectReference(house, "plastered", false);
    houseTiled = new DataObjectReference(house, "tiled", false);
    cableAvailable = new DataObjectReference(cable, "available", false);
    wallAvailable = new DataObjectReference(wall, "available", true);
    wallStanding = new DataObjectReference(wall, "standing", true);

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

    //reset ObjectiveObjects
    objectiveObject = new ObjectiveObject(mapleStreet, ["painted"]);
    objectiveObject2 = new ObjectiveObject(mapleStreet, ["tiled"]);
    objectiveObject3 = new ObjectiveObject(bakerStreet, ["painted"]);

    //reset objectives
    objective = new Objective([objectiveObject], []);

    //reset goal
    goal = new Goal([objective]);

    //reset all activities
    paint = new Activity("paint", 1, 1, painter, inputSetPaint, outputSetPaint);
    tile = new Activity("tile", 1, 1, tiler, inputSetTile, outputSetTile);

    //reset all project states
    activities = [paint];
    resources = [picasso];
    currentState = new ExecutionState([mapleStreetInit], [], [], [picasso], 0, [], [], []);
});

describe('generate plan', () => {

    test('plan one activity', () => {
        let outputAction = new ScheduledAction(paint, 0, 1, picasso, 1, [mapleStreet], [mapleStreet]);
        let executionLog = new Schedule([outputAction], [mapleStreet], resources);

        let planner = new Planner(currentState, goal, [paint]);

        expect(planner.generatePlan()).toEqual(executionLog);
    });

    test('plan two activities', () => {
        let resources = [picasso, michelangelo];
        let outputAction = new ScheduledAction(paint, 0, 1, picasso, 1, [mapleStreet], [mapleStreet]);
        let outputAction2 = new ScheduledAction(tile, 1, 2, michelangelo, 1, [mapleStreet], [mapleStreet]);
        let executionLog = new Schedule([outputAction, outputAction2], [mapleStreet], resources);

        objective2 = new Objective([objectiveObject2], []);
        goal = new Goal([objective, objective2]);

        currentState.resources = resources;
        let planner = new Planner(currentState, goal, [paint, tile]);
        expect(planner.generatePlan()).toEqual(executionLog);
    });

    test('plan one activity on two objects', () => {
        let outputAction = new ScheduledAction(paint, 0, 1, picasso, 1, [mapleStreet], [mapleStreet]);
        let outputAction2 = new ScheduledAction(paint, 1, 2, picasso, 1, [bakerStreet], [bakerStreet]);
        let executionLog = new Schedule([outputAction, outputAction2], [bakerStreet, mapleStreet], resources);

        objective = new Objective([objectiveObject, objectiveObject3], []);
        goal = new Goal([objective]);

        currentState.availableStateInstances = [mapleStreetInit, bakerStreetInit];
        let planner = new Planner(currentState, goal, [paint, tile]);
        expect(planner.generatePlan()).toEqual(executionLog);
    });
});