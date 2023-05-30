import AdaptiveLabelPositioningBehavior from './AdaptiveLabelPositioningBehavior';
import AppendBehavior from './AppendBehavior';
import FixHoverBehavior from '../../../../frequentlyUsedFiles/features/modeling/behavior/FixHoverBehavior';
import ImportDockingFix from '../../../../frequentlyUsedFiles/features/modeling/behavior/ImportDockingFix';
import LabelBehavior from './LabelBehavior';
import UnclaimIdBehavior from './UnclaimIdBehavior';

export default {
  __init__: [
    'adaptiveLabelPositioningBehavior',
    'appendBehavior',
    'fixHoverBehavior',
    'importDockingFix',
    'labelBehavior',
    'unclaimIdBehavior',
  ],
  adaptiveLabelPositioningBehavior: [ 'type', AdaptiveLabelPositioningBehavior ],
  appendBehavior: [ 'type', AppendBehavior ],
  fixHoverBehavior: [ 'type', FixHoverBehavior ],
  importDockingFix: [ 'type', ImportDockingFix ],
  labelBehavior: [ 'type', LabelBehavior ],
  unclaimIdBehavior: [ 'type', UnclaimIdBehavior ],
};
