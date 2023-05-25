import {assign} from 'min-dash';

import Moddle from './Moddle';

import ODDescriptors from './resources/rem.json';
import DiDescriptors from './resources/odDi.json';
import DcDescriptors from '../../frequentlyUsedFiles/moddle/dc.json';

var packages = {
  rem: ODDescriptors,
  odDi: DiDescriptors,
  dc: DcDescriptors,
};

export default function(additionalPackages, options) {
  var pks = assign({}, packages, additionalPackages);

  return new Moddle(pks, options);
}
