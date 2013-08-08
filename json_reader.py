#!/usr/bin/python

# Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import sys

from inc_json_reader import IncJSONReader

def value_to_str(value, enum_members = None):
    if enum_members != None:
        value = enum_members[value]
    if isinstance(value, unicode):
        value = str(value)

    if isinstance(value, str):
        return "'%s'" % value
    elif isinstance(value, float):
        return '%1.10f' % value
    else:
        return str(value)

def array_to_str(array, enum_members = None):
    array = map(lambda x : value_to_str(x, enum_members), array)
    if len(array) > 0:
        array_str = reduce(lambda x, y : x + " " + y, array, "")
    else:
        array_str = ""
    return "len:%d [%s ]" % ( len(array), array_str )

def to_str(value, enum_members = None):
    if not isinstance(value, list):
        return value_to_str(value, enum_members)
    else:
        return array_to_str(value, enum_members)

class Data:
    def __init__(self, data_id, data_name, data_type,
                 is_array, group_name, enum_members, value):
        self.data_id = data_id
        self.data_name = data_name
        self.data_type = data_type
        self.is_array = is_array
        self.group_name = group_name
        self.enum_members = enum_members
        self.value = value
        self.dirty = True

    def get_id(self):
        return self.data_id

    def set_value(self, value):
        self.value = value
        self.dirty = True

    def clear_dirty(self):
        self.dirty = False

    def get_actual_value(self, value):
        if self.enum_members != None:
            return self.enum_members[value]
        else:
            return value

    def value_to_str(self):
        value_str = to_str(self.value, self.enum_members)
        if self.dirty:
            return "(DIRTY) %s" % value_str
        else:
            return value_str

    def print_metadata(self):
        group_str = ''
        if self.group_name != None:
            group_str = '"%s" / ' % self.group_name
        is_array_str = 'Array' if self.is_array else 'Value'
        print 'Metadata     Data [%2d] %s"%s" | %s %s | %s' % (
            self.data_id, group_str, self.data_name,
            self.data_type, is_array_str, self.value_to_str() )
        if self.enum_members != None:
            print 'Metadata       Enum Members %s' % array_to_str(self.enum_members)

    def print_data(self):
        print '    Data [%2d] "%s" | %s' % ( self.data_id, self.data_name,
                                             self.value_to_str() )

class Space:
    def __init__(self, space_id, space_name):
        self.space_id = space_id
        self.space_name = space_name
        self.data = [ ]

    def get_id(self):
        return self.space_id

    def add_data(self, data):
        self.data.insert(data.get_id(), data)

    def get_data(self, data_id):
        return self.data[data_id]

    def get_data_with_name(self, data_name):
        for data in self.data:
            if data.data_name == data_name:
                return data
        return None

    def clear_dirty(self):
        for data in self.data:
            data.clear_dirty()

    def print_metadata(self):
        print 'Metadata   Space [%2d] "%s" | %d Data' % ( self.space_id,
                                                          self.space_name,
                                                          len(self.data) )
        for data in self.data:
            data.print_metadata()

    def print_data(self):
        print '  Space[%2d] "%s"' % ( self.space_id, self.space_name )
        for data in self.data:
            data.print_data()

class GCview:
    def __init__(self):
        self.spaces = [ ]

    def add_space(self, space):
        self.spaces.insert(space.get_id(), space)

    def get_space(self, space_id):
        return self.spaces[space_id]

    def get_space_with_name(self, space_name):
        for space in self.spaces:
            if space.space_name == space_name:
                return space
        return None

    def set_value(self, space_id, data_id, value):
        self.get_space(space_id).get_data(data_id).set_value(value)

    def clear_dirty(self):
        for space in self.spaces:
            space.clear_dirty()

    def print_metadata(self):
        print 'Metadata GCview | %d Spaces' % ( len(self.spaces) )
        for space in self.spaces:
            space.print_metadata()
        print ''

    def print_data(self):
        print 'GCview'
        for space in self.spaces:
            space.print_data()
        print ''

gcview = None

args = sys.argv
if len(args) != 2:
    print 'one argument expected'
    sys.exit(1)

file_name = args[1]
json_reader = IncJSONReader(file_name)
event_count = 0

for json_obj in json_reader:

    if 'GCviewMetadata' in json_obj:
        gcview_obj = json_obj['GCviewMetadata']
        gcview = GCview()

        space_list = gcview_obj['Spaces']
        for space_obj in space_list:
            space_id = space_obj['ID']
            space_name = space_obj['Name']
            space = Space(space_id, space_name)
            gcview.add_space(space)
    
            data_list = space_obj['Data']
            for data_obj in data_list:
                data_id = data_obj['ID']
                data_name = data_obj['Name']
                data_type = data_obj['DataType']
                is_array = data_obj['IsArray']
                group_name = None
                if 'Group' in data_obj:
                    group_name = data_obj['Group']
                enum_members = None
                if 'Members' in data_obj:
                    enum_members = data_obj['Members']
                value = data_obj['Value']
                data = Data(data_id, data_name, data_type,
                            is_array, group_name, enum_members, value)
                space.add_data(data)

        gcview.print_metadata()
        gcview.clear_dirty()

    elif 'GCviewData' in json_obj:
        event_count += 1

        space_list = json_obj['GCviewData']
        if space_list != None:
            for space_id in range(len(space_list)):
                data_list = space_list[space_id]
                if data_list != None:
                    for data_id in range(len(data_list)):
                        value = data_list[data_id]
                        if value != None:
                            gcview.set_value(space_id, data_id, value)

        gcview.print_data()
        gcview.clear_dirty()
