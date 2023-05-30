import CopyPasteModule from 'diagram-js/lib/features/copy-paste';

import ODCopyPaste from './ODCopyPaste';
import ModdleCopy from '../../../frequentlyUsedFiles/features/copy-paste/ModdleCopy.js';

export default {
  __depends__: [
    CopyPasteModule
  ],
  __init__: [ 'odCopyPaste', 'moddleCopy' ],
  odCopyPaste: [ 'type', ODCopyPaste ],
  moddleCopy: [ 'type', ModdleCopy ]
};
