import inherits from 'inherits';
import {findIndex} from 'min-dash'

import BaseModeler from './BaseModeler';

import Viewer from './Viewer';
import NavigatedViewer from './NavigatedViewer';

import KeyboardMoveModule from 'diagram-js/lib/navigation/keyboard-move';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import TouchModule from 'diagram-js/lib/navigation/touch';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';

import AlignElementsModule from 'diagram-js/lib/features/align-elements';
import AutoplaceModule from './features/auto-place';
import AutoScrollModule from 'diagram-js/lib/features/auto-scroll';
import BendpointsModule from 'diagram-js/lib/features/bendpoints';
import ConnectionPreviewModule from 'diagram-js/lib/features/connection-preview';
import ConnectModule from 'diagram-js/lib/features/connect';
import ContextPadModule from './features/context-pad';
import CopyPasteModule from './features/copy-paste';
import CreateModule from 'diagram-js/lib/features/create';
import EditorActionsModule from '../common/editor-actions';
import GridSnappingModule from './features/grid-snapping';
import KeyboardModule from '../common/keyboard';
import KeyboardMoveSelectionModule from 'diagram-js/lib/features/keyboard-move-selection';
import LabelEditingModule from './features/label-editing';
import ModelingModule from './features/modeling';
import MoveModule from 'diagram-js/lib/features/move';
import RemButtonBarModule from './buttonbar';
import RemObjectDropdown from './remObjectLabelHandling';
import PaletteModule from './features/palette';
import ResizeModule from 'diagram-js/lib/features/resize';
import SnappingModule from './features/snapping';
import {nextPosition} from '../util/Util';
import {is} from "bpmn-js/lib/util/ModelUtil";
import modeling from './features/modeling';

var initialDiagram =
    `<?xml version="1.0" encoding="UTF-8"?>
<rem:definitions xmlns:rem="http://tk/schema/od" xmlns:odDi="http://tk/schema/odDi">
    <rem:odBoard id="Board" />
    <odDi:odRootBoard id="StartBoard">
        <odDi:odPlane id="Plane" boardElement="Board" />
    </odDi:odRootBoard>
</rem:definitions>`;

export default function RemModeler(options) {
    BaseModeler.call(this, options);
}

inherits(RemModeler, BaseModeler);


RemModeler.Viewer = Viewer;
RemModeler.NavigatedViewer = NavigatedViewer;

/**
 * The createDiagram result.
 *
 * @typedef {Resource} CreateDiagramResult
 *
 * @property {Array<string>} warnings
 */

/**
 * The createDiagram error.
 *
 * @typedef {Error} CreateDiagramError
 *
 * @property {Array<string>} warnings
 */

/**
 * Create a new diagram to start modeling.
 *
 * @returns {Promise<CreateDiagramResult, CreateDiagramError>}
 *
 */
RemModeler.prototype.createDiagram = function () {
    return this.importXML(initialDiagram);
};


RemModeler.prototype._interactionModules = [

    // non-modeling components
    KeyboardMoveModule,
    MoveCanvasModule,
    // RemButtonBarModule,
    TouchModule,
    ZoomScrollModule
];

RemModeler.prototype._modelingModules = [

    // modeling components
    AutoplaceModule,
    AlignElementsModule,
    AutoScrollModule,
    BendpointsModule,
    ConnectModule,
    ConnectionPreviewModule,
    ContextPadModule,
    CopyPasteModule,
    CreateModule,
    EditorActionsModule,
    GridSnappingModule,
    KeyboardModule,
    KeyboardMoveSelectionModule,
    LabelEditingModule,
    ModelingModule,
    MoveModule,
    RemObjectDropdown,
    PaletteModule,
    ResizeModule,
    SnappingModule,
    // SpaceToolBehaviorModule
];


// modules the modeler is composed of
//
// - viewer modules
// - interaction modules
// - modeling modules

RemModeler.prototype._modules = [].concat(
    Viewer.prototype._modules,
    RemModeler.prototype._interactionModules,
    RemModeler.prototype._modelingModules
);

RemModeler.prototype.id = "REM";

RemModeler.prototype.name = function (constructionMode) {
    if (constructionMode) {
        return "Resource Model";
    } else {
        return "Resource Model";
    }
}

// RemModeler.prototype.createResource = function (name) {
//     const modeling = this.get('modeling');
//     const canvas = this.get('canvas');
//     const diagramRoot = canvas.getRootElement();

//     const {x, y} = nextPosition(this, 'rem:Resource');
//     const shape = modeling.createShape({
//         type: 'rem:Resource',
//         name: name
//     }, {x, y}, diagramRoot);
//     return shape.businessResource;
// }

 RemModeler.prototype.renameResource = function (resource, name) {
    this.get('modeling').updateLabel(this.get('elementRegistry').get(resource.id), name);
 }

RemModeler.prototype.deleteResource = function (resource) {
    this.get('modeling').removeShape(resource);
}

RemModeler.prototype.handleResourceRenamed = function (resource) {
    this.getVisualsOfResource(resource).forEach(element => {
        this.get('eventBus').fire('element.changed', {
            element
        })
    });
}

// RemModeler.prototype.updateProperty = function (object, property) {
//     this.get('modeling').updateProperties(object, property);
// }

// RemModeler.prototype.getResources = function () {
//     return this._definitions.get('rootBoards');
// }

// RemModeler.prototype.showResource = function (objective) {
//     const container = this.get('canvas').getContainer();
//     this._objective = objective;
//     this.clear();
//     if (objective) {
//         container.style.visibility = '';
//         this.open(objective);
//     } else {
//         container.style.visibility = 'hidden';
//     }
// }

// RemModeler.prototype.getCurrentResource = function () {
//     return this._objective;
// }

// RemModeler.prototype.addObjective = function (objectiveReference) {
//     var rootBoard = this.get('elementFactory').createRootBoard(objectiveReference.name || 'undefined', objectiveReference);
//     this._definitions.get('rootBoards').push(rootBoard[0]);
//     this._definitions.get('rootElements').push(rootBoard[1]);
//     this.showResource(rootBoard[0]);
// }

// RemModeler.prototype.deleteResource = function (objectiveReference) {
//     var objective = this.getObjectiveByReference(objectiveReference);
//     if (objective.id !== 'StartBoard') {
//         var currentIndex = findIndex(this._definitions.get('rootElements'), objective.plane.boardElement);
//         this._definitions.get('rootElements').splice(currentIndex, 1);

//         currentIndex = findIndex(this._definitions.get('rootBoards'), objective);
//         var indexAfterRemoval = Math.min(currentIndex, this._definitions.get('rootBoards').length - 2);
//         this._definitions.get('rootBoards').splice(currentIndex, 1);

//         if (this.getCurrentResource() === objective) {
//             this.showResource(this._definitions.get('rootBoards')[indexAfterRemoval]);
//         }
//     }
// }

// RemModeler.prototype.renameObjective = function (objectiveReference, name) {
//     var objective = this.getObjectiveByReference(objectiveReference);
//     objective.name = name;
// }

// RemModeler.prototype.createInstance = function (name, clazz) {
//     const objectInstance = this.get('elementFactory').createObjectInstance(name, clazz);
//     this._definitions.get('objectInstances').push(objectInstance);
//     return objectInstance;
// }

// RemModeler.prototype.renameInstance = function (instance, name) {
//     instance.name = name;
//     this.getVisualsWithInstance(instance).forEach(element => {
//         this.get('eventBus').fire('element.changed', {
//             element
//         })
//     });
// }

// RemModeler.prototype.deleteInstance = function (instance) {
//     let changedVisuals = this.getVisualsWithInstance(instance);
//     this.getObjectsWithInstance(instance).forEach(element => {
//         element.instance = undefined;
//     });
//     changedVisuals.forEach(element =>
//         this.get('eventBus').fire('element.changed', {
//             element
//         })
//     );
//     let instances = this._definitions.get('objectInstances');
//     let index = instances.indexOf(instance);
//     if (index > -1) {
//         instances.splice(index, 1);
//     }
// }

// RemModeler.prototype.handleOlcListChanged = function (olcs, dryRun = false) {
//     this._olcs = olcs;
// }

// RemModeler.prototype.handleStateRenamed = function (olcState) {
//     this.getVisualsInState(olcState).forEach(element =>
//         this.get('eventBus').fire('element.changed', {
//             element
//         })
//     );
// }

// RemModeler.prototype.handleStateDeleted = function (olcState) {
//     let changedVisual = this.getVisualsInState(olcState);
//     this.getObjectsInState(olcState).forEach(element => {
//         element.state = undefined;
//     });
//     changedVisual.forEach(element =>
//         this.get('eventBus').fire('element.changed', {
//             element
//         })
//     );
// }

RemModeler.prototype.handleResourceRenamed = function (resource) {
    this.getVisualsOfResource(resource).forEach(element => {
        this.get('eventBus').fire('element.changed', {
            element
        })
    });
}

// RemModeler.prototype.handleClassDeleted = function (clazz) {
//     let objectives = this._definitions.get('rootElements');
//     objectives.forEach(objective => {
//         let elements = objective.get('boardElements');

//         for (let i = 0; i < elements.length; i++) {
//             if (this.isObjectOfDeletedClass(clazz, elements[i]) || this.isLinkConnectedToObjectOfDeletedClass(clazz, elements[i])) {
//                 elements.splice(i, 1);
//                 i--;
//             }
//         }
//     })

//     let instances = this._definitions.get('objectInstances');
//     for (let i = 0; i < instances.length; i++) {
//         if (clazz.id && instances[i].classRef?.id === clazz.id) {
//             instances.splice(i, 1);
//             i--;
//         }
//     }
//     this.showResource(this.getCurrentResource());
//     // This is needed to update the visual representation of the objective that is currently loaded.
//     // This may need to be adapted once the error of links between deleted objects is resolved
// }

// RemModeler.prototype.getVisualsInState = function (olcState) {
//     return this.get('elementRegistry').filter(element =>
//         is(element, 'rem:Resource') &&
//         olcState.id &&
//         element.businessObject.state?.id === olcState.id
//     );
// }

// RemModeler.prototype.getObjectsInState = function (olcState) {
//     let objectives = this._definitions.get('rootElements');
//     let objects = objectives.map(objective => objective.get('boardElements')).flat(1).filter((element) =>
//         is(element, 'rem:Resource') &&
//         olcState.id &&
//         element.state?.id === olcState.id);
//     return objects;
// }

RemModeler.prototype.getVisualsOfResource = function (resource) {
    return this.get('elementRegistry').filter(element =>
        is(element, 'rem:Resource') &&
        resource.id
    );
}

// RemModeler.prototype.getVisualsWithInstance = function (instance) {
//     return this.get('elementRegistry').filter(element =>
//         is(element, 'rem:Resource') &&
//         instance.id &&
//         element.businessObject.instance?.id === instance.id
//     );
// }

// RemModeler.prototype.getObjectsWithInstance = function (instance) {
//     let objectives = this._definitions.get('rootElements');
//     let objects = objectives.map(objective => objective.get('boardElements')).flat(1).filter((element) =>
//         is(element, 'rem:Resource') &&
//         instance.id &&
//         element.instance?.id === instance.id);
//     return objects;
// }

// RemModeler.prototype.getObjectsOfClass = function (clazz) {
//     let objectives = this._definitions.get('rootElements');
//     let objects = objectives.map(objective => objective.get('boardElements')).flat(1).filter((element) =>
//         is(element, 'rem:Resource') &&
//         clazz.id &&
//         element.classRef?.id === clazz.id);
//     return objects;
// }

// RemModeler.prototype.getObjectInstancesOfClass = function (clazz) {
//     let instances = this._definitions.get('objectInstances');
//     return instances.filter(instance =>
//         is(instance, 'rem:ObjectInstance') &&
//         clazz.id &&
//         instance.classRef?.id === clazz.id
//     );
// }

// RemModeler.prototype.getObjectiveByReference = function (objectiveReference) {
//     const objective = this.getResources().filter(objective => objective.objectiveRef === objectiveReference)[0];
//     if (!objective) {
//         throw 'Unknown rootBoard of objective \"' + objectiveReference.name + '\"';
//     } else {
//         return objective;
//     }
// }

// RemModeler.prototype.isObjectOfDeletedClass = function (clazz, element) {
//     return is(element, 'rem:Resource') && clazz.id && element.classRef?.id === clazz.id;
// }

// RemModeler.prototype.isLinkConnectedToObjectOfDeletedClass = function (clazz, element) {
//     return is(element, 'rem:Link') && clazz.id && ((element.sourceRef?.classRef?.id === clazz.id) || (element.targetRef?.classRef?.id === clazz.id));
// }