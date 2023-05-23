import RulesModule from 'diagram-js/lib/features/rules';

import DepRuleProvider from './DepRuleProvider';

export default {
  __depends__: [
    RulesModule
  ],
  __init__: [ 'depRuleProvider' ],
  depRuleProvider: [ 'type', DepRuleProvider ]
};