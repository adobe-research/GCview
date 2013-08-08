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

#include "gcview.hpp"
#include "json.hpp"

using namespace gcview;

static const unsigned ARRAY_LENGTH_MIN          =     0;
static const unsigned ARRAY_LENGTH_MAX          =   250;
static const unsigned ARRAY_LENGTH_STEP         =     1;

void doIteration(JSONWriter* writer, JSONArrayWriter* array_writer) {
  GCview gcview("GCview Unit Tests", 1.0);
  unsigned event0 = gcview.addEvent("Event 0");
  unsigned event1 = gcview.addEvent("Event 1");
  unsigned event2 = gcview.addEvent("Event 2");
  unsigned event3 = gcview.addEvent("Event 3");

  Space* space0 = gcview.addSpace("Space 0");

  ByteValue* byte_value = space0->addData<ByteValue>("Byte Value");
  IntValue* int_value = space0->addData<IntValue>("Int Value");
  StringValue* string_value = space0->addData<StringValue>("String Value");

  ByteArray* byte_array = space0->addData<ByteArray>("Byte Array", "Group A");
  IntArray* int_array = space0->addData<IntArray>("Int Array", "Group A");
  StringArray* string_array = space0->addData<StringArray>("String Array", "Group A");

  Space* space1 = gcview.addSpace("Space 1");

  BoolValue* bool_value = space1->addData<BoolValue>("Bool Value");
  BoolArray* bool_array = space1->addData<BoolArray>("Bool Array");
  DoubleValue* double_value = space1->addData<DoubleValue>("Double Value");
  DoubleArray* double_array = space1->addData<DoubleArray>("Double Array");

  EnumValue* enum_value = space1->addData<EnumValue>("Enum Value");
  enum_value->addEnumMember("cat");
  enum_value->addEnumMember("dog");
  enum_value->addEnumMember("tiger");
  enum_value->addEnumMember("hippo");
  const char* lang_names[] = { "c++", "java", "pascal", "cobol", "python", NULL };
  EnumArray* enum_array = space1->addData<EnumArray>("EnumArray");
  for (unsigned i = 0; lang_names[i] != NULL; i += 1) {
    enum_array->addEnumMember(lang_names[i]);
  }
  enum_array->addEnumMember("javascript");
  enum_array->addEnumMember("haskell");

  if (writer != NULL) {
    array_writer->startElem();
    gcview.writeJSONMetadata(writer);

    gcview.eventStart(event0, 2.0);
    gcview.eventEnd(2.2);

    array_writer->startElem();
    gcview.writeJSONData(writer);
  }

  byte_value->value() = 160;
  int_value->value() = 12345;
  string_value->value() = "hello";
  enum_value->value() = 3;

  for (unsigned length = ARRAY_LENGTH_MIN;
       length <= ARRAY_LENGTH_MAX;
       length += ARRAY_LENGTH_STEP) {

    double start_sec = (double) (4 * (length + 1));
    gcview.eventStart(event1, start_sec);

    char buffer[64];

    if (length % 4 != 0) {
      bool_value->value()  = (length % 3 == 0);
    }
    if (length % 2 != 0) {
      byte_value->value() = (unsigned char) 5 + length;
    }
    if (length % 3 != 0) {
      int_value->value() = (int) 100 + length;
    }
    if (length % 4 != 0) {
      double_value->value() = (double) (length * 1.23456 + 3.45);
    }
    if (length % 2 != 0) {
      sprintf(buffer, "val.%u", length);
      string_value->value() = buffer;
    }
    if (length % 8 != 0) {
      enum_value->value() = length % 4;
    }

    if (length % 3 != 0) {
      byte_array->resize(length);
    }
    if (length % 2 != 0) {
      int_array->resize(length);
    }
    if (length % 8 != 0) {
      double_array->resize(length);
    }
    if (length % 3 != 0) {
      string_array->resize(length);
    }
    if (length % 4 != 0) {
      enum_array->resize(length);
    }
    if (length % 8 != 0) {
      bool_array->resize(length);
    }

    for (unsigned i = 0; i < length; i += 1) {
      if (length % 3 != 0) {
        byte_array->value(i) = (unsigned char) (length + i);
      }
      if (length % 2 != 0) {
        int_array->value(i) = (int) (1000 * length + i);
      }
      if (length % 8 != 0) {
        double_array->value(i) = (double) (i + 5) * 2.345;
      }
      if (length % 3 != 0) {
        sprintf(buffer, "elem.%u.%u", length, i);
        string_array->value(i) = buffer;
      }
      if (length % 4 != 0) {
        enum_array->value(i) = (i + 3) % 7;
      }
      if (length % 8 != 0) {
        bool_array->value(i) = i % 3 == 0;
      }
    }

    double end_sec = start_sec + 0.1;
    gcview.eventEnd(end_sec);

    if (writer != NULL) {
      array_writer->startElem();
      gcview.writeJSONData(writer);
    }
  }
}
