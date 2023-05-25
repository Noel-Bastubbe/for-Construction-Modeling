import REMRenderer from './REMRenderer';
import TextRenderer from './TextRenderer';

export default {
  __init__: [ 'remRenderer' ],
  remRenderer: [ 'type', REMRenderer ],
  textRenderer: [ 'type', TextRenderer ],
};
