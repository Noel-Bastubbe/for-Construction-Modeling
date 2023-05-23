"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataObjectInstance_1 = require("../types/executionState/DataObjectInstance");
const ExecutionState_1 = require("../types/executionState/ExecutionState");
const IOSet_1 = require("../types/fragments/IOSet");
const DataObjectReference_1 = require("../types/fragments/DataObjectReference");
const Role_1 = require("../types/Role");
const Resource_1 = require("../types/Resource");
const Dataclass_1 = require("../types/Dataclass");
const Planner_1 = require("../Planner");
const Objective_1 = require("../types/goal/Objective");
const ObjectiveNode_1 = require("../types/goal/ObjectiveNode");
const Goal_1 = require("../types/goal/Goal");
const Action_1 = require("../types/fragments/Action");
const ExecutionDataObjectInstance_1 = require("../types/executionState/ExecutionDataObjectInstance");
const ExecutionLog_1 = require("../types/output/ExecutionLog");
const OutputAction_1 = require("../types/output/OutputAction");
// Dataclasses
let house;
let wall;
let cable;
// Instances
let mapleStreet;
let bakerStreet;
// let mapleStreetPainted: DataObjectInstance;
// let mapleStreetTiled: DataObjectInstance;
// let mapleStreetPlastered: DataObjectInstance;
let mapleStreetInit;
let bakerStreetInit;
let wallNorthAvailable;
let wallNorthStanding;
let wallSouthAvailable;
let wallSouthStanding;
let redCableAvailable;
// Instance links
let wallNorthMapleStreetLink;
let wallSouthMapleStreetLink;
// Roles
let painter;
let tiler;
let electrician;
let builder;
// Resources
let picasso;
let michelangelo;
let tesla;
let bob;
// DataObjectReferences
let houseInit;
let housePainted;
let housePlastered;
let houseTiled;
let cableAvailable;
let wallAvailable;
let wallStanding;
// IOSets
let inputSetPaint;
let outputSetPaint;
let inputSetPlaster;
let outputSetPlaster;
let inputSetPutWalls;
let outputSetPutWalls;
let inputSetTile;
let outputSetTile;
let inputSetLay;
let outputSetLay;
let outputSetBuyCables;
// Activities
let paint;
let plaster;
let putWalls;
let tile;
let lay;
let buyCables;
// ObjectiveNodes
let objectiveNode;
let objectiveNode2;
let objectiveNode3;
// Objectives
let objective;
let objective2;
// Goal
let goal;
// Project State
let actions;
let resources;
let currentState;
beforeEach(() => {
    //reset all dataclasses
    house = new Dataclass_1.Dataclass("house");
    wall = new Dataclass_1.Dataclass("wall");
    cable = new Dataclass_1.Dataclass("cable");
    //reset all instances
    mapleStreet = new DataObjectInstance_1.DataObjectInstance("house:1", house);
    bakerStreet = new DataObjectInstance_1.DataObjectInstance("house:2", house);
    // mapleStreetPainted = new DataObjectInstance("house:1", house, "painted");
    // mapleStreetTiled = new DataObjectInstance("house:1", house, "tiled");
    // mapleStreetPlastered = new DataObjectInstance("house:1", house, "plastered");
    mapleStreetInit = new ExecutionDataObjectInstance_1.ExecutionDataObjectInstance(mapleStreet, "init");
    bakerStreetInit = new ExecutionDataObjectInstance_1.ExecutionDataObjectInstance(bakerStreet, "init");
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
    painter = new Role_1.Role("painter");
    tiler = new Role_1.Role("tiler");
    electrician = new Role_1.Role("electrician");
    builder = new Role_1.Role("builder");
    //reset all resources
    picasso = new Resource_1.Resource("Picasso", [painter], 1);
    michelangelo = new Resource_1.Resource("Michelangelo", [tiler], 1);
    tesla = new Resource_1.Resource("Tesla", [electrician], 1);
    bob = new Resource_1.Resource("Bob", [builder], 1);
    //reset all dataObjectReferences
    houseInit = new DataObjectReference_1.DataObjectReference(house, "init", false);
    housePainted = new DataObjectReference_1.DataObjectReference(house, "painted", false);
    housePlastered = new DataObjectReference_1.DataObjectReference(house, "plastered", false);
    houseTiled = new DataObjectReference_1.DataObjectReference(house, "tiled", false);
    cableAvailable = new DataObjectReference_1.DataObjectReference(cable, "available", false);
    wallAvailable = new DataObjectReference_1.DataObjectReference(wall, "available", true);
    wallStanding = new DataObjectReference_1.DataObjectReference(wall, "standing", true);
    //reset all IOSets
    inputSetPaint = new IOSet_1.IOSet([houseInit]);
    outputSetPaint = new IOSet_1.IOSet([housePainted]);
    inputSetPlaster = new IOSet_1.IOSet([wallStanding]);
    outputSetPlaster = new IOSet_1.IOSet([housePlastered]);
    inputSetPutWalls = new IOSet_1.IOSet([wallAvailable]);
    outputSetPutWalls = new IOSet_1.IOSet([wallStanding]);
    inputSetTile = new IOSet_1.IOSet([housePainted]);
    outputSetTile = new IOSet_1.IOSet([houseTiled]);
    inputSetLay = new IOSet_1.IOSet([housePainted, cableAvailable]);
    outputSetLay = new IOSet_1.IOSet([]);
    outputSetBuyCables = new IOSet_1.IOSet([cableAvailable]);
    //reset ObjectiveNodes
    objectiveNode = new ObjectiveNode_1.ObjectiveNode(mapleStreet, ["painted"]);
    objectiveNode2 = new ObjectiveNode_1.ObjectiveNode(mapleStreet, ["tiled"]);
    objectiveNode3 = new ObjectiveNode_1.ObjectiveNode(bakerStreet, ["painted"]);
    //reset Objectives
    objective = new Objective_1.Objective([objectiveNode], []);
    //reset Goal
    goal = new Goal_1.Goal([objective]);
    //reset all activities
    paint = new Action_1.Action("paint", 1, 1, painter, inputSetPaint, outputSetPaint);
    // plaster = new Activity("plaster", 1, 1, painter, [inputSetPlaster], outputSetPlaster);
    // putWalls = new Activity("putWalls", 1, 1, builder, [inputSetPutWalls], outputSetPutWalls);
    tile = new Action_1.Action("tile", 1, 1, tiler, inputSetTile, outputSetTile);
    // lay = new Activity("lay", 1, 1, electrician, [inputSetLay], outputSetLay);
    // buyCables = new Activity("buyCables", 1, 1, electrician, [], outputSetBuyCables);
    //reset all project states
    actions = [paint];
    resources = [picasso];
    currentState = new ExecutionState_1.ExecutionState([mapleStreetInit], [], [], [picasso], 0, [], [], []);
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
        let outputAction = new OutputAction_1.OutputAction(paint, 0, 1, picasso, 1, [mapleStreet], [mapleStreet]);
        let executionLog = new ExecutionLog_1.ExecutionLog([outputAction], [mapleStreet]);
        let planner = new Planner_1.Planner(currentState, goal, [paint]);
        expect(planner.simulateUntil(currentState, goal, [paint], [picasso])).toEqual(executionLog);
    });
    test('plan two activities', () => {
        let outputAction = new OutputAction_1.OutputAction(paint, 0, 1, picasso, 1, [mapleStreet], [mapleStreet]);
        let outputAction2 = new OutputAction_1.OutputAction(tile, 1, 2, michelangelo, 1, [mapleStreet], [mapleStreet]);
        let executionLog = new ExecutionLog_1.ExecutionLog([outputAction, outputAction2], [mapleStreet]);
        objective2 = new Objective_1.Objective([objectiveNode2], []);
        goal = new Goal_1.Goal([objective, objective2]);
        currentState.resources = [picasso, michelangelo];
        let planner = new Planner_1.Planner(currentState, goal, [paint, tile]);
        expect(planner.simulateUntil(currentState, goal, [paint, tile], [picasso, michelangelo])).toEqual(executionLog);
    });
    test('plan one activity on two objects', () => {
        let outputAction = new OutputAction_1.OutputAction(paint, 0, 1, picasso, 1, [mapleStreet], [mapleStreet]);
        let outputAction2 = new OutputAction_1.OutputAction(paint, 1, 2, picasso, 1, [bakerStreet], [bakerStreet]);
        let executionLog = new ExecutionLog_1.ExecutionLog([outputAction, outputAction2], [mapleStreet, bakerStreet]);
        objective = new Objective_1.Objective([objectiveNode, objectiveNode3], []);
        currentState.availableExecutionDataObjectInstances = [mapleStreetInit, bakerStreetInit];
        goal = new Goal_1.Goal([objective]);
        let planner = new Planner_1.Planner(currentState, goal, [paint, tile]);
        expect(planner.simulateUntil(currentState, goal, [paint, tile], [picasso])).toEqual(executionLog);
    });
});
