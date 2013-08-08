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

var gcviewConstructor = function() {
    var gcview = null;

    var customization = function() {
        var eventNameFormatter = {
            transform : function(eventName) {
                return gcview.eventPresentationNames[eventName];
            },
            format : function(eventName) { return eventName; },
            unitSec : ''
        };

        var DefaultGCviewDataCustomization = {
            Groups : { null : { SlotName : 'Event ID',
                                Labels   : 'Event Name' } },

            Data : {
                'Event' : {
                    Formatter : eventNameFormatter
                },
                'Elapsed Time' : {
                    Formatter : customizationShared.secFromSecFormatter
                },
                'Actual Elapsed Time' : {
                    Formatter : customizationShared.secFromSecFormatter
                },
                'Last Data Collection Time' : {
                    Formatter : customizationShared.msFromSecFormatter
                },
                'Total Data Collection Time' : {
                    Formatter : customizationShared.secFromSecFormatter
                },
                'Event Name' : {
                    Formatter : eventNameFormatter,
                    ExcludeFromMenu : true
                }
                
            }
        };

        var cust = this['gcviewCustomization'];
        if (cust == null) {
            cust = { };
        }
        if (!cust.hasOwnProperty('Spaces')) {
            cust['Spaces'] = { };
        }
        if (!cust.Spaces.hasOwnProperty('GCview Data')) {
            cust.Spaces['GCview Data'] = DefaultGCviewDataCustomization;
        }

        var getAttr = function(attrs, defaultValue) {
            attrs = utils.getArray(attrs);
            var curr = cust;
            for (var i = 0; i < attrs.length; i += 1) {
                var attrName = attrs[i];
                if (curr.hasOwnProperty(attrName)) {
                    curr = curr[attrName];
                } else {
                    return defaultValue;
                }
            }
            return curr;
        }

        var getEventAttrValue = function(eventName, attrName, defaultValue) {
            return getAttr([ 'Events', eventName, attrName ], defaultValue);
        }

        var getSpaceAttrValue = function(spaceName, attrName, defaultValue) {
            return getAttr([ 'Spaces', spaceName, attrName ], defaultValue);
        }

        var getGroupAttrValue = function(spaceName, groupName,
                                         attrName, defaultValue) {
            return getAttr([ 'Spaces', spaceName, 'Groups', groupName, attrName ],
                           defaultValue);
        }

        var getDataAttrValue = function(spaceName, dataName,
                                        attrName, defaultValue) {
            return getAttr([ 'Spaces', spaceName, 'Data', dataName, attrName ],
                           defaultValue);
        }

        // Event Attributes

        var getEventPresentationName = function(eventName) {
            return getEventAttrValue(eventName, 'Name', eventName);
        }

        // Space Attributes

        var getSpacePresentationName = function(spaceName) {
            return getSpaceAttrValue(spaceName, 'Name', spaceName);
        }

        var shouldExpandAtStart = function(spaceName) {
            return getSpaceAttrValue(spaceName, 'ExpandAtStart', false);
        }

        var getSpaceHistograms = function(spaceName) {
            return getSpaceAttrValue(spaceName, 'Histograms', null);
        }

        // Group Attributes

        var getGroupPresentationName = function(spaceName, groupName) {
            return getGroupAttrValue(spaceName, groupName, 'Name', groupName);
        }

        var getSlotName = function(spaceName, groupName) {
            return getGroupAttrValue(spaceName, groupName, 'SlotName', 'Slot');
        }

        var getGroupLabelName = function(spaceName, groupName) {
            return getGroupAttrValue(spaceName, groupName, 'Labels', null);
        }

        // Data Attributes

        var getDataPresentationName = function(spaceName, dataName) {
            return getDataAttrValue(spaceName, dataName, 'Name', dataName);
        }

        var shouldAddDataToTable = function (spaceName, dataName) {
            return !getDataAttrValue(spaceName, dataName,
                                     'ExcludeFromTable', false);
        }

        var shouldAddDataToMenu = function(spaceName, dataName) {
            return !getDataAttrValue(spaceName, dataName,
                                     'ExcludeFromMenu', false);
        };

        var getDataFormatter = function(spaceName, dataName) {
            return getDataAttrValue(spaceName, dataName, 'Formatter', null);
        }

        var getMaxValue = function(spaceName, dataName) {
            return getDataAttrValue(spaceName, dataName, 'MaxValue', null);
        }

        return {
            getEventPresentationName   : getEventPresentationName,

            getSpacePresentationName   : getSpacePresentationName,
            shouldExpandAtStart        : shouldExpandAtStart,
            getSpaceHistograms         : getSpaceHistograms,

            getGroupPresentationName   : getGroupPresentationName,
            getSlotName                : getSlotName,
            getGroupLabelName          : getGroupLabelName,

            getDataPresentationName    : getDataPresentationName,
            shouldAddDataToTable       : shouldAddDataToTable,
            shouldAddDataToMenu        : shouldAddDataToMenu,
            getDataFormatter           : getDataFormatter,
            getMaxValue                : getMaxValue
        };
    }();

    function Data(id, name, spaceName, dataType, isArray,
                  groupName, enumMembers, value) {
        this.id = id;
        this.name = name;
        this.dataType = dataType;
        this.isArray = isArray;
        this.groupName = groupName;
        this.enumMembers = enumMembers;
        this.value = value;

        var valueCellClassNames = {
            Bool   : 'boolValueCells',
            Byte   : 'byteValueCells',
            Int    : 'intValueCells',
            Double : 'doubleValueCells',
            String : 'stringValueCells',
            Enum   : 'enumValueCells'
        };

        this.getValueStr = function(index) {
            var val = null;
            if (index == null) {
                val = this.value;
            } else {
                val = this.value[index];
            }
            if (val == null) {
                return '<null>';
            }
            if (this.enumMembers != null) {
                val = this.enumMembers[val];
            }
            if (this.formatter == null) {
                return String(val);
            } else {
                val = this.formatter.transform(val);
                return this.formatter.format(val);
            }
        };

        this.getUnitStr = function() {
            if (this.formatter == null) {
                return '';
            } else {
                return this.formatter.unitStr;
            }
        }

        this.getValueCellClassName = function() {
            return valueCellClassNames[this.dataType];
        }

        // Look-and-feel and customization

        this.presentationName =
            customization.getDataPresentationName(spaceName, name);
        this.shouldAddToTable =
            customization.shouldAddDataToTable(spaceName, name);
        this.shouldAddToMenu =
            customization.shouldAddDataToMenu(spaceName, name);
        this.formatter = customization.getDataFormatter(spaceName, name);
        this.maxValue = customization.getMaxValue(spaceName, name);

        var groupPrefix = '';
        if (this.groupName != null) {
            groupPrefix = '[' + this.groupName + '] ';
        }
        this.nameWithGroupPrefix = groupPrefix + this.presentationName;
    }

    function Space(id, name) {
        this.id = id;
        this.name = name;
        this.data = [ ];
        this.dataDict = { };
        this.groups = [ ];

        this.addData = function(data) {
            this.data[data.id] = data;
            this.dataDict[data.name] = data;

            var groupName = data.groupName;
            if (!utils.arrayContains(this.groups, groupName)) {
                this.groups.push(groupName);
                this.dataForValueTable[groupName] = [ ];
                this.dataForArrayTable[groupName] = [ ];
                this.groupPresentationNames[groupName] =
                    customization.getGroupPresentationName(name, groupName);
                this.slotNames[groupName] =
                    customization.getSlotName(name, groupName);
                this.groupLabelNames[groupName] =
                    customization.getGroupLabelName(name, groupName);
            }
            if (data.shouldAddToTable) {
                if (!data.isArray) {
                    this.dataForValueTable[groupName].push(data);
                } else {
                    this.dataForArrayTable[groupName].push(data);
                }
            }
            if (data.shouldAddToMenu) {
                if (data.isArray) {
                    this.dataForArrayMenu.push(data);
                }
            }
        };

        this.findData = function(dataName) {
            return this.dataDict[dataName];
        }

        // Look-and-feel and customization

        this.presentationName = customization.getSpacePresentationName(name);
        this.slotNames = { };
        this.groupPresentationNames = { };
        this.groupLabelNames = { };
        this.dataForValueTable = { };
        this.dataForArrayTable = { };
        this.dataForArrayMenu = [ ];
        this.needsArrayPanels = function() {
            return this.dataForArrayMenu.length > 0;
        };
        this.shouldExpandAtStart = customization.shouldExpandAtStart(name);
        this.histograms = customization.getSpaceHistograms(name);
    }

    function GCview() {
        this.spaces = [ ];
        this.spacesDict = { };
        this.eventNames = [ ];

        this.addSpace = function(space) {
            this.spaces[space.id] = space;
            this.spacesDict[space.name] = space;
        };

        this.getData = function(spaceID, dataID) {
            return this.spaces[spaceID].data[dataID];
        };

        this.setValue = function(spaceID, dataID, value) {
            this.getData(spaceID, dataID).value = value;
        };

        this.findSpaceDataID = function(spaceName, dataName) {
            var spaceID = null;
            var dataID = null;
            if (this.spacesDict.hasOwnProperty(spaceName)) {
                var space = this.spacesDict[spaceName];
                spaceID = space.id;
                var dataDict = space.dataDict;
                if (dataDict.hasOwnProperty(dataName)) {
                    var datum = dataDict[dataName];
                    dataID = datum.id;
                }
            }
            return { spaceID : spaceID,
                     dataID  : dataID };
        };

        this.findSpaceData = function(spaceName, dataName) {
            var ids = this.findSpaceDataID(spaceName, dataName);
            return this.getData(ids.spaceID, ids.dataID);
        }

        this.findSpaceDataValue = function(spaceName, dataName) {
            return this.findSpaceData(spaceName, dataName).value;
        }

        this.addEvent = function(eventID, eventName) {
            this.eventNames[eventID] = eventName;
            this.eventPresentationNames[eventName] =
                             customization.getEventPresentationName(eventName);
        }

        // Look-and-feel and customization
        this.eventPresentationNames = { };
    }

    function setupGCview(jsonObj) {
        var jsonMetadataObj = jsonObj.GCviewMetadata;
        var jsonSpaces = jsonMetadataObj.Spaces;

        gcview = new GCview();
        for (var i = 0; i < jsonSpaces.length; i += 1) {
            var jsonSpace = jsonSpaces[i];
            var spaceID = jsonSpace.ID;
            var spaceName = jsonSpace.Name;
            var jsonData = jsonSpace.Data;
            var space = new Space(spaceID, spaceName);
            for (var j = 0; j < jsonData.length; j += 1) {
                var jsonDatum = jsonData[j];
                var dataID = jsonDatum.ID;
                var dataName = jsonDatum.Name;
                var dataType = jsonDatum.DataType;
                var isArray = jsonDatum.IsArray;
                var groupName = null;
                if (jsonDatum.hasOwnProperty('Group')) {
                    groupName = jsonDatum.Group;
                }
                var enumMembers = null;
                if (jsonDatum.hasOwnProperty('Members')) {
                    enumMembers = jsonDatum.Members;
                }
                var value = jsonDatum.Value;
                var datum = new Data(dataID, dataName, spaceName,
                                     dataType, isArray,
                                     groupName, enumMembers, value);
                space.addData(datum);
            }
            gcview.addSpace(space);
        }

        var eventNames =
            gcview.findSpaceDataValue('GCview Data', 'Event Name');
        for (var i = 0; i < eventNames.length; i += 1) {
            gcview.addEvent(i, eventNames[i]);
        }
    }

    function updateGCview(jsonObj) {
        var jsonData = jsonObj.GCviewData;
        if (jsonData != null) {
            for (var i = 0; i < jsonData.length; i += 1) {
                var dataArray = jsonData[i];
                if (dataArray != null) {
                    for (var j = 0; j < dataArray.length; j += 1) {
                        var value = dataArray[j];
                        if (value != null) {
                            gcview.setValue(i, j, value);
                        }
                    }
                }
            }
        }
    }

    function createPlayer(jsonArray) {
        var LONG_STEP = 25;

        var index = null;
        var jsonDataObjs = null;
        var playing = false;
        var timeout = null;
        var slow = false;
        var speed = 2;
        var currEventElapsedTimeMS = null;
        var eventData = null;
        var elapsedTimeIDs = null;
        var pauseAfterFlags = [ ];

        var firstButton = toolkit.createImageButton(
            'icons/FirstButton.png', 'Go To First Event',
            null, 'navigationButtons');
        var prevLongButton = toolkit.createImageButton(
            'icons/Prev25Button.png', 'Go To -' + LONG_STEP + ' Event',
            null, 'navigationButtons');
        var prevButton = toolkit.createImageButton(
            'icons/PrevButton.png', 'Got To -1 Event',
            null, 'navigationButtons');
        var playPauseButton = toolkit.createImageButton(
            null, '', null, 'navigationButtons');
        var nextButton = toolkit.createImageButton(
            'icons/NextButton.png', 'Go To +1 Event',
            null, 'navigationButtons');
        var nextLongButton = toolkit.createImageButton(
            'icons/Next25Button.png', 'Go To +' + LONG_STEP + ' Event',
            null, 'navigationButtons');
        var lastButton = toolkit.createImageButton(
            'icons/LastButton.png', 'Go To Last Event',
            null, 'navigationButtons');

        var speedButtonRange = toolkit.createButtonRange(
            'Playback Speed',
            [ '--', '-', '0', '+', '++' ],
            [ 'Slowest Speed', 'Slower Speed', 
              'Normal Speed',
              'Faster Speed', 'Fastest Speed' ],
            updateSpeed);
        speedButtonRange.tSelect(speed);

        firstButton.onclick = doFirstEvent;
        prevLongButton.onclick = doPrevLongEvent;
        prevButton.onclick = doPrevEvent;
        playPauseButton.onclick = playPauseClick;
        nextButton.onclick = doNextEvent;
        nextLongButton.onclick = doNextLongEvent;
        lastButton.onclick = doLastEvent;

        function getControlButtons() {
            return { firstButton      : firstButton,
                     prevLongButton   : prevLongButton,
                     prevButton       : prevButton,
                     playPauseButton  : playPauseButton,
                     nextButton       : nextButton,
                     nextLongButton   : nextLongButton,
                     lastButton       : lastButton,
                     speedButtonRange : speedButtonRange };
        }

        function getPauseAfterCheckboxes() {
            eventData = gcview.findSpaceData('GCview Data', 'Event');

            var pauseAfterCheckboxes = [ ];
            var eventNames = gcview.eventNames;
            for (var i = 0; i < eventNames.length; i += 1) {
                var eventName = eventNames[i];
                var checkbox = toolkit.createCheckbox();
                checkbox.onclick = function() {
                    var index = i;
                    function doIt() {
                        pauseAfterFlags[index] = this.tIsChecked();
                    }
                    return doIt;
                }();

                pauseAfterFlags[i] = false;
                var eventPresentationName = gcview.eventPresentationNames[eventName];
                pauseAfterCheckboxes[i] = {
                    eventName : eventPresentationName,
                    checkbox  : checkbox
                };
            }

            return pauseAfterCheckboxes;
        }

        function getElapsedTimeMS(jsonObj) {
            return 1000.0 * jsonObj.GCviewData[elapsedTimeIDs.spaceID][elapsedTimeIDs.dataID];
        }

        function updatePlayPauseButton(text, enabled) {
            if (text == 'Play') {
                playPauseButton.tSetImageURL('icons/PlayButton.png');
            } else {
                playPauseButton.tSetImageURL('icons/PauseButton.png');
            }
            playPauseButton.tSetTooltip(text);
            playPauseButton.tSetEnabled(enabled);
        }

        function updateFirstButton(enabled) {
            firstButton.tSetEnabled(enabled);
        }

        function updatePrevLongButton(enabled) {
            prevLongButton.tSetEnabled(enabled);
        }

        function updatePrevButton(enabled) {
            prevButton.tSetEnabled(enabled);
        }

        function updateNextButton(enabled) {
            nextButton.tSetEnabled(enabled);
        }

        function updateNextLongButton(enabled) {
            nextLongButton.tSetEnabled(enabled);
        }

        function updateLastButton(enabled) {
            lastButton.tSetEnabled(enabled);
        }

        function updateButtons() {
            if (index == -1) {
                updateFirstButton(false);
                updatePrevLongButton(false);
                updatePrevButton(false);
                updatePlayPauseButton('Play', false);
                updateNextButton(false);
                updateNextLongButton(false);
                updateLastButton(false);
            } else {
                updateFirstButton(index > 0);
                updateLastButton(index < jsonDataObjs.length - 1);
                if (playing) {
                    updatePlayPauseButton('Pause', true);
                    updatePrevLongButton(false);
                    updatePrevButton(false);
                    updateNextButton(false);
                    updateNextLongButton(false);
                } else {
                    if (index > 0) {
                        updatePrevButton(true);
                        updatePrevLongButton(true);
                    } else  {
                        updatePrevButton(false);
                        updatePrevLongButton(false);
                    }
                    if (index < jsonDataObjs.length - 1) {
                        updatePlayPauseButton('Play', true);
                        updateNextButton(true);
                        updateNextLongButton(true);
                    } else  {
                        updatePlayPauseButton('Play', false);
                        updateNextButton(false);
                        updateNextLongButton(false);
                    }
                }
            }
        }

        function doEvent() {
            var jsonObj = jsonDataObjs[index];
            currEventElapsedTimeMS = getElapsedTimeMS(jsonObj);
            updateGCview(jsonObj);
            updateVis();
        }

        function clearNextEvent() {
            if (timeout != null) {
                window.clearInterval(timeout);
                timeout = null;
            }
        }

        function scheduleNextEvent() {
            var nextIndex = index + 1;
            if (nextIndex < jsonDataObjs.length) {
                var jsonObj = jsonDataObjs[nextIndex];
                var nextEventElapsedTimeMS = getElapsedTimeMS(jsonObj);
                var intervalMS = nextEventElapsedTimeMS - currEventElapsedTimeMS;
                intervalMS = getAdjustedIntervalMS(intervalMS);
                timeout = window.setTimeout(doNextEvent, intervalMS);
            } else {
                playing = false;
            }
            updateButtons();
        }

        function doFirstEvent() {
            index = 0;
            playing = false;
            clearNextEvent();
            doEvent();
            postEvent();
        }

        function doPrevLongEvent() {
            index -= LONG_STEP;
            index = Math.max(index, 0);
            doEvent();
            postEvent();
        }

        function doPrevEvent() {
            index -= 1;
            doEvent();
            postEvent();
        }

        function doNextEvent() {
            index += 1;
            doEvent();
            postEvent();
        }

        function doNextLongEvent() {
            index += LONG_STEP;
            index = Math.min(index, jsonDataObjs.length - 1);
            doEvent();
            postEvent();
        }

        function doLastEvent() {
            index = jsonDataObjs.length - 1;
            clearNextEvent();
            doEvent();
            postEvent();
        }

        function postEvent() {
            if (pauseAfterFlags[eventData.value]) {
                playing = false;
            }
            if (playing) {
                scheduleNextEvent();
            } else {
                updateButtons();
            }
        }

        function playPauseClick() {
            if (playing) {
                // Pause request
                playing = false;
                clearNextEvent();
                updateButtons();
            } else {
                // Play request
                playing = true;
                scheduleNextEvent();
            }
        }

        function updateSpeed(index) {
            speed = index;
            if (playing) {
                clearNextEvent();
                scheduleNextEvent();
            }
        }

        function getAdjustedIntervalMS(intervalMS) {
            intervalMS = Math.max(0.0, intervalMS);

            switch (speed) {
            case 0: return 3 * intervalMS + 250;
            case 1: return 3 * intervalMS;
            case 2: return intervalMS;
            case 3: return intervalMS / 3;
            case 4: return 0;
            }
        }

        function start() {
            setupGCview(jsonArray[0]);
            setupVis();
            elapsedTimeIDs = gcview.findSpaceDataID('GCview Data',
                                                     'Actual Elapsed Time');

            index = -1;
            currEventTimeMS = 0.0;
            jsonDataObjs = jsonArray.slice(1, jsonArray.length);
            if (playing) {
                postEvent();
            } else {
                if (jsonDataObjs.length > 0) {
                    doNextEvent();
                }
            }
        }

        return {
            getControlButtons       : getControlButtons,
            getPauseAfterCheckboxes : getPauseAfterCheckboxes,

            start                   : start
        };
    }

    var MIN_CHART_WIDTH =  200;
    var MAX_CHART_WIDTH = 1400;
    var CHART_HEIGHT    =  175;

    function calcChartWidth() {
        var widthHint = Math.floor(window.innerWidth * 4 / 10);
        var width = widthHint;
        width = Math.min(width, MAX_CHART_WIDTH);
        width = Math.max(width, MIN_CHART_WIDTH);

        return width;
    }

    var leftMainDiv = null;
    var rightMainDiv = null;
    var errorDiv = null;
    var player = null;

    function replaceMainDivs() {
        var newLeftMainDiv = toolkit.createDiv(null, 'leftMainDiv');
        leftMainDiv.parentNode.replaceChild(newLeftMainDiv, leftMainDiv);
        leftMainDiv = newLeftMainDiv;

        var newRightMainDiv = toolkit.createDiv(null, 'rightMainDiv');
        rightMainDiv.parentNode.replaceChild(newRightMainDiv, rightMainDiv);
        rightMainDiv = newRightMainDiv;
    }

    function error(text) {
        toolkit.createParagraphBreak(errorDiv);
        toolkit.createErrorLabel('ERROR: ' + text, errorDiv);
    }

    function setup() {
        var parent = document.body;
        var topLevelDiv = toolkit.createDiv(parent, 'topLevelDiv');

        var mainTable = toolkit.createTable(2, topLevelDiv, 'mainTable');
        var leftTable = toolkit.createTable(1);
        var rightTable = toolkit.createTable(1);
        mainTable.tAddObjs([ leftTable, rightTable ], 'topAlignedTableCells');

        var titleDiv = toolkit.createDiv(null, 'titleDiv');
        var title = toolkit.createTitle('GCview', titleDiv);
        leftTable.tAddObjs(titleDiv);
        leftMainDiv = toolkit.createDiv(null, 'leftMainDiv');
        leftTable.tAddObjs(leftMainDiv);

        errorDiv = toolkit.createDiv(null, 'errorDiv');
        rightTable.tAddObjs(errorDiv);
        rightMainDiv = toolkit.createDiv(null, 'rightMainDiv');
        rightTable.tAddObjs(rightMainDiv);
    }

    function init(postInitFunc) {
        postInitFunc();
    }

    function setupQuestion() {
        function readFile(fileName, file) {
            function parseJSONStr(jsonStr) {
                replaceMainDivs();
                toolkit.createLabel('Parsing Trace...', leftMainDiv);

                try {
                    var jsonArray = eval('(' + jsonStr + ')');
                    processTrace(jsonArray);
                } catch (err) {
                    error('[' + err.name + '] ' + err.message);
                }
            }

            function processTrace(jsonArray) {
                replaceMainDivs();
                toolkit.createLabel('Processing Trace...', leftMainDiv);

                var prevSpaceArray = null;
                for (var i = 0; i < jsonArray.length; i += 1) {
                    var jsonObj = jsonArray[i];
                    if (jsonObj.hasOwnProperty('GCviewMetadata')) {
                        var spacesArray = [ ];
                        var metadata = jsonObj.GCviewMetadata;
                        var jsonSpaces = metadata.Spaces;
                        for (var sid = 0; sid < jsonSpaces.length; sid += 1) {
                            var dataArray = [ ];
                            var spaceID = jsonSpaces[sid].ID;
                            var jsonData = jsonSpaces[sid].Data;
                            for (var did = 0; did < jsonData.length; did += 1) {
                                var valueID = jsonData[did].ID;
                                var value = jsonData[did].Value;
                                dataArray[valueID] = value;
                            }
                            spacesArray[spaceID] = dataArray;
                        }
                        prevSpaceArray = spacesArray;
                    } else if (jsonObj.hasOwnProperty('GCviewData')) {
                        var spaceArray = jsonObj.GCviewData;
                        if (spaceArray == null) {
                            jsonObj.GCviewData = prevSpaceArray;
                        } else {
                            for (var sid = 0; sid < spaceArray.length; sid += 1) {
                                var dataArray = spaceArray[sid];
                                if (dataArray == null) {
                                    spaceArray[sid] = prevSpaceArray[sid];
                                } else {
                                    for (var did = 0; did < dataArray.length; did += 1) {
                                        var data = dataArray[did];
                                        if (data == null) {
                                            dataArray[did] = prevSpaceArray[sid][did];
                                        }
                                    }
                                }
                            }
                        } 
                        prevSpaceArray = jsonObj.GCviewData;
                    }
                }

                playTrace(jsonArray);
            }

            function playTrace(jsonArray) {
                player = createPlayer(jsonArray);
                player.start();
            }

            replaceMainDivs();
            toolkit.createLabel('Reading Trace: ' + fileName + '...', leftMainDiv);
            var reader = new FileReader();
            reader.onload = function(event) {
                parseJSONStr(event.target.result);
            }
            reader.onerror = function(event) {
                error('Could not load file: ' + fileName);
            }
            reader.readAsText(file);
        }

        replaceMainDivs();
        var fileChooser = toolkit.createFileChooser('Choose Trace File:',
                                                    leftMainDiv, readFile);
    }

    // TODO: return div instead of object?
    // TODO: do the interaction differently?
    function createTilePanel(updateSpacePanel, showArrayTable) {
        var MIN_WIDTH = 100;
        var MAX_WIDTH = 1000;
        var BORDER_GAP = 5;
        var TILE_WIDTH = 7;
        var TILE_HEIGHT = 14;
        var TILE_GAP = 2;
        var TILE_FILL = 'DimGray';
        var SELECTED_STROKE = 'White';
        var SELECTED_STROKE_WIDTH = 2;
        var MOUSEOVER_STROKE = 'DarkGray';
        var MOUSEOVER_STROKE_WIDTH = 2;

        var div = toolkit.createDiv(null, 'tilePanelDivs');
        var svg = svgtoolkit.createSVG(div);
        var backgroundRect = svgtoolkit.createRect(svg);
        backgroundRect.tSetPos(0, 0);
        backgroundRect.tSetFillOpacity(0);

        backgroundRect.addEventListener('click', function() {
            updateSelection();
        });

        var tiles = [ ];
        var cols = 0;
        var rows = 0;
        var width = 0;
        var height = 0;
        var selectedIndex = null;

        function calcDimensions(widthHint, num) {
            num = Math.max(num, 1);
            width = widthHint;
            width = Math.min(width, MAX_WIDTH);
            width = Math.max(width, MIN_WIDTH);

            cols = Math.floor((width - 2 * BORDER_GAP + TILE_GAP) / (TILE_WIDTH + TILE_GAP));
            rows = Math.ceil(num / cols);

            height = 2 * BORDER_GAP + rows * TILE_HEIGHT + (rows - 1) * TILE_GAP;
        }

        function updateSelection(index) {
            if (index != selectedIndex) {
                unselectTile(selectedIndex);
                selectTile(index);
                selectedIndex = index;
                updateSpacePanel();
            }
            showArrayTable(selectedIndex != null);
        }

        function selectTile(index) {
            if (index != null) {
                tiles[index].tSetStroke(SELECTED_STROKE,
                                        SELECTED_STROKE_WIDTH);                
            }
        }

        function mouseOverTile(index) {
            if (index != null) {
                tiles[index].tSetStroke(MOUSEOVER_STROKE,
                                        MOUSEOVER_STROKE_WIDTH);
            }
        }

        function unselectTile(index) {
            if (index != null) {
                tiles[index].tSetStroke(null, 0);
            }
        }

        function createTile(index) {
            var tile = svgtoolkit.createRect(svg);
            tile.tSetDims(TILE_WIDTH, TILE_HEIGHT);
            tile.tSetFill(TILE_FILL);
            tile.tSetStroke(null, 0);

            tile.addEventListener('click', function() {
                updateSelection(index);
            });
            tile.addEventListener('mouseover', function() {
                if (index != selectedIndex) {
                    mouseOverTile(index);
                }
            });
            tile.addEventListener('mouseout', function() {
                if (index != selectedIndex) {
                    unselectTile(index);
                }
            });
            return tile;
        }

        var paintTiles = function() {
            var Color = function(r, g, b) {
                this.r = r;
                this.b = b;
                this.g = g;

                this.generateStr = function() {
                    var resStr = 'rgb(' + this.r + ',' + this.g + ',' + this.b + ')';
                    return resStr;
                }
            }

            var BLACK   = new Color(  0,   0,   0);
            var RED     = new Color(250,  20,  20);
            var GREEN   = new Color( 20, 250,  20);
            var BLUE    = new Color( 20,  20, 250);
            var YELLOW  = new Color(250, 250,  20);
            var MAGENTA = new Color(250,  20,  20);
            var CYAN    = new Color( 20, 250, 250);
            var WHITE   = new Color(250, 250, 250);

            var DATA_COLORS = {
                Bool   : { lo : BLACK,             hi : WHITE },
                Byte   : { lo : BLACK, med : BLUE, hi : RED   },
                Int    : { lo : BLACK, med : BLUE, hi : RED   },
                Double : { lo : BLACK, med : BLUE, hi : RED   },
                String : { lo : BLACK                         },
                Enum   : [ RED, GREEN, BLUE, YELLOW, MAGENTA, WHITE, BLACK ]
            };

            function calcColor(ratio, fromColor, toColor) {
                var rDiff = toColor.r - fromColor.r;
                var gDiff = toColor.g - fromColor.g;
                var bDiff = toColor.b - fromColor.b;
                return new Color(Math.floor(fromColor.r + ratio * rDiff),
                                 Math.floor(fromColor.g + ratio * gDiff),
                                 Math.floor(fromColor.b + ratio * bDiff));
            }

            function getFillColorStr(colors, value, max) {
                var ratio = (max != 0) ? value / max : 0.0;
                ratio = Math.max(ratio, 0.0);
                ratio = Math.min(ratio, 1.0);

                var color = null;
                if (colors.lo) {
                    if (colors.hi) {
                        if (colors.med) {
                            // low -> medium -> high
                            if (ratio < 0.5) {
                                color = calcColor(2.0 * ratio,
                                                  colors.lo, colors.med);
                            } else {
                                color = calcColor(2.0 * (ratio - 0.5),
                                                  colors.med, colors.hi);
                            }
                        } else {
                            // low -> high
                            color = calcColor(ratio, colors.lo, colors.hi);
                        }
                    } else {
                        // only low
                        color = colors.lo;
                    }
                } else {
                    // enum
                    var index = Math.min(value, colors.length - 1);
                    color = colors[index];
                }

                return color.generateStr();
            }

            function doIt(datum) {
                var colors = DATA_COLORS[datum.dataType];
                var origArray = datum.value;
                var max = null;
                var array = null;

                switch (datum.dataType) {
                case 'Bool':
                    array = [ ];
                    for (var i = 0; i < origArray.length; i += 1) {
                        if (!origArray[i]) {
                            array[i] = 0;
                        } else {
                            array[i] = 1;
                        }
                    }
                    max = 1;
                    break;

                case 'Byte':
                case 'Int':
                case 'Double':
                    array = origArray;
                    max = datum.maxValue;
                    if (max == null) {
                        for (var i = 0; i < origArray.length; i += 1) {
                            if (max == null || origArray[i] > max) {
                                max = origArray[i];
                            }
                        }
                    }
                    break;

                case 'String':
                    array = [ ];
                    for (var i = 0; i < origArray.length; i += 1) {
                        array[i] = 0;
                    }
                    max = 0;
                    break;

                case 'Enum':
                    array = origArray;
                    max = datum.enumMembers.length - 1;
                    break;
                }

                for (var i = 0; i < array.length; i += 1) {
                    var colorStr = getFillColorStr(colors, array[i], max);
                    tiles[i].tSetFill(colorStr);
                }
            }

            return doIt;
        }();

        function resize(width) {
            // TODO:
        }

        function update(datum) {
            var array = null;
            if (datum != null) {
                array = datum.value;
            }

            var num = 0;
            if (array != null) {
                num = array.length;
            }

            var widthHint = Math.floor(window.innerWidth * 4 / 10);
            calcDimensions(widthHint, num);
            svg.tSetDims(width, height);
            backgroundRect.tSetDims(width, height);

            while (tiles.length < num) {
                tiles.push(createTile(tiles.length));
            }
            while (tiles.length > num) {
                var tile = tiles.pop();
                svg.removeChild(tile);
            }

            for (var i = 0; i < num; i += 1) {
                var tile = tiles[i];
                var col = i % cols;
                var row = Math.floor(i / cols);
                var x = BORDER_GAP + col * (TILE_WIDTH + TILE_GAP);
                var y = BORDER_GAP + row * (TILE_HEIGHT + TILE_GAP);
                tile.tSetPos(x, y);
            }

            if (selectedIndex >= num) {
                selectedIndex = null;
                updateSelection();
            }

            if (array != null) {
                paintTiles(datum);
            }
        }

        function select(index) {
            if (index != null && index != tiles.length) {
                updateSelection(index);
            }
        }

        function getSelectedIndex() { return selectedIndex; }

        update();

        return { panel            : div,
                 resize           : resize,
                 update           : update,
                 select           : select,
                 unselect         : function() { updateSelection(); },
                 getSelectedIndex : getSelectedIndex,
                 legend           : null };
    }

    function createSingleBarChart() {
        var xAxisConfig = { ticksEnabled      : true,
                            tickLabelsEnabled : true };
        var yAxis0Config = { gridLinesEnabled : true };
        var chartConfig = { series        : [ { Name : '' }  ],
                            mainTitle     : '',
                            isStacked     : false,
                            legendEnabled : false,
                            xAxisConfig   : xAxisConfig,
                            yAxis0Config  : yAxis0Config
                          };
        var chart = charts.createBarChart(chartConfig);
        chart.panel.tSetClassName('tilePanelDivs');
        chart.resize(calcChartWidth(), CHART_HEIGHT);

        function resize(width) {
            chart.resize(width, CHART_HEIGHT);
        }

        function update(datum, labelsDatum) {
            var dataName = datum.nameWithGroupPrefix;
            var chartConfig = { series       : [ { Name : dataName } ],
                                mainTitle    : dataName,
                                yAxis0Config : {
                                    formatter : datum.formatter
                                }
                              };
            chart.updateConfig(chartConfig);
            var labels = null;
            if (labelsDatum != null) {
                labels = labelsDatum.value;
            }
            chart.update([ datum.value ], labels);
        }

        return { panel            : chart.panel,
                 resize           : resize,
                 update           : update,
                 select           : function() { },
                 unselect         : function() { },
                 getSelectedIndex : function() { return null; },
                 legend           : null };
    }

    function createChart(histogramData) {
        var isStacked = histogramData.isStacked;
        var labelData = histogramData.labelData;
        var categoryLabels = null;
        var ticksEnabled = false;
        var reverseCategory = histogramData.reverseCategory;

        if (!reverseCategory) {
            ticksEnabled = labelData != null;
        } else {
            ticksEnabled = true;
        }

        var xAxisConfig = { ticksEnabled      : ticksEnabled,
                            tickLabelsEnabled : ticksEnabled };
        var yAxis0Config = null;
        var yAxis1Config = null;
        var series = [ ];
        if (!reverseCategory) {
            if (histogramData.data0 != null) {
                var data0 = histogramData.data0.data;
                for (var i = 0; i < data0.length; i += 1) {
                    series.push({ Name : data0[i].presentationName,
                                  yAxis : 0 });
                }
                yAxis0Config = {
                    formatter        : histogramData.data0.formatter,
                    gridLinesEnabled : true
                };              
            }
            if (histogramData.data1 != null) {
                var data1 = histogramData.data1.data;
                for (var i = 0; i < data1.length; i += 1) {
                    series.push({ Name : data1[i].presentationName,
                                  yAxis : 1 });
                }
                yAxis1Config = {
                    formatter        : histogramData.data1.formatter,
                    gridLinesEnabled : histogramData.data0 == null
                };
            }
        } else {
            isStacked = true;
            categoryLabels = [ ];
            var labelDataValue = labelData.value;
            for (var i = 0; i < labelDataValue.length; i += 1) {
                series.push({ Name  : labelDataValue[i],
                              yAxis : 0 });
            }
            var data0 = histogramData.data0.data;
            for (var i = 0; i < data0.length; i += 1) {
                categoryLabels.push(data0[i].presentationName);
            }
            yAxis0Config = {
                formatter        : histogramData.data0.formatter,
                gridLinesEnabled : true
            };
        }

        var chartConfig = { series        : series,
                            mainTitle     : histogramData.name,
                            isStacked     : isStacked,
                            legendEnabled : true,
                            xAxisConfig   : xAxisConfig };
        if (yAxis0Config != null) {
            chartConfig.yAxis0Config = yAxis0Config;
        }
        if (yAxis1Config != null) {
            chartConfig.yAxis1Config = yAxis1Config;
        }

        var chart = null;
        if (histogramData.type == 'bars') {
            chart = charts.createBarChart(chartConfig);
        }
        chart.panel.tSetClassName('tilePanelDivs');
        chart.legendPanel.tSetClassName('tilePanelDivs');
        chart.resize(calcChartWidth(), CHART_HEIGHT);

        function resize(width) {
            chart.resize(width, CHART_HEIGHT);
        }

        function update() {
            var dataArray = [ ];
            var labels = null;
            if (!reverseCategory) {
                if (labelData != null) {
                    labels = labelData.value;
                }
                if (histogramData.data0 != null) {
                    var data0 = histogramData.data0.data;
                    for (var i = 0; i < data0.length; i += 1) {
                        dataArray.push(data0[i].value);
                    }
                }
                if (histogramData.data1 != null) {
                    var data1 = histogramData.data1.data;
                    for (var i = 0; i < data1.length; i += 1) {
                        dataArray.push(data1[i].value);
                    }
                }
            } else {
                var labelDataValue = labelData.value;
                for (var i = 0; i < labelDataValue.length; i += 1) {
                    dataArray[i] = [ ];
                }

                var data0 = histogramData.data0.data;
                for (var i = 0; i < data0.length; i += 1) {
                    for (var j = 0; j < labelDataValue.length; j += 1) {
                        dataArray[j][i] = data0[i].value[j];
                    }
                }

                labels = categoryLabels;
            }
            chart.update(dataArray, labels);
        }

        return { panel            : chart.panel,
                 resize           : resize,
                 update           : update,
                 select           : function() { },
                 unselect         : function() { },
                 getSelectedIndex : function() { return null; },
                 legend           : chart.legendPanel };
    }

    function createSpacePanel(space, parent) {
        function createHistogramData() {
            var histograms = space.histograms;
            var histogramData = [ ];
            if (histograms == null) {
                return histogramData;
            }

            for (var i = 0; i < histograms.length; i += 1) {
                var histogram = histograms[i];
                var foundData = false;

                function createData(propName) {
                    var res = null;

                    if (histogram.hasOwnProperty(propName)) {
                        var dataInfo = histogram[propName];
                        var dataNames = dataInfo.Names;

                        var resData = [ ];
                        var resFormatter = null;

                        for (var i = 0; i < dataNames.length; i += 1) {
                            var dataName = dataNames[i];
                            var datum = space.findData(dataName);
                            if (datum != null) {
                                resData.push(datum);
                            }
                        }
                        if (dataInfo.hasOwnProperty('Formatter')) {
                            resFormatter = dataInfo.Formatter;
                        }
                        if (resData.length > 0) {
                            foundData = true;
                            res = { data      : resData,
                                    formatter : resFormatter };
                        }
                    }

                    return res;
                }

                var data = { };
                data.name = histogram.Name;
                data.type = histogram.Type;
                data.isStacked = false;
                if (histogram.hasOwnProperty('Stacked')) {
                    data.isStacked = histogram.Stacked;
                }
                data.reverseCategory = false
                if (histogram.hasOwnProperty('ReverseCategory')) {
                    data.reverseCategory = histogram.ReverseCategory;
                }
                data.labelData = null;
                if (histogram.hasOwnProperty('Labels')) {
                    data.labelData = space.findData(histogram.Labels);
                }
                data.data0 = createData('Data');
                data.data1 = createData('Data1');
                if (foundData) {
                    histogramData.push(data);
                }
            }

            return histogramData;
        }

        var div = toolkit.createDiv(parent, 'spacePanelDivs');
        var table = toolkit.createTable(3, div);

        var leftTable = toolkit.createTable(1);
        var label = toolkit.createSpaceTitle(space.presentationName);
        leftTable.tAddObjs(label);

        var valueDataTable = toolkit.createKeyValueTable();

        var group = null;
        for (var i = 0; i < space.groups.length; i += 1) {
            var valueData = space.dataForValueTable[space.groups[i]];
            for (var j = 0; j < valueData.length; j += 1) {
                var data = valueData[j];
                var dataGroupName = space.groupPresentationNames[data.groupName];
                if (dataGroupName != group) {
                    group = dataGroupName;
                    valueDataTable.tAddTitle(group);
                }
                valueDataTable.tAddKeyValue(data.presentationName, '',
                                            data.getUnitStr(),
                                            data.getValueCellClassName());
            }
        }

        var valueDataTableEmpty = toolkit.createKeyValueTable();
        var valueDataTableDiv = toolkit.createSelectableDiv([ valueDataTable,
                                                              valueDataTableEmpty ]);
        leftTable.tAddObjs(valueDataTableDiv);

        var legendDiv = toolkit.createReplaceableDiv();

        var dataMenu = null;
        var chartMenu = null;
        var arrayDataTableDiv = null;
        var arrayDataTable = null;
        var chartPanelDiv = null;
        var chartPanel = null;
        var group = null;

        var histogramData = createHistogramData();

        function selectDataMenuItem(index, option, data) {
            var groupName = data.groupName;
            if (groupName != group) {
                populateArrayTable(groupName);
                updateArrayData();
            }
            updateChartPanel();
        }

        function selectChartMenuItem(index, option, data) {
            var selectedIndex = null;
            var enableDataMenu = true;
            var unselectIndex = true;
            if (chartPanel != null) {
                selectedIndex = chartPanel.getSelectedIndex();
            }
            switch (index) {
            case 0:
                chartPanel = createTilePanel(
                    function() {
                        updateArrayData();
                    },
                    function(show) {
                        var i = (show) ? 0 : 1;
                        arrayDataTableDiv.tSelect(i);
                    }
                );
                unselectIndex = false;
                break;

            case 1:
                chartPanel = createSingleBarChart();
                break;

            default:
                var histogramData = data;
                chartPanel = createChart(histogramData);
                enableDataMenu = false;
                break;
            }
            if (unselectIndex) {
                selectedIndex = null;
                arrayDataTableDiv.tSelect(1);
            }
            legendDiv.tReplaceWith(chartPanel.legend);
            chartPanelDiv.tReplaceWith(chartPanel.panel);                
            updateChartPanel();
            chartPanel.select(selectedIndex);
            dataMenu.tSetEnabled(enableDataMenu);
        }

        if (space.needsArrayPanels()) {
            arrayDataTable = toolkit.createKeyValueTable();
            var dataOptions = [ ];
            var data = [ ];

            for (var i = 0; i < space.groups.length; i += 1) {
                var group = space.groups[i];
                for (var j = 0; j < space.dataForArrayMenu.length; j += 1) {
                    var datum = space.dataForArrayMenu[j];
                    if (datum.groupName == group) {
                        var optionName = datum.nameWithGroupPrefix;
                        dataOptions.push(optionName);
                        data.push(datum);
                    }
                }
            }

            var arrayDataTableEmpty = toolkit.createKeyValueTable();
            arrayDataTableDiv = toolkit.createSelectableDiv([ arrayDataTable,
                                                              arrayDataTableEmpty ]);

            dataMenu = toolkit.createPullDownMenu(dataOptions, data,
                                                  null, selectDataMenuItem);
            var dataStartingIndex = 0;
            dataMenu.tSelectIndex(dataStartingIndex);
            populateArrayTable(space.dataForArrayMenu[dataStartingIndex].groupName);

            chartPanelDiv = toolkit.createReplaceableDiv();

            var chartOptions = [ 'Tiles', 'Histogram' ];
            var chartData = [ null, null ];
            for (var i = 0; i < histogramData.length; i += 1) {
                chartOptions.push(histogramData[i].name);
                chartData.push(histogramData[i]);
            }
            chartMenu = toolkit.createPullDownMenu(chartOptions, chartData,
                                                   null, selectChartMenuItem);
            var chartStartingIndex = 0;
            chartMenu.tSelectIndex(chartStartingIndex);
            selectChartMenuItem(chartStartingIndex);

            var middleTable = toolkit.createTable(1);
            middleTable.tAddObjs(chartPanelDiv);
            var controlDiv = toolkit.createDiv(null, null,
                                               [ dataMenu, chartMenu ]);
            middleTable.tAddObjs(controlDiv);

            var rightTable = toolkit.createTable(1);
            rightTable.tAddObjs(legendDiv);
            rightTable.tAddObjs(arrayDataTableDiv);

            table.tAddObjs([ leftTable, middleTable, rightTable ],
                           'topAlignedTableCells');
        } else {
            table.tAddSingleObj(leftTable);
        }

        var buttonDiv = toolkit.createDiv();
        var expandCollapseButton = toolkit.createImageButton(
            null, '', buttonDiv, 'expandCollapseButtons');
                                                             
        table.tAddSingleObj(buttonDiv);

        function updateValueData() {
            var index = 0;
            for (var i = 0; i < space.groups.length; i += 1) {
                var valueData = space.dataForValueTable[space.groups[i]];
                for (var j = 0; j < valueData.length; j += 1) {
                    var data = valueData[j];
                    var valueStr = data.getValueStr();
                    valueDataTable.tSetValueText(index, valueStr);
                    index += 1;
                }
            }
        }

        function populateArrayTable(groupName) {
            arrayDataTable.tEmpty();
            var dataGroupName = space.groupPresentationNames[groupName];
            if (dataGroupName != null) {
                arrayDataTable.tAddTitle(dataGroupName);
            }
            var slotName = space.slotNames[groupName];
            arrayDataTable.tAddKeyValue(slotName, '', '', 'intValueCells');
            var arrayData = space.dataForArrayTable[groupName];
            for (var i = 0; i < arrayData.length; i += 1) {
                arrayDataTable.tAddKeyValue(arrayData[i].presentationName, '',
                                            arrayData[i].getUnitStr(),
                                            arrayData[i].getValueCellClassName());
            }
            group = groupName;
        }

        function updateArrayData() {
            var selectedIndex = chartPanel.getSelectedIndex();
            if (space.needsArrayPanels()) {
                var valueStr = null;
                if (selectedIndex != null) {
                    valueStr = String(selectedIndex);
                }
                valueStr = valueStr || '';
                arrayDataTable.tSetValueText(0, valueStr);
                var arrayData = space.dataForArrayTable[group];
                for (var i = 0; i < arrayData.length; i += 1) {
                    var data = arrayData[i];
                    var valueStr = null;
                    if (selectedIndex != null) {
                        valueStr = data.getValueStr(selectedIndex);
                    }
                    valueStr = valueStr || '';
                    arrayDataTable.tSetValueText(i + 1, valueStr);
                }
            }
        }

        function resizeChartPanel(width) {
            chartPanel.resize(width);
        }

        function updateChartPanel() {
            var data = dataMenu.tGetSelectedData();
            var groupName = data.groupName;
            var labelsDataName = space.groupLabelNames[groupName];
            var labelsData = space.findData(labelsDataName);
            chartPanel.update(data, labelsData);
        }

        function update() {
            updateValueData();
            if (space.needsArrayPanels()) {
                updateChartPanel();
                updateArrayData();
            }
        }

        function resize(width) {
            if (chartPanel != null) {
                resizeChartPanel(width);
                updateChartPanel();
            }
        }

        function expand() {
            valueDataTableDiv.tSelect(0);
            expandCollapseButton.tSetImageURL('icons/CollapseButton.png');
            expandCollapseButton.tSetTooltip('Collapse');
            expandCollapseButton.onclick = collapse;
        }

        function collapse() {
            valueDataTableDiv.tSelect(1);
            if (chartPanel != null) {
                chartPanel.unselect();
            }

            expandCollapseButton.tSetImageURL('icons/ExpandButton.png');
            expandCollapseButton.tSetTooltip('Expand');
            expandCollapseButton.onclick = expand;
        }

        if (space.shouldExpandAtStart) {
            expand();
        } else {
            collapse();
        }

        return { update   : update,
                 resize   : resize,
                 expand   : expand,
                 collapse : collapse };
    }

    var pauseAfterEvents = [ ];
    var spacePanels = [ ];

    function setupVis() {
        replaceMainDivs();

        // Controls

        var controlButtons = player.getControlButtons();
        leftMainDiv.appendChild(controlButtons.firstButton);
        leftMainDiv.appendChild(controlButtons.prevLongButton);
        leftMainDiv.appendChild(controlButtons.prevButton);
        leftMainDiv.appendChild(controlButtons.playPauseButton);
        leftMainDiv.appendChild(controlButtons.nextButton);
        leftMainDiv.appendChild(controlButtons.nextLongButton);
        leftMainDiv.appendChild(controlButtons.lastButton);
        toolkit.createParagraphBreak(leftMainDiv);

        var expandAllButton = toolkit.createImageButton(
            'icons/ExpandButton.png', 'Expand All',
            leftMainDiv, 'expandCollapseButtons');
        var collapseAllButton = toolkit.createImageButton(
            'icons/CollapseButton.png', 'Collapse All',
            leftMainDiv, 'expandCollapseButtons');

        expandAllButton.onclick = function() {
            for (var i = 0; i < spacePanels.length; i += 1) {
                spacePanels[i].expand();
            }
        }

        collapseAllButton.onclick = function() {
            for (var i = 0; i < spacePanels.length; i += 1) {
                spacePanels[i].collapse();
            }
        }

        toolkit.createParagraphBreak(leftMainDiv);
        leftMainDiv.appendChild(controlButtons.speedButtonRange);

        // Pause After Checkboxes

        toolkit.createParagraphBreak(leftMainDiv);

        var pauseAfterCheckboxes = player.getPauseAfterCheckboxes();
        var pauseAfterTable = toolkit.createKeyValueTable(leftMainDiv,
                                                          'pauseAfterTable');
        pauseAfterTable.tAddTitle('Pause After Event');
        for (var i = 0; i < pauseAfterCheckboxes.length; i += 1) {
            pauseAfterTable.tAddKeyObj(pauseAfterCheckboxes[i].eventName,
                                       pauseAfterCheckboxes[i].checkbox);
        }

        // Space Panels

        for (var i = 0; i < gcview.spaces.length; i += 1) {
            spacePanels[i] = createSpacePanel(gcview.spaces[i], rightMainDiv);
        }

        resizeVis();
        updateVis();
    }

    function updateVis() {
        for (var i = 0; i < spacePanels.length; i += 1) {
            spacePanels[i].update();
        }
    }

    function resizeVis() {
        var width = calcChartWidth();

        if (spacePanels != null) {
            for (var i = 0; i < spacePanels.length; i += 1) {
                spacePanels[i].resize(width);
            }
        }
    }

    function onLoadFunc() {
        setup();
        init(setupQuestion);
    }

    function onResizeFunc() {
        resizeVis();
    }

    return { onLoadFunc   : onLoadFunc,
             onResizeFunc : onResizeFunc };
}();

window.onload = gcviewConstructor.onLoadFunc;
window.onresize = gcviewConstructor.onResizeFunc;
