import {getBusinessObject} from '../../../frequentlyUsedFiles/util/ModelUtil.js';

import {filter, map} from 'min-dash';

import {selfAndAllChildren} from 'diagram-js/lib/util/Elements';
import {getDi} from "../../../frequentlyUsedFiles/draw/RendererUtil.js";


var HIGH_PRIORITY = 2000;

export default function ODDiOrdering(eventBus, canvas) {

  eventBus.on('saveXML.start', HIGH_PRIORITY, orderDi);

  function orderDi() {
    var root = canvas.getRootElement(),
        rootDi = getBusinessObject(root).di,
        elements,
        diElements;

    elements = selfAndAllChildren([ root ], false);

    // only odDi:Shape can be direct children of odDi:Plane
    elements = filter(elements, function(element) {
      return element !== root && !element.labelTarget;
    });

    diElements = map(elements, getDi);

    rootDi.set('planeElement', diElements);
  }
}

ODDiOrdering.$inject = [ 'eventBus', 'canvas' ];
