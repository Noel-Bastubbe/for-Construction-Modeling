import inherits from 'inherits';

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
import PaletteModule from './features/palette';
import ResizeModule from 'diagram-js/lib/features/resize';
import SnappingModule from './features/snapping';
import {is} from "bpmn-js/lib/util/ModelUtil";
import taskLabelHandling from "./remObjectLabelHandling";
import RoleModeler from "../rolemodeler/RoleModeler";

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
    PaletteModule,
    ResizeModule,
    SnappingModule,
    taskLabelHandling,
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
RoleModeler.prototype.rank = 10;

RemModeler.prototype.name = function (constructionMode) {
    if (constructionMode) {
        return "Resource Model";
    } else {
        return "Resource Model";
    }
}

// RemModeler.prototype.renameResource = function (resource, name) {
//     this.get('modeling').updateLabel(this.get('elementRegistry').get(resource.id), name);
// }
//
// RemModeler.prototype.deleteResource = function (resource) {
//     this.get('modeling').removeShape(resource);
// }

RemModeler.prototype.handleRoleRenamed = function (role) {
    this.getResourcesWithRole(role).forEach(element => {
        this.get('eventBus').fire('element.changed', {
            element
        })
    });
}

RemModeler.prototype.getResourcesWithRole = function (role) {
    return this.get('elementRegistry').filter(element =>
        is(element, 'rem:Resource') &&
        role.id &&
        element.businessObject.role?.id === role.id
    );
}
