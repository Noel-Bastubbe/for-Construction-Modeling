import { is } from "../../util/Util";

export default function DepContextPadProvider(connect, contextPad, modeling, elementFactory, create, autoPlace) {
  this._connect = connect;
  this._modeling = modeling;
  this._elementFactory = elementFactory;
  this._create = create;
  this._autoPlace = autoPlace;

  contextPad.registerProvider(this);
}

DepContextPadProvider.$inject = [
  'connect',
  'contextPad',
  'modeling',
  'elementFactory',
  'create',
  'autoPlace'
];


DepContextPadProvider.prototype.getContextPadEntries = function (element) {
  var connect = this._connect,
    modeling = this._modeling,
    elementFactory = this._elementFactory,
    create = this._create,
    autoPlace = this._autoPlace;

  function removeElement() {
    modeling.removeElements([element]);
  }

  function startConnect(event, element, autoActivate) {
    connect.start(event, element, autoActivate);
  }

  function appendState(event, element) {
    const shape = elementFactory.createShape({ type: 'olc:State' });

    autoPlace.append(element, shape, { connection: { type: 'dep:Dependency' } });
  }

  function appendStateStart(event) {
    const shape = elementFactory.createShape({ type: 'olc:State' });

    create.start(event, shape, { source: element });
  }

  const entries =  {
    'delete': {
      group: 'edit',
      className: 'bpmn-icon-trash',
      title: 'Remove',
      action: {
        click: removeElement,
        dragstart: removeElement
      }
    },
    'connect': {
      group: 'edit',
      className: 'bpmn-icon-connection',
      title: 'Connect',
      action: {
        click: startConnect,
        dragstart: startConnect
      }
    }
  };

  if (is(element, 'olc:State')) {
    entries['append'] = {
      group: 'create',
      className: 'bpmn-icon-start-event-none',
      title: 'Append Objective',
      action: {
        click: appendState,
        dragstart: appendStateStart
      }
    }
  }

  return entries;
};