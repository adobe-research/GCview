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

var gcviewCustomization = function() {
    var StandardPageSize = 1024 * 1024;

    var msFormatter = customizationShared.msFromSecFormatter;
    var secFormatter = customizationShared.secFromSecFormatter;
    var byteFormatter = customizationShared.bytesFromBytesFormatter;
    var kbFormatter = customizationShared.kbsFromBytesFormatter;
    var mbFormatter = customizationShared.mbsFromBytesFormatter;
    var boolFormatter = customizationShared.boolFormatter;

    var countFormatter = {
        transform : function(value) { return value; },
        format    : function(value) { return value; },
        unitStr   : 'count'
    };

    var isCommittedFormatter = {
        transform : function(value) { return value; },
        format    : function(value) {
            return (value) ? 'Committed' : 'Not Commmited'
        },
        unitStr   : ''
    };

    var PagedSpaceAttrs = {
        Groups : {
            null                      : { SlotName : 'Page ID'            },
            'Free Lists'              : { SlotName : 'Free List ID',
                                          Labels   : 'Free List Category' },
            'Free Chunk Distribution' : { SlotName : 'Bucket ID',
                                          Labels   : 'Bucket Range'       },
            'Code Ages'               : { SlotName : 'Age ID',
                                          Labels   : 'Code Age Name'      },
            'Code Kinds'              : { SlotName : 'Kind ID',
                                          Labels   : 'Code Kind Name'     },
        },

        Data : {
            'Total Used Size'         : { Formatter : mbFormatter },
            'Total Committed Size'    : { Formatter : mbFormatter },
            'Total Reserved Size'     : { Formatter : mbFormatter },
            'Address Range'           : { ExcludeFromMenu : true },
            'Used Size'               : { Formatter : kbFormatter,
                                          MaxValue  : StandardPageSize },
            'Committed Size'          : { Formatter : kbFormatter },
            'Scan On Scavenge'        : { Formatter : boolFormatter },
            'Is Committed'            : { Name      : 'Status',
                                          Formatter : isCommittedFormatter },
            'Free Size (Unavailable)' : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },
            'Free Size (Small)'       : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },
            'Free Size (Medium)'      : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },
            'Free Size (Large)'       : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },
            'Free Size (Huge)'        : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },

            'No Age Code Size'        : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },
            'Age 1 Code Size'         : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },
            'Age 2 Code Size'         : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },
            'Age 3 Code Size'         : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },
            'Age 4 Code Size'         : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },
            'Age 5 Code Size'         : { ExcludeFromMenu : true,
                                          Formatter       : kbFormatter },

            // Free Lists Group
            'Total Free Size'         : { Formatter : mbFormatter },
            'Free List Category'      : { ExcludeFromMenu : true },
            'Free Size'               : { Formatter : mbFormatter },

            // Free Chuck Dist Group
            'Bucket Range'            : { Formatter : byteFormatter,
                                          ExcludeFromMenu : true },
            'Bucket Size'             : { Formatter : mbFormatter },

            // Code Ages Group
            'Code Age Name'           : { Name : 'Age Name',
                                          ExcludeFromMenu : true },
            'Code Object Size'        : { Name : 'Object Size',
                                          Formatter : mbFormatter },
            'Code Object Number'      : { Name : 'Object Number' },
            'Opt Function Size'       : { Formatter : mbFormatter },

            // Code Kinds Group
            'Code Kind Name'          : { Name : 'Kind Name',
                                          ExcludeFromMenu : true },
            'Code Kind Object Size'   : { Name : 'Object Size',
                                          Formatter : mbFormatter },
            'Code Kind Object Number' : { Name : 'Object Number' }
        },

        Histograms : [
            { Name      : 'Space Info',
              Type      : 'bars',
              Stacked   : false,
              Data : {
                  Names     : [ 'Page Number',
                                'S-O-S Page Number' ],
                  Formatter : countFormatter
              },
              Data1 : {
                  Names     : [ 'Total Used Size',
                                'Total Committed Size',
                                'Total Reserved Size' ],
                  Formatter : mbFormatter
              }
            },

            { Name      : 'Fragmentation',
              Type      : 'bars',
              Stacked   : true,
              Data :  {
                  Names     : [ 'Used Size',
                                'Free Size (Unavailable)',
                                'Free Size (Small)',
                                'Free Size (Medium)',
                                'Free Size (Large)',
                                'Free Size (Huge)' ],
                  Formatter : kbFormatter
              }
            },

            { Name      : 'Free List Info',
              Type      : 'bars',
              Stacked   : false,
              Labels    : 'Free List Category',
              Data : {
                  Names     : [ 'Free Chunk Number' ],
                  Formatter : countFormatter
              },
              Data1 : {
                  Names     : [ 'Free Size' ],
                  Formatter : mbFormatter
              }
            },

            { Name      : 'Free Chunk Distribution',
              Type      : 'bars',
              Stacked   : false,
              Labels    : 'Bucket Range',
              Data : {
                  Names     : [ 'Bucket Population' ],
                  Formatter : countFormatter
              },
              Data1 : {
                  Names     : [ 'Bucket Size' ],
                  Formatter : mbFormatter
              }
            },

            { Name      : 'Code Ages',
              Type      : 'bars',
              Stacked   : true,
              Data : {
                  Names     : [ 'No Age Code Size',
                                'Age 1 Code Size',
                                'Age 2 Code Size',
                                'Age 3 Code Size',
                                'Age 4 Code Size',
                                'Age 5 Code Size' ],
                  Formatter : kbFormatter
              }
            },

            { Name      : 'Code Age Distribution',
              Type      : 'bars',
              Stacked   : false,
              Labels    : 'Code Age Name',
              Data : { 
                  Names     : [ 'Code Object Number' ],
                  Formatter : countFormatter
              },
              Data1 : {
                  Names     : [ 'Code Object Size' ],
                  Formatter : mbFormatter
              }
            },

            { Name      : 'Opt Function Age Distribution',
              Type      : 'bars',
              Stacked   : false,
              Labels    : 'Code Age Name',
              Data : { 
                  Names     : [ 'Opt Function Number' ],
                  Formatter : countFormatter
              },
              Data1 : {
                  Names     : [ 'Opt Function Size' ],
                  Formatter : mbFormatter
              }
            },

            { Name      : 'Code Kind Distribution',
              Type      : 'bars',
              Stacked   : false,
              Labels    : 'Code Kind Name',
              Data : {
                  Names     : [ 'Code Kind Object Number' ],
                  Formatter : countFormatter
              },
              Data1 : {
                  Names     : [ 'Code Kind Object Size' ],
                  Formatter : mbFormatter
              }
            },

            { Name            : 'Code Kind Breakdown',
              Type            : 'bars',
              Labels          : 'Code Kind Name',
              ReverseCategory : true,
              Data : {
                  Names     : [ 'Code Kind Object Size' ],
                  Formatter : mbFormatter
              }
            }
              
        ]
    };

    var events = {
    };

    var spaces = {
        'Summary' : {
            Groups : { 'GC Summary' : {  SlotName : 'GC ID',
                                         Labels   : 'GC Type' } },

            Data : {
                'GC Type'              : { ExcludeFromMenu : true },
                'Last GC Time'         : { Formatter : msFormatter },
                'Total GC Time'        : { Formatter : secFormatter },
                'Standard Page Size'   : { Formatter : mbFormatter },
                'Heap Used Size'       : { Formatter : mbFormatter },
                'Heap Committed Size'  : { Formatter : mbFormatter },
                'Heap Reserved Size'   : { Formatter : mbFormatter }
            },

            ExpandAtStart : true,

            Histograms : [
                { Name    : 'GC Info',
                  Type    : 'bars',
                  Stacked : false,
                  Labels : 'GC Type',
                  Data : {
                      Names     : [ 'GC Count' ],
                      Formatter : countFormatter
                  },
                  Data1 : {
                      Names     : [ 'Total GC Time' ],
                      Formatter : secFormatter
                  }
                },

                { Name    : 'Heap Info',
                  Type    : 'bars',
                  Stacked : false,
                  Data : {
                      Names     : [ 'Heap Page Number',
                                    'Heap S-O-S Page Number' ],
                      Formatter : countFormatter
                  },
                  Data1 : {
                      Names     : [ 'Heap Used Size',
                                    'Heap Committed Size',
                                    'Heap Reserved Size' ],
                      Formatter : mbFormatter
                  }
                }
            ]
        },

        'New Space'           : PagedSpaceAttrs,
        'Old Pointer Space'   : PagedSpaceAttrs,
        'Old Data Space'      : PagedSpaceAttrs,
        'Code Space'          : PagedSpaceAttrs,
        'Map Space'           : PagedSpaceAttrs,
        'Cell Space'          : PagedSpaceAttrs,
        'Property Cell Space' : PagedSpaceAttrs,

        'Large Object Space' : {
            Groups : { null : { SlotName : 'Large Page ID' } },

            Data : {
                'Total Used Size'      : { Formatter : mbFormatter },
                'Total Committed Size' : { Formatter : mbFormatter },
                'Total Reserved Size'  : { Formatter : mbFormatter },
                'Address Range'        : { ExcludeFromMenu : true },
                'Used Size'            : { Formatter : kbFormatter },
                'Committed Size'       : { Formatter : kbFormatter }
            }
        },

        'Store Buffer' : {
            Groups : { null : { SlotName : 'Space ID',
                                Labels   : 'Space Name' } },

            Data : {
                'New Buffer Size'       : { Name      : 'New Size',
                                            Formatter : kbFormatter },
                'Old Buffer Limit Size' : { Name      : 'Old Limit',
                                            Formatter : kbFormatter },
                'Old Buffer Size'       : { Name      : 'Old Size',
                                            Formatter : kbFormatter },
                'Space Name'            : { ExcludeFromMenu : true },
            },

            Histograms : [
                { Name    : 'Buffer Info',
                  Type    : 'bars',
                  Stacked : false,
                  Data : {
                      Names     : [ 'New Buffer Size',
                                    'Old Buffer Limit Size',
                                    'Old Buffer Size' ],
                      Formatter : kbFormatter
                  },
                  Data1 : {
                      Names     : [ 'Overflow Count',
                                    'Compaction Count' ],
                      Formatter : countFormatter
                  }
                },

                { Name            : 'Entry Breakdown',
                  Type            : 'bars',
                  Labels          : 'Space Name',
                  Stacked         : true,
                  ReverseCategory : true,
                  Data : {
                      Names     : [ 'Entry Number' ],
                      Formatter : countFormatter
                  }
                }
            ]
        }
    };

    return { Events : events,
             Spaces : spaces };
}();
