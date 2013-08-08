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

#ifndef _GCVIEW_SPACE_HPP

#define _GCVIEW_SPACE_HPP

#include "array.hpp"
#include "data.hpp"

namespace gcview {

class GCview;
class JSONWriter;

class Space {
  friend class GCview;

private:
  unsigned _id;
  const char* const _name;
  Array<Data*> _data;
  bool _modified;

  void setID(unsigned id) { _id = id; }

  bool isModified() const { return _modified; }

  void updateModifiedFlags();
  void updateModifiedFlags(bool modified);
  void updatePrevValues();

  Data* findData(const char* name, bool should_succeed = true) const;

  void writeJSONMetadata(JSONWriter *writer) const;
  void writeJSONData(JSONWriter *writer) const;

  void validate() const;

  template <typename VDT>
  VDT* findValue(const char* name, bool should_succeed = true) const {
    VDT* res = (VDT*) findData(name, should_succeed);
    GCVIEW_ASSERT(VDT::StaticValueDataType == res->getDataType());
    GCVIEW_ASSERT(!VDT::StaticIsArray);
    GCVIEW_ASSERT(!res->isArray());
    return res;
  }

  template <typename ADT>
  ADT* findArray(const char* name, bool should_succeed = true) const {
    ADT* res = (ADT*) findData(name, should_succeed);
    GCVIEW_ASSERT(ADT::StaticArrayDataType == res->getDataType());
    GCVIEW_ASSERT(ADT::StaticIsArray);
    GCVIEW_ASSERT(res->isArray());
    return res;
  }

public:
  const char* getName() const { return _name; }

  Data* addData(Data* data);
  template <typename D>
  D* addData(const char* name, const char* group_name = NULL) {
    D* data = new D(name, group_name);
    GCVIEW_ALLOC_GUARANTEE(data);
    addData(data);
    return data;
  }

  ///// Convenience methods to retrieve Values /////

  BoolValue* findBoolValue(const char* n, bool ss = true) const {
    return findValue<BoolValue>(n, ss);
  }

  ByteValue* findByteValue(const char* n, bool ss = true) const {
    return findValue<ByteValue>(n, ss);
  }

  IntValue* findIntValue(const char* n, bool ss = true) const {
    return findValue<IntValue>(n, ss);
  }

  DoubleValue* findDoubleValue(const char* n, bool ss = true) const {
    return findValue<DoubleValue>(n, ss);
  }

  StringValue* findStringValue(const char* n, bool ss = true) const {
    return findValue<StringValue>(n, ss);
  }

  EnumValue* findEnumValue(const char* n, bool ss = true) const {
    return findValue<EnumValue>(n, ss);
  }

  ///// Convenience methods to retrieve Arrays /////

  BoolArray* findBoolArray(const char* n, bool ss = true) const {
    return findArray<BoolArray>(n, ss);
  }

  ByteArray* findByteArray(const char* n, bool ss = true) const {
    return findArray<ByteArray>(n, ss);
  }

  IntArray* findIntArray(const char* n, bool ss = true) const {
    return findArray<IntArray>(n, ss);
  }

  DoubleArray* findDoubleArray(const char* n, bool ss = true) const {
    return findArray<DoubleArray>(n, ss);
  }

  StringArray* findStringArray(const char* n, bool ss = true) const {
    return findArray<StringArray>(n, ss);
  }

  EnumArray* findEnumArray(const char* n, bool ss = true) const {
    return findArray<EnumArray>(n, ss);
  }

  Space(const char* name);
  ~Space();
};

}

#endif // _GCVIEW_SPACE_HPP
