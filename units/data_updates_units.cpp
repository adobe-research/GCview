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

int main() {
  {
    GCview gcview("GCview Update Unit Tests");
    unsigned event_id = gcview.addEvent("Event 0");

    JSONWriter writer;
    JSONArrayWriter array_writer(&writer);

    Space* space0 = gcview.addSpace("Values");
    BoolValue* bool_value = space0->addData<BoolValue>("Bool Value");
    ByteValue* byte_value = space0->addData<ByteValue>("Byte Value");
    IntValue* int_value = space0->addData<IntValue>("Int Value");
    DoubleValue* double_value = space0->addData<DoubleValue>("Double Value");
    StringValue* str_value_0 = space0->addData<StringValue>("String Value 0");
    StringValue* str_value_1 = space0->addData<StringValue>("String Value 1");
    EnumValue* enum_value = space0->addData<EnumValue>("Enum Value");
    unsigned cpp_id = enum_value->addEnumMember("c++");
    unsigned pascal_id = enum_value->addEnumMember("pascal");
    unsigned python_id = enum_value->addEnumMember("python");
    unsigned haskell_id = enum_value->addEnumMember("haskell");
    unsigned enum_num = haskell_id + 1;

    Space* space1 = gcview.addSpace("Arrays");
    BoolArray* bool_array = space1->addData<BoolArray>("Bool Array");
    ByteArray* byte_array = space1->addData<ByteArray>("Byte Array");
    IntArray* int_array = space1->addData<IntArray>("Int Array");
    DoubleArray* double_array = space1->addData<DoubleArray>("Double Array");
    StringArray* str_array = space1->addData<StringArray>("String Array");
    EnumArray* enum_array = space1->addData<EnumArray>("Enum Array");
    enum_array->addEnumMember("c++");
    enum_array->addEnumMember("pascal");
    enum_array->addEnumMember("python");
    enum_array->addEnumMember("haskell");

    Space* space2 = gcview.addSpace("Groups");
    IntValue* g0_int_value_0 = space2->addData<IntValue>("G0 Int Value 0");
    IntValue* g0_int_value_1 = space2->addData<IntValue>("G0 Int Value 1");
    IntArray* g0_int_array_0 = space2->addData<IntArray>("G0 Int Array 0");
    IntArray* g0_int_array_1 = space2->addData<IntArray>("G0 Int Array 1");
    const unsigned g0_length = 10;
    g0_int_array_0->resize(g0_length);
    g0_int_array_1->resize(g0_length);

    IntValue* g1_int_value_0 = space2->addData<IntValue>("G1 Int Value 0", "Group 1");
    IntValue* g1_int_value_1 = space2->addData<IntValue>("G1 Int Value 1", "Group 1");
    IntArray* g1_int_array_0 = space2->addData<IntArray>("G1 Int Array 0", "Group 1");
    IntArray* g1_int_array_1 = space2->addData<IntArray>("G1 Int Array 1", "Group 1");
    DoubleArray* g1_double_array_2 = space2->addData<DoubleArray>("G1 Double Array 2", "Group 1");
    const unsigned g1_length = 20;
    g1_int_array_0->resize(g1_length);
    g1_int_array_1->resize(g1_length);
    g1_double_array_2->resize(g1_length);

    IntArray* g2_int_array_0 = space2->addData<IntArray>("G2 Int Array 0", "Group 2");
    IntArray* g2_int_array_1 = space2->addData<IntArray>("G2 Int Array 1", "Group 2");
    IntArray* g2_int_array_2 = space2->addData<IntArray>("G2 Int Array 2", "Group 2");
    const unsigned g2_length = 15;
    g2_int_array_0->resize(g2_length);
    g2_int_array_1->resize(g2_length);
    g2_int_array_2->resize(g2_length);

    IntValue* g3_int_value_0 = space2->addData<IntValue>("G3 Int Value 0", "Group 3");
    IntValue* g3_int_value_1 = space2->addData<IntValue>("G3 Int Value 1", "Group 3");
    DoubleValue* g3_double_value_2 = space2->addData<DoubleValue>("G3 Double Value 2", "Group 3");

    array_writer.startElem();
    gcview.writeJSONMetadata(&writer);

    int_value->value() = 5;

    for (unsigned i = 0; i < 10; i += 1) {
      char buffer[64];
      gcview.eventStart(event_id);

      bool_value->value() = ((i / 2) % 2) == 0;
      byte_value->value() = (unsigned char) (i / 2);
      double_value->value() = 1.234;
      sprintf(buffer, "STR %u", i / 2);
      str_value_0->value() = buffer;
      enum_value->value() = (unsigned char) ((i / 2) % enum_num);

      g0_int_value_0->value() = i;
      g0_int_value_1->value() = 10 + i;
      for (unsigned j = 0; j < g0_length; j += 1) {
        g0_int_array_0->value(j) = i + j;
        g0_int_array_1->value(j) = 10 + i + j;
      }

      g1_int_value_0->value() = i;
      g1_int_value_1->value() = 10 + i;
      for (unsigned j = 0; j < g1_length; j += 1) {
        g1_int_array_0->value(j) = i + j;
        g1_int_array_1->value(j) = 10 + i + j;
        g1_double_array_2->value(j) = (double) (100 + i + j);
      }

      for (unsigned j = 0; j < g2_length; j += 1) {
        g2_int_array_0->value(j) = i + j;
        g2_int_array_1->value(j) = 10 + i + j;
        g2_int_array_2->value(j) = 100 + i + j;
      }

      g3_int_value_0->value() = i;
      g3_int_value_1->value() = 10 + i;
      g3_double_value_2->value() = (double) (100 + i);

      gcview.eventEnd();
      array_writer.startElem();
      gcview.writeJSONData(&writer);

      int_value->value() += (int) 1;
      unsigned j = 0;
      for ( ; j < i; j += 1) {
        buffer[j] = 'X';
      }
      buffer[j] = '\0';
      str_value_1->value() = buffer;

      unsigned array_length = (i / 3) * 3;
      unsigned seed = i / 2;
      bool_array->resize(array_length);
      byte_array->resize(array_length);
      int_array->resize(array_length);
      double_array->resize(array_length);
      str_array->resize(array_length);
      enum_array->resize(array_length);

      for (unsigned i = 0; i < array_length; i += 1) {
        bool_array->value(i) = ((seed + i) % 2) == 0;
        byte_array->value(i) = (unsigned char) (seed + i + 1);
        int_array->value(i) = (int) (seed + i + 5);
        double_array->value(i) = (double) (seed + i + 123);
        sprintf(buffer, "elem %u", seed + i + 10);
        str_array->value(i) = buffer;
        enum_array->value(i) = (unsigned char) ((seed + i + 15) % enum_num);
      }
    }

    gcview.eventStart(event_id);

    bool_value->reset();
    byte_value->reset();
    int_value->reset();
    double_value->reset();
    str_value_0->reset();
    str_value_1->reset();
    enum_value->reset();

    bool_array->reset();
    byte_array->reset();
    int_array->reset();
    double_array->reset();
    str_array->reset();
    enum_array->reset();

    gcview.eventEnd();
    array_writer.startElem();
    gcview.writeJSONData(&writer);
  }

  MM::print_report();
}
