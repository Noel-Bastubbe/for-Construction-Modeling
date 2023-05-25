import ROMRenderer from './ROMRenderer';
import TextRenderer from '../../frequentlyUsedFiles/draw/TextRenderer.js';

export default {
  __init__: [ 'romRenderer' ],
  romRenderer: [ 'type', ROMRenderer ],
  textRenderer: [ 'type', TextRenderer ],
};
