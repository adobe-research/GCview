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

#ifndef _GCVIEW_DATA_HPP

#define _GCVIEW_DATA_HPP

#include "array.hpp"
#include "json.hpp"
#include "utils.hpp"
#include "vector.hpp"

namespace gcview {

class Space;

////////// Class Data //////////

class Data {
  friend class Space;

public:
  typedef enum {
    BoolType,
    ByteType,
    IntType,
    DoubleType,
    StringType,
    EnumType
  } DataType;

private:
  void setID(unsigned id) { _id = id; }

protected:
  unsigned _id;
  const char* const _name;
  const DataType _data_type;
  const bool _is_array;
  const char* const _group_name;
  Array<const char*>* const _enum_members;

  bool _modified;

  static const char* getDataTypeStr(DataType data_type) {
    switch (data_type) {
    case BoolType   : return "Bool";
    case ByteType   : return "Byte";
    case IntType    : return "Int";
    case DoubleType : return "Double";
    case StringType : return "String";
    case EnumType   : return "Enum";
    default: GCVIEW_UNREACHABLE_NULL("unknown data type");
    }
  }

  bool isModified() const { return _modified; }

  virtual bool isValueModified() const = 0;
  virtual void updatePrevValue() = 0;

  void updateModifiedFlag()              { _modified = isValueModified(); }
  void updateModifiedFlag(bool modified) { _modified = modified;          }

  void validateEnumValue(uintptr_t value) const {
    GCVIEW_ASSERT(_data_type == EnumType);
    GCVIEW_ASSERT(_enum_members != NULL);
    GCVIEW_GUARANTEE(value < (uintptr_t) _enum_members->getLength(),
                     "enum value is out-of-bounds");
  }

  void writeJSONMetadata(JSONWriter* writer) const;
  void writeJSONData(JSONWriter* writer) const {
    if (_modified) {
      writeJSONDataSpecial(writer);
    } else {
      writer->writeNull();
    }
  }
  virtual void writeJSONDataSpecial(JSONWriter* writer) const = 0;

  virtual void validate() const = 0;

  Data(const char* name, DataType data_type, bool is_array,
       const char* group_name = NULL);

public:
  const char* getName() const { return _name; }
  DataType getDataType() const { return _data_type; }
  bool isArray() const { return _is_array; }

  unsigned addEnumMember(const char* enum_member);

  virtual ~Data();
};

////////// Element Classes //////////

template <typename T>
class SimpleElement {
private:
  T _value;

public:
  typedef T ValueType;
  static const bool ArithmeticOpsAreAllowed = true;

  static T getDefault() { return (T) 0; }

  SimpleElement() : _value((T) 0) { }

  T get() const { return _value; }
  void reset() { set((T) 0); }
  void set(T value) { _value = value; }
  bool isEqualTo(T value) const { return _value == value; }
};

class StringElement {
private:
  const char* _str;

  void reclaim() {
    if (_str != NULL) {
      delete[] _str;
      _str = NULL;
    }
  }

public:
  typedef const char* ValueType;

  static const char* getDefault() { return NULL; }

  StringElement() : _str(NULL) { }
  ~StringElement() { reclaim(); }

  const char* get() const { return Utils::getStrOrEmptyStr(_str); }
  void reset() { reclaim(); }
  void set(const char* str) {
    if (!isEqualTo(str)) {
      reclaim();
      _str = Utils::cloneStr(str);
    }
  }
  bool isEqualTo(const char* str) const { return Utils::areStrsEqual(str, _str); }
};

template <typename E>
class Element {
private:
  E _elem;

  typedef Element<E> ET;
  typedef typename E::ValueType T;

  T get() const { return _elem.get(); }

  void set(T value) { _elem.set(value); }

  bool isEqualTo(T value) const { return _elem.isEqualTo(value); }

  void add(T value) {
    GCVIEW_ASSERT(E::ArithmeticOpsAreAllowed);
    _elem.set(get() + value);
  }

  void sub(T value) {
    GCVIEW_ASSERT(E::ArithmeticOpsAreAllowed);
    _elem.set(get() - value);
  }

public:
  Element() { }
  Element(const ET& other) {
    GCVIEW_UNREACHABLE("copy constructor should not be called");
  }

  operator T() const { return get(); }

  void operator=(T value) { set(value); }
  void operator=(const ET& other) { set(other.get()); }

  bool operator==(T value) const { return isEqualTo(value); }
  bool operator==(const ET& other) const { return isEqualTo(other.get()); }

  bool operator!=(T value) const { return !isEqualTo(value); }
  bool operator!=(const ET& other) const { return !isEqualTo(other.get()); }

  void operator+=(T value) { add(value); }
  void operator+=(const ET& other) { add(other.get()); }

  void operator-=(T value) { sub(value); }
  void operator-=(const ET& other) { sub(other.get()); }
};

////////// ValueData Classes //////////

template <typename ET, Data::DataType DT>
class ValueData : public Data {
private:
  typedef typename ET::ValueType T;
  typedef ValueData<ET, DT> VDT;

  Element<ET> _prev_value;
  Element<ET> _value;

protected:
  virtual bool isValueModified() const { return _value != _prev_value; }

  virtual void updatePrevValue() {
    if (_modified) {
      _prev_value = _value;
    } else {
      GCVIEW_ASSERT(_value == _prev_value);
    }
  }

  virtual void writeJSONDataSpecial(JSONWriter* writer) const {
    writer->write((T) _value);
  }

  virtual void validate() const {
    if (_data_type == EnumType) {
      validateEnumValue((uintptr_t) get());
    }
  }

public:
  static const DataType StaticValueDataType = DT;
  static const bool StaticIsArray = false;

  void reset() { set(ET::getDefault()); }

  T get() const { return (T) _value; }

  void set(T value) { _value = value; }

  Element<ET>& value() { return _value; }

  ValueData(const char* name, const char* group_name = NULL)
      : Data(name, DT, false /* is_array */, group_name) { }
};

typedef ValueData<SimpleElement<bool>, Data::BoolType> BoolValue;
typedef ValueData<SimpleElement<unsigned char>, Data::ByteType> ByteValue;
typedef ValueData<SimpleElement<int>, Data::IntType> IntValue;
typedef ValueData<SimpleElement<double>, Data::DoubleType> DoubleValue;
typedef ValueData<StringElement, Data::StringType> StringValue;
typedef ValueData<SimpleElement<unsigned char>, Data::EnumType> EnumValue;

////////// ArrayData Classes //////////

template <typename ET, Data::DataType DT>
class ArrayData : public Data {
private:
  typedef typename ET::ValueType T;
  typedef ValueData<ET, DT> VDT;

  Vector<Element<ET> > _prev_array;
  Vector<Element<ET> > _array;

  bool areArraysEqual() const {
    const unsigned length = _array.getLength();
    if (length != _prev_array.getLength()) {
      return false;
    }
    for (unsigned i = 0; i < length; i += 1) {
      if (_array[i] != _prev_array[i]) {
        return false;
      }
    }
    return true;
  }

protected:
  virtual bool isValueModified() const { return !areArraysEqual(); }

  virtual void updatePrevValue() {
    if (_modified) {
      const unsigned length = _array.getLength();
      _prev_array.resize(length);
      for (unsigned i = 0; i < length; i += 1) {
        _prev_array[i] = _array[i];
      }
    } else {
      GCVIEW_ASSERT(areArraysEqual());
    }
  }

  virtual void writeJSONDataSpecial(JSONWriter* writer) const {
    JSONArrayWriter y(writer);
    const unsigned length = _array.getLength();
    for (unsigned i = 0; i < length; i += 1) {
      y.writeElem((T) _array[i]);
    }
  }

  virtual void validate() const {
    const unsigned length = _array.getLength();
    if (_data_type == EnumType) {
      for (unsigned i = 0; i < length; i += 1) {
        validateEnumValue((uintptr_t) get(i));
      }
    }
  }
public:
  static const DataType StaticArrayDataType = DT;
  static const bool StaticIsArray = true;

  void reset() { reset(ET::getDefault()); }

  void reset(T value) {
    const unsigned length = _array.getLength();
    for (unsigned i = 0; i < length; i += 1) {
      set(i, value);
    }
  }

  void resize(unsigned new_length) { _array.resize(new_length); }

  unsigned getLength() const { return _array.getLength(); }

  T get(unsigned index) const { return (T) _array[index]; }

  void set(unsigned index, T value) { _array[index] = value; }

  Element<ET>& value(unsigned index) { return _array[index]; }

  ArrayData(const char* name, const char* group_name = NULL)
      : Data(name, DT, true /* is_array */, group_name)  { }
};

typedef ArrayData<SimpleElement<bool>, Data::BoolType> BoolArray;
typedef ArrayData<SimpleElement<unsigned int>, Data::ByteType> ByteArray;
typedef ArrayData<SimpleElement<int>, Data::IntType> IntArray;
typedef ArrayData<SimpleElement<double>, Data::DoubleType> DoubleArray;
typedef ArrayData<StringElement, Data::StringType> StringArray;
typedef ArrayData<SimpleElement<unsigned char>, Data::EnumType> EnumArray;

}

#endif // _GCVIEW_DATA_HPP
