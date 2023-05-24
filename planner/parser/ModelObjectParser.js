import {is} from "bpmn-js/lib/util/ModelUtil";
import {StateInstance} from "../../dist/types/executionState/StateInstance";
import {InstanceLink} from "../../dist/types/executionState/InstanceLink";
import {ExecutionState} from "../../dist/types/executionState/ExecutionState";
import {DataObjectReference} from "../../dist/types/fragments/DataObjectReference";
import {IOSet} from "../../dist/types/fragments/IOSet";
import {Resource} from "../../dist/types/Resource";
import {Instance} from "../../dist/types/executionState/Instance";
import {Goal} from "../../dist/types/goal/Goal";
import {Role} from "../../dist/types/Role";
import {ObjectiveLink} from "../../dist/types/goal/ObjectiveLink";
import {ObjectiveObject} from "../../dist/types/goal/ObjectiveObject";
import {Objective} from "../../dist/types/goal/Objective";
import {Activity} from "../../dist/types/fragments/Activity";
import {Planner} from "../../dist/Planner";
import {Dataclass} from "../../dist/types/Dataclass";

export function parseObjects(dataModeler, fragmentModeler, objectiveModeler, roleModeler, resourceModeler) {

    let dataclasses = [];
    let modelDataclasses = dataModeler._definitions.get('rootElements').map(element => element.get('boardElements')).flat();
    for (let dataclass of modelDataclasses.filter(element => is(element, 'od:Class'))) {
        dataclasses.push(new Dataclass(dataclass.name));
    }

    let roles = [];
    let modelRoles = roleModeler._definitions.get('rootElements').map(element => element.get('boardElements')).flat();
    for (let role of modelRoles.filter(element => is(element, 'rom:Role'))) {
        roles.push(new Role(role.name));
    }

    let resources = [];
    let modelResources = resourceModeler._definitions.get('rootElements').map(element => element.get('boardElements')).flat();
    for (let resource of modelResources.filter(element => is(element, 'rem:Resource'))) {
        let rolePlanReferences = [];
        for (let roleModelReference of resource.roles) {
            rolePlanReferences.push(roles.find(element => element.name === roleModelReference.name));
        }
        resources.push(new Resource(resource.name, rolePlanReferences, getNumber(resource.capacity, 1), getNumber(resource.availabilityStart, 0), getNumber(resource.availabilityEnd, Infinity)));
    }

    let dataObjectInstances = [];
    let modelInstances = objectiveModeler._definitions.get('objectInstances');
    for (let instance of modelInstances.filter(element => is(element, 'om:ObjectInstance'))) {
        dataObjectInstances.push(new Instance(instance.name, dataclasses.find(element => element.name === instance.classRef.name)))
    }

    let objectives = []; //TODO: ensure order of objectives
    let modelObjectives = objectiveModeler._definitions.get('rootElements');
    for (let i = 0; i < modelObjectives.length; i++) {
        let objectiveNodes = [];
        for (let object of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Object'))) {
            objectiveNodes.push(new ObjectiveObject(dataObjectInstances.find(element => element.name === object.instance.name && element.dataclass.name === object.classRef.name), object.states.map(element => element.name)));
        }
        let objectiveLinks = [];
        for (let link of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Link'))) {
            objectiveLinks.push(new ObjectiveLink(objectiveNodes.find(element => element.dataObjectInstance.name === link.sourceRef.instance.name && element.dataObjectInstance.dataclass.name === link.sourceRef.classRef.name), objectiveNodes.find(element => element.dataObjectInstance.name === link.targetRef.instance.name && element.dataObjectInstance.dataclass.name === link.targetRef.classRef.name)));
        }
        objectives.push(new Objective(objectiveNodes, objectiveLinks, getNumber(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date, null)));
    }

    let goal = new Goal(objectives);

    let startState = objectiveModeler._definitions.get('rootElements').find(element => element.id === "Board");
    let executionInstances = [];
    for (let executionInstance of startState.get('boardElements').filter((element) => is(element, 'om:Object'))) {
        executionInstances.push(new StateInstance(dataObjectInstances.find(element => element.name === executionInstance.instance.name && element.dataclass.name === executionInstance.classRef.name), executionInstance.states[0].name));
    }
    let instanceLinks = [];
    for (let instanceLink of startState.get('boardElements').filter((element) => is(element, 'om:Link'))) {
        instanceLinks.push(new InstanceLink(executionInstances.find(element => element.dataObjectInstance.name === instanceLink.sourceRef.instance.name && element.dataObjectInstance.dataclass.name === instanceLink.sourceRef.classRef.name), executionInstances.find(element => element.dataObjectInstance.name === instanceLink.targetRef.instance.name && element.dataObjectInstance.dataclass.name === instanceLink.targetRef.classRef.name)));
    }
    let currentState = new ExecutionState(executionInstances, [], instanceLinks, resources, 0, [], [], []);

    let actions = [];
    let modelActivities = fragmentModeler._definitions.get('rootElements')[0].get('flowElements');
    for (let action of modelActivities.filter(element => is(element, 'bpmn:Task'))) {
        let inputSet = [];
        for (let dataObjectReference of action.get('dataInputAssociations')) {
            inputSet.push(new DataObjectReference(dataclasses.find(element => element.name === dataObjectReference.get('sourceRef')[0].dataclass.name), dataObjectReference.get('sourceRef')[0].states[0].name, false));
        }
        let outputSet = [];
        for (let dataObjectReference of action.get('dataOutputAssociations')) {
            outputSet.push(new DataObjectReference(dataclasses.find(element => element.name === dataObjectReference.get('targetRef').dataclass.name), dataObjectReference.get('targetRef').states[0].name, false));
        }
        actions.push(new Activity(action.name, getNumber(action.duration, 0), getNumber(action.NoP, 1), roles.find(element => element.name === action.role.name), new IOSet(inputSet), new IOSet(outputSet)))
    }

    return new Planner(currentState, goal, actions);
}

function getNumber(value, defaultValue) {
    let num = parseInt(value, 10)
    return isNaN(num) ? defaultValue : num;
}