import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
import CommonEvents from "../../common/CommonEvents";
import getDropdown from "../../util/Dropdown";
import {appendOverlayListeners} from "../../util/HtmlUtil";
import {is} from "../../util/Util";

export default class FragmentLabelHandler extends CommandInterceptor {
    constructor(eventBus, modeling, directEditing, overlays, fragmentModeler) {
        super(eventBus);
        this._eventBus = eventBus;
        this._modeling = modeling;
        this._directEditing = directEditing;
        this._dropdownContainer = document.createElement('div');
        this._dropdownContainer.classList.add('dd-dropdown-multicontainer');
        this._nameDropdown = getDropdown("Name");
        this._dropdownContainer.appendChild(this._nameDropdown);
        this._durationDropdown = getDropdown("Duration");
        this._dropdownContainer.appendChild(this._durationDropdown);
        this._roleDropdown = getDropdown("Role");
        this._dropdownContainer.appendChild(this._roleDropdown);
        this._NoPDropdown = getDropdown("Number Of People");
        this._dropdownContainer.appendChild(this._NoPDropdown);
        this._currentDropdownTarget = undefined;
        this._overlayId = undefined;
        this._overlays = overlays;
        this._fragmentModeler = fragmentModeler;

        eventBus.on('directEditing.activate', function (e) {
            if (is(e.active.element, 'bpmn2:task')) {
                directEditing.cancel();
            }
        });

        eventBus.on(['element.dblclick', 'create.end', 'autoPlace.end'], e => {
            const element = e.element || e.shape || e.elements[0];
            if (is(element, 'bpmn:Task')) {
                const activity = element.businessObject;
                this._dropdownContainer.currentElement = element;

                const updateRoleSelection = () => {
                    this._roleDropdown.getEntries().forEach(entry => entry.setSelected(activity.role === entry.option));
                }

                const populateNameDropdown = () => {
                    this._nameDropdown.populate(
                        [],
                        (state, element) => {
                            this.updateName(state, element);
                            },
                        element
                    );
                    this._nameDropdown.addCreateElementInput(event => this._dropdownContainer.confirm(),"text",activity.name);
                }
                const populateDurationDropdown = () => {
                    this._durationDropdown.populate(
                        [],
                        (state, element) => {
                            this.updateDuration(state, element);
                        },
                        element
                    );
                    this._durationDropdown.addCreateElementInput(event => this._dropdownContainer.confirm(),"number",activity.duration);
                }
                const populateRoleDropdown = () => {
                    this._roleDropdown.populate(
                        [],
                        (state, element) => {
                            this.updateRole(state, element);
                            updateRoleSelection();
                        },
                        element
                    );
                    this._roleDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
                }
                const populateNoPDropdown = () => {
                    this._NoPDropdown.populate(
                        [],
                        (state, element) => {
                            this.updateNoP(state, element);
                        },
                        element
                    );
                    this._NoPDropdown.addCreateElementInput(event => this._dropdownContainer.confirm(),"number",activity.NoP);
                }
                populateNameDropdown();
                populateDurationDropdown();
                populateRoleDropdown();
                populateNoPDropdown();

                this._dropdownContainer.confirm = (event) => {
                    const newNameInput = this._nameDropdown.getInputValue();
                    const newDurationInput = this._durationDropdown.getInputValue();
                    const newRoleInput = this._roleDropdown.getInputValue();
                    const newNoPInput = this._NoPDropdown.getInputValue();
                    let needUpdate = false;
                    if (newNameInput !== '' && newNameInput !== activity.name) {
                        this.updateName(newNameInput,element);
                        populateNameDropdown();
                        needUpdate = true;
                    }
                    if (newDurationInput !== activity.duration) {
                        this.updateDuration(newDurationInput,element);
                        populateDurationDropdown();
                        needUpdate = true;
                    }
                    if (newRoleInput !== activity.role) {
                        this.updateRole(newRoleInput,element);
                        populateRoleDropdown();
                        needUpdate = true;
                    }
                    if (newNoPInput !== activity.NoP) {
                        this.updateNoP(newNoPInput,element);
                        populateNoPDropdown();
                        needUpdate = true;
                    }
                    if (needUpdate) {
                        this._nameDropdown.focusInput();
                        this._durationDropdown.focusInput();
                        this._roleDropdown.focusInput();
                        this._NoPDropdown.focusInput();
                        updateRoleSelection();
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
                        this._nameDropdown.clearInput();
                        this._durationDropdown.clearInput();
                        this._roleDropdown.clearInput();
                        this._NoPDropdown.clearInput();
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

    updateName(newName, element) {
        element.businessObject.name = newName;
        this._eventBus.fire('element.changed', {
            element
        });
        this._eventBus.fire(CommonEvents.OBJECTIVE_RENAMED, {
            objective: element
        });
    }

    updateDuration(newTime, element) {
        element.businessObject.duration = newTime;
        this._eventBus.fire('element.changed', {
            element
        });
    }

    updateRole(newRole, element) {
        element.businessObject.role = newRole;
        this._eventBus.fire('element.changed', {
            element
        });
    }

    updateNoP(newNoP, element) {
        element.businessObject.NoP = newNoP;
        this._eventBus.fire('element.changed', {
            element
        });
    }

}

FragmentLabelHandler.$inject = [
    'eventBus',
    'modeling',
    'directEditing',
    'overlays',
    'fragmentModeler'
];
