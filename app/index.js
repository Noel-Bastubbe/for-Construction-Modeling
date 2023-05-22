import FragmentModeler from './lib/fragmentmodeler/FragmentModeler';
import diagramXML from '../resources/newDiagram.bpmn';
import newDatamodel from '../resources/emptyBoard.bpmn';
import OlcModeler from './lib/olcmodeler/OlcModeler';
import TerminationConditionModeler from './lib/terminationconditionmodeler/TerminationConditionModeler';
import DataModelModeler from './lib/datamodelmodeler/Modeler';
import ObjectiveModeler from './lib/objectivemodeler/OmModeler';
import DependencyModeler from './lib/dependencymodeler/DependencyModeler';
import RoleModeler from './lib/rolemodeler/RoleModeler';
import RemModeler from './lib/resourcemodeler/RemModeler';

import $ from 'jquery';
import Mediator from './lib/mediator/Mediator';
import Checker from './lib/guidelines/Checker';
import ErrorBar from './lib/guidelines/ErrorBar';
import {download, upload} from './lib/util/FileUtil';
import getDropdown from "./lib/util/Dropdown";
import {classes as domClasses} from 'min-dom';

import conferenceProcess from '../resources/conferenceModel/process.bpmn';
import conferenceDataModel from '../resources/conferenceModel/datamodel.xml';
import conferenceOLC from '../resources/conferenceModel/olc.xml';
import conferenceTerminationCondition from '../resources/conferenceModel/terminationCondition.xml';

import Zip from 'jszip';
import {appendOverlayListeners} from "./lib/util/HtmlUtil";

import {Planner} from "../planner/Planner.js";
import {is} from "bpmn-js/lib/util/ModelUtil.js";
import {Dataclass} from "../planner/types/Dataclass.js";
import {Resource} from "../planner/types/Resource.js";
import {Role} from "../planner/types/Role.js";
import {ObjectiveNode} from "../planner/types/goal/ObjectiveNode.js";
import {NodeLink} from "../planner/types/goal/NodeLink.js";
import {Objective} from "../planner/types/goal/Objective.js";
import {DataObjectInstance} from "../planner/types/executionState/DataObjectInstance.js";
import {Goal} from "../planner/types/goal/Goal.js";
import {Action} from "../planner/types/fragments/Action.js";
import {DataObjectReference} from "../planner/types/fragments/DataObjectReference";
import {IOSet} from "../planner/types/fragments/IOSet";
import {ExecutionState} from "../planner/types/executionState/ExecutionState";
import {ExecutionDataObjectInstance} from "../planner/types/executionState/ExecutionDataObjectInstance";
import {exportExecutionPlan} from "../planner/excel/excel.js";

const LOAD_DUMMY = false; // Set to true to load conference example data
const SHOW_DEBUG_BUTTONS = false; // Set to true to show additional buttons for debugging


var mediator = new Mediator();
window.mediator = mediator;

var olcModeler = new OlcModeler({
    container: document.querySelector('#olc-canvas'),
    keyboard: {
        bindTo: document.querySelector('#olc-canvas')
    },
    additionalModules: [{
        __init__: ['mediator'],
        mediator: ['type', mediator.OlcModelerHook]
    }]
});

var dependencyModeler = new DependencyModeler({
    container: document.querySelector('#dependencymodel-canvas'),
    keyboard: {
        bindTo: document.querySelector('#dependencymodel-canvas')
    },
    additionalModules: [{
        __init__: ['mediator'],
        mediator: ['type', mediator.DependencyModelerHook]
    }]
});

var dataModeler = new DataModelModeler({
    container: '#datamodel-canvas',
    keyboard: {
        bindTo: document.querySelector('#datamodel-canvas')
    },
    additionalModules: [{
        __init__: ['mediator'],
        mediator: ['type', mediator.DataModelerHook]
    }]
});

var objectiveModeler = new ObjectiveModeler({
    container: '#objectivemodel-canvas',
    keyboard: {
        bindTo: document.querySelector('#objectivemodel-canvas')
    },
    additionalModules: [{
        __init__: ['mediator'],
        mediator: ['type', mediator.ObjectiveModelerHook]
    }]
});

var fragmentModeler = new FragmentModeler({
    container: '#fragments-canvas',
    keyboard: {bindTo: document.querySelector('#fragments-canvas')},
    additionalModules: [{
        __init__: ['mediator'],
        mediator: ['type', mediator.FragmentModelerHook]
    }]
});

var roleModeler = new RoleModeler({
    container: '#rolemodel-canvas',
    keyboard: {bindTo: document.querySelector('#rolemodel-canvas')},
    additionalModules: [{
        __init__: ['mediator'],
        mediator: ['type', mediator.RoleModelerHook]
    }]
});

var resourceModeler = new RemModeler({
    container: '#resourcemodel-canvas',
    keyboard: {
        bindTo: document.querySelector('#resourcemodel-canvas')
    },
    additionalModules: [{
        __init__: ['mediator'],
        mediator: ['type', mediator.ResourceModelerHook]
    }]
});

var terminationConditionModeler = new TerminationConditionModeler(
    '#terminationcondition-canvas'
);
new mediator.TerminationConditionModelerHook(terminationConditionModeler);


const errorBar = new ErrorBar(document.getElementById("errorBar"), mediator);
const checker = new Checker(mediator, errorBar);
var currentModeler = fragmentModeler;

// construction Mode for User Study, to enable set constructionMode to true
const constructionMode = false;
mediator.getModelers().forEach(modeler => {
        var header = document.getElementById("title" + modeler.id);
        header.innerHTML = modeler.name(constructionMode);
    }
)

async function loadDebugData() {
    const zip = new Zip();
    zip.file('fragments.bpmn', conferenceProcess);
    zip.file('dataModel.xml', conferenceDataModel);
    zip.file('olcs.xml', conferenceOLC);
    zip.file('terminationCondition.xml', conferenceTerminationCondition);
    await importFromZip(zip.generateAsync({type: 'base64'}));
}

async function createNewDiagram() {
    try {
        checker.deactivate();
        await dependencyModeler.createNew();
        await fragmentModeler.importXML(diagramXML);
        await olcModeler.createNew();
        await dataModeler.importXML(newDatamodel);
        await roleModeler.createDiagram();
        await resourceModeler.createDiagram();
        await objectiveModeler.createDiagram();
        terminationConditionModeler.createNew();
        if (LOAD_DUMMY) {
            await loadDebugData();
        }
        checker.activate();
    } catch (err) {
        console.error(err);
    }
}

$(function () {
    createNewDiagram();
});

// expose modeler to window for debugging purposes
window.modeler = olcModeler;


// Focus follows mouse to not send commands to all modelers all the time
Array.from(document.getElementsByClassName("canvas")).forEach(element => {
    element.tabIndex = 0;
    element.addEventListener('mouseenter', event => {
        element.focus();
    });
});

async function exportToZip() {
    const zip = new Zip();
    const fragments = (await fragmentModeler.saveXML({format: true})).xml;
    zip.file('fragments.bpmn', fragments);
    const dataModel = (await dataModeler.saveXML({format: true})).xml;
    zip.file('dataModel.xml', dataModel);
    const objectiveModel = (await objectiveModeler.saveXML({format: true})).xml;
    zip.file('objectiveModel.xml', objectiveModel);
    const olcs = (await olcModeler.saveXML({format: true})).xml;
    zip.file('olcs.xml', olcs);
    const resourceModel = (await resourceModeler.saveXML({format: true})).xml;
    zip.file('resourceModel.xml', resourceModel);
    const terminationCondition = (await terminationConditionModeler.saveXML({format: true})).xml;
    zip.file('terminationCondition.xml', terminationCondition);
    const dependencyModel = (await dependencyModeler.saveXML({format: true})).xml;
    zip.file('dependencyModel.xml', dependencyModel);
    const roleModel = (await roleModeler.saveXML({format: true})).xml;
    zip.file('roleModel.xml', roleModel);
    return zip.generateAsync({type: 'base64'});
}

async function importFromZip(zipData) {
    checker.deactivate();
    const zip = await Zip.loadAsync(zipData, {base64: true});
    const files = {
        fragments: zip.file('fragments.bpmn'),
        dataModel: zip.file('dataModel.xml'),
        objectiveModel: zip.file('objectiveModel.xml'),
        olcs: zip.file('olcs.xml'),
        terminationCondition: zip.file('terminationCondition.xml'),
        dependencyModel: zip.file('dependencyModel.xml'),
        resourceModel: zip.file('resourceModel.xml'),
        roleModel: zip.file('roleModel.xml')
    };
    Object.keys(files).forEach(key => {
        if (!files[key]) {
            throw new Error('Missing file: ' + key)
        }
    });
    await dependencyModeler.importXML(await files.dependencyModel.async("string"));
    await dataModeler.importXML(await files.dataModel.async("string"));
    await roleModeler.importXML(await files.roleModel.async("string"));
    await olcModeler.importXML(await files.olcs.async("string"));
    await fragmentModeler.importXML(await files.fragments.async("string"));
    await terminationConditionModeler.importXML(await files.terminationCondition.async("string"));
    await objectiveModeler.importXML(await files.objectiveModel.async("string"));
    await resourceModeler.importXML(await files.resourceModel.async("string"));
    checker.activate();
}

export async function planButtonAction() {

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
        resources.push(new Resource(resource.name, rolePlanReferences, resource.capacity));
    }

    let dataObjectInstances = [];
    let modelDataObjectInstances = objectiveModeler._definitions.get('objectInstances');
    for (let instance of modelDataObjectInstances.filter(element => is(element, 'om:ObjectInstance'))) {
        dataObjectInstances.push(new DataObjectInstance(instance.name, dataclasses.find(element => element.name === instance.classRef.name)))
    }

    let objectives = []; //TODO: ensure order of objectives + links
    let modelObjectives = objectiveModeler._definitions.get('rootElements');
    for (let i = 0; i < modelObjectives.length; i++) {
        let objectiveNodes = [];
        for (let object of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Object'))) {
            objectiveNodes.push(new ObjectiveNode(dataObjectInstances.find(element => element.name === object.instance.name && element.dataclass.name === object.classRef.name), object.states.map(element => element.name)));
        }
        let objectiveLinks = [];
        for (let links of modelObjectives[i].get('boardElements').filter((element) => is(element, 'om:Link'))) {

        }
        objectives.push(new Objective(objectiveNodes, objectiveLinks, objectiveModeler._definitions.get('rootBoards')[i].objectiveRef?.date));
    }

    let goal = new Goal(objectives);

    let startState = objectiveModeler._definitions.get('rootElements').find(element => element.id === "Board");
    let executionDataObjectInstances = [];
    for (let executionDataObjectInstance of startState.get('boardElements').filter((element) => is(element, 'om:Object'))) {
        executionDataObjectInstances.push(new ExecutionDataObjectInstance(dataObjectInstances.find(element => element.name === executionDataObjectInstance.instance.name && element.dataclass.name === executionDataObjectInstance.classRef.name), executionDataObjectInstance.states[0].name));
    }
    let instanceLinks = [];
    for (let instanceLinks of startState.get('boardElements').flat(1).filter((element) => is(element, 'om:Link'))) {
        // TODO
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
        actions.push(new Action(action.name, action.duration, action.NoP, roles.find(element => element.name === action.role.name), new IOSet(inputSet), new IOSet(outputSet)))
    }




    const planner = new Planner(currentState, goal, actions);
    let executionLog = planner.generatePlan();
    let blob = await exportExecutionPlan(executionLog);

    const url = window.URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Execution Plan.xlsx';

    // Programmatically click the link to initiate the download
    link.click();

    // Clean up the temporary URL
    window.URL.revokeObjectURL(url);
}

// IO Buttons
document.getElementById('newButton').addEventListener('click', () => {
    createNewDiagram();
    displayFileName("Unnamed file");
});

document.getElementById('openButton').addEventListener('click', () => upload((data, title) => {
    if (data.startsWith('data:')) {
        data = data.split(',')[1];
    }
    importFromZip(data);
    displayFileName(title);
}, 'base64'));

document.getElementById('saveButton').addEventListener('click', () => exportToZip().then(zip => {
    download('fcmModel.zip', zip, 'base64');
}));

async function displayFileName(zipName) {
    document.getElementById("fileName").innerHTML = zipName;
}

document.getElementById('planningButton').addEventListener('click', () => {
    planButtonAction();
});

async function navigationDropdown() {
    var container = document.getElementById("navigationBar");
    var buttonBar = document.createElement('div');
    domClasses(buttonBar).add('olc-buttonbar');
    domClasses(buttonBar).add('barContent');
    container.appendChild(buttonBar);

    // Select olc Menu
    var selectOlcComponent = document.createElement('div');
    selectOlcComponent.classList.add('olc-select-component');
    var selectedOlcSpan = document.createElement('span');
    selectedOlcSpan.style.userSelect = 'none';
    selectOlcComponent.showValue = function (modeler) {
        this.value = modeler;
        selectedOlcSpan.innerText = this.value.name(constructionMode) ?
            this.value.name(constructionMode)
            : 'buggy';
    }
    var selectOlcMenu = getDropdown();
    selectOlcComponent.addEventListener('click', event => {
        if (event.target === selectOlcComponent || event.target === selectedOlcSpan) {
            repopulateDropdown();
            showSelectOlcMenu();
        }
    });

    selectOlcMenu.handleClick = (event) => {
        return selectOlcMenu.contains(event.target);
    }

    function repopulateDropdown() {
        var modelers = mediator.getModelers();
        modelers.sort((a, b) => {
            return a.rank - b.rank
        });
        if (constructionMode) {
            modelers = modelers.filter(object => object !== terminationConditionModeler);
        }
        var valueBefore = selectOlcComponent.value;
        selectOlcMenu.populate(modelers, modeler => {
            showModeler(modeler);
            selectOlcComponent.showValue(modeler);
            selectOlcMenu.hide();
        }, undefined, modeler => modeler.name(constructionMode));
        selectOlcComponent.showValue(valueBefore);
    }

    function showModeler(modeler) {
        if (modeler === terminationConditionModeler) {
            focus(modeler._root.closest('.canvas'));
        } else {
            focus(modeler.get('canvas')._container.closest('.canvas'));
        }
    }

    function showSelectOlcMenu() {
        const closeOverlay = appendOverlayListeners(selectOlcMenu);
        selectOlcMenu.style.display = 'block';
        selectOlcComponent.appendChild(selectOlcMenu);
        selectOlcMenu.hide = closeOverlay;
    }

    selectOlcComponent.showValue(currentModeler);
    selectOlcComponent.appendChild(selectedOlcSpan);
    buttonBar.appendChild(selectOlcComponent);
}

navigationDropdown();

if (SHOW_DEBUG_BUTTONS) {
    const reloadButton = document.createElement('a');
    reloadButton.classList.add('barButton');
    reloadButton.classList.add('barContent');
    reloadButton.innerHTML = 'reload';
    document.getElementById('saveButton').parentElement.appendChild(reloadButton);
    reloadButton.addEventListener('click', () => exportToZip().then(zip => {
        importFromZip(zip);
    }));
}


// functions to make the note area draggable

//Make the DIV element draggagle:
dragElement(document.getElementById("note-area-wrapper"));

function dragElement(elmnt) {

    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    document.getElementById("note-area-drag").onmousedown = dragMouseDown;


    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


// function to toggle the note Area

document.getElementById("noteAreaToggleButton").addEventListener("click", toggleNoteArea, false)

document.getElementById("note-area-close").addEventListener("click", toggleNoteArea, false)

function toggleNoteArea() {

    var noteArea = document.getElementById("note-area-wrapper");

    if (noteArea.classList.contains("hidden") == true) {
        noteArea.classList.remove("hidden");
    } else {
        noteArea.classList.add("hidden");
    }
}

// function to toggle focus

Array.from(document.getElementsByClassName("focusHeader")).forEach(button => button.addEventListener("click", function (event) {
    focus(event.target.closest('.canvas'))
}, false));

function focus(element) {
    // get wrapper for element on left side
    var currentlyFocussedElement = document.getElementsByClassName("focus")[0];

    if (element !== currentlyFocussedElement) {
        // canvas on right side add class focus

        element.classList.remove("hidden");
        element.classList.add("focus");

        // remove focus from canvas on left side
        currentlyFocussedElement.classList.remove("focus");
        currentlyFocussedElement.classList.add("hidden");
    }
}

// TODO move full focus function to mediator
mediator.focus = function (modeler) {
    focus(modeler.get('canvas').getContainer().closest('.canvas'));
}
// document.getElementById("toggleDatamodel").click(); //TODO only for debug reasons

window.mediator = mediator;
window.export = function (modeler) {
    modeler.saveXML({format: true}).then(result => {
        download('foobar.xml', result.xml);
    });
}

window.checker = checker;

