import AutoPlaceModule from 'diagram-js/lib/features/auto-place';

import DepAutoPlace from './DepAutoPlace';

export default {
    __depends__: [ AutoPlaceModule ],
    __init__: [ 'olcAutoPlace' ],
    olcAutoPlace: [ 'type', OlcAutoPlace ]
};
