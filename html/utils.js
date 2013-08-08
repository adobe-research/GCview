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

var utils = function() {
    function getArray(obj) {
        if (obj == null || obj == undefined) {
            return obj;
        } else if (obj instanceof Array) {
            return obj;
        } else {
            return [ obj ];
        }
    }

    function arrayContains(array, elem) {
        return array.indexOf(elem) > -1;
    }

    return { getArray      : getArray,
             arrayContains : arrayContains };
}();

var customizationShared = function() {

    var KB = 1024;
    var MB = 1024 * 1024;

    var secFromSecFormatter = {
        transform : function(sec) { return sec; },
        format    : function(sec) { return sec.toFixed(4); },
        unitStr   : 'sec'
    };

    var msFromSecFormatter = {
        transform : function(sec) { return 1000 * sec; },
        format    : function(ms)  { return ms.toFixed(4); },
        unitStr   : 'ms'
    };

    var bytesFromBytesFormatter = {
        transform : function(bytes) { return bytes; },
        format    : function(bytes) { return bytes; },
        unitStr   : 'bytes'
    };

    var kbsFromBytesFormatter = {
        transform : function(bytes) { return bytes / KB; },
        format    : function(kb)    { return kb.toFixed(2); },
        unitStr   : 'KB'
    };

    var mbsFromBytesFormatter = {
        transform : function(bytes) { return bytes / MB; },
        format    : function(mb)    { return mb.toFixed(2); },
        unitStr   : 'MB'
    };

    var boolFormatter = {
        transform : function(b) { return b; },
        format    : function(b) { return (b) ? "True" : "False" },
        unitStr   : null
    };

    return {
        secFromSecFormatter     : secFromSecFormatter,
        msFromSecFormatter      : msFromSecFormatter,
        bytesFromBytesFormatter : bytesFromBytesFormatter,
        kbsFromBytesFormatter   : kbsFromBytesFormatter,
        mbsFromBytesFormatter   : mbsFromBytesFormatter,
        boolFormatter           : boolFormatter
    };

}();
