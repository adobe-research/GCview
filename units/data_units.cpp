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

static BoolValue* bool_value;
static ByteValue* byte_value;
static IntValue* int_value;
static DoubleValue* double_value;
static StringValue* string_value;
static EnumValue* enum_value;

static unsigned event_id;

static unsigned CatEnumID;
static unsigned DogEnumID;
static unsigned TigerEnumID;

static BoolArray* bool_array;
static ByteArray* byte_array;
static IntArray* int_array;
static DoubleArray* double_array;
static StringArray* string_array;
static EnumArray* enum_array;

static unsigned CEnumID;
static unsigned PythonEnumID;
static unsigned JavaEnumID;
static unsigned PascalEnumID;
static unsigned HaskellEnumID;

static void updateValues() {
  bool_value->value() = true;
  byte_value->value() = 3;
  int_value->value() = 654;
  double_value->value() = 1.2345;
  string_value->value() = "hello";
  enum_value->value() = DogEnumID;
}

static void updateStringArray(unsigned length, unsigned seed = 1) {
  char buffer[16];
  string_array->resize(length);
  for (unsigned i = 0; i < length; i += 1) {
    snprintf(buffer, 16, "item %u", seed + i);
    string_array->value(i) = buffer;
  }
}

static void updateArrays(unsigned length) {
  bool_array->resize(length);
  byte_array->resize(length);
  int_array->resize(length);
  double_array->resize(length);
  enum_array->resize(length);

  for (unsigned i = 0; i < length; i += 1) {
    bool_array->value(i) = (i % 2 == 0);
    byte_array->value(i) = (unsigned char) i;
    int_array->value(i) = 1000 + (int) i;
    double_array->value(i) = 5000.0 + (double) + i;
    enum_array->value(i) = (i % 3 == 0) ? JavaEnumID : HaskellEnumID;
  }

  updateStringArray(length);
}

static void dumpData(GCview *gcview,
                     JSONWriter* writer,
                     JSONArrayWriter* array_writer) {
  gcview->eventStart(event_id);
  gcview->eventEnd();
  array_writer->startElem();
  gcview->writeJSONData(writer);
}

static void dumpMetadata(GCview *gcview,
                         JSONWriter* writer,
                         JSONArrayWriter* array_writer) {
  array_writer->startElem();
  gcview->writeJSONMetadata(writer);

  dumpData(gcview, writer, array_writer);
}

int main() {
  {
    GCview gcview("GCview Data Unit Tests");
    event_id = gcview.addEvent("Event 0");

    JSONWriter writer;
    JSONArrayWriter array_writer(&writer);

    Space* space0 = gcview.addSpace("Values");
    bool_value = space0->addData<BoolValue>("Bool Value");
    byte_value = space0->addData<ByteValue>("Byte Value");
    int_value = space0->addData<IntValue>("Int Value");
    double_value = space0->addData<DoubleValue>("Double Value");
    string_value = space0->addData<StringValue>("String Value");
    enum_value = space0->addData<EnumValue>("Enum Value");
    CatEnumID = enum_value->addEnumMember("cat");
    DogEnumID = enum_value->addEnumMember("dog");
    TigerEnumID = enum_value->addEnumMember("tiger");

    Space* space1 = gcview.addSpace("Arrays");
    bool_array = space1->addData<BoolArray>("Bool Array");
    byte_array = space1->addData<ByteArray>("Byte Array");
    int_array = space1->addData<IntArray>("Int Array");
    double_array = space1->addData<DoubleArray>("Double Array");
    string_array = space1->addData<StringArray>("String Array");
    enum_array = space1->addData<EnumArray>("Enum Array");
    CEnumID = enum_array->addEnumMember("C");
    PythonEnumID = enum_array->addEnumMember("Python");
    JavaEnumID = enum_array->addEnumMember("Java");
    PascalEnumID = enum_array->addEnumMember("Pascal");
    HaskellEnumID = enum_array->addEnumMember("Haskell");

    dumpMetadata(&gcview, &writer, &array_writer);

    updateValues();
    updateArrays(5);
    dumpData(&gcview, &writer, &array_writer);

    string_value->value() = "hello";
    updateArrays(5);
    dumpData(&gcview, &writer, &array_writer);

    string_value->value() = "";
    dumpData(&gcview, &writer, &array_writer);

    updateValues();
    updateArrays(7);
    dumpData(&gcview, &writer, &array_writer);

    updateStringArray(7, 10);
    dumpData(&gcview, &writer, &array_writer);

    string_array->resize(2);
    dumpData(&gcview, &writer, &array_writer);

    updateArrays(0);
    dumpData(&gcview, &writer, &array_writer);

    updateArrays(0);
    dumpData(&gcview, &writer, &array_writer);
  }

  MM::print_report();
}
