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

export class ModelObjectParser {
    constructor(dataModeler, fragmentModeler, objectiveModeler, dependencyModeler, roleModeler, resourceModeler) {
        this.dataclasses = this.parseDataclasses(dataModeler);
        this.roles = this.parseRoles(roleModeler);
        this.resources = this.parseResources(resourceModeler, this.roles);
        this.actions = this.parseActions(fragmentModeler, this.dataclasses, this.roles);
        this.dataObjectInstances = this.parseDataObjectInstances(objectiveModeler, this.dataclasses);
        this.currentState = this.parseCurrentState(objectiveModeler, resourceModeler, this.resources, this.dataObjectInstances);
        this.objectives = this.parseObjectives(objectiveModeler, dependencyModeler, this.dataObjectInstances);
        this.goal = new Goal(this.objectives);
    }

    createPlanner() {
        return new Planner(this.currentState, this.goal, this.actions);
    }

    parseDataclasses(dataModeler) {
        let dataclasses = [];
        let modelDataclasses = dataModeler._definitions.get('rootElements').map(element => element.get('boardElements')).flat();

        for (let dataclass of modelDataclasses.filter(element => is(element, 'od:Class'))) {
            dataclasses.push(new Dataclass(dataclass.id, dataclass.name));
        }
        return dataclasses;
    }

    parseRoles(roleModeler) {
        let roles = [];
        let modelRoles = roleModeler._definitions.get('rootElements').map(element => element.get('boardElements')).flat();

        for (let role of modelRoles.filter(element => is(element, 'rom:Role'))) {
            roles.push(new Role(role.id, role.name));
        }
        return roles;
    }

    parseResources(resourceModeler, roles) {
        let resources = [];
        let modelResources = resourceModeler._definitions.get('rootElements').map(element => element.get('boardElements')).flat();

        for (let resource of modelResources.filter(element => is(element, 'rem:Resource'))) {
            let rolePlanReferences = [];
            for (let roleModelReference of resource.roles) {
                rolePlanReferences.push(roles.find(element => element.id === roleModelReference.id));
            }
            resources.push(new Resource(resource.id, resource.name, rolePlanReferences, parseInt(resource.capacity)));
        }
        return resources
    }

    parseDataObjectInstances(objectiveModeler, dataclasses) {
        let dataObjectInstances = [];
        let modelDataObjectInstances = objectiveModeler._definitions.get('objectInstances');

        for (let instance of modelDataObjectInstances.filter(element => is(element, 'om:ObjectInstance'))) {
            dataObjectInstances.push(new DataObjectInstance(instance.id, instance.name, dataclasses.find(element => element.id === instance.classRef.id)))
        }
        return dataObjectInstances
    }

    parseObjectives(objectiveModeler, dependencyModeler, dataObjectInstances) {
        let objectives = [];
        let dependencyLinks = dependencyModeler._definitions.get('goals')[0].get('Elements').filter(element => is(element, 'dep:Dependency'));
        let modelObjectives = objectiveModeler._definitions.get('rootElements');

        for (let i = 0; i < modelObjectives.length; i++) {
            let objectiveBoardId = modelObjectives[i].id;
            let objectiveId = objectiveModeler._definitions.get('rootBoards').find(element => element.plane.get('boardElement').id === objectiveBoardId).objectiveRef.id;

            let objectiveNodes = [];
            for (let object of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Object'))) {
                objectiveNodes.push(new ObjectiveNode(object.id, dataObjectInstances.find(element => element.id === object.instance.id && element.dataclass.id === object.classRef.id), object.states.map(element => element.name)));
            }
            let objectiveLinks = [];
            for (let link of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Link'))) {
                objectiveLinks.push(new NodeLink(link.id, objectiveNodes.find(element => element.dataObjectInstance.id === link.sourceRef.instance.id && element.dataObjectInstance.dataclass.id === link.sourceRef.classRef.id), objectiveNodes.find(element => element.dataObjectInstance.id === link.targetRef.instance.id && element.dataObjectInstance.dataclass.id === link.targetRef.classRef.id)));
            }

            if (objectiveId === 'start_state') {
                objectives.push(new Objective(objectiveId, objectiveNodes, objectiveLinks, parseInt(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date)));
            } else {
                let previousObjectiveId = dependencyLinks.find(element => element.targetObjective.id === objectiveId).sourceObjective.id;
                let index = objectives.findIndex(element => element.id === previousObjectiveId);
                if (index === -1) {
                    objectives.push(new Objective(objectiveId, objectiveNodes, objectiveLinks, parseInt(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date)));
                } else {
                    objectives.splice(index + 1, 0, new Objective(objectiveId, objectiveNodes, objectiveLinks, parseInt(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date)));
                }
            }
        }
        return objectives
    }

    parseCurrentState(objectiveModeler, resourceModeler, resources, dataObjectInstances) {
        let startState = objectiveModeler._definitions.get('rootElements').find(element => element.id === "Board");

        let executionDataObjectInstances = [];
        for (let executionDataObjectInstance of startState.get('boardElements').filter((element) => is(element, 'om:Object'))) {
            executionDataObjectInstances.push(new ExecutionDataObjectInstance(dataObjectInstances.find(element => element.id === executionDataObjectInstance.instance.id && element.dataclass.id === executionDataObjectInstance.classRef.id), executionDataObjectInstance.states[0].name));
        }
        let instanceLinks = [];
        for (let instanceLink of startState.get('boardElements').filter((element) => is(element, 'om:Link'))) {
            instanceLinks.push(new InstanceLink(executionDataObjectInstances.find(element => element.dataObjectInstance.id === instanceLink.sourceRef.instance.id && element.dataObjectInstance.dataclass.id === instanceLink.sourceRef.classRef.id), executionDataObjectInstances.find(element => element.dataObjectInstance.id === instanceLink.targetRef.instance.id && element.dataObjectInstance.dataclass.id === instanceLink.targetRef.classRef.id)));
        }
        return new ExecutionState(executionDataObjectInstances, [], instanceLinks, resources, 0, [], [], []);
    }

    parseActions(fragmentModeler, dataclasses, roles) {
        let actions = [];
        let modelActions = fragmentModeler._definitions.get('rootElements')[0].get('flowElements');

        for (let action of modelActions.filter(element => is(element, 'bpmn:Task'))) {
            let inputs = [];
            for (let dataObjectReference of action.get('dataInputAssociations')) {
                let dataObjectReferences = [];
                for (let i = 0; i < dataObjectReference.get('sourceRef')[0].states.length; i++) {
                    dataObjectReferences.push(new DataObjectReference(dataclasses.find(element => element.id === dataObjectReference.get('sourceRef')[0].dataclass.id), dataObjectReference.get('sourceRef')[0].states[i].name, false))
                }
                inputs.push(dataObjectReferences);
            }
            inputs = cartesianProduct(...inputs);

            let outputSet = [];
            for (let dataObjectReference of action.get('dataOutputAssociations')) {
                outputSet.push(new DataObjectReference(dataclasses.find(element => element.id === dataObjectReference.get('targetRef').dataclass.id), dataObjectReference.get('targetRef').states[0].name, false));
            }

            for (let input of inputs) {
                actions.push(new Action(action.name, parseInt(action.duration ?? 0), parseInt(action.NoP), roles.find(element => element.id === action.role.id), new IOSet(input), new IOSet(outputSet)))
            }
        }
        return actions;
    }

}