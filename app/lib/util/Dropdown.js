//import OmObjectLabelHandler from "../objectivemodeler/omObjectLabelHandling/OmObjectLabelHandler"

export default function getDropdown(name = '') {
    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dd-dropdown-menu');
    
    dropdownMenu.populate = function (options, onChange, element, labelFunc = x => x.name || x) {
        this.innerHTML = '';
        
        if (name != '') {
            const dropdownTitle = document.createElement('div');
            dropdownTitle.classList.add('dd-dropdown-title');
            dropdownTitle.innerHTML = name;
            this.appendChild(dropdownTitle);
        }
        for (const option of options) {
            const entry = document.createElement('div');
            entry.option = option;
            entry.classList.add('dd-dropdown-entry');
            entry.innerHTML = labelFunc(option);
            entry.addEventListener('click', event => {
                onChange(option, element, event)
            });
            entry.setSelected = function(isSelected) {
                if (isSelected) {
                    this.classList.add('dd-dropdown-entry-selected');
                } else {
                    this.classList.remove('dd-dropdown-entry-selected');
                }
            }
            this.appendChild(entry);

            // Delete and Edit name button in Objective Model
            if (name === 'Name') {
                var editNameButton = document.createElement('button');
                editNameButton.innerHTML = '🖋️';
                editNameButton.title = 'Edit current Name';
                editNameButton.classList.add('editNameButton');
                editNameButton.addEventListener('click', () => {
                    const newName = prompt('Enter new name:', entry.option.name);
                    if (newName !== null && newName !== '') {
                        entry.option.name = newName;
                        entry.innerHTML = newName;
                        // entry.appendChild(editNameButton);
                        // entry.appendChild(deleteNameButton);
                    }
                });
                entry.appendChild(editNameButton);
                
                var deleteNameButton = document.createElement('button');
                deleteNameButton.innerHTML = '🗑️';
                deleteNameButton.title = 'Delete current Name';
                deleteNameButton.classList.add('deleteNameButton');
                deleteNameButton.addEventListener('click', () => {
                    // const index = options.indexOf(entry.option);
                    // if (index > -1) {
                    //     options.splice(index, 1);
                    // }
                    // this.populate(options, onChange, element, labelFunc);
                    var nameToDelete = entry.option;
                    // nameToDelete.name = undefined; 
                    console.log(nameToDelete);
                    // OmObjectLabelHandler.populateClassDropdown();
                    // delete nameToDelete.name;
                    // entry.appendChild(editNameButton);
                    // entry.appendChild(deleteNameButton);
                    });
                entry.appendChild(deleteNameButton);
            }
        }
    } 

    dropdownMenu.getEntries = function() {
        return Array.from(this.children).filter(child => child.classList.contains('dd-dropdown-entry'));
    }

    dropdownMenu.getEntry = function(option) {
        return this.getEntries().filter(entry => entry.option === option)[0];
    }

    dropdownMenu.addCreateElementInput = function (onConfirm) {
        const createNewElementEditorContainer = document.createElement('div');
        createNewElementEditorContainer.classList.add('dd-dropdown-create-input');
        const createNewElementEditor = document.createElement('input');
        createNewElementEditor.type = 'text';
        createNewElementEditor.placeholder = 'Create new';
        this.confirm = event => onConfirm(event);
        createNewElementEditor.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                this.confirm(event);
            }
        });
        createNewElementEditorContainer.appendChild(createNewElementEditor);
        this.appendChild(createNewElementEditorContainer);
    }

    dropdownMenu.getInputValue = function () {
        const inputElements = dropdownMenu.getElementsByTagName('input');
        return inputElements[0] ? inputElements[0].value : '';
    }

    dropdownMenu.clearInput = function () {
        const inputElements = dropdownMenu.getElementsByTagName('input');
        if (inputElements[0]) {
            inputElements[0].value = '';
        }
    }

    dropdownMenu.focusInput = function () {
        const inputElements = dropdownMenu.getElementsByTagName('input');
        if (inputElements[0]) {
            inputElements[0].focus();
        }
    }

    return dropdownMenu;
}
