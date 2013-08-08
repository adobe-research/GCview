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

#include <string.h>

#include "gcview.hpp"
#include "json.hpp"
#include "utils.hpp"

namespace gcview {

#define ITERATE_SPACES(__cmd__) \
  GCVIEW_ARRAY_ITERATE(&_spaces, Space*, the_space, __cmd__)

unsigned GCview::getEventNum() const {
  GCVIEW_ASSERT(_event_names_array->getLength() == _event_counts_array->getLength());
  return _event_names_array->getLength();
}

unsigned GCview::findEventID(const char* event_name) const {
  for (unsigned i = 0; i < getEventNum(); i += 1) {
    if (_event_names_array->value(i) == event_name) return i;
  }
  GCVIEW_UNREACHABLE_0("event not found");
}

void GCview::updateModifiedFlags() {
  bool modified = false;
  ITERATE_SPACES({
    the_space->updateModifiedFlags();
    if (the_space->isModified()) {
      modified = true;
    }
  });
  _modified = modified;
}

void GCview::updateModifiedFlags(bool modified) {
  ITERATE_SPACES({
    the_space->updateModifiedFlags(modified);
  });
  _modified = modified;
}

void GCview::updatePrevValues() {
  ITERATE_SPACES({
      the_space->updatePrevValues();
  });
}

void GCview::initGCviewSpace(const char* name) {
  Space* space = addSpace("GCview Data");
  StringValue* name_value = space->addData<StringValue>("Name");
  name_value->value() = name;
  _event_value = space->addData<EnumValue>("Event");
  _total_event_count_value = space->addData<IntValue>("Total Event Count");
  _elapsed_time_value = space->addData<DoubleValue>("Elapsed Time");
  _actual_elapsed_time_value = space->addData<DoubleValue>("Actual Elapsed Time");
  _last_data_collection_time_value = space->addData<DoubleValue>("Last Data Collection Time");
  _total_data_collection_time_value = space->addData<DoubleValue>("Total Data Collection Time");
  _event_names_array = space->addData<StringArray>("Event Name");
  _event_counts_array = space->addData<IntArray>("Event Count");
}

void GCview::updateGCviewSpaceData(double collection_time_sec) {
  _elapsed_time_value->value() = _last_timestamp_sec;
  _last_data_collection_time_value->value() = collection_time_sec;
  _total_data_collection_time_value->value() += collection_time_sec;
  GCVIEW_ASSERT(_last_timestamp_sec >=
                          (double) _total_data_collection_time_value->value());
  _actual_elapsed_time_value->value() = _last_timestamp_sec -
                           (double) _total_data_collection_time_value->value();
}

Space* GCview::addSpace(const char* name) {
  Space* space = new Space(name);
  GCVIEW_ALLOC_GUARANTEE(space);
  return addSpace(space);
}

Space* GCview::addSpace(Space* space) {
  GCVIEW_GUARANTEE(findSpace(space->getName(), false /* should_succeed */) == NULL,
                  "space with that name already exists");
  unsigned id = _spaces.add(space);
  space->setID(id);
  return space;
}

Space* GCview::findSpace(const char* name, bool should_succeed) const {
  ITERATE_SPACES({
    if (!strcmp(name, the_space->getName())) return the_space;
  });
  GCVIEW_GUARANTEE(!should_succeed, "space not found");
  return NULL;
}

unsigned GCview::addEvent(const char* event_name) {
  unsigned event_id = _event_value->addEnumMember(event_name);
  GCVIEW_ASSERT(event_id == _event_names_array->getLength());
  GCVIEW_ASSERT(event_id == _event_counts_array->getLength());

  _event_names_array->resize(event_id + 1);
  _event_names_array->value(event_id) = event_name;
  _event_counts_array->resize(event_id + 1);
  _event_counts_array->value(event_id) = 0;

  return event_id;
}

bool GCview::eventStart(const char* name, double now_sec) {
  return eventStart(findEventID(name), now_sec);
}

bool GCview::eventStart(unsigned event_id, double now_sec) {
  GCVIEW_ASSERT(event_id < getEventNum());
  GCVIEW_ASSERT(_last_event_start_timestamp_sec < 0.0);

  _event_value->value() = event_id;
  _total_event_count_value->value() += 1;
  _event_counts_array->value(event_id) += 1;
  updateLastTimestampSec(now_sec);
  _last_event_start_timestamp_sec = _last_timestamp_sec;

  return true;
}

void GCview::eventEnd(double now_sec) {
  GCVIEW_ASSERT(_last_event_start_timestamp_sec >= 0.0);

  updateLastTimestampSec(now_sec);
  GCVIEW_ASSERT(_last_timestamp_sec >= _last_event_start_timestamp_sec);
  const double collection_time_sec =
                        _last_timestamp_sec - _last_event_start_timestamp_sec;
  _last_event_start_timestamp_sec = -1.0;
  updateGCviewSpaceData(collection_time_sec);
}

void GCview::writeJSONMetadata(JSONWriter* writer) {
  validate();
  updateModifiedFlags(true);

  {
    JSONObjectWriter x(writer);
    x.startPair("GCviewMetadata");
    {
      JSONObjectWriter y(writer);
      y.startPair("Spaces");
      {
        JSONArrayWriter z(writer, true /* add_newlines */);
        ITERATE_SPACES({
          z.startElem();
          the_space->writeJSONMetadata(writer);
        });
      }
    }
  }
  writer->flush();

  updatePrevValues();
}

void GCview::writeJSONData(JSONWriter* writer) {
  validate();
  updateModifiedFlags();

  {
    JSONObjectWriter x(writer);
    x.startPair("GCviewData");

    if (_modified) {
      JSONArrayWriter y(writer);
      ITERATE_SPACES({
        y.startElem();
        the_space->writeJSONData(writer);
      });
    } else {
      writer->writeNull();
    }
  }
  writer->flush();

  updatePrevValues();
}

void GCview::validate() const {
  ITERATE_SPACES({ the_space->validate(); });
}

GCview::GCview(const char* name, double now_sec)
    : _modified(false), _start_sec(now_sec),
      _last_timestamp_sec(0.0), _last_event_start_timestamp_sec(-1.0), 
      _event_value(NULL), _total_event_count_value(NULL),
      _elapsed_time_value(NULL), _actual_elapsed_time_value(NULL),
      _last_data_collection_time_value(NULL),
      _total_data_collection_time_value(NULL),
      _event_names_array(NULL), _event_counts_array(NULL) {
  updateLastTimestampSec(now_sec);
  initGCviewSpace(name);
}

GCview::~GCview() {
  ITERATE_SPACES({ delete the_space; });
}

}
