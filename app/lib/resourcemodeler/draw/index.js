import REMRenderer from './REMRenderer';
import TextRenderer from '../../common/draw/TextRenderer.js';

export default {
  __init__: [ 'remRenderer' ],
  remRenderer: [ 'type', REMRenderer ],
  textRenderer: [ 'type', TextRenderer ],
};
