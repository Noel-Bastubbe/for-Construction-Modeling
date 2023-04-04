export default function getDropdown(name = "") {
    const dropdownMenu = document.createElement("div");
    dropdownMenu.classList.add("dd-dropdown-menu");

    dropdownMenu.populate = function (
        options,
        onChange,
        element,
        onEdit = (entry, newValue) => {
        },
        onDelete = (entry) => {
        },
        allowEdit = false,
        allowDelete = false,
        labelFunc = (x) => x.name || x
    ) {
        this.innerHTML = "";

        if (name != "") {
            const dropdownTitle = document.createElement("div");
            dropdownTitle.classList.add("dd-dropdown-title");
            dropdownTitle.innerHTML = name;
            this.appendChild(dropdownTitle);
        }
        for (const option of options) {
            const box = document.createElement("div");
            box.classList.add("dd-dropdown-box");
            const entry = document.createElement("div");
            entry.option = option;
            entry.classList.add("dd-dropdown-entry");
            entry.innerHTML = labelFunc(option);
            entry.addEventListener("click", (event) => {
                onChange(option, element, event);
            });
            box.appendChild(entry);
            if (allowDelete && allowEdit) {
                var editButton = document.createElement("button");
                editButton.innerHTML = "🖋️";
                editButton.title = "Edit Entry";
                editButton.classList.add("editButton");
                editButton.addEventListener("click", (event) => {
                    let newValue = prompt('Enter new value:', entry.option.name);
                    if (newValue) {
                        onEdit(entry, newValue);
                    }
                });
                box.appendChild(editButton);
                editButton.style.visibility = "gone";

                var deleteButton = document.createElement("button");
                deleteButton.innerHTML = "🗑️";
                deleteButton.title = "Delete Entry";
                deleteButton.classList.add("deleteButton");
                deleteButton.addEventListener("click", (event) => {
                    onDelete(entry);
                });
                box.appendChild(deleteButton);
                deleteButton.style.visibility = "gone";
            }
            entry.setSelected = function (isSelected) {
                if (isSelected) {
                    this.classList.add("dd-dropdown-entry-selected");
                    if (allowDelete && allowEdit) {
                        this.parentElement.children[1].style.visibility = "visible";
                        this.parentElement.children[2].style.visibility = "visible";
                    }
                } else {
                    this.classList.remove("dd-dropdown-entry-selected");
                    if (allowDelete && allowEdit) {
                        this.parentElement.children[1].style.visibility = "gone";
                        this.parentElement.children[2].style.visibility = "gone";
                    }
                }
            };
            this.appendChild(box);

            // Delete and Edit name button in Objective Model
            //display none
        }
    };

    dropdownMenu.getEntries = function () {
        let boxList = Array.from(this.children).filter((child) =>
            child.classList.contains("dd-dropdown-box")
        );
        return boxList.map((box) =>
            box.firstChild
        );
    };

    dropdownMenu.getEntry = function (option) {
        return this.getEntries().filter((entry) => entry.option === option)[0];
    };

    dropdownMenu.addCreateElementInput = function (onConfirm) {
        const createNewElementEditorContainer = document.createElement("div");
        createNewElementEditorContainer.classList.add("dd-dropdown-create-input");
        const createNewElementEditor = document.createElement("input");
        createNewElementEditor.type = "text";
        createNewElementEditor.placeholder = "Create new";
        this.confirm = (event) => onConfirm(event);
        createNewElementEditor.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                this.confirm(event);
            }
        });
        createNewElementEditorContainer.appendChild(createNewElementEditor);
        this.appendChild(createNewElementEditorContainer);
    };

    dropdownMenu.getInputValue = function () {
        const inputElements = dropdownMenu.getElementsByTagName("input");
        return inputElements[0] ? inputElements[0].value : "";
    };

    dropdownMenu.clearInput = function () {
        const inputElements = dropdownMenu.getElementsByTagName("input");
        if (inputElements[0]) {
            inputElements[0].value = "";
        }
    };

    dropdownMenu.focusInput = function () {
        const inputElements = dropdownMenu.getElementsByTagName("input");
        if (inputElements[0]) {
            inputElements[0].focus();
        }
    };

    return dropdownMenu;
}
