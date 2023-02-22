import {
    classes as domClasses,
} from 'min-dom';

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

    // Select objective Menu
    var selectObjectiveComponent = document.createElement('div');
    selectObjectiveComponent.classList.add('olc-select-component');
    var selectedObjectiveSpan = document.createElement('span');
    selectedObjectiveSpan.style.userSelect = 'none';
    selectObjectiveComponent.showValue = function (objective) {
        this.value = objective;
        selectedObjectiveSpan.innerText = this.value ?
            this.value.name
            : '<no Objective selected>';
    }
    var selectObjectiveMenu = getDropdown();
    selectObjectiveComponent.addEventListener('click', event => {
        if (event.target === selectObjectiveComponent || event.target === selectedObjectiveSpan) {
            repopulateDropdown();
            showSelectObjectiveMenu();
        }
    });
    selectObjectiveComponent.addEventListener('dblclick', event => {
        if (selectObjectiveComponent.value && (event.target === selectObjectiveComponent || event.target === selectedObjectiveSpan)) {
            selectObjectiveMenu.hide();
            var renameObjectiveInput = document.createElement('input');
            renameObjectiveInput.value = selectObjectiveComponent.value.name;
            renameObjectiveInput.addEventListener("change", function () {
                renameObjectiveInput.blur();
                gmModeler.getCurrentObjective().name = renameObjectiveInput.value;
                selectObjectiveComponent.showValue(gmModeler.getCurrentObjective());
            });
            renameObjectiveInput.addEventListener("focusout", function () {
                selectObjectiveComponent.replaceChild(selectedObjectiveSpan, renameObjectiveInput);
            });

            selectObjectiveComponent.replaceChild(renameObjectiveInput, selectedObjectiveSpan);
            //Timeout because focus is immediately lost if set immediately
            setTimeout(() => renameObjectiveInput.focus(), 100);
        }
    });
    selectObjectiveComponent.appendChild(selectedObjectiveSpan);
    buttonBar.appendChild(selectObjectiveComponent);

    // Delete objective button
    var deleteObjectiveButton = document.createElement('button');
    deleteObjectiveButton.innerHTML = '🗑️';
    deleteObjectiveButton.title = 'Delete Current Objective';
    deleteObjectiveButton.addEventListener('click', () => {
        var objectiveToDelete = selectObjectiveComponent.value;
        gmModeler.deleteObjective(objectiveToDelete);
        selectObjectiveComponent.showValue(gmModeler.getCurrentObjective());
        repopulateDropdown();
    });
    buttonBar.appendChild(deleteObjectiveButton);

    selectObjectiveMenu.handleClick = (event) => {
        return selectObjectiveMenu.contains(event.target);
    }

    function repopulateDropdown() {
        var objectives = gmModeler.getObjectives();
        var valueBefore = selectObjectiveComponent.value;
        selectObjectiveMenu.populate(objectives, objective => {
            gmModeler.showObjective(objective);
            selectObjectiveMenu.hide();
        });
        selectObjectiveMenu.addCreateElementInput(() => {
            var objectiveName = selectObjectiveMenu.getInputValue();
            if (objectiveName && objectiveName.length > 0) {
                gmModeler.addObjective(objectiveName);
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


    eventBus.on('import.render.complete', event => selectObjectiveComponent.showValue(event.rootBoard));
}

GmButtonBar.$inject = [
    'canvas',
    'eventBus',
    'goalModeler'
];
