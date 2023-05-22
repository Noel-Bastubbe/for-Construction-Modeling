import {is} from "bpmn-js/lib/util/ModelUtil";
import {ExecutionDataObjectInstance} from "../types/executionState/ExecutionDataObjectInstance";
import {InstanceLink} from "../types/executionState/InstanceLink";
import {ExecutionState} from "../types/executionState/ExecutionState";
import {DataObjectReference} from "../types/fragments/DataObjectReference";
import {IOSet} from "../types/fragments/IOSet";
import {Resource} from "../types/Resource";
import {DataObjectInstance} from "../types/executionState/DataObjectInstance";
import {Goal} from "../types/goal/Goal";
import {Role} from "../types/Role";
import {NodeLink} from "../types/goal/NodeLink";
import {ObjectiveNode} from "../types/goal/ObjectiveNode";
import {Objective} from "../types/goal/Objective";
import {Action} from "../types/fragments/Action";
import {Planner} from "../Planner";
import {Dataclass} from "../types/Dataclass";

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
        resources.push(new Resource(resource.name, rolePlanReferences, parseInt(resource.capacity)));
    }

    let dataObjectInstances = [];
    let modelDataObjectInstances = objectiveModeler._definitions.get('objectInstances');
    for (let instance of modelDataObjectInstances.filter(element => is(element, 'om:ObjectInstance'))) {
        dataObjectInstances.push(new DataObjectInstance(instance.name, dataclasses.find(element => element.name === instance.classRef.name)))
    }

    let objectives = []; //TODO: ensure order of objectives
    let modelObjectives = objectiveModeler._definitions.get('rootElements');
    for (let i = 0; i < modelObjectives.length; i++) {
        let objectiveNodes = [];
        for (let object of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Object'))) {
            objectiveNodes.push(new ObjectiveNode(dataObjectInstances.find(element => element.name === object.instance.name && element.dataclass.name === object.classRef.name), object.states.map(element => element.name)));
        }
        let objectiveLinks = [];
        for (let link of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Link'))) {
            objectiveLinks.push(new NodeLink(objectiveNodes.find(element => element.dataObjectInstance.name === link.sourceRef.instance.name && element.dataObjectInstance.dataclass.name === link.sourceRef.classRef.name), objectiveNodes.find(element => element.dataObjectInstance.name === link.targetRef.instance.name && element.dataObjectInstance.dataclass.name === link.targetRef.classRef.name)));
        }
        objectives.push(new Objective(objectiveNodes, objectiveLinks, parseInt(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date)));
    }

    let goal = new Goal(objectives);

    let startState = objectiveModeler._definitions.get('rootElements').find(element => element.id === "Board");
    let executionDataObjectInstances = [];
    for (let executionDataObjectInstance of startState.get('boardElements').filter((element) => is(element, 'om:Object'))) {
        executionDataObjectInstances.push(new ExecutionDataObjectInstance(dataObjectInstances.find(element => element.name === executionDataObjectInstance.instance.name && element.dataclass.name === executionDataObjectInstance.classRef.name), executionDataObjectInstance.states[0].name));
    }
    let instanceLinks = [];
    for (let instanceLink of startState.get('boardElements').filter((element) => is(element, 'om:Link'))) {
        instanceLinks.push(new InstanceLink(executionDataObjectInstances.find(element => element.dataObjectInstance.name === instanceLink.sourceRef.instance.name && element.dataObjectInstance.dataclass.name === instanceLink.sourceRef.classRef.name), executionDataObjectInstances.find(element => element.dataObjectInstance.name === instanceLink.targetRef.instance.name && element.dataObjectInstance.dataclass.name === instanceLink.targetRef.classRef.name)));
    }
    let currentState = new ExecutionState(executionDataObjectInstances, [], instanceLinks, resources, 0, [], [], []);

    let actions = [];
    let modelActions = fragmentModeler._definitions.get('rootElements')[0].get('flowElements');
    for (let action of modelActions.filter(element => is(element, 'bpmn:Task'))) {
        let inputSet = [];
        for (let dataObjectReference of action.get('dataInputAssociations')) {
            inputSet.push(new DataObjectReference(dataclasses.find(element => element.name === dataObjectReference.get('sourceRef')[0].dataclass.name), dataObjectReference.get('sourceRef')[0].states[0].name, false));
        }
        let outputSet = [];
        for (let dataObjectReference of action.get('dataOutputAssociations')) {
            outputSet.push(new DataObjectReference(dataclasses.find(element => element.name === dataObjectReference.get('targetRef').dataclass.name), dataObjectReference.get('targetRef').states[0].name, false));
        }
        actions.push(new Action(action.name, parseInt(action.duration), parseInt(action.NoP), roles.find(element => element.name === action.role.name), new IOSet(inputSet), new IOSet(outputSet)))
    }

    return new Planner(currentState, goal, actions);
}