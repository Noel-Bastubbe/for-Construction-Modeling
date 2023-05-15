// Dataclasses
import {Dataclass} from "../types/Dataclass";
import {DataObjectInstance} from "../types/executionState/DataObjectInstance";
import {InstanceLink} from "../types/executionState/InstanceLink";
import {Role} from "../types/Role";
import {Resource} from "../types/Resource";
import {DataObjectReference} from "../types/fragments/DataObjectReference";
import {IOSet} from "../types/fragments/IOSet";
import {Activity} from "../types/fragments/Activity";
import {ObjectiveNode} from "../types/goal/ObjectiveNode";
import {Objective} from "../types/goal/Objective";

const house = new Dataclass("house");
const wall = new Dataclass("wall");
const cable = new Dataclass("cable");

// Instances
const mapleStreetInit = new DataObjectInstance("house:1", house, "init");
const mapleStreetPainted = new DataObjectInstance("house:1", house, "painted");
const mapleStreetTiled = new DataObjectInstance("house:1", house, "tiled");
const mapleStreetPlastered = new DataObjectInstance("house:1", house, "plastered");

const wallNorthAvailable = new DataObjectInstance("wall:1", wall, "available");
const wallNorthStanding = new DataObjectInstance("wall:1", wall, "standing");
const wallSouthAvailable = new DataObjectInstance("wall:2", wall, "available");
const wallSouthStanding = new DataObjectInstance("wall:2", wall, "standing");

const redCableAvailable = new DataObjectInstance("cable:1", cable, "available");

// Instance links
const wallNorthMapleStreetLink = new InstanceLink(wallNorthStanding, mapleStreetPlastered);
const wallSouthMapleStreetLink = new InstanceLink(wallSouthStanding, mapleStreetPlastered);

// Roles
const painter = new Role("painter");
const tiler = new Role("tiler");
const electrician = new Role("electrician");
const builder = new Role("builder");

// Resources
const picasso = new Resource("Picasso", painter, 1);
const michelangelo = new Resource("Michelangelo", tiler, 1);
const tesla = new Resource("Tesla", electrician, 1);
const bob = new Resource("Bob", builder, 1);

// DataObjectReferences
const houseInit = new DataObjectReference(house, ["init"], false);
const housePainted = new DataObjectReference(house, ["painted"], false);
const housePlastered = new DataObjectReference(house, ["plastered"], false);
const houseTiled = new DataObjectReference(house, ["tiled"], false);
const cableAvailable = new DataObjectReference(cable, ["available"], false);
const wallAvailable = new DataObjectReference(wall, ["available"], true);
const wallStanding = new DataObjectReference(wall, ["standing"], true);

// IOSets
const inputSetPaint = new IOSet([houseInit]);
const outputSetPaint = new IOSet([housePainted]);

const inputSetPlaster = new IOSet([wallStanding]);
const outputSetPlaster = new IOSet([housePlastered]);

const inputSetPutWalls = new IOSet([wallAvailable]);
const outputSetPutWalls = new IOSet([wallStanding]);

const inputSetTile = new IOSet([housePainted]);
const outputSetTile = new IOSet([houseTiled]);

const inputSetLay = new IOSet([housePainted, cableAvailable]);
const outputSetLay = new IOSet([]);

const outputSetBuyCables = new IOSet([cableAvailable]);

// Activities
const paint = new Activity("paint", 1, 1, painter, [inputSetPaint], outputSetPaint);
const plaster = new Activity("plaster", 1, 1, painter, [inputSetPlaster], outputSetPlaster);
const putWalls = new Activity("putWalls", 1, 1, builder, [inputSetPutWalls], outputSetPutWalls);
const tile = new Activity("tile", 1, 1, tiler, [inputSetPaint, inputSetTile], outputSetTile);
const lay = new Activity("lay", 1, 1, electrician, [inputSetLay], outputSetLay);
const buyCables = new Activity("buyCables", 1, 1, electrician, [], outputSetBuyCables);

// ObjectiveNodes
const objectiveNode = new ObjectiveNode("house:1", house, ["painted"]);

// Objectives
const objective = new Objective([objectiveNode], []);