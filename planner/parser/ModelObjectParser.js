import {is} from "bpmn-js/lib/util/ModelUtil";
import {ExecutionDataObjectInstance} from "../../dist/types/executionState/ExecutionDataObjectInstance";
import {InstanceLink} from "../../dist/types/executionState/InstanceLink";
import {ExecutionState} from "../../dist/types/executionState/ExecutionState";
import {DataObjectReference} from "../../dist/types/fragments/DataObjectReference";
import {IOSet} from "../../dist/types/fragments/IOSet";
import {Resource} from "../../dist/types/Resource";
import {DataObjectInstance} from "../../dist/types/executionState/DataObjectInstance";
import {Goal} from "../../dist/types/goal/Goal";
import {Role} from "../../dist/types/Role";
import {NodeLink} from "../../dist/types/goal/NodeLink";
import {ObjectiveNode} from "../../dist/types/goal/ObjectiveNode";
import {Objective} from "../../dist/types/goal/Objective";
import {Action} from "../../dist/types/fragments/Action";
import {Planner} from "../../dist/Planner";
import {Dataclass} from "../../dist/types/Dataclass";
import {cartesianProduct} from "../../dist/Util";

export function parseObjects(dataModeler, fragmentModeler, objectiveModeler, dependencyModeler, roleModeler, resourceModeler) {
    let currentState = getCurrentState(objectiveModeler, getDataObjectInstances(objectiveModeler, getDataclasses(dataModeler)), getResources(resourceModeler, getRoles(roleModeler)));
    let goal = new Goal(getObjectives(objectiveModeler, dependencyModeler, getDataObjectInstances(objectiveModeler, getDataclasses(dataModeler))));
    let actions = getActions(fragmentModeler, getDataclasses(dataModeler), getRoles(roleModeler));

    return new Planner(currentState, goal, actions);
}

function getDataclasses(dataModeler) {
    let dataclasses = [];
    let modelDataclasses = dataModeler._definitions.get('rootElements').map(element => element.get('boardElements')).flat();
    for (let dataclass of modelDataclasses.filter(element => is(element, 'od:Class'))) {
        dataclasses.push(new Dataclass(dataclass.name));
    }
    return dataclasses;
}

function getRoles(roleModeler) {
    let roles = [];
    let modelRoles = roleModeler._definitions.get('rootElements').map(element => element.get('boardElements')).flat();
    for (let role of modelRoles.filter(element => is(element, 'rom:Role'))) {
        roles.push(new Role(role.name));
    }
    return roles;
}

function getResources(resourceModeler, roles) {
    let resources = [];
    let modelResources = resourceModeler._definitions.get('rootElements').map(element => element.get('boardElements')).flat();
    for (let resource of modelResources.filter(element => is(element, 'rem:Resource'))) {
        let rolePlanReferences = [];
        for (let roleModelReference of resource.roles) {
            rolePlanReferences.push(roles.find(element => element.name === roleModelReference.name));
        }
        resources.push(new Resource(resource.name, rolePlanReferences, parseInt(resource.capacity)));
    }
    return resources
}

function getDataObjectInstances(objectiveModeler, dataclasses) {
    let dataObjectInstances = [];
    let modelDataObjectInstances = objectiveModeler._definitions.get('objectInstances');
    for (let instance of modelDataObjectInstances.filter(element => is(element, 'om:ObjectInstance'))) {
        dataObjectInstances.push(new DataObjectInstance(instance.name, dataclasses.find(element => element.name === instance.classRef.name)))
    }
    return dataObjectInstances
}

function getObjectives(objectiveModeler, dependencyModeler, dataObjectInstances) {
    let objectives = [];
    let dependencyLinks = dependencyModeler._definitions.get('goals')[0].get('Elements').filter(element => is(element, 'dep:Dependency'));
    let modelObjectives = objectiveModeler._definitions.get('rootElements');
    for (let i = 0; i < modelObjectives.length; i++) {
        let objectiveBoardId = modelObjectives[i].id;
        let objectiveMega = objectiveModeler._definitions.get('rootBoards').find(element => element.plane.get('boardElement').id === objectiveBoardId);
        let objectiveId = objectiveMega.objectiveRef.id;
        let objectiveNodes = [];
        for (let object of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Object'))) {
            objectiveNodes.push(new ObjectiveNode(dataObjectInstances.find(element => element.name === object.instance.name && element.dataclass.name === object.classRef.name), object.states.map(element => element.name)));
        }
        let objectiveLinks = [];
        for (let link of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Link'))) {
            objectiveLinks.push(new NodeLink(objectiveNodes.find(element => element.dataObjectInstance.name === link.sourceRef.instance.name && element.dataObjectInstance.dataclass.name === link.sourceRef.classRef.name), objectiveNodes.find(element => element.dataObjectInstance.name === link.targetRef.instance.name && element.dataObjectInstance.dataclass.name === link.targetRef.classRef.name)));
        }
        if (objectiveId === 'start_state') {
            objectives.push(new Objective(objectiveId, objectiveNodes, objectiveLinks, parseInt(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date)));
        }
        else {
            let previousObjectiveId = dependencyLinks.find(element => element.targetObjective.id === objectiveId).sourceObjective.id;
            let index = objectives.findIndex(element => element.id === previousObjectiveId);
            if (index === -1) {
                objectives.push(new Objective(objectiveId, objectiveNodes, objectiveLinks, parseInt(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date)));
            }
            else {
                objectives.splice(index + 1 , 0, new Objective(objectiveId, objectiveNodes, objectiveLinks, parseInt(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date)));
            }
        }

    }
    return objectives
}

function getCurrentState(objectiveModeler, dataObjectInstances, resources) {
    let startState = objectiveModeler._definitions.get('rootElements').find(element => element.id === "Board");
    let executionDataObjectInstances = [];
    for (let executionDataObjectInstance of startState.get('boardElements').filter((element) => is(element, 'om:Object'))) {
        executionDataObjectInstances.push(new ExecutionDataObjectInstance(dataObjectInstances.find(element => element.name === executionDataObjectInstance.instance.name && element.dataclass.name === executionDataObjectInstance.classRef.name), executionDataObjectInstance.states[0].name));
    }
    let instanceLinks = [];
    for (let instanceLink of startState.get('boardElements').filter((element) => is(element, 'om:Link'))) {
        instanceLinks.push(new InstanceLink(executionDataObjectInstances.find(element => element.dataObjectInstance.name === instanceLink.sourceRef.instance.name && element.dataObjectInstance.dataclass.name === instanceLink.sourceRef.classRef.name), executionDataObjectInstances.find(element => element.dataObjectInstance.name === instanceLink.targetRef.instance.name && element.dataObjectInstance.dataclass.name === instanceLink.targetRef.classRef.name)));
    }
    return new ExecutionState(executionDataObjectInstances, [], instanceLinks, resources, 0, [], [], []);
}
function getActions(fragmentModeler, dataclasses, roles) {
    let actions = [];
    let modelActions = fragmentModeler._definitions.get('rootElements')[0].get('flowElements');
    for (let action of modelActions.filter(element => is(element, 'bpmn:Task'))) {
        let inputs = [];
        for (let dataObjectReference of action.get('dataInputAssociations')) {
            let dataObjectReferences = [];
            for (let i = 0; i < dataObjectReference.get('sourceRef')[0].states.length; i++) {
                dataObjectReferences.push(new DataObjectReference(dataclasses.find(element => element.name === dataObjectReference.get('sourceRef')[0].dataclass.name), dataObjectReference.get('sourceRef')[0].states[i].name, false))
            }
            inputs.push(dataObjectReferences);
        }
        inputs = cartesianProduct(...inputs);

        let outputSet = [];
        for (let dataObjectReference of action.get('dataOutputAssociations')) {
            outputSet.push(new DataObjectReference(dataclasses.find(element => element.name === dataObjectReference.get('targetRef').dataclass.name), dataObjectReference.get('targetRef').states[0].name, false));
        }

        for (let input of inputs) {
            actions.push(new Action(action.name, parseInt(action.duration), parseInt(action.NoP), roles.find(element => element.name === action.role.name), new IOSet(input), new IOSet(outputSet)))
        }
    }
    return actions;
}