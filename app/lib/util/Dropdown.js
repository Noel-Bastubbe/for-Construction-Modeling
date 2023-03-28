export default function getDropdown(name = '') {
    const dropdownMenu = document.createElement('div');
    dropdownMenu.classList.add('dd-dropdown-menu');

    dropdownMenu.populate = function (options, onChange, element, labelFunc = x => x.name || x, onEdit = {}, onDelete = {}, allowEdit = true, allowDelete = true) {
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
            entry.setSelected = function (isSelected) {
                if (isSelected) {
                    this.classList.add('dd-dropdown-entry-selected');
                } else {
                    this.classList.remove('dd-dropdown-entry-selected');
                }
            }
            this.appendChild(entry);

            // Delete and Edit name button in Objective Model
            if (allowDelete && allowEdit) {
                var editButton = document.createElement('button');
                editButton.innerHTML = '🖋️';
                editButton.title = 'Edit Entry';
                editButton.classList.add('editButton');
                editButton.addEventListener('click', event => {
                    onEdit(option, element, event);
                    // const newName = prompt('Enter new name:', entry.option.name);
                    // if (newName) {
                    //     entry.option.name = newName;
                    //     var nameToChange = entry.firstChild;
                    //     nameToChange.nodeValue = newName;
                    // }
                });
                entry.appendChild(editButton);

                var deleteButton = document.createElement('button');
                deleteButton.innerHTML = '🗑️';
                deleteButton.title = 'Delete Entry';
                deleteButton.classList.add('deleteButton');
                deleteButton.addEventListener('click', event => {
                    onDelete(option, element, event);
                    // this.removeEntry(entry);
                    // entry.option.name = undefined;
                    // entry.remove();
                    // console.log(entry.option);
                });
                entry.appendChild(deleteButton);
            }
        }
    }

    dropdownMenu.getEntries = function () {
        return Array.from(this.children).filter(child => child.classList.contains('dd-dropdown-entry'));
    }

    dropdownMenu.getEntry = function (option) {
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
