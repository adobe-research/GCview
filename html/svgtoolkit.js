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

var svgtoolkit = function() {
    var SVGNS = 'http://www.w3.org/2000/svg';

    function createShape(name, parent) {
        var shape = document.createElementNS(SVGNS, name);
        if (parent != null) {
            parent.appendChild(shape);
        }

        shape.tSetPos = function(x, y) {
            this.setAttribute('x', x);
            this.setAttribute('y', y);
        }

        shape.tSetDims = function(width, height) {
            this.setAttribute('width', width);
            this.setAttribute('height', height);
        }

        shape.tSetStroke = function(strokeColor, strokeWidth) {
            if (strokeColor != null) {
                this.setAttribute('stroke', strokeColor);
            }
            if (strokeWidth != null) {
                this.setAttribute('stroke-width', strokeWidth);
            }
        }

        shape.tSetFill = function(fillColor) {
            this.setAttribute('fill', fillColor);
        }

        shape.tSetFillOpacity = function(fillOpacity) {
            this.setAttribute('fill-opacity', fillOpacity);
        }

        shape.tTransform = function(x, y, angle) {
            var transformStr = 'rotate(' + angle + ' ' + x + ',' + y + ')';
            this.setAttribute('transform', transformStr);
        }

        shape.tSetTooltipText = function(text) {
            var title = null;
            if (this.hasOwnProperty('tTooltip')) {
                title = createShape('title', this);
                this.tTooltip = title;
                this.appendChild(title);
            } else {
                title = this.tTooltip;
            }
            title.textContent = text;
        }

        return shape;
    }

    function createSVG(parent) {
        var shape = createShape('svg', parent);

        shape.tSetViewBox = function(x, y, width, height) {
            var viewBoxStr = x + ' ' + y + ' ' + width + ' ' + height;
            this.setAttribute('viewBox', viewBoxStr);
        }

        return shape;
    }

    function createRect(parent) {
        return createShape('rect', parent);
    }

    function createLine(x1, y1, x2, y2, parent) {
        var shape = createShape('line', parent);

        shape.tSetLimits = function(x1, y1, x2, y2) {
            this.setAttribute('x1', x1);
            this.setAttribute('y1', y1);
            this.setAttribute('x2', x2);
            this.setAttribute('y2', y2);
        }
        if (x1 != null && y1 != null && x2 != null && y2 != null) {
            shape.tSetLimits(x1, y1, x2, y2);
        }

        return shape;
    }

    function createPolygon(points, parent) {
        var shape = createShape('polygon', parent);

        shape.tSetPoints = function(points) {
            if (points != null) {
                var pointsStr = '';
                for (var i = 0; i < points.length; i += 1) {
                    if (i > 0) {
                        pointsStr += ' ';
                    }
                    pointsStr += points[i].x + ',' + points[i].y;
                }
                this.setAttribute('points', pointsStr);
            }
        }
        shape.tSetPoints(points);

        return shape;
    }

    function createText(text, parent) {
        var shape = createShape('text', parent);
        var textNode = document.createTextNode('');
        shape.appendChild(textNode);
        shape.tTextNode = textNode;

        shape.tSetText = function(text) {
            if (text != null) {
                shape.tTextNode.nodeValue = text;
            }
        }
        shape.tSetText(text);

        shape.tSetFont = function(fontFamily, fontSize) {
            this.tSetFontFamily(fontFamily);
            this.tSetFontSize(fontSize);
        }

        shape.tSetFontFamily = function(fontFamily) {
            if (fontFamily != null) {
                this.setAttribute('font-family', fontFamily);
            }
        }

        shape.tSetFontSize = function(fontSize) {
            if (fontSize != null) {
                this.setAttribute('font-size', fontSize);
            }
        }

        // textAnchor : start, middle, end
        shape.tSetTextAnchor = function(textAnchor) {
            this.setAttribute('text-anchor', textAnchor);
        }

        // shift : super, baseline, sub
        shape.tSetBaselineShift = function(shift) {
            this.setAttribute('baseline-shift', shift);
        }

        return shape;
    }

    return { createSVG     : createSVG,
             createRect    : createRect,
             createLine    : createLine,
             createPolygon : createPolygon,
             createText    : createText
           };
}();
