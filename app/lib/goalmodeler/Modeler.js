import inherits from 'inherits';

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
import OlcButtonBarModule from './buttonbar';
import OlcModeler from "../olcmodeler/OlcModeler";
import OlcEvents from "../olcmodeler/OlcEvents";


var initialDiagram =
  `<?xml version="1.0" encoding="UTF-8"?>
<od:definitions xmlns:od="http://tk/schema/od" xmlns:odDi="http://tk/schema/odDi">
    <od:odBoard id="Board_debug" />
    <odDi:odRootBoard id="RootBoard_debug">
        <odDi:odPlane id="Plane_debug" boardElement="Board_debug" />
    </odDi:odRootBoard>
</od:definitions>`;

var exampleDiagram = '<gm:definitions xmlns:od="http://tk/schema/od" xmlns:odDi="http://tk/schema/odDi" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC">\n' +
    '<gm:odBoard id="Board1">\n' +
    '<gm:object name="Test" id="Object_1fr8m0m" attributeValues="Teststate"/>\n' +
    '</gm:odBoard>\n' +
    '<gm:odBoard id="Board2">\n' +
    '</gm:odBoard>\n' +
    '<odDi:odRootBoard id="RootBoard" name="Objective Uno">\n' +
    '<odDi:odPlane id="Plane" boardElement="Board">\n' +
    '<odDi:odShape id="Object_1fr8m0m_di" boardElement="Object_1fr8m0m">\n' +
    '<dc:Bounds x="370" y="110" width="150" height="90"/>\n' +
    '</odDi:odShape>\n' +
    '</odDi:odPlane>\n' +
    '</odDi:odRootBoard>\n' +
    '<odDi:odRootBoard id="RootBoard2" name="Objective Dos">\n' +
    '<odDi:odPlane id="Plane2" boardElement="Board2">\n' +
    '</odDi:odPlane>\n' +
    '</odDi:odRootBoard>\n' +
    '</gm:definitions>';




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
  return this.importXML(exampleDiagram);
};


Modeler.prototype._interactionModules = [

  // non-modeling components
  OlcButtonBarModule,
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

  const {x,y} = nextPosition(this, 'gm:Object');
  const shape = modeling.createShape({
    type: 'gm:Object',
    name: name
  }, {x,y}, diagramRoot);
  return shape.businessObject;
}

Modeler.prototype.renameObject = function (clazz, name) {
  this.get('modeling').updateLabel(this.get('elementRegistry').get(clazz.id), name);
}

Modeler.prototype.deleteObject = function (clazz) {
  this.get('modeling').removeShape(this.get('elementRegistry').get(clazz.id));
}

Modeler.prototype.updateProperty = function (clazz, property) {
  this.get('modeling').updateProperties(clazz, property);
}

Modeler.prototype.getObjectives = function() {
  return this._definitions.get('rootBoards');
}

Modeler.prototype.addObjective = function (name) {
  var rootBoard = this.get('elementFactory').createRootBoard(name || '<TBD>');
  this._definitions.get('rootBoards').push(rootBoard[0]);
  this._definitions.get('rootElements').push(rootBoard[1]);
  //this._emit(OlcEvents.DEFINITIONS_CHANGED, { definitions: this._definitions });
  this.open(rootBoard[0]);
}
