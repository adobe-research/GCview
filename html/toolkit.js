// Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var toolkit = function() {
    function createObject(name, parent, className, defaultClassName, children) {
        var obj = document.createElement(name);
        if (parent != null) {
            parent.appendChild(obj);
        }
        if (className == null && defaultClassName != null) {
            className = defaultClassName;
        }

        obj.tSetClassName = function(className) {
            if (className != null) {
                this.className = className;
            }
        }
        obj.tSetClassName(className);
        obj.tSetEnabled = function(enabled) { this.disabled = !enabled;     }
        obj.tEnable     = function()        { this.tSetEnabled(true);       }
        obj.tDisable    = function()        { this.tSetEnabled(false);      }
        obj.tSetOpacity = function(opacity) { this.style.opacity = opacity; }
        obj.tSetDims    = function(width, height) {
            this.style.width  = width;
            this.style.height = height;
        }

        if (children != null) {
            var array = utils.getArray(children);
            for (var index in array) {
                var child = array[index];
                obj.appendChild(child);
            }
        }
        return obj;
    }

    function createDiv(parent, className, children) {
        return createObject('div', parent, className, 'divs', children);
    }
    
    function createReplaceableDiv(parent, className) {
        var div = createDiv(parent, className);

        div.tCurrObj = null;
        div.tReplaceWith = function(obj) {
            if (this.tCurrObj != null) {
                this.removeChild(this.tCurrObj);
            }
            if (obj != null) {
                this.appendChild(obj);
            }
            this.tCurrObj = obj;
        }

        return div;
    }

    function createSelectableDiv(objs, parent, className) {
        var div = createReplaceableDiv(parent, className);

        div.tObjs = objs;
        div.tSelect = function(index) {
            if (index == null) {
                this.tReplaceWith(null);
            } else {
                this.tReplaceWith(this.tObjs[index]);
            }
        }

        return div;
    }

    function createVSeparator(parent, className) {
        return createObject('hr', parent, className, 'vSeparators');
    }

    function createHSeparator(parent, className) {
        return createLabel('', parent, className, 'hSeparators');
    }

    function createSmallHSeparator(parent) {
        return createHSeparator(parent, 'hSeparatorsSmall');
    }

    function createLargeHSeparator(parent) {
        return createHSeparator(parent, 'hSeparatorsLarge');
    }

    function createLineBreak(parent, className) {
        return createObject('br', parent, className, 'lineBreaks');
    }

    function createParagraphBreak(parent, className) {
        return createObject('p', parent, className, 'paragraphBreaks');
    }

    function createLabel(text, parent, className) {
        var obj = createObject('span', parent, className, 'labels');
        obj.tSetText = function(text) {
            if (text != null) {
                this.innerHTML = text;
            }
        }
        obj.tSetText(text);
        return obj;
    }

    function createTitle(text, parent) {
        return createLabel(text, parent, 'titleLabels');
    }

    function createSpaceTitle(text, parent) {
        return createLabel(text, parent, 'spaceTitleLabels');
    }

    function createTableTitle(text, parent) {
        return createLabel(text, parent, 'tableTitleLabels');
    }

    function createKeyLabel(text, parent) {
        return createLabel(text, parent, 'keyLabels');
    }

    function createValueLabel(text, parent) {
        return createLabel(text, parent, 'valueLabels');
    }

    function createUnitLabel(text, parent) {
        return createLabel(text, parent, 'unitLabels');
    }

    function createErrorLabel(text, parent) {
        return createLabel(text, parent, 'errorLabels');
    }

    function createInput(type, parent, className) {
        var obj = createObject('input', parent, className, 'inputs');
        obj.type = type;
        obj.tSetText = function(text) {
            if (text != null) {
                this.value = text;
            }
        }
        return obj;
    }

    function createButton(text, tooltipText, parent, className) {
        var obj = createInput('button', parent, className, 'buttons');
        obj.tSetText(text);

        obj.tSetTooltip = function(tooltipText) {
            if (tooltipText != null) {
                this.title = tooltipText;
            }
        }
        obj.tSetTooltip(tooltipText);

        return obj;
    }

    function createImageButton(imageURL, tooltipText, parent, className) {
        var obj = createInput('button', parent, className, 'imageButtons');

        obj.tSetImageURL = function(imageURL) {
            if (imageURL != null) {
                this.style.backgroundImage = "url('" + imageURL + "')";
            }
        }
        obj.tSetImageURL(imageURL);

        obj.tSetTooltip = function(tooltipText) {
            if (tooltipText != null) {
                this.title = tooltipText;
            }
        }
        obj.tSetTooltip(tooltipText);

        return obj;
    }

    function createCheckbox(parent, className) {
        var obj = createInput('checkbox', parent, className, 'checkboxes');

        obj.tIsChecked = function() { return this.checked; };
        obj.tSetChecked = function(checked) { this.checked = checked; };

        return obj;
    }

    function createTextField(text, parent, className) {
        var obj = createInput('text', parent, className, 'textFields');
        obj.tSetReadOnly = function(readOnly) {
            this.readOnly = readOnly;
        }
        obj.tSetText(text);
        return obj;
    }

    function createPullDownMenu(options, data, parent, selectFunc,
                                className, optionClassName) {
        function createOption(name, parent, className) {
            var obj = createObject('option', parent, className, 'pullDownMenuOptions');
            obj.innerHTML = name;
            return obj;
        }

        var obj = createObject('select', parent, className, 'pullDownMenus');
        var selectedIndex = 0;
        for (var index in options) {
            var option = options[index];
            createOption(option, obj, optionClassName);
        }

        obj.onchange = function() {
            var index = this.selectedIndex;
            selectedIndex = index;
            selectFunc(index, options[index], data[index]);
        }

        obj.tSelectIndex = function(index) {
            this.selectedIndex = index;
            selectedIndex = index;
        }

        obj.tGetSelectedIndex = function() { return selectedIndex; }

        obj.tGetSelectedData = function() { return data[selectedIndex]; }

        return obj;
    }

    function createFileChooser(text, parent, loadFunc) {
        createLabel(text, parent, 'fileChooserLabels');
        createSmallHSeparator(parent);
        var textField = createTextField('', parent, 'fileChooserTextFields');
        textField.tSetReadOnly(true);
        createSmallHSeparator(parent);
        var browseButton = createButton('Browse...', null, parent,
                                        'fileChooserButtons');
        createLargeHSeparator(parent);
        var loadButton = createButton('Load', null, parent,
                                      'fileChooserButtons');
        loadButton.tDisable();

        var fileSelector = createInput('file', parent);
        fileSelector.style.visibility = 'hidden';

        browseButton.onclick = function() {
            fileSelector.click();
        }

        loadButton.onclick = function() {
            var fileName = fileSelector.value;
            var file = fileSelector.files[0];
            loadFunc(fileName, file);
        }

        fileSelector.onchange = function() {
            var fileName = fileSelector.value;
            if (fileName != '') {
                textField.tSetText(fileName);
                loadButton.tEnable();
            }
        }
    }

    function createButtonRange(titleText, labels, tooltipText, selectFunc,
                               parent, buttonClassName, divClassName) {
        labels = utils.getArray(labels);
        tooltipText = utils.getArray(tooltipText);
        if (buttonClassName == null) {
            buttonClassName = 'buttonRangeButtons';
        }
        if (divClassName == null) {
            divClassName = 'buttonRangeDivs';
        }

        var div = createDiv(parent, divClassName);
        var table = createTable(labels.length, div);
        if (titleText != null) {
            var titleLabel = createTableTitle(titleText);
            table.tAddSingleObj(titleLabel, 'titleCells');            
        }

        var buttons = [ ];
        var buttonDiv = createDiv();
        for (var i = 0; i < labels.length; i += 1) {
            var text = null;
            if (tooltipText != null && i < tooltipText.length) {
                text = tooltipText[i];
            }
            var button = createButton(labels[i], text,
                                      buttonDiv, buttonClassName);
            button.onclick = function() {
                var index = i;
                function doIt() {
                    div.tSelect(index);
                }
                return doIt;
            }();
            buttons[i] = button;
        }
        table.tAddSingleObj(buttonDiv);

        div.tSelectedIndex = 0;
        buttons[0].tDisable();

        div.tSelect = function(index) {
            buttons[this.tSelectedIndex].tEnable();
            this.tSelectedIndex = index;
            buttons[this.tSelectedIndex].tDisable();
            selectFunc(index);
        }

        return div;
    }

    function createTableRow(parent, className, children) {
        return createObject('tr', parent, className, 'tableRows', children);
    }

    function createTableCell(parent, className, children) {
        var obj = createObject('td', parent, className, 'tableCells', children);

        obj.tSetColSpan = function(cols) { this.colSpan = cols; }

        return obj;
    }

    function createTable(colNum, parent, className, children) {
        var obj = createObject('table', parent, className, 'tables', children);

        obj.tRows = [ ];
        if (colNum != null) {
            obj.tColNum = colNum;
        }

        obj.tAddRow = function(row) {
            this.appendChild(row);
            this.tRows.push(row);
        }

        obj.tAddCells = function(cells, rowClassName) {
            this.tAddRow(createTableRow(null, rowClassName, cells));
        }

        obj.tAddObjs = function(objs, cellClassName, rowClassName) {
            var cells = [ ];
            objs = utils.getArray(objs);
            for (var index = 0; index < objs.length; index += 1) {
                cells.push(createTableCell(null, cellClassName, objs[index]));
            }
            this.tAddCells(cells, rowClassName);
        }

        obj.tAddSingleObj = function(obj, cellClassName, rowClassName) {
            var cell = createTableCell(null, cellClassName, obj);
            cell.tSetColSpan(this.tColNum);
            this.tAddCells(cell, rowClassName);
        }

        obj.tEmpty = function() {
            for (var index in this.tRows) {
                var row = this.tRows[index];
                this.removeChild(row);
            }
            this.tRows = [ ];
        }

        return obj;
    }

    function createKeyValueTable(parent, className) {
        if (className == null) {
            className = 'keyValueTables';
        }
        var obj = createTable(3, parent, className);
        obj.tValueLabels = [ ];

        obj.tAddTitle = function(titleText) {
            var titleLabel = createTableTitle(titleText);
            this.tAddSingleObj(titleLabel, 'titleCells');
        }

        obj.tAddKeyValue = function(keyText, valueText, unitText,
                                    valueCellClassName) {
            var keyLabel = createKeyLabel(keyText);
            var keyCell = createTableCell(null, 'keyCells', keyLabel);

            var valueLabel = createValueLabel(valueText);
            this.tValueLabels.push(valueLabel);
            if (valueCellClassName == null) {
                valueCellClassName = 'valueCells';
            }
            var valueCell = createTableCell(null, valueCellClassName, valueLabel);

            var unitLabel = null;
            if (unitText != null) {
                unitLabel = createUnitLabel(unitText);
            }
            var unitCell = createTableCell(null, 'unitCells', unitLabel);

            this.tAddCells([ keyCell, valueCell, unitCell ]);
        }

        obj.tAddKeyObj = function(keyText, obj, objClassName) {
            var keyLabel = createKeyLabel(keyText);
            var keyCell = createTableCell(null, 'keyCells', keyLabel);

            var objCell = createTableCell(null, objClassName, obj);

            var unitCell = createTableCell(null, 'unitCells');

            this.tAddCells([ keyCell, objCell, unitCell ]);
        }

        obj.tSetValueText = function(index, valueText) {
            this.tValueLabels[index].tSetText(valueText);
        }

        obj.tParentEmpty = obj.tEmpty;
        obj.tEmpty = function() {
            this.tParentEmpty();
            this.tValueLabels = [ ];
        }

        return obj;
    }

    return {
        createDiv              : createDiv,
        createReplaceableDiv   : createReplaceableDiv,
        createSelectableDiv    : createSelectableDiv,

        createVSeparator       : createVSeparator,
        createSmallHSeparator  : createSmallHSeparator,
        createLargeHSeparator  : createLargeHSeparator,

        createLineBreak        : createLineBreak,
        createParagraphBreak   : createParagraphBreak,

        createLabel            : createLabel,
        createTableTitle       : createTableTitle,
        createKeyLabel         : createKeyLabel,
        createValueLabel       : createValueLabel,
        createUnitLabel        : createUnitLabel,
        createSpaceTitle       : createSpaceTitle,
        createTitle            : createTitle,
        createErrorLabel       : createErrorLabel,

        createButton           : createButton,
        createImageButton      : createImageButton,
        createCheckbox         : createCheckbox,
        createTextField        : createTextField,
        createPullDownMenu     : createPullDownMenu,
        createFileChooser      : createFileChooser,

        createButtonRange      : createButtonRange,

        createTableRow         : createTableRow,
        createTableCell        : createTableCell,
        createTable            : createTable,
        createKeyValueTable    : createKeyValueTable
    };
}();
