import {
    attr as domAttr,
    classes as domClasses,
    event as domEvent,
    query as domQuery
} from 'min-dom';
import CommonEvents from '../../common/CommonEvents';

import getDropdown from '../../util/Dropdown';
import {download, upload} from '../../util/FileUtil';
import { appendOverlayListeners } from '../../util/HtmlUtil';


export default function GmButtonBar(canvas, eventBus, gmModeler) {
    var container = canvas.getContainer().parentElement;
    var buttonBar = document.createElement('div');
    domClasses(buttonBar).add('olc-buttonbar');
    container.appendChild(buttonBar);

    // Import export buttons (disabled)

    const exportButton = document.createElement('button');
    exportButton.innerHTML = 'Export GoalModel as Xml'
    exportButton.addEventListener('click', function () {
        gmModeler.saveXML({ format: true }).then(result => {
            download('foobar.xml', result.xml);
        });
    });
    // buttonBar.appendChild(exportButton);
    const importButton = document.createElement('button');
    importButton.innerHTML = 'Import GoalModel from Xml'
    importButton.addEventListener('click', function () {
        upload(xml => gmModeler.importXML(xml));
    });
    // buttonBar.appendChild(importButton);

    // Select olc Menu    
    var selectObjectiveComponent = document.createElement('div');
    selectObjectiveComponent.classList.add('olc-select-component');
    var selectedObjectiveSpan = document.createElement('span');
    selectedObjectiveSpan.style.userSelect = 'none';
    selectObjectiveComponent.showValue = function (objective) {
        this.value = objective;
        selectedObjectiveSpan.innerText = this.value ?
            this.value.name //this.value.classRef.name
            : '<no Objective selected>';
    }
    var selectObjectiveMenu = getDropdown();
    selectObjectiveComponent.addEventListener('click', event => {
        if (event.target === selectObjectiveComponent || event.target === selectedObjectiveSpan) {
            repopulateDropdown();
            showSelectObjectiveMenu();
        } else {
            return;
        }
    });
    selectObjectiveComponent.addEventListener('dblclick', event => {
        if (selectObjectiveComponent.value && (event.target === selectObjectiveComponent || event.target === selectedObjectiveSpan)) {
            selectObjectiveMenu.hide();
            var renameObjectiveInput = document.createElement('input');
            renameObjectiveInput.value = selectObjectiveComponent.value.name;
            renameObjectiveInput.addEventListener("change", function (event) {
                renameObjectiveInput.blur();
                // eventBus.fire(OlcEvents.OLC_RENAME, {
                //     olc: selectOlcComponent.value,
                //     name: renameOlcInput.value
                // });
            });
            renameObjectiveInput.addEventListener("focusout", function (event) {
                selectObjectiveComponent.replaceChild(selectedObjectiveSpan, renameObjectiveInput);
            });

            selectObjectiveComponent.replaceChild(renameObjectiveInput, selectedObjectiveSpan);
            //Timeout because focus is immediately lost if set immediately
            setTimeout(() => renameObjectiveInput.focus(), 100);
        } else {
            return;
        }
    });
    selectObjectiveComponent.appendChild(selectedObjectiveSpan);
    buttonBar.appendChild(selectObjectiveComponent);

    // Delete olc button
    var deleteObjectiveButton = document.createElement('button');
    deleteObjectiveButton.innerHTML = '🗑️';
    deleteObjectiveButton.title = 'Delete Current Objective';
    deleteObjectiveButton.addEventListener('click', () => {
        var objectiveToDelete = selectObjectiveComponent.value;
        //var shouldDelete = eventBus.fire(OlcEvents.OLC_DELETION_REQUESTED, { olc: olcToDelete });
        if (shouldDelete !== false) {
            // Deletion was not rejected and not handled somewhere else; should not happen when mediator is involved
            // gmModeler.deleteOlc(objectiveToDelete.classRef);
        }
    });
    buttonBar.appendChild(deleteObjectiveButton);

    selectObjectiveMenu.handleClick = (event) => {
        return selectObjectiveMenu.contains(event.target);
    }

    function repopulateDropdown() {
        var objectives = gmModeler.getObjectives(); //gmModeler.getOlcs()
        var valueBefore = selectObjectiveComponent.value;
        selectObjectiveMenu.populate(objectives, objective => {
            gmModeler.open(objective);
            selectObjectiveMenu.hide();
        });
        selectObjectiveMenu.addCreateElementInput(event => {
            var className = selectObjectiveMenu.getInputValue();
            if (className && className.length > 0) {
                gmModeler.addObjective(className);
                repopulateDropdown();
            }
        });
        deleteObjectiveButton.disabled = objectives.length === 0;
        selectObjectiveComponent.showValue(valueBefore);
    }

    function showSelectObjectiveMenu() {
        const closeOverlay = appendOverlayListeners(selectObjectiveMenu);
        selectObjectiveMenu.style.display = 'block';
        selectObjectiveComponent.appendChild(selectObjectiveMenu);
        eventBus.once('element.contextmenu', event => {
            closeOverlay(event);
            event.preventDefault();
        });
        selectObjectiveMenu.hide = closeOverlay;
    }


    //eventBus.on([OlcEvents.DEFINITIONS_CHANGED], event => repopulateDropdown());
    eventBus.on('import.render.complete', event => selectObjectiveComponent.showValue(event.rootBoard));
}

GmButtonBar.$inject = [
    'canvas',
    'eventBus',
    'goalModeler'
];
