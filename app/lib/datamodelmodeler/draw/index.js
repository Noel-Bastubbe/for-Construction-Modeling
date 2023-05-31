import ODRenderer from './ODRenderer';
import TextRenderer from '../../common/draw/TextRenderer.js';

export default {
  __init__: [ 'odRenderer' ],
  odRenderer: [ 'type', ODRenderer ],
  textRenderer: [ 'type', TextRenderer ],
};
