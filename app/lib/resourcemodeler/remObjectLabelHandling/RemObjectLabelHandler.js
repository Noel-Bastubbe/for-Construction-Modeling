// import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
// import CommonEvents from "../../common/CommonEvents";
// import getDropdown from "../../util/Dropdown";
// import {appendOverlayListeners} from "../../util/HtmlUtil";
// import {is} from "../../util/Util";

// export default class RemObjectLabelHandler extends CommandInterceptor {
//     constructor(eventBus, modeling, directEditing, overlays, resourceModeler) {
//         super(eventBus);
//         this._eventBus = eventBus;
//         this._modeling = modeling;
//         this._directEditing = directEditing;
//         this._dropdownContainer = document.createElement('div');
//         this._dropdownContainer.classList.add('dd-dropdown-multicontainer');
//         this._classDropdown = getDropdown("Class");
//         this._dropdownContainer.appendChild(this._classDropdown);
//         this._instanceDropdown = getDropdown("Instance");
//         this._dropdownContainer.appendChild(this._instanceDropdown);
//         this._stateDropdown = getDropdown("State");
//         this._dropdownContainer.appendChild(this._stateDropdown);
//         this._currentDropdownTarget = undefined;
//         this._overlayId = undefined;
//         this._overlays = overlays;
//         this._resourceModeler = resourceModeler;

//         eventBus.on('directEditing.activate', function (e) {
//             if (is(e.active.element, 'rem:Resource')) {
//                 directEditing.cancel();
//             }
//         });

//         eventBus.on(['element.dblclick', 'create.end', 'autoPlace.end'], e => {
//             const element = e.element || e.shape || e.elements[0];
//             if (is(element, 'rem:Resource')) {
//                 const olcs = this._resourceModeler._olcs;
//                 const omObject = element.businessObject;
//                 this._dropdownContainer.currentElement = element;
//                 let currentOlc = undefined;

//                 const updateStateSelection = () => {
//                     this._stateDropdown.getEntries().forEach(entry => entry.setSelected(omObject.state === entry.option));
//                 }

//                 const updateInstanceSelection = () => {
//                     this._instanceDropdown.getEntries().forEach(entry => entry.setSelected(omObject.instance === entry.option));
//                 }

//                 const populateStateDropdown = (states) => {
//                     this._stateDropdown.populate(
//                         states,
//                         (state, element) => {
//                             this.updateState(state, element);
//                             updateStateSelection();
//                         },
//                         element
//                         );
//                 }

//                 const populateInstanceDropdown = (instances) => {
//                     this._instanceDropdown.populate(
//                         instances,
//                         (instance, element) => {
//                             this.updateInstance(instance, element);
//                             updateInstanceSelection();
//                         },
//                         element, undefined,
//                         (entry, newValue) => {
//                             this._resourceModeler.renameInstance(entry.option, newValue)
//                             populateInstanceDropdown(this._resourceModeler.getObjectInstancesOfClass(omObject.classRef));
//                             omObject.classRef && this._instanceDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
//                             updateInstanceSelection();
//                         },
//                         (entry) => {
//                             this._resourceModeler.deleteInstance(entry.option);
//                             populateInstanceDropdown(this._resourceModeler.getObjectInstancesOfClass(omObject.classRef));
//                             omObject.classRef && this._instanceDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
//                             updateInstanceSelection();
//                         },
//                         true,
//                         true
//                     );
//                 }

//                 const updateClassSelection = () => {
//                     if (olcs.length > 0) {
//                         let states = [];
//                         let instances = [];
//                         if (omObject.classRef) {
//                             currentOlc = olcs.filter(olc => olc.classRef === omObject.classRef)[0];
//                             this._classDropdown.getEntries().forEach(entry => entry.setSelected(entry.option === currentOlc));
//                             states = currentOlc.get('Elements').filter(element => is(element, 'olc:State'));
//                             instances = this._resourceModeler.getObjectInstancesOfClass(omObject.classRef);
//                         }

//                         populateStateDropdown(states);
//                         populateInstanceDropdown(instances);

//                         // Prevent adding new states if no dataclass is selected
//                         omObject.classRef && this._stateDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
//                         omObject.classRef && this._instanceDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
//                     } else {
//                         populateStateDropdown([]);
//                         populateInstanceDropdown([])
//                     }
//                 }

//                 const populateClassDropdown = () => {
//                     this._classDropdown.populate(
//                         olcs,
//                         (olc, element) => {
//                         this.updateClass(olc.classRef, element);
//                         updateClassSelection();
//                     },
//                         element
//                     );
//                     this._classDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
//                     updateClassSelection();
//                     updateStateSelection();
//                     updateInstanceSelection();
//                 }

//                 populateClassDropdown();

//                 this._dropdownContainer.confirm = (event) => {
//                     const newClassInput = this._classDropdown.getInputValue();
//                     const newStateInput = this._stateDropdown.getInputValue();
//                     const newInstanceInput = this._instanceDropdown.getInputValue();
//                     let needUpdate = false;
//                     if (newClassInput !== '') {
//                         const newClass = this.createDataclass(newClassInput);
//                         this.updateClass(newClass, element);
//                         populateClassDropdown();
//                         needUpdate = true;
//                     }
//                     if (newStateInput !== '') {
//                         const newState = this.createState(newStateInput, currentOlc);
//                         this.updateState(newState, element);
//                         needUpdate = true;
//                     }
//                     if (newInstanceInput !== '') {
//                         const newInstance = this._resourceModeler.createInstance(newInstanceInput, currentOlc.classRef);
//                         this.updateInstance(newInstance, element);
//                         needUpdate = true;
//                     }

//                     if (needUpdate) {
//                         updateClassSelection();
//                         updateStateSelection();
//                         updateInstanceSelection();
//                         this._stateDropdown.focusInput();
//                         this._instanceDropdown.focusInput();
//                     }
//                 }

//                 let shouldBlockNextClick = e.type === 'create.end';
//                 this._dropdownContainer.handleClick = (event) => {
//                     if (shouldBlockNextClick) {
//                         shouldBlockNextClick = false;
//                         return true;
//                     } else if (!this._dropdownContainer.contains(event.target)) {
//                         return false;
//                     } else if (event.target.classList.contains('dd-dropdown-entry')) {
//                         this._classDropdown.clearInput();
//                         this._instanceDropdown.clearInput();
//                         this._stateDropdown.clearInput();
//                     } else if (event.target.tagName !== 'INPUT' || !event.target.value) {
//                         this._dropdownContainer.confirm();
//                     }
//                     return true;
//                 }

//                 this._dropdownContainer.close = () => {
//                     if (this._overlayId) {
//                         this._overlays.remove(this._overlayId);
//                         this._overlayId = undefined;
//                     }
//                     this._dropdownContainer.currentElement = undefined;
//                     this._currentDropdownTarget = undefined;
//                 }

//                 const closeOverlay = appendOverlayListeners(this._dropdownContainer);
//                 eventBus.once('element.contextmenu', event => {
//                     if (this._currentDropdownTarget && ((event.element || event.shape).businessObject !== this._currentDropdownTarget)) {
//                         closeOverlay(event);
//                         event.preventDefault();
//                     }
//                 });

//                 // Show the menu(e)
//                 this._overlayId = overlays.add(element.id, 'classSelection', {
//                     position: {
//                         bottom: 0,
//                         right: 0
//                     },
//                     scale: false,
//                     html: this._dropdownContainer
//                 });

//                 this._currentDropdownTarget = element.businessObject;
//             }
//         });
//     }

//     updateClass(newClass, element) {
//         element.businessObject.classRef = newClass;
//         element.businessObject.instance = undefined;
//         element.businessObject.state = undefined;
//         this._eventBus.fire('element.changed', {
//             element
//         });
//     }

//     updateState(newState, element) {
//         const omObject = element.businessObject;
//         if (omObject.state === newState) {
//             omObject.state = undefined;
//         } else {
//             omObject.state = newState;
//         }
//         this._eventBus.fire('element.changed', {
//             element
//         });
//     }

//     updateInstance(newInstance, element) {
//         element.businessObject.instance = newInstance;
//         this._eventBus.fire('element.changed', {
//             element
//         });
//     }

//     createState(name, olc) {
//         return this._eventBus.fire(CommonEvents.STATE_CREATION_REQUESTED, {
//             name,
//             olc
//         });
//     }

//     createDataclass(name) {
//         return this._eventBus.fire(CommonEvents.DATACLASS_CREATION_REQUESTED, {
//             name
//         });
//     }
// }

// RemObjectLabelHandler.$inject = [
//     'eventBus',
//     'modeling',
//     'directEditing',
//     'overlays',
//     'resourceModeler'
// ];
