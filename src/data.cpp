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

#include "data.hpp"

namespace gcview {

#define ITERATE_ENUM_MEMBERS(__cmd__) \
  GCVIEW_ARRAY_ITERATE(_enum_members, const char*, the_enum_member, __cmd__)

unsigned Data::addEnumMember(const char* enum_member) {
  GCVIEW_ASSERT(_enum_members != NULL);
  return _enum_members->add(Utils::cloneStr(enum_member));
}

void Data::writeJSONMetadata(JSONWriter* writer) const {
  {
    JSONObjectWriter x(writer);
    x.writePair("ID", _id);
    x.writePair("Name", _name);
    x.writePair("DataType", getDataTypeStr(_data_type));
    x.writePair("IsArray", _is_array);
    if (_group_name != NULL) {
      x.writePair("Group", _group_name);
    }
    if (_enum_members != NULL) {
      x.startPair("Members");
      {
        JSONArrayWriter y(writer);
        ITERATE_ENUM_MEMBERS({ y.writeElem(the_enum_member); });
      }
    }
    x.startPair("Value");
    writeJSONDataSpecial(writer);
  }
}

Data::Data(const char* name, DataType data_type,
           bool is_array, const char* group_name)
    : _name(Utils::cloneStr(name)),
      _data_type(data_type), _is_array(is_array),
      _group_name(Utils::cloneStr(group_name)),
      _enum_members((data_type == EnumType) ? new Array<const char*>() : NULL),
      _modified(false) {
  if (data_type == EnumType) {
    GCVIEW_ALLOC_GUARANTEE(_enum_members);
  } else {
    GCVIEW_ASSERT(_enum_members == NULL);
  }
}

Data::~Data() {
  delete[] _name;
  if (_group_name != NULL) {
    delete[] _group_name;
  }
  if (_enum_members != NULL) {
    ITERATE_ENUM_MEMBERS({ delete[] the_enum_member; });
    delete _enum_members;
  }
}

}
