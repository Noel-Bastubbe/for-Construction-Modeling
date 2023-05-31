import ROMRenderer from './ROMRenderer';
import TextRenderer from '../../common/draw/TextRenderer.js';

export default {
  __init__: [ 'romRenderer' ],
  romRenderer: [ 'type', ROMRenderer ],
  textRenderer: [ 'type', TextRenderer ],
};
