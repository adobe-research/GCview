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

#ifndef _GCVIEW_JSON_HPP

#define _GCVIEW_JSON_HPP

#include <stdio.h>

#include "utils.hpp"

namespace gcview {

class JSONScope;
class JSONObjectWriter;
class JSONArrayWriter;

class JSONWriter {
  friend class JSONScope;
  friend class JSONObjectWriter;
  friend class JSONArrayWriter;

private:
  FILE*       _fout;
  const char* _file_name;
  unsigned    _active_objects;
  unsigned    _active_arrays;
  unsigned    _active_with_newlines;

  void baseWrite(const char* str) {
    GCVIEW_ASSERT(str != NULL);
    fprintf(_fout, "%s", str);
  }

  void writeSeparator(unsigned count, bool add_newline) {
    if (count > 0) {
      baseWrite(",");
    }
    if (add_newline) {
      writeNewline();
      unsigned count = _active_with_newlines - 1;
      for (unsigned i = 0; i < count; i += 1) {
        baseWrite(" ");
      }
    }
    baseWrite(" ");
  }

  void writeNewline() {
    baseWrite("\n");
  }

  void startObject() {
    _active_objects += 1;
    baseWrite("{");
  }

  void endObject() {
    baseWrite(" }");
    GCVIEW_ASSERT(_active_objects > 0);
    _active_objects -= 1;
  }

  void startArray() {
    _active_arrays += 1;
    baseWrite("[");
  }

  void endArray() {
    baseWrite(" ]");
    GCVIEW_ASSERT(_active_arrays > 0);
    _active_arrays -= 1;
  }

  void increaseActiveWithNewlines() { _active_with_newlines += 1; }
  void decreaseActiveWithNewlines() {
    GCVIEW_ASSERT(_active_with_newlines > 0);
    _active_with_newlines -= 1;
  }

public:
  JSONWriter(FILE* fout = stdout)
      : _fout(fout), _file_name(NULL),
        _active_objects(0), _active_arrays(0), _active_with_newlines(0) { }

  JSONWriter(const char* file_name)
      : _fout(NULL), _file_name(file_name),
        _active_objects(0), _active_arrays(0), _active_with_newlines(0) {
    GCVIEW_ASSERT(file_name != NULL);
    _fout = fopen(file_name, "w");
    GCVIEW_GUARANTEE(_fout != NULL, "could not open file");
  }

  void writeNull() {
    baseWrite("null");
  }

  void write(bool val) {
    if (!val) {
      baseWrite("false");
    } else {
      baseWrite("true");
    }
  }

  void write(unsigned char val) {
    char buffer[8];
    Utils::formatStr(buffer, 8, "%hhu", val);
    baseWrite((const char*) buffer);
  }

  void write(int val) {
    char buffer[16];
    Utils::formatStr(buffer, 16, "%d", val);
    baseWrite((const char*) buffer);
  }

  void write(unsigned val) {
    char buffer[16];
    Utils::formatStr(buffer, 16, "%u", val);
    baseWrite((const char*) buffer);
  }

  void write(double val) {
    char buffer[64];
    Utils::formatStr(buffer, 64, "%1.10f", val);
    unsigned index = strlen(buffer) - 1;
    while (buffer[index] == '0') {
      index -= 1;
    }
    if (buffer[index] == '.') {
      index -= 1;
    }
    buffer[index + 1] = '\0';
    baseWrite((const char*) buffer);
  }

  void write(const char* str) {
    if (str == NULL) {
      baseWrite("\"\"");
    } else {
      baseWrite("\"");
      baseWrite(str);
      baseWrite("\"");
    }
  }

  void flush() {
    fflush(_fout);
  }

  ~JSONWriter() {
    GCVIEW_ASSERT(_active_objects == 0);
    GCVIEW_ASSERT(_active_arrays == 0);
    GCVIEW_ASSERT(_active_with_newlines == 0);

    if (_file_name != NULL) {
      fclose(_fout);
    }
  }
};

class JSONScope {
protected:
  JSONWriter* const _writer;
  unsigned _count;
  bool _add_newlines;

  JSONScope(JSONWriter* writer, bool add_newlines)
      : _writer(writer), _count(0), _add_newlines(add_newlines) {
    if (add_newlines) {
      _writer->increaseActiveWithNewlines();
    }
  }

  void writeSeparator() {
    _writer->writeSeparator(_count, _add_newlines);
    _count += 1;
  }

public:
  ~JSONScope() {
    if (_add_newlines) {
      _writer->decreaseActiveWithNewlines();
    }
  }
};

class JSONObjectWriter : public JSONScope {
public:
  JSONObjectWriter(JSONWriter* writer, bool add_newlines = false)
      : JSONScope(writer, add_newlines) {
    _writer->startObject();
  }

  void startPair(const char* str) {
    writeSeparator();
    _writer->write(str);
    _writer->baseWrite(" : ");
  }

  template <typename T>
  void writePair(const char* str, T val) {
    startPair(str);
    _writer->write(val);
  }

  ~JSONObjectWriter() {
    _writer->endObject();
  }
};

class JSONArrayWriter : public JSONScope {
public:
  JSONArrayWriter(JSONWriter* writer, bool add_newlines = false)
      : JSONScope(writer, add_newlines) {
    _writer->startArray();
  }

  void startElem() {
    writeSeparator();
  }

  template <typename T>
  void writeElem(T val) {
    startElem();
    _writer->write(val);
  }

  ~JSONArrayWriter() {
    _writer->endArray();
  }
};

}

#endif // _GCVIEW_JSON_HPP
