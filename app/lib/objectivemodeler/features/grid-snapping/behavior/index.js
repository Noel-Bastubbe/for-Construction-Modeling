import AutoPlaceBehavior from './AutoPlaceBehavior';
import LayoutConnectionBehavior from '../../../../frequentlyUsedFiles/features/grid-snapping/LayoutConnectionBehavior.js';

export default {
  __init__: [
    'gridSnappingAutoPlaceBehavior',
    'gridSnappingLayoutConnectionBehavior',
  ],
  gridSnappingAutoPlaceBehavior: [ 'type', AutoPlaceBehavior ],
  gridSnappingLayoutConnectionBehavior: [ 'type', LayoutConnectionBehavior ]
};