import {isAny} from '../../../common/features/modeling/ModelingUtil.js';

function getLabelAttr(semantic) {
  if (semantic.labelAttribute) {
    return semantic.labelAttribute;
  }
  if (isAny(semantic, [ 'rom:Inheritance', 'rom:Role' ])) {
    return 'name';
  }
}

export function getLabel(element) {
  var semantic = element.businessObject;
  var attr = getLabelAttr(semantic);

  if (attr) {
    return semantic[attr] || '';
  }
}


export function setLabel(element, text) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {
    semantic[attr] = text;
  }

  return element;
}