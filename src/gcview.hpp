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

#ifndef _GCVIEW_GCVIEW_HPP

#define _GCVIEW_GCVIEW_HPP

#include "array.hpp"
#include "space.hpp"

namespace gcview {

class JSONWriter;

class GCview {
private:
  Array<Space*> _spaces;

  bool _modified;
  const double _start_sec;
  double _last_timestamp_sec;
  double _last_event_start_timestamp_sec;
  
  EnumValue* _event_value;
  IntValue* _total_event_count_value;
  DoubleValue* _elapsed_time_value;
  DoubleValue* _actual_elapsed_time_value;
  DoubleValue* _last_data_collection_time_value;
  DoubleValue* _total_data_collection_time_value;
  StringArray* _event_names_array;
  IntArray* _event_counts_array;

  double getTimestampSec(const double now_sec) const {
    return (now_sec > _start_sec) ? now_sec - _start_sec : 0.0;
  }

  void updateLastTimestampSec(const double now_sec) {
    const double timestamp_sec = getTimestampSec(now_sec);
    if (timestamp_sec > _last_timestamp_sec) {
      _last_timestamp_sec = timestamp_sec;
    }
  }

  unsigned getEventNum() const;
  unsigned findEventID(const char* event_name) const;

  void updateModifiedFlags();
  void updateModifiedFlags(bool modified);
  void updatePrevValues();

  void initGCviewSpace(const char* name);
  void updateGCviewSpaceData(double collection_time_sec);

public:
  Space* addSpace(const char* space_name);
  Space* addSpace(Space* space);
  Space* findSpace(const char* name, bool should_succeeded = true) const;

  unsigned addEvent(const char* event_name);

  bool eventStart(const char* event_name, double now_sec = -1.0);
  bool eventStart(unsigned event_id, double now_sec = -1.0);
  void eventEnd(double now_sec = -1.0);

  void writeJSONMetadata(JSONWriter* writer);
  void writeJSONData(JSONWriter* writer);

  void validate() const;

  GCview(const char* name, double now_sec = 0.0);
  ~GCview();
};

}

#endif // _GCVIEW_GCVIEW_HPP
