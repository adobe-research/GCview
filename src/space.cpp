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

#include "json.hpp"
#include "space.hpp"
#include "utils.hpp"

namespace gcview {

#define ITERATE_DATA(__cmd__) \
  GCVIEW_ARRAY_ITERATE(&_data, Data*, the_data, __cmd__)

void Space::updateModifiedFlags() {
  bool modified = false;
  ITERATE_DATA({
    the_data->updateModifiedFlag();
    if (the_data->isModified()) {
      modified = true;
    }
  });
  _modified = modified;
}

void Space::updateModifiedFlags(bool modified) {
  ITERATE_DATA({
    the_data->updateModifiedFlag(modified);
  });
  _modified = modified;
}

void Space::updatePrevValues() {
  ITERATE_DATA({
    the_data->updatePrevValue();
  });
}

Data* Space::addData(Data* data) {
  GCVIEW_GUARANTEE(findData(data->getName(), false /* should succeed */) == NULL,
                   "data with that name alredy exist");
  unsigned id = _data.add(data);
  data->setID(id);
  return data;
}

Data* Space::findData(const char* name,
                      bool should_succeed) const {
  ITERATE_DATA({
    if (!strcmp(name, the_data->getName())) return the_data;
  });
  GCVIEW_GUARANTEE(!should_succeed, "data not found");
  return NULL;
}

void Space::writeJSONMetadata(JSONWriter *writer) const {
  {
    JSONObjectWriter y(writer);
    y.writePair("ID", _id);
    y.writePair("Name", _name);
    y.startPair("Data");
    {
      JSONArrayWriter z(writer, true /* add_newlines */);
      ITERATE_DATA({
        z.startElem();
        the_data->writeJSONMetadata(writer);
      });
    }
  }
}

void Space::writeJSONData(JSONWriter *writer) const {
  if (_modified) {
    JSONArrayWriter y(writer, true /* add_newlines */);
    ITERATE_DATA({
        y.startElem();
        the_data->writeJSONData(writer);
      });
  } else {
    writer->writeNull();
  }
}

void Space::validate() const {
  ITERATE_DATA({ the_data->validate(); });
}

Space::Space(const char* name)
    : _name(Utils::cloneStr(name)), _modified(false) { }

Space::~Space() {
  delete[] _name;
  ITERATE_DATA({ delete the_data; });
}

}
