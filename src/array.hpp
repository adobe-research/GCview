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

#ifndef _GCVIEW_ARRAY_HPP

#define _GCVIEW_ARRAY_HPP

#include "utils.hpp"

#define GCVIEW_ARRAY_MAX_LENGTH 64

#define GCVIEW_ARRAY_ITERATE(__array__, __type__, __elem__, __cmd__) \
do { \
  GCVIEW_ASSERT((__array__) != NULL); \
  Array<__type__>* __the_array__ = (Array<__type__>*) (__array__); \
  unsigned __length__ = __the_array__->getLength(); \
  for (unsigned __i__ = 0; __i__ < __length__; __i__ += 1) { \
    __type__ __elem__ = (*__the_array__)[__i__]; \
    unsigned the_index = __i__; \
    (void) __elem__; \
    (void) the_index; \
    { __cmd__ } \
  } \
} while (false)

namespace gcview {

template <typename T, unsigned MaxLength = GCVIEW_ARRAY_MAX_LENGTH>
class Array {
private:
  unsigned _length;
  T        _array[MaxLength];

public:
  unsigned getLength() const { return _length; }

  unsigned add(T elem) {
    GCVIEW_ASSERT(_length <= MaxLength);
    GCVIEW_GUARANTEE(_length < MaxLength, "array full");
    unsigned index = _length;
    _array[index] = elem;
    _length += 1;
    return index;
  }

  T& operator[](unsigned index) {
    GCVIEW_ASSERT(index < _length);
    return _array[index];
  }

  Array() : _length(0) { }
};

}

#endif // _GCVIEW_ARRAY_HPP
