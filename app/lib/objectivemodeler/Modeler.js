import inherits from 'inherits';
import {findIndex } from 'min-dash'

import BaseModeler from './BaseModeler';

import Viewer from './Viewer';
import NavigatedViewer from './NavigatedViewer';

import KeyboardMoveModule from 'diagram-js/lib/navigation/keyboard-move';
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import TouchModule from 'diagram-js/lib/navigation/touch';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';

import AlignElementsModule from 'diagram-js/lib/features/align-elements';
import AutoScrollModule from 'diagram-js/lib/features/auto-scroll';
import BendpointsModule from 'diagram-js/lib/features/bendpoints';
import ConnectModule from 'diagram-js/lib/features/connect';
import ConnectionPreviewModule from 'diagram-js/lib/features/connection-preview';
import ContextPadModule from './features/context-pad';
import CopyPasteModule from './features/copy-paste';
import CreateModule from 'diagram-js/lib/features/create';
import EditorActionsModule from '../common/editor-actions';
import GridSnappingModule from './features/grid-snapping';
import KeyboardModule from '../common/keyboard';
import AutoplaceModule from './features/auto-place';
import KeyboardMoveSelectionModule from 'diagram-js/lib/features/keyboard-move-selection';
import LabelEditingModule from './features/label-editing';
import ModelingModule from './features/modeling';
import MoveModule from 'diagram-js/lib/features/move';
import PaletteModule from './features/palette';
import ResizeModule from 'diagram-js/lib/features/resize';
import SpaceToolBehaviorModule from './behavior';
import SnappingModule from './features/snapping';
import { nextPosition } from '../util/Util';
import OmButtonBarModule from './buttonbar';


var initialDiagram =
  `<?xml version="1.0" encoding="UTF-8"?>
<od:definitions xmlns:od="http://tk/schema/od" xmlns:odDi="http://tk/schema/odDi">
    <od:odBoard id="Board" />
    <odDi:odRootBoard id="RootBoard" name="Start State">
        <odDi:odPlane id="Plane" boardElement="Board" />
    </odDi:odRootBoard>
</od:definitions>`;

export default function Modeler(options) {
  BaseModeler.call(this, options);
}

inherits(Modeler, BaseModeler);


Modeler.Viewer = Viewer;
Modeler.NavigatedViewer = NavigatedViewer;

/**
* The createDiagram result.
*
* @typedef {Object} CreateDiagramResult
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
Modeler.prototype.createDiagram = function() {
  const container = this.get('canvas').getContainer();
  container.style.visibility = 'hidden';
  return this.importXML(initialDiagram);
};


Modeler.prototype._interactionModules = [

  // non-modeling components
  OmButtonBarModule,
  KeyboardMoveModule,
  MoveCanvasModule,
  TouchModule,
  ZoomScrollModule
];

Modeler.prototype._modelingModules = [

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
  SpaceToolBehaviorModule
];


// modules the modeler is composed of
//
// - viewer modules
// - interaction modules
// - modeling modules

Modeler.prototype._modules = [].concat(
  Viewer.prototype._modules,
  Modeler.prototype._interactionModules,
  Modeler.prototype._modelingModules
);

Modeler.prototype.createObject = function (name) {
  const modeling = this.get('modeling');
  const canvas = this.get('canvas');
  const diagramRoot = canvas.getRootElement();

  const {x,y} = nextPosition(this, 'om:Object');
  const shape = modeling.createShape({
    type: 'om:Object',
    name: name
  }, {x,y}, diagramRoot);
  return shape.businessObject;
}

Modeler.prototype.renameObject = function (object, name) {
  this.get('modeling').updateLabel(this.get('elementRegistry').get(object.id), name);
}

Modeler.prototype.deleteObject = function (object) {
  this.get('modeling').removeShape(object);
}

Modeler.prototype.updateProperty = function (object, property) {
  this.get('modeling').updateProperties(object, property);
}

Modeler.prototype.getObjectives = function() {
  return this._definitions.get('rootBoards');
}

Modeler.prototype.showObjective = function (objective) {
  const container = this.get('canvas').getContainer();
  this._objective = objective;
  this.clear();
  if (objective) {
    container.style.visibility = '';
    this.open(objective);
  } else {
    container.style.visibility = 'hidden';
  }
}

Modeler.prototype.getCurrentObjective = function () {
  return this._objective;
}
Modeler.prototype.addObjective = function (name) {
  var rootBoard = this.get('elementFactory').createRootBoard(name || '<TBD>');
  this._definitions.get('rootBoards').push(rootBoard[0]);
  this._definitions.get('rootElements').push(rootBoard[1]);
  this.showObjective(rootBoard[0]);
}
Modeler.prototype.deleteObjective = function (objective) {

  var currentIndex = findIndex(this._definitions.get('rootElements'), objective.plane.boardElement);
  this._definitions.get('rootElements').splice(currentIndex,1);

  currentIndex = findIndex(this._definitions.get('rootBoards'), objective);
  var indexAfterRemoval = Math.min(currentIndex, this._definitions.get('rootBoards').length - 2);
  this._definitions.get('rootBoards').splice(currentIndex,1);

  if (this.getCurrentObjective() === objective) {
    this.showObjective(this._definitions.get('rootBoards')[indexAfterRemoval]);
  }
}
