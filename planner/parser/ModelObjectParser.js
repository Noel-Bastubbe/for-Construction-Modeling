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
import {cartesianProduct} from "../../dist/Util";

export class ModelObjectParser {
    constructor(dataModeler, fragmentModeler, objectiveModeler, dependencyModeler, roleModeler, resourceModeler) {
        this.dataclasses = this.parseDataclasses(dataModeler);
        this.roles = this.parseRoles(roleModeler);
        this.resources = this.parseResources(resourceModeler, this.roles);
        this.activities = this.parseActivities(fragmentModeler, this.dataclasses, this.roles);
        this.instances = this.parseInstances(objectiveModeler, this.dataclasses);
        this.currentState = this.parseCurrentState(objectiveModeler, resourceModeler, this.resources, this.instances);
        this.objectives = this.parseObjectives(objectiveModeler, dependencyModeler, this.instances);
        this.goal = new Goal(this.objectives);
    }

    createPlanner() {
        return new Planner(this.currentState, this.goal, this.activities);
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
            resources.push(new Resource(resource.id, resource.name, rolePlanReferences, getNumber(resource.capacity, 1), getNumber(resource.availabilityStart, 0), getNumber(resource.availabilityEnd, Infinity)));
        }
        return resources
    }

    parseInstances(objectiveModeler, dataclasses) {
        let instances = [];
        let modelDataObjectInstances = objectiveModeler._definitions.get('objectInstances');

        for (let instance of modelDataObjectInstances.filter(element => is(element, 'om:ObjectInstance'))) {
            instances.push(new Instance(instance.id, instance.name, dataclasses.find(element => element.id === instance.classRef.id)))
        }
        return instances
    }

    parseObjectives(objectiveModeler, dependencyModeler, dataObjectInstances) {
        let objectives = [];
        let dependencyLinks = dependencyModeler._definitions.get('goals')[0].get('Elements').filter(element => is(element, 'dep:Dependency'));
        let modelObjectives = objectiveModeler._definitions.get('rootElements');

        for (let i = 0; i < modelObjectives.length; i++) {
            let objectiveBoardId = modelObjectives[i].id;
            let objectiveId = objectiveModeler._definitions.get('rootBoards').find(element => element.plane.get('boardElement').id === objectiveBoardId).objectiveRef.id;

            let objectiveObjects = [];
            for (let object of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Object'))) {
                objectiveObjects.push(new ObjectiveObject(object.id, dataObjectInstances.find(element => element.id === object.instance.id && element.dataclass.id === object.classRef.id), object.states.map(element => element.name)));
            }
            let objectiveLinks = [];
            for (let link of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Link'))) {
                objectiveLinks.push(new ObjectiveLink(link.id, objectiveObjects.find(element => element.dataObjectInstance.id === link.sourceRef.instance.id && element.dataObjectInstance.dataclass.id === link.sourceRef.classRef.id), objectiveObjects.find(element => element.dataObjectInstance.id === link.targetRef.instance.id && element.dataObjectInstance.dataclass.id === link.targetRef.classRef.id)));
            }

            if (objectiveId === 'start_state') {
                objectives.push(new Objective(objectiveId, objectiveObjects, objectiveLinks, getNumber(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date, null)));
            } else {
                let previousObjectiveId = dependencyLinks.find(element => element.targetObjective.id === objectiveId).sourceObjective.id;
                let index = objectives.findIndex(element => element.id === previousObjectiveId);
                if (index === -1) {
                    objectives.push(new Objective(objectiveId, objectiveObjects, objectiveLinks, parseInt(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date)));
                } else {
                    objectives.splice(index + 1, 0, new Objective(objectiveId, objectiveObjects, objectiveLinks, parseInt(objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date)));
                }
            }
        }
        return objectives
    }

    parseCurrentState(objectiveModeler, resourceModeler, resources, dataObjectInstances) {
        let startState = objectiveModeler._definitions.get('rootElements').find(element => element.id === "Board");

        let stateInstances = [];
        for (let executionDataObjectInstance of startState.get('boardElements').filter((element) => is(element, 'om:Object'))) {
            stateInstances.push(new StateInstance(dataObjectInstances.find(element => element.id === executionDataObjectInstance.instance.id && element.dataclass.id === executionDataObjectInstance.classRef.id), executionDataObjectInstance.states[0].name));
        }
        let instanceLinks = [];
        for (let instanceLink of startState.get('boardElements').filter((element) => is(element, 'om:Link'))) {
            instanceLinks.push(new InstanceLink(stateInstances.find(element => element.dataObjectInstance.id === instanceLink.sourceRef.instance.id && element.dataObjectInstance.dataclass.id === instanceLink.sourceRef.classRef.id), stateInstances.find(element => element.dataObjectInstance.id === instanceLink.targetRef.instance.id && element.dataObjectInstance.dataclass.id === instanceLink.targetRef.classRef.id)));
        }
        return new ExecutionState(stateInstances, [], instanceLinks, resources, 0, [], [], []);
    }

    parseActivities(fragmentModeler, dataclasses, roles) {
        let activities = [];
        let modelActivities = fragmentModeler._definitions.get('rootElements')[0].get('flowElements').filter(element => is(element, 'bpmn:Task'));

        for (let activity of modelActivities) {
            let inputs = [];
            for (let dataObjectReference of activity.get('dataInputAssociations')) {
                let dataObjectReferences = [];
                for (let i = 0; i < dataObjectReference.get('sourceRef')[0].states.length; i++) {
                    dataObjectReferences.push(new DataObjectReference(dataclasses.find(element => element.id === dataObjectReference.get('sourceRef')[0].dataclass.id), dataObjectReference.get('sourceRef')[0].states[i].name, false))
                }
                inputs.push(dataObjectReferences);
            }
            inputs = cartesianProduct(...inputs);

            let outputSet = [];
            for (let dataObjectReference of activity.get('dataOutputAssociations')) {
                outputSet.push(new DataObjectReference(dataclasses.find(element => element.id === dataObjectReference.get('targetRef').dataclass.id), dataObjectReference.get('targetRef').states[0].name, false));
            }

            for (let input of inputs) {
                activities.push(new Activity(activity.name, getNumber(activity.duration, 0), getNumber(activity.NoP, 1), roles.find(element => element.id === activity.role.id), new IOSet([].concat(input)), new IOSet(outputSet)))
            }
        }
        return activities;
    }

}

function getNumber(value, defaultValue) {
    let num = parseInt(value, 10)
    return isNaN(num) ? defaultValue : num;
}