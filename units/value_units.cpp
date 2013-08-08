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

using namespace gcview;

int main() {
  {
    printf("== Element (int)\n");

    Element<SimpleElement<int> > e, f;

    printf("e:%2d  f:%2d\n", (int) e, (int) f);

    e = 2;
    f = 5;
    printf("e:%2d  f:%2d\n", (int) e, (int) f);

    e = f;
    printf("e:%2d  f:%2d\n", (int) e, (int) f);

    printf("eq:%d  ne:%d  eq2:%d  ne2:%d\n", e == f, e != f, e == 2, e != 2);

    e -= 1;
    f += 1;
    printf("e:%2d  f:%2d\n", (int) e, (int) f);

    f -= e;
    e += f;
    printf("e:%2d  f:%2d\n", (int) e, (int) f);

    printf("\n");

    printf("== ValueData (int)\n");

    ValueData<SimpleElement<int>, Data::IntType> x("X");
    ValueData<SimpleElement<int>, Data::IntType> y("Y");

    printf("x:%2d  y:%2d\n", (int) x.value(), (int) y.value());

    x.value() = 5;
    y.value() = x.value();
    printf("x:%2d  y:%2d\n", (int) x.value(), (int) y.value());

    x.value() += 1;
    y.value() -= 1;
    printf("x:%2d  y:%2d\n", (int) x.value(), (int) y.value());

    x.value() -= y.value();
    y.value() += x.value();
    printf("x:%2d  y:%2d\n", (int) x.value(), (int) y.value());

    printf("eq:%d  ne:%d  eq2:%d  ne2:%d\n",
           x.value() == y.value(), x.value() != y.value(), 
           x.value() == 2, x.value() != 2);

    x.reset();
    printf("x:%2d  y:%2d\n", (int) x.value(), (int) y.value());

    printf("\n");

    printf("== ValueData (String)\n");

    ValueData<StringElement, Data::StringType> a("A");
    ValueData<StringElement, Data::StringType> b("B");

    printf("a:'%s'  b:'%s'\n", (const char*) a.value(), (const char*) b.value());

    a.value() = "hello";
    b.value() = a.value();
    printf("a:'%s'  b:'%s'\n", (const char*) a.value(), (const char*) b.value());

    printf("eq:%d  ne:%d  eqFoo:%d  neFoo:%d\n",
           a.value() == b.value(), a.value() != b.value(), 
           a.value() == "Foo", a.value() != "Foo");

    a.reset();
    printf("a:'%s'  b:'%s'\n", (const char*) a.value(), (const char*) b.value());

    printf("\n");

    printf("== ArrayData (int)\n");

    ArrayData<SimpleElement<int>, Data::IntType> ax("AX");
    ArrayData<SimpleElement<int>, Data::IntType> ay("AY");

    const unsigned length = 5;
    ax.resize(length);

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] %2d\n", i, (int) ax.value(i));
    }

    for (unsigned i = 0; i < length; i += 1) {
      ax.value(i) = 10 + i;
    }

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] %2d\n", i, (int) ax.value(i));
    }

    ay.resize(length);
    for (unsigned i = 0; i < length; i += 1) {
      ay.value(i) = ax.value(i) + 10;
    }

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] %2d\n", i, (int) ay.value(i));
    }

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] eq20:%d\n", i, ay.value(i) == 20);
    }

    printf("\n");

    printf("== ArrayData (String)\n");

    ArrayData<StringElement, Data::StringType> aa("AA");
    ArrayData<StringElement, Data::StringType> ab("AB");

    aa.resize(length);

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] '%s'\n", i, (const char *) aa.value(i));
    }

    for (unsigned i = 0; i < length; i += 1) {
      char buffer[64];
      sprintf(buffer, "hello %u", i);
      aa.value(i) = buffer;
    }

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] '%s'\n", i, (const char *) aa.value(i));
    }

    for (unsigned i = 0; i < length; i += 1) {
      char buffer[64];
      sprintf(buffer, "bye %u", i);
      aa.value(i) = buffer;
    }

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] '%s'\n", i, (const char *) aa.value(i));
    }

    ab.resize(length);

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] '%s'\n", i, (const char *) ab.value(i));
    }

    for (unsigned i = 0; i < length; i += 1) {
      ab.value(i) = aa.value(i);
    }

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] '%s'\n", i, (const char *) ab.value(i));
    }

    printf("\n");

    printf("== Data\n");

    StringArray* str0_array = new StringArray("str0 array");
    StringArray* str1_array = new StringArray("str0 array");
    Data* tmp = str1_array;

    str0_array->resize(length);
    str1_array->resize(length);
    for (unsigned i = 0; i < length; i += 1) {
      char buffer[64];
      sprintf(buffer, "STR %u", i);
      str0_array->value(i) = buffer;
      str1_array->value(i) = str0_array->value(i);
    }

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] '%s' '%s'\n", i,
             (const char *) str0_array->value(i),
             (const char *) str1_array->value(i));
    }

    for (unsigned i = 0; i < length; i += 1) {
      char buffer[64];
      sprintf(buffer, "ANOTHER %u", i);
      str0_array->value(i) = buffer;
      str1_array->value(i) = str0_array->value(i);
    }

    printf("length:%2u\n", length);
    for (unsigned i = 0; i < length; i += 1) {
      printf("  [%2u] '%s' '%s'\n", i,
             (const char *) str0_array->value(i),
             (const char *) str1_array->value(i));
    }
    delete str0_array;
    delete tmp;

    printf("\n");    
  }

  MM::print_report();
}
