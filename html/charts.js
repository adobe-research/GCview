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

var charts = function() {

    var BORDER_PADDING = 8;
    var LEGEND_BORDER_PADDING = 5;
    var LEGEND_ROW_GAP_PERC = 20;
    var LABEL_MULT = 1.5;
    var TICK_LABEL_FONT_MULT = 3.5;
    var GROUP_GAP_PERC = 6;
    var BAR_GAP_PERC = 2;
    var FONT_MULT_FOR_BAR_LABEL = 4;
    var MAX_CATEGORY_TICK_NUM = 25;
    var FONT_MULT_FOR_TICK_LABEL = 6;

    var IS_STACKED = false;

    var AXIS_UNITS_ENABLED        = true;
    var XAXIS_TICKS_ENABLED       = false;
    var XAXIS_TICK_LABELS_ENABLED = false;
    var YAXIS_TICKS_ENABLED       = true;
    var YAXIS_TICK_LABELS_ENABLED = true;
    var GRID_LINES_ENABLED        = true;

    var FONT_FAMILY                = 'Arial';
    var DEFAULT_FONT_SIZE          = 10;
    var MAIN_TITLE_FONT_SIZE       = 1.4 * DEFAULT_FONT_SIZE;
    var SUB_TITLE_FONT_SIZE        = 1.3 * DEFAULT_FONT_SIZE;
    var AXIS_TITLE_FONT_SIZE       = 1.3 * DEFAULT_FONT_SIZE;
    var AXIS_UNITS_FONT_SIZE       = 1.2 * DEFAULT_FONT_SIZE;
    var AXIS_TICK_LABEL_FONT_SIZE  =       DEFAULT_FONT_SIZE;

    var AXIS_STROKE_WIDTH        = 2;
    var AXIS_TICK_NUM            = 5;
    var AXIS_TICK_LENGTH         = 4;
    var GRID_LINES_STROKE_WIDTH  = 1;

    var TITLE_COLOR           = 'Black';
    var AXIS_COLOR            = 'Black';
    var AXIS_TITLE_COLOR      = 'Black';
    var AXIS_TICK_COLOR       = 'Black';
    var AXIS_TICK_LABEL_COLOR = 'Black';
    var GRID_LINES_COLOR      = 'LightGray';
    var SERIES_COLORS = [ 'DarkRed',   'DarkGreen',    'DarkBlue',
                          'Tomato',    'Orange',       'Magenta',
                          'Salmon',    'Gold',         'DeepSkyBlue', 
                          'FireBrick', 'Khaki',        'DeepPink',
                          'Plum',      'LemonChiffon', 'Lavender' ];

    // For Bar Charts

    var BAR_LABEL_FONT_SIZE = DEFAULT_FONT_SIZE;
    var BAR_LABEL_COLOR = 'Black';

    // For Legend

    var LEGEND_ENABLED   = false;
    var LEGEND_WIDTH     = 200;
    var LEGEND_BOX_SIZE  = 16;
    var LEGEND_FONT_SIZE = DEFAULT_FONT_SIZE;

    function setAttribute(obj, config, attrName, defaultValue) {
        if (config.hasOwnProperty(attrName)) {
            obj[attrName] = config[attrName];
        } else {
            obj[attrName] = defaultValue;
        }
    }

    function updateAttribute(obj, config, attrName) {
        if (config.hasOwnProperty(attrName)) {
            obj[attrName] = config[attrName];
        }
    }

    function sizeArray(array, desiredLength, createFunc, disposeFunc) {
        while (array.length < desiredLength) {
            array.push(createFunc(array.length));
        }
        while (array.length > desiredLength) {
            var item = array.pop();
            disposeFunc(item);
        }
    }

    // orientation : 'x', 'y'
    // type        : 'category' (for x), 'left' (for y), 'right' (for y)
    function createAxis(chart, config, orientation, type) {
        var axis = { };

        setAttribute(axis, config, 'title',     null);
        setAttribute(axis, config, 'formatter', null);

        setAttribute(axis, config, 'unitsEnabled', AXIS_UNITS_ENABLED);
        if (orientation == 'x') {
            setAttribute(axis, config, 'ticksEnabled', XAXIS_TICKS_ENABLED);
            setAttribute(axis, config, 'tickLabelsEnabled',
                         XAXIS_TICK_LABELS_ENABLED);
        } else {
            setAttribute(axis, config, 'ticksEnabled', YAXIS_TICKS_ENABLED);
            setAttribute(axis, config, 'tickLabelsEnabled',
                         YAXIS_TICK_LABELS_ENABLED);
        }

        setAttribute(axis, config, 'gridLinesEnabled',  false);

        setAttribute(axis, config, 'fontFamily',        FONT_FAMILY);
        setAttribute(axis, config, 'titleFontSize',     AXIS_TITLE_FONT_SIZE);
        setAttribute(axis, config, 'unitsFontSize',     AXIS_UNITS_FONT_SIZE);
        setAttribute(axis, config, 'tickLabelFontSize', AXIS_TICK_LABEL_FONT_SIZE);

        setAttribute(axis, config, 'strokeWidth',          AXIS_STROKE_WIDTH);
        setAttribute(axis, config, 'tickNum',              AXIS_TICK_NUM);
        setAttribute(axis, config, 'tickLength',           AXIS_TICK_LENGTH);
        setAttribute(axis, config, 'gridLinesStrokeWidth', GRID_LINES_STROKE_WIDTH);

        setAttribute(axis, config, 'axisColor',       AXIS_COLOR);
        setAttribute(axis, config, 'titleColor',      AXIS_TITLE_COLOR);
        setAttribute(axis, config, 'unitsColor',      AXIS_TITLE_COLOR);
        setAttribute(axis, config, 'tickColor',       AXIS_TICK_COLOR);
        setAttribute(axis, config, 'tickLabelColor',  AXIS_TICK_LABEL_COLOR);
        setAttribute(axis, config, 'gridLinesColor',  GRID_LINES_COLOR);

        if (type == 'category') {
            axis.unitsEnabled = false;
            axis.gridLinesEnabled = false;
            axis.tickNum = 0;
        }

        function updateLabels() {
            if (axis.title != null) {
                axis.titleLabel.tSetText(axis.title);
            }
        }

        function createTickLine() {
            return chart.createLine(axis.strokeWidth, axis.tickColor);
        }

        var tickLabelAnchor = null;
        var tickLabelShift = null;
        if (orientation == 'x') {
            tickLabelAnchor = 'middle';
            tickLabelShift = 'sub';
        } else {
            tickLabelAnchor = (type == 'left') ? 'end' : 'start';
            tickLabelShift = 'baseline';
        }

        function createTickLabel() {
            return chart.createLabel(axis.tickLabelFontSize,
                                     axis.tickLabelColor,
                                     tickLabelAnchor, tickLabelShift);
        }

        function sizeTickArrays(num, labelNum) {
            if (labelNum == null) {
                labelNum = num;
            }
            if (axis.ticksEnabled) {
                sizeArray(axis.tickLines, num,
                          function(index) { return createTickLine(); },
                          function(line) { chart.removeObj(line); });

                if (axis.tickLabelsEnabled) {
                    sizeArray(axis.tickLabels, labelNum,
                              function(index) { return createTickLabel(); },
                              function(label) { chart.removeObj(label); });
                }
            }
        }

        function init() {
            var shift = (orientation == 'x') ? 'baseline' : 'sub';
            axis.axisLine = chart.createLine(axis.strokeWidth, axis.axisColor);
            if (axis.title != null) {
                axis.titleLabel = chart.createLabel(axis.titleFontSize,
                                                    axis.titleColor,
                                                    'middle', shift);
            }
            if (axis.unitsEnabled) {
                axis.unitsLabel = chart.createLabel(axis.unitsFontSize,
                                                    axis.unitsColor,
                                                    'middle', shift);
            }

            if (axis.ticksEnabled) {
                axis.tickLines = [ ];
                if (axis.tickLabelsEnabled) {
                    axis.tickLabels = [ ];
                }

                if (type != 'category') {
                    sizeTickArrays(axis.tickNum + 1);
                }
            }
            if (axis.gridLinesEnabled) {
                axis.gridLines = [ ];
                for (var i = 1; i <= axis.tickNum; i += 1) {
                    axis.gridLines[i] = chart.createLine(axis.gridLinesStrokWidth,
                                                        axis.gridLinesColor);
                }
            }

            updateLabels();
        }

        function calcSizes(curr) {
            var mult = (orientation == 'x' || type == 'right') ? -1 : 1;

            if (axis.title != null) {
                axis.titlePos = curr;
                curr += mult * LABEL_MULT * axis.titleFontSize;
            }
            if (axis.unitsEnabled) {
                axis.unitsPos = curr;
                curr += mult * LABEL_MULT * axis.unitsFontSize;
            }
            if (axis.ticksEnabled) {
                if (axis.tickLabelsEnabled) {
                    if (orientation == 'x') {
                        curr += mult * LABEL_MULT * axis.tickLabelFontSize;
                    } else {
                        curr += mult * TICK_LABEL_FONT_MULT * axis.tickLabelFontSize;
                    }
                }
                curr += mult * 2 * axis.tickLength;
            }

            return curr;
        }

        function resize() {
            if (orientation == 'x') {
                axis.axisLine.tSetLimits(chart.toChartX(0),
                                         chart.toChartY(0),
                                         chart.toChartX(1),
                                         chart.toChartY(0));
            } else {
                var x = 0;
                if (type == 'right') {
                    x = 1;
                }
                axis.axisLine.tSetLimits(chart.toChartX(x),
                                         chart.toChartY(0),
                                         chart.toChartX(x),
                                         chart.chartAxisY);
                                         
            }

            if (axis.title != null) {
                if (orientation == 'x') {
                    axis.titleLabel.tSetPos(chart.toChartX(0.5),
                                            axis.titlePos);
                } else {
                    var rotate = (type == 'left') ? -90 : 90;
                    var x = axis.titlePos;
                    var y = chart.toChartY(0.5);
                    axis.titleLabel.tSetPos(x, y);
                    axis.titleLabel.tTransform(x, y, rotate);
                }
            }

            if (axis.unitsEnabled) {
                if (orientation == 'x') {
                    axis.unitsLabel.tSetPos(chart.toChartX(0.5),
                                            axis.unitsPos);
                } else {
                    var rotate = (type == 'left') ? -90 : 90;
                    var x = axis.unitsPos;
                    var y = chart.toChartY(0.5);
                    axis.unitsLabel.tSetPos(x, y);
                    axis.unitsLabel.tTransform(x, y, rotate);
                }
            }

            if (axis.ticksEnabled || axis.gridLinesEnabled) {
                var mult = (orientation == 'x' || type == 'right') ? 1 : -1;
                var curr = 0;
                var gap = 1 / axis.tickNum;
                for (var i = 0; i <= axis.tickNum; i += 1) {
                    if (orientation == 'x') {
                        if (type != 'category') {
                            // TODO: x-axis ticks / gridlines not supported
                        }
                    } else {
                        var leftX = chart.toChartX(0);
                        var rightX = chart.toChartX(1);
                        var y = chart.toChartY(curr);
                        var axisX = (type == 'left') ? leftX : rightX;
                        var tickLength = mult * axis.tickLength;
                        if (axis.ticksEnabled) {
                            axis.tickLines[i].tSetLimits(axisX,
                                                         y,
                                                         axisX + tickLength,
                                                         y);
                            if (axis.tickLabelsEnabled) {
                                axis.tickLabels[i].tSetPos(axisX + 2 * tickLength,
                                                           y);
                            }
                        }
                        if (axis.gridLinesEnabled && i > 0) {
                            axis.gridLines[i].tSetLimits(leftX, y,
                                                         rightX, y);
                        }
                    }
                    curr += gap;
                }
            }
        }

        function update(adjMax) {
            updateLabels();

            if (axis.unitsEnabled) {
                var unitsLabelStr = '';
                var formatter = axis.formatter;
                if (formatter != null) {
                    unitsLabelStr += ' ' + formatter.unitStr;
                }
                if (adjMax.presentationMultiplier != 1) {
                    unitsLabelStr += ' (x' + adjMax.presentationMultiplier + ')';
                }
                axis.unitsLabel.tSetText(unitsLabelStr);
            }

            if (type != 'category' &&
                axis.ticksEnabled && axis.tickLabelsEnabled) {
                var num = axis.tickNum;
                var fixedDigits = adjMax.fixedDigits;
                var gap = adjMax.presentationMax / num;
                var curr = 0;
                for (var i = 0; i <= num; i += 1) {
                    var labelStr = null;
                    if (fixedDigits != 0) {
                        labelStr = curr.toFixed(fixedDigits);
                    } else {
                        labelStr = String(curr);
                    }
                    axis.tickLabels[i].tSetText(labelStr);
                    curr += gap;
                }
            }
        }

        function updateAttributes(config) {
            updateAttribute(axis, config, 'title');
            updateAttribute(axis, config, 'formatter');

            updateLabels();
        }

        function updateCategoryXAxis(tickXs, labels) {
            if (axis.ticksEnabled) {
                var num = tickXs.length;
                if (num > MAX_CATEGORY_TICK_NUM) {
                    num = 0;
                }
                var labelNum = num;
                if (FONT_MULT_FOR_TICK_LABEL * axis.tickLabelFontSize >
                    chart.chartWidth / num) {
                    labelNum = 0;
                }
                if (labels == null) {
                    labelNum = 0;
                }
                sizeTickArrays(num, labelNum);

                var tickLength = axis.tickLength;
                for (var i = 0; i < num; i += 1) {
                    var x = chart.toChartX(tickXs[i]);
                    var y = chart.toChartY(0);
                    axis.tickLines[i].tSetLimits(x, y, x, y + tickLength);
                    if (axis.tickLabelsEnabled) {
                        if (labels != null && i < labelNum) {
                            axis.tickLabels[i].tSetPos(x, y + 2 * tickLength);
                            axis.tickLabels[i].tSetText(labels[i]);
                        }
                    }
                }
            }
        }

        function bringToFront() {
            chart.bringToFront(axis.axisLine);
        }

        init();

        return { formatter           : function() { return axis.formatter; },
                 calcSizes           : calcSizes,
                 resize              : resize,
                 update              : update,
                 updateAttributes    : updateAttributes,
                 updateCategoryXAxis : updateCategoryXAxis,
                 bringToFront        : bringToFront };
    }

    function updateLabels(chart) {
        if (chart.mainTitle != null) {
            chart.mainTitleLabel.tSetText(chart.mainTitle);
        }
        if (chart.subTitle != null) {
            chart.subTitleLabel.tSetText(chart.subTitle);
        }

        chart.seriesNames = [ ];
        chart.seriesYAxes = [ ];
        chart.seriesFormatters = [ ];
        var series = chart.series;
        for (var i = 0; i < chart.seriesNum; i += 1) {
            var yAxis = 0;
            if (series[i].hasOwnProperty('yAxis')) {
                if (series[i].yAxis == 1) {
                    yAxis = 1;
                } else {
                    yAxis = 0;
                }
            }
            chart.seriesNames[i] = series[i].Name;
            chart.seriesYAxes[i] = yAxis;
            var formatter = chart.yAxes[yAxis].formatter();
            chart.seriesFormatters[i] = formatter;
        }

        if (chart.legend != null) {
            chart.legend.update();
        }
    }

    function initAttributes(chart, config) {
        setAttribute(chart, config, 'series',        null);
        chart.series = utils.getArray(chart.series);
        setAttribute(chart, config, 'isStacked',     IS_STACKED);

        setAttribute(chart, config, 'xAxisConfig',  null);
        setAttribute(chart, config, 'yAxis0Config', null);
        setAttribute(chart, config, 'yAxis1Config', null);

        setAttribute(chart, config, 'mainTitle', null);
        setAttribute(chart, config, 'subTitle',  null);

        setAttribute(chart, config, 'borderPadding', BORDER_PADDING);

        setAttribute(chart, config, 'fontFamily',        FONT_FAMILY);
        setAttribute(chart, config, 'mainTitleFontSize', MAIN_TITLE_FONT_SIZE);
        setAttribute(chart, config, 'subTitleFontSize',  SUB_TITLE_FONT_SIZE);

        setAttribute(chart, config, 'mainTitleColor', TITLE_COLOR);
        setAttribute(chart, config, 'subTitleColor',  TITLE_COLOR);
        setAttribute(chart, config, 'seriesColors',   SERIES_COLORS);

        // For Legend
        setAttribute(chart, config, 'legendEnabled',  LEGEND_ENABLED);
        setAttribute(chart, config, 'legendWidth',    LEGEND_WIDTH);
        setAttribute(chart, config, 'legendBoxSize',  LEGEND_BOX_SIZE);
        setAttribute(chart, config, 'legendFontSize', LEGEND_FONT_SIZE);

        // For Bar Charts
        setAttribute(chart, config, 'barLabelFontSize', BAR_LABEL_FONT_SIZE);
        setAttribute(chart, config, 'barLabelColor',    BAR_LABEL_COLOR);

        chart.div = toolkit.createDiv();
        chart.svg = svgtoolkit.createSVG(chart.div);
        chart.bgRect = svgtoolkit.createRect(chart.svg);
        chart.bgRect.tSetPos(0, 0);
        chart.bgRect.tSetFillOpacity(0);

        chart.createLabel = function(fontSize, color,
                                     textAnchor, baselineShift) {
            var label = svgtoolkit.createText('', this.svg);
            if (fontSize != null) {
                label.tSetFont(this.fontFamily, fontSize);
            }
            if (color != null) {
                label.tSetFill(color);
            }
            if (textAnchor != null) {
                label.tSetTextAnchor(textAnchor);
            }
            if (baselineShift != null) {

                label.tSetBaselineShift(baselineShift);
            }
            return label;
        }

        chart.createLine = function(strokeWidth, color) {
            var line = svgtoolkit.createLine(null, null, null, null, this.svg);
            line.tSetStroke(color, strokeWidth);
            return line;
        }

        chart.createRect = function(color) {
            var rect = svgtoolkit.createRect(this.svg);
            rect.tSetFill(color);
            return rect;
        }

        chart.removeObj = function(obj) {
            this.svg.removeChild(obj);
        }

        chart.chartWidth = 0;
        chart.chartHeight = 0;

        // 0 <= x <= 1
        chart.toChartX = function(x) {
            return chart.chartX + x * chart.chartWidth;
        }

        // 0 <= y <= 1
        chart.toChartY = function(y) {
            return chart.chartY + (1 - y) * chart.chartHeight;
        }

        // 0 <= width <= 1
        chart.toChartWidth = function(width) {
            return width * chart.chartWidth;
        }

        // 0 <= height <= 1
        chart.toChartHeight = function(height) {
            return height * chart.chartHeight;
        }

        chart.max    = [    0,    0 ];
        chart.adjMax = [ null, null ];

        chart.bringToFront = function(objs) {
            objs = utils.getArray(objs);
            for (var i = 0; i < objs.length; i += 1) {
                var obj = objs[i];
                if (obj != null) {
                    this.svg.removeChild(obj);
                    this.svg.appendChild(obj);
                }
            }
        }
    }

    function updateAttributes(chart, config) {
        updateAttribute(chart, config, 'series');
        chart.series = utils.getArray(chart.series);
        updateAttribute(chart, config, 'mainTitle');
        updateAttribute(chart, config, 'subTitle');

        if (chart.xAxis != null && config.hasOwnProperty('xAxisConfig')) {
            chart.xAxis.updateAttributes(config.xAxisConfig);
        }
        if (chart.yAxes[0] != null && config.hasOwnProperty('yAxis0Config')) {
            chart.yAxes[0].updateAttributes(config.yAxis0Config);
        }
        if (chart.yAxes[1] != null && config.hasOwnProperty('yAxis1Config')) {
            chart.yAxes[1].updateAttributes(config.yAxis1Config);
        }

        for (var i = 0; i < chart.seriesNum; i += 1) {
            var yAxis = chart.seriesYAxes[i];
            var formatter = chart.yAxes[yAxis].formatter();
            chart.seriesFormatters[i] = formatter;
        }

        updateLabels(chart);
    }

    function createLegend(chart) {
        var div = toolkit.createDiv();
        var svg = svgtoolkit.createSVG(div);

        var seriesNum = chart.seriesNum;
        var rowGap = LEGEND_ROW_GAP_PERC * chart.legendBoxSize / 100;
        var height = 2 * LEGEND_BORDER_PADDING +
            seriesNum * chart.legendBoxSize +
            (seriesNum - 1) * rowGap;

        var labels = [ ];

        svg.tSetDims(chart.legendWidth, height);
        var x = LEGEND_BORDER_PADDING;
        var y = LEGEND_BORDER_PADDING;
        for (var i = 0; i < seriesNum; i += 1) {
            var bar = svgtoolkit.createRect(svg);
            bar.tSetFill(chart.seriesColors[i]);
            bar.tSetDims(chart.legendBoxSize, chart.legendBoxSize);
            bar.tSetPos(x, y);

            var labelX = x + 1.5 * chart.legendBoxSize;
            var labelY = y + chart.legendBoxSize;
            var label = svgtoolkit.createText('', svg);
            label.tSetPos(labelX, labelY);
            label.tSetFont(chart.fontFamily, chart.legendFontSize);
            label.tSetTextAnchor('start');
            label.tSetBaselineShift('super');
            labels[i] = label;

            y += chart.legendBoxSize + rowGap;
        }

        function update() {
            for (var i = 0; i < chart.seriesNum; i += 1) {
                labels[i].tSetText(chart.seriesNames[i]);
            }
        }

        return { panel  : div,
                 update : update };
    }

    function initChart(chart, config, xAxisType) {
        initAttributes(chart, config);

        if (chart.mainTitle != null) {
            chart.mainTitleLabel = chart.createLabel(chart.mainTitleFontSize,
                                                     chart.mainTitleColor,
                                                     'middle', 'sub');
        }
        if (chart.subTitle != null) {
            chart.subTitleLabel = chart.createLabel(chart.subTitleFontSize,
                                                    chart.subTitleColor,
                                                    'middle', 'sub');
        }

        chart.xAxis = null;
        chart.yAxes = [ null, null ];
        if (chart.xAxisConfig) {
            chart.xAxis = createAxis(chart, chart.xAxisConfig, 'x', xAxisType);
        }
        if (chart.yAxis0Config) {
            chart.yAxes[0] = createAxis(chart, chart.yAxis0Config, 'y', 'left');
        }
        if (chart.yAxis1Config) {
            chart.yAxes[1] = createAxis(chart, chart.yAxis1Config, 'y', 'right');
        }

        chart.seriesNum = chart.series.length;

        chart.legend = null;
        if (chart.legendEnabled) {
            chart.legend = createLegend(chart);
        }

        updateLabels(chart);
    }

    function resizeChart(chart, totalWidth, totalHeight) {
        chart.svg.tSetDims(totalWidth, totalHeight);
        chart.bgRect.tSetDims(totalWidth, totalHeight);

        var startX = chart.borderPadding;
        var startY = chart.borderPadding;
        var endX = totalWidth - chart.borderPadding;
        var endY = totalHeight - chart.borderPadding;

        var mainTitleY = 0;
        var subTitleY = 0;
        var yAxisTopY = 0;

        if (chart.mainTitle != null) {
            mainTitleY = startY;
            startY += LABEL_MULT * chart.mainTitleFontSize;
        }
        if (chart.subTitle != null) {
            subTitleY = startY;
            startY += LABEL_MULT * chart.subTitleFontSize;
        }
        yAxisTopY = startY;
        startY += LABEL_MULT * chart.barLabelFontSize;

        if (chart.xAxis != null) {
            endY = chart.xAxis.calcSizes(endY);
        }
        if (chart.yAxes[0] != null) {
            startX = chart.yAxes[0].calcSizes(startX);
        }
        if (chart.yAxes[1] != null) {
            endX = chart.yAxes[1].calcSizes(endX);
        }

        chart.chartX = startX;
        chart.chartY = startY;
        chart.chartAxisY = yAxisTopY;
        chart.chartWidth = endX - startX;
        chart.chartHeight = endY - startY;

        if (chart.mainTitle != null) {
            chart.mainTitleLabel.tSetPos(totalWidth / 2, mainTitleY);
        }
        if (chart.subTitle != null) {
            chart.subTitleLabel.tSetPos(totalWidth / 2, subTitleY);
        }
        if (chart.xAxis != null) {
            chart.xAxis.resize();
        }
        if (chart.yAxes[0] != null) {
            chart.yAxes[0].resize();
        }
        if (chart.yAxes[1] != null) {
            chart.yAxes[1].resize();
        }
    }

    function calculateAdjustedMax(max) {
        if (max == null) {
            return null;
        }

        var curr = max;
        var factor = 1;
        var iters = 0;
        if (max > 0) {
            while (curr < 1 || curr > 10) {
                if (curr < 1) {
                    curr *= 10;
                    factor /= 10;
                } else {
                    curr /= 10;
                    factor *= 10;
                }
                iters += 1;
            }
        }

        if (curr <= 5) {
            curr = 5;
        } else {
            // 5 < curr <= 10
            curr = 10;
        }

        var fixedDigits = iters;
        if (factor >= 1) {
            fixedDigits = 0;
        }
        var adjustedMax = factor * curr;

        var presentationMax = adjustedMax;
        var presentationMultiplier = 1;
        if (presentationMax > 1000) {
            presentationMax = presentationMax / 1000;
            presentationMultiplier = 1000;
        }

        return { adjustedMax            : adjustedMax,
                 fixedDigits            : fixedDigits,
                 presentationMax        : presentationMax,
                 presentationMultiplier : presentationMultiplier };
    }

    function transformValue(value, formatter) {
        if (formatter != null) {
            return formatter.transform(value);
        } else {
            return value;
        }
    }

    function formatValue(value, formatter) {
        if (formatter != null) {
            return formatter.format(value);
        } else {
            return String(value);
        }
    }

    function calculateMax(chart, yAxis, seriesData) {
        var seriesNum = chart.seriesNum;

        var data = [ ];
        var formatters = [ ];
        var maxDataLen = 0;
        for (var i = 0; i < seriesNum; i += 1) {
            if (chart.seriesYAxes[i] == yAxis) {
                data.push(seriesData[i]);
                formatters.push(chart.seriesFormatters[i]);
                maxDataLen = Math.max(maxDataLen, seriesData[i].length);
            }
        }

        if (data.length == 0) {
            return null;
        }

        var max = 0;
        if (chart.isStacked) {
            for (var di = 0; di < maxDataLen; di += 1) {
                var sum = 0;
                for (var si = 0; si < data.length; si += 1) {
                    if (di < data[si].length) {
                        var value =
                            transformValue(data[si][di], formatters[si]);
                        sum += value;
                    }
                }
                max = Math.max(max, sum);
            }
        } else {
            for (var si = 0; si < data.length; si += 1) {
                for (var di = 0; di < data[si].length; di += 1) {
                    var value = transformValue(data[si][di], formatters[si]);
                    max = Math.max(max, value);
                }
            }
        }
        return max;
    }

    function updateChart(chart, seriesData) {
        updateLabels(chart);

        for (var i = 0; i < chart.seriesNum; i += 1) {
            seriesData[i] = utils.getArray(seriesData[i]);
        }

        var maxDataLen = 0;
        var dataElemNum = 0;
        for (var i = 0; i < chart.seriesNum; i += 1) {
            var len = seriesData[i].length;
            maxDataLen = Math.max(maxDataLen, len);
            dataElemNum += len;
        }
        chart.maxDataLen = maxDataLen;
        chart.dataElemNum = dataElemNum;

        chart.max[0] = calculateMax(chart, 0, seriesData);
        chart.adjMax[0] = calculateAdjustedMax(chart.max[0]);
        chart.max[1] = calculateMax(chart, 1, seriesData);
        chart.adjMax[1] = calculateAdjustedMax(chart.max[1]);

        if (chart.xAxis != null) {
            // TODO: x-axis updating not supported
        }
        if (chart.yAxes[0] != null) {
            chart.yAxes[0].update(chart.adjMax[0]);
        }
        if (chart.yAxes[1] != null) {
            chart.yAxes[1].update(chart.adjMax[1]);
        }
    }

    function updateCategoryXAxis(chart, tickXs, labels) {
        if (chart.xAxis != null) {
            chart.xAxis.updateCategoryXAxis(tickXs, labels);
        }
    }

    function bringAxesToFront(chart) {
        if (chart.xAxis != null) {
            chart.xAxis.bringToFront();
        }
        if (chart.yAxes[0] != null) {
            chart.yAxes[0].bringToFront();
        }
        if (chart.yAxes[1] != null) {
            chart.yAxes[1].bringToFront();
        }
    }

    // series : [ { Name : 'Series Name', yAxis : 0 (default) | 1 } ]
    function createBarChart(config) {
        var chart = { };

        initChart(chart, config, 'category');

        chart.bars = [ ];
        chart.barLabels = [ ];
        for (var i = 0; i < chart.seriesNum; i += 1) {
            chart.bars[i] = [ ];
        }

        function resize(totalWidth, totalHeight) {
            resizeChart(chart, totalWidth, totalHeight);
        }

        function update(seriesData, categoryXAxisLabels) {
            updateChart(chart, seriesData);

            for (var i = 0; i < chart.seriesNum; i += 1) {
                sizeArray(chart.bars[i], seriesData[i].length,
                          function(index) {
                              return chart.createRect(chart.seriesColors[i]);
                          },
                          function(bar) {
                              chart.removeObj(bar);
                          });
            }

            var seriesNum = chart.seriesNum;
            var maxDataLen = chart.maxDataLen;
            var dataElemNum = chart.dataElemNum;
            var groupNum = 0;
            var barNum = 0;
            var verticalBarNum = 0;
            var yAxesUsed = 0;

            if (chart.yAxes[0] != null) {
                yAxesUsed += 1;
            }
            if (chart.yAxes[1] != null) {
                yAxesUsed += 1;
            }
            if (chart.isStacked) {
                groupNum = maxDataLen;
                barNum = maxDataLen;
                verticalBarNum = yAxesUsed * maxDataLen;
            } else {
                groupNum = maxDataLen;
                barNum = seriesNum;
                verticalBarNum = dataElemNum;
            }

            var chartWidth = 1; // normalized
            var groupGapTotal = 0;
            var groupGap = 0;
            if (groupNum > 1 && barNum > 1) {
                groupGapTotal = chartWidth * GROUP_GAP_PERC / 100;
                groupGap = groupGapTotal / (groupNum + 1);
            }

            var barWidth = (chartWidth - groupGapTotal) / verticalBarNum;
            var barGap = barWidth * BAR_GAP_PERC / 100;
            var adjBarWidth = barWidth - 2 * barGap;

            var max = [ ];
            for (var i = 0; i < seriesNum; i += 1) {
                var yAxis = chart.seriesYAxes[i];
                max[i] = chart.adjMax[yAxis].adjustedMax;
            }

            var labelNum = 0;
            var limit = FONT_MULT_FOR_BAR_LABEL * chart.barLabelFontSize;
            if (chart.toChartWidth(barWidth) >= limit) {
                labelNum = verticalBarNum;
            }
            sizeArray(chart.barLabels, labelNum,
                      function(index) {
                          return chart.createLabel(chart.barLabelFontSize,
                                                   chart.barLabelColor,
                                                   'middle', 'super');
                      },
                      function(bar) { chart.removeObj(bar); });

            tickXs = [ ];
            if (chart.isStacked) {
                var x = groupGap;
                var labelIndex = 0;
                for (var di = 0; di < maxDataLen; di += 1) {
                    var groupStartX = x;
                    for (var yAxis = 0; yAxis < 2; yAxis += 1) {
                        if (chart.yAxes[yAxis] == null) continue;

                        var y = 0;
                        var sum = 0;
                        var barX = x + barGap;
                        for (var si = seriesNum - 1; si >= 0; si -= 1) {
                            if (chart.seriesYAxes[si] != yAxis) continue;
                            if (di >= seriesData[si].length) continue;

                            var formatter = chart.seriesFormatters[si];
                            var value = transformValue(seriesData[si][di],
                                                       formatter);
                            sum += value;
                            var barHeight = value / max[si];
                            y += barHeight;

                            chart.bars[si][di].tSetPos(chart.toChartX(barX),
                                                       chart.toChartY(y));
                            chart.bars[si][di].tSetDims(
                                chart.toChartWidth(adjBarWidth),
                                chart.toChartHeight(barHeight));
                        }

                        if (labelNum > 0) {
                            var labelStr = formatValue(sum, formatter);
                            chart.barLabels[labelIndex].tSetText(labelStr);
                            chart.barLabels[labelIndex].tSetPos(
                                chart.toChartX(barX + adjBarWidth / 2),
                                chart.toChartY(y));
                            labelIndex += 1;
                        }

                        x += barWidth;
                    }
                    var deltaX = x - groupStartX;
                    tickXs.push(groupStartX + deltaX / 2);

                    x += groupGap;
                }
            } else {
                var x = groupGap;
                var labelIndex = 0;
                for (var di = 0; di < maxDataLen; di += 1) {
                    var groupStartX = x;
                    for (var si = 0; si < seriesNum; si += 1) {
                        if (di < seriesData[si].length) {
                            var formatter = chart.seriesFormatters[si];
                            var value = transformValue(seriesData[si][di],
                                                       formatter);
                            var barHeight = value / max[si];
                            var barX = x + barGap;
                            var barY = barHeight;

                            chart.bars[si][di].tSetPos(chart.toChartX(barX),
                                                       chart.toChartY(barY));
                            chart.bars[si][di].tSetDims(
                                chart.toChartWidth(adjBarWidth),
                                chart.toChartHeight(barHeight));

                            if (labelNum > 0) {
                                var labelStr = formatValue(value, formatter);
                                chart.barLabels[labelIndex].tSetText(labelStr);
                                chart.barLabels[labelIndex].tSetPos(
                                    chart.toChartX(barX + adjBarWidth / 2),
                                    chart.toChartY(barY));
                            }

                            x += barWidth;
                            labelIndex += 1;
                        }
                    }
                    var deltaX = x - groupStartX;
                    tickXs.push(groupStartX + deltaX / 2);

                    x += groupGap;
                }
            }

            updateCategoryXAxis(chart, tickXs, categoryXAxisLabels);
            bringAxesToFront(chart);
        }

        function updateConfig(config) {
            updateAttributes(chart, config);
        }

        return { panel        : chart.div,
                 legendPanel  : (chart.legend != null) ? chart.legend.panel : null,
                 resize       : resize,
                 update       : update,
                 updateConfig : updateConfig };
    }

    return { createBarChart : createBarChart };

}();
