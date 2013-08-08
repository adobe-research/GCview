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

#ifndef _GCVIEW_VECTOR_HPP

#define _GCVIEW_VECTOR_HPP

#include "utils.hpp"

namespace gcview {

template <typename T>
class Vector {
private:
  unsigned _length;
  T*       _array;

public:
  unsigned getLength() const { return _length; }

  void resize(unsigned new_length) {
    if (new_length != _length) {
      T* new_array = NULL;
      if (new_length > 0) {
        new_array = new T[new_length];
        GCVIEW_ALLOC_GUARANTEE(new_array);
        const unsigned copy_length =
          (new_length < _length) ? new_length : _length;
        for (unsigned i = 0; i < copy_length; i += 1) {
          new_array[i] = _array[i];
        }
      }

      reclaim();

      if (new_length > 0) {
        GCVIEW_ASSERT(new_array != NULL);
        _array = new_array;
        _length = new_length;
      }
    }
  }

  void reclaim() {
    if (_array != NULL) {
      GCVIEW_ASSERT(_length > 0);
      delete[] _array;
      _array = NULL;
      _length = 0;
    } else {
      GCVIEW_ASSERT(_length == 0);
    }
  }

  T get(unsigned index) const {
    GCVIEW_ASSERT(index < _length);
    GCVIEW_ASSERT(_array != NULL);
    return _array[index];
  }

  void set(unsigned index, T v) const {
    GCVIEW_ASSERT(index < _length);
    GCVIEW_ASSERT(_array != NULL);
    _array[index] = v;
  }

  T& operator[](unsigned index) const {
    GCVIEW_ASSERT(index < _length);
    GCVIEW_ASSERT(_array != NULL);
    return _array[index];
  }

  Vector() : _length(0), _array(NULL) { }
  ~Vector() { reclaim(); }
};

}

#endif // _GCVIEW_VECTOR_HPP
