import ROMRenderer from './ROMRenderer';
import TextRenderer from './TextRenderer';

export default {
  __init__: [ 'romRenderer' ],
  romRenderer: [ 'type', ROMRenderer ],
  textRenderer: [ 'type', TextRenderer ],
};
