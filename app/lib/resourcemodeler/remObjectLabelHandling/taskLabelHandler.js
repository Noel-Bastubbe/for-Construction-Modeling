import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
import CommonEvents from "../../common/CommonEvents";
import getDropdown from "../../util/Dropdown";
import {appendOverlayListeners} from "../../util/HtmlUtil";
import {is} from "../../util/Util";

export default class TaskLabelHandler extends CommandInterceptor {
    constructor(eventBus, modeling, directEditing, overlays, resourceModeler) {
        super(eventBus);
        this._eventBus = eventBus;
        this._modeling = modeling;
        this._dropdownContainer = document.createElement('div');
        this._dropdownContainer.classList.add('dd-dropdown-multicontainer');
        this._nameDropdown = getDropdown("Name");
        this._dropdownContainer.appendChild(this._nameDropdown);
        this._rolesDropdown = getDropdown("Roles");
        this._dropdownContainer.appendChild(this._rolesDropdown);
        this._capacityDropdown = getDropdown("Capacity");
        this._dropdownContainer.appendChild(this._capacityDropdown);
        this._availabilityDropdown = getDropdown("Availability");
        this._dropdownContainer.appendChild(this._availabilityDropdown);
        this._currentDropdownTarget = undefined;
        this._overlayId = undefined;
        this._overlays = overlays;
        this._resourceModeler = resourceModeler;

        eventBus.on('directEditing.activate', function (e) {
            if (is(e.active.element, 'rem:Resource')) {
                directEditing.cancel();
            }
        });

        eventBus.on(['element.dblclick', 'create.end', 'autoPlace.end'], e => {
            const element = e.element || e.shape || e.elements[0];
            if (is(element, 'rem:Resource')) {
                const activity = element.businessObject;
                this._dropdownContainer.currentElement = element;

                const updateRolesSelection = () => {
                    this._rolesDropdown.getEntries().forEach(entry => entry.setSelected(activity.roles === entry.option));
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
                const populateCapacityDropdown = () => {
                    this._capacityDropdown.populate(
                        [],
                        (state, element) => {
                            this.updateCapacity(state, element);
                        },
                        element
                    );
                    this._capacityDropdown.addCreateElementInput(event => this._dropdownContainer.confirm(),"number",activity.capacity);
                }
                const populateRolesDropdown = () => {
                    this._rolesDropdown.populate(
                        [], // TODO Change this to the list of roles instead of an empty list
                        (state, element) => {
                            this.updateRoles(state, element);
                            updateRolesSelection();
                        },
                        element
                    );
                    this._rolesDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
                }
                const populateAvailabilityDropdown = () => {
                    this._availabilityDropdown.populate(
                        [],
                        (state, element) => {
                            this.updateAvailability(state, element);
                        },
                        element
                    );
                    this._availabilityDropdown.addCreateElementInput(event => this._dropdownContainer.confirm());
                }
                populateNameDropdown();
                populateCapacityDropdown();
                populateRolesDropdown();
                populateAvailabilityDropdown();

                this._dropdownContainer.confirm = (event) => {
                    const newNameInput = this._nameDropdown.getInputValue();
                    const newCapacityInput = this._capacityDropdown.getInputValue();
                    const newRolesInput = this._rolesDropdown.getInputValue();
                    const newAvailabilityInput = this._availabilityDropdown.getInputValue();
                    if (newNameInput !== '' && newNameInput !== activity.name) {
                        this.updateName(newNameInput,element);
                        populateNameDropdown();
                    }
                    if (newCapacityInput !== activity.capacity && newCapacityInput > 0) {
                        this.updateCapacity(newCapacityInput,element);
                        populateCapacityDropdown();
                    }
                    if (newRolesInput !== activity.roles) {
                        this.updateRoles(newRolesInput,element);
                        populateRolesDropdown();
                    }
                    if (newAvailabilityInput !== activity.availability && newAvailabilityInput > 0) {
                        this.updateAvailability(newAvailabilityInput,element);
                        populateAvailabilityDropdown();
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
                        this._capacityDropdown.clearInput();
                        this._rolesDropdown.clearInput();
                        this._availabilityDropdown.clearInput();
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

    updateCapacity(newCapacity, element) {
        element.businessObject.capacity = newCapacity;
        this._eventBus.fire('element.changed', {
            element
        });
    }

    updateRoles(newRoles, element) {
        element.businessObject.roles = newRoles;
        this._eventBus.fire('element.changed', {
            element
        });
    }

    updateAvailability(newAvailability, element) {
        element.businessObject.availability = newAvailability;
        this._eventBus.fire('element.changed', {
            element
        });
    }

}

TaskLabelHandler.$inject = [
    'eventBus',
    'modeling',
    'directEditing',
    'overlays',
    'resourceModeler'
];
