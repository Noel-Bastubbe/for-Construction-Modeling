import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
// import { without } from 'min-dash';
import CommonEvents from "../../common/CommonEvents";
import getDropdown from "../../util/Dropdown";
import {appendOverlayListeners} from "../../util/HtmlUtil";
import {formatStates, is} from "../../util/Util";
import ObjectiveEvents from "../ObjectiveEvents";

export default class OmObjectLabelHandler extends CommandInterceptor {
    constructor(eventBus, modeling, directEditing, overlays, objectiveModeler) {
        super(eventBus);
        this._eventBus = eventBus;
        this._modeling = modeling;
        this._directEditing = directEditing;
        this._dropdownContainer = document.createElement('div');
        this._dropdownContainer.classList.add('dd-dropdown-multicontainer');
        this._classDropdown = getDropdown("Class");
        this._dropdownContainer.appendChild(this._classDropdown);
        this._nameDropdown = getDropdown("Name");
        this._dropdownContainer.appendChild(this._nameDropdown);
        this._stateDropdown = getDropdown("States");
        this._dropdownContainer.appendChild(this._stateDropdown);
        this._currentDropdownTarget = undefined;
        this._overlayId = undefined;
        this._overlays = overlays;
        this._objectiveModeler = objectiveModeler;

        eventBus.on('element.changed', function (e) {
            if (is(e.element, 'om:Object') && e.element.parent) {
                const businessObject = e.element.businessObject;
                const name = `${businessObject.classRef?.name} : ${businessObject.instance?.name}`;
                const state = businessObject.state?.name;
                if (businessObject.name !== name) {
                    modeling.updateLabel(e.element, name, undefined, {
                        omObjectLabelUpdate: true
                    });
                }
            }
        });

        eventBus.on('directEditing.activate', function (e) {
            if (is(e.active.element, 'om:Object')) {
                directEditing.cancel();
            }
        });

        eventBus.on(['element.dblclick', 'create.end', 'autoPlace.end'], e => {
            const element = e.element || e.shape || e.elements[0];
            if (is(element, 'om:Object')) {
                const olcs = this._objectiveModeler._olcs;
                const omObject = element.businessObject;
                this._dropdownContainer.currentElement = element;
                let currentOlc = undefined;

                const updateStateSelection = () => {
                    this._stateDropdown.getEntries().forEach(entry => entry.setSelected(omObject.state === entry.option));
                }

                const updateNameSelection = () => {
                    this._nameDropdown.getEntries().forEach(entry => entry.setSelected(omObject.instance === entry.option));
                }

                const populateStateDropdown = (states) => {
                    this._stateDropdown.populate(
                        states,
                        (state, element) => {
                            this.updateState(state, element);
                            updateStateSelection();
                        },
                        element
                        );
                }

                const populateNameDropdown = (names) => {
                    this._nameDropdown.populate(
                        names,
                        (name, element) => {
                            this.updateName(name, element);
                            updateNameSelection();
                        },
                        element,
                        (entry, newValue) => {
                            this.requestInstanceRenaming(entry.option, newValue);
                            populateNameDropdown();
                            updateNameSelection();
                        },
                        (entry) => {
                            this.requestInstanceDeletion(entry.option);
                            updateNameSelection();
                        },
                        true,
                        true
                    );
                }

                const updateClassSelection = () => {
                    if (olcs.length > 0) {
                        let states = [];
                        let names = [];
                        if (omObject.classRef) {
                            currentOlc = olcs.filter(olc => olc.classRef === omObject.classRef)[0];
                            this._classDropdown.getEntries().forEach(entry => entry.setSelected(entry.option === currentOlc));
                            states = currentOlc.get('Elements').filter(element => is(element, 'olc:State'));
                            names = this._objectiveModeler.getObjectInstancesOfClass(omObject.classRef);
                        }

                        populateStateDropdown(states);
                        populateNameDropdown(names);

                        // Prevent adding new states if no dataclass is selected
                        omObject.classRef && this._stateDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
                        omObject.classRef && this._nameDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
                    } else {
                        populateStateDropdown([]);
                        populateNameDropdown([])
                    }
                }

                const populateClassDropdown = () => {
                    this._classDropdown.populate(
                        olcs,
                        (olc, element) => {
                        this.updateClass(olc.classRef, element);
                        updateClassSelection();
                    },
                        element
                    );
                    this._classDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
                    updateClassSelection();
                    updateStateSelection();
                    updateNameSelection();
                }

                populateClassDropdown();

                this._dropdownContainer.confirm = (event) => {
                    const newClassInput = this._classDropdown.getInputValue();
                    const newStateInput = this._stateDropdown.getInputValue();
                    const newNameInput = this._nameDropdown.getInputValue();
                    let needUpdate = false;
                    if (newClassInput !== '') {
                        const newClass = this.createDataclass(newClassInput);
                        this.updateClass(newClass, element);
                        populateClassDropdown();
                        needUpdate = true;
                    }
                    if (newStateInput !== '') {
                        const newState = this.createState(newStateInput, currentOlc);
                        this.updateState(newState, element);
                        needUpdate = true;
                    }
                    if (newNameInput !== '') {
                        const newName = this.createName(newNameInput, currentOlc.classRef);
                        this.updateName(newName, element);
                        needUpdate = true;
                    }

                    if (needUpdate) {
                        updateClassSelection();
                        updateStateSelection();
                        updateNameSelection();
                        this._stateDropdown.focusInput();
                        this._nameDropdown.focusInput();
                    }
                }

                let shouldBlockNextClick = e.type === 'create.end';
                this._dropdownContainer.handleClick = (event) => {
                    if (shouldBlockNextClick) {
                        shouldBlockNextClick = false;
                        return true;
                    } else if (!this._dropdownContainer.contains(event.target)) {
                        return false;
                    } else if (event.target.classList.contains('dd-dropdown-entry')) {
                        this._classDropdown.clearInput();
                        this._nameDropdown.clearInput();
                        this._stateDropdown.clearInput();
                    } else if (event.target.tagName !== 'INPUT' || !event.target.value) {
                        this._dropdownContainer.confirm();
                    }
                    return true;
                }

                this._dropdownContainer.close = () => {
                    if (this._overlayId) {
                        this._overlays.remove(this._overlayId);
                        this._overlayId = undefined;
                    }
                    if (this._currentDropdownTarget?.classRef === undefined) {
                        this._modeling.removeElements([this._dropdownContainer.currentElement]);
                    }
                    this._dropdownContainer.currentElement = undefined;
                    this._currentDropdownTarget = undefined;
                }

                const closeOverlay = appendOverlayListeners(this._dropdownContainer);
                eventBus.once('element.contextmenu', event => {
                    if (this._currentDropdownTarget && ((event.element || event.shape).businessObject !== this._currentDropdownTarget)) {
                        closeOverlay(event);
                        event.preventDefault();
                    }
                });

                // Show the menu(e)
                this._overlayId = overlays.add(element.id, 'classSelection', {
                    position: {
                        bottom: 0,
                        right: 0
                    },
                    scale: false,
                    html: this._dropdownContainer
                });

                this._currentDropdownTarget = element.businessObject;
            }
        });
    }

    updateClass(newClass, element) {
        element.businessObject.classRef = newClass;
        element.businessObject.state = null;
        this._eventBus.fire('element.changed', {
            element
        });
    }

    updateState(newState, element) {
        const omObject = element.businessObject;
        if (omObject.state === newState) {
            omObject.state = undefined;
        } else {
            omObject.state = newState;
        }
        this._eventBus.fire('element.changed', {
            element
        });
    }

    updateName(newName, element) {
        element.businessObject.instance = newName;
        this._eventBus.fire('element.changed', {
            element
        });
    }

    requestInstanceRenaming(instance, name) {
        this._eventBus.fire(ObjectiveEvents.INSTANCE_RENAMING_REQUESTED, {
            instance,
            name
        });
    }

    requestInstanceDeletion(instance) {
        this._eventBus.fire(ObjectiveEvents.INSTANCE_DELETION_REQUESTED, {
            instance
        });
    }

    createState(name, olc) {
        return this._eventBus.fire(CommonEvents.STATE_CREATION_REQUESTED, {
            name,
            olc
        });
    }

    createName(name, clazz) {
        return this._eventBus.fire(CommonEvents.NAME_CREATION_REQUESTED, {
            name,
            clazz
        });
    }

    createDataclass(name) {
        return this._eventBus.fire(CommonEvents.DATACLASS_CREATION_REQUESTED, {
            name
        });
    }
}

OmObjectLabelHandler.$inject = [
    'eventBus',
    'modeling',
    'directEditing',
    'overlays',
    'objectiveModeler'
];
