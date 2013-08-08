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

#ifndef _GCVIEW_MM_HPP

#define _GCVIEW_MM_HPP

#include <stdlib.h>

#define GCVIEW_ENABLE_MM_SUMMARY    0
#define GCVIEW_ENABLE_MM_TRACING    0

#if GCVIEW_ENABLE_MM_SUMMARY

namespace gcview {

class MM {
private:
  static size_t _curr_allocated_count;
  static unsigned long long _total_allocated_bytes;
  static unsigned long long _total_array_allocated_bytes;

  static void print_alloc_event(bool is_alloc, size_t size_bytes,
                                void* ptr, bool is_array);

public:
  static void* alloc(size_t size_bytes, bool is_array);
  static void free(void* ptr, bool is_array);
  static void print_report();
};

}

inline void* operator new(size_t size_bytes) {
  return gcview::MM::alloc(size_bytes, false /* is_array */);
}

inline void* operator new[](size_t size_bytes) {
  return gcview::MM::alloc(size_bytes, true /* is_array */);
}

inline void operator delete(void* ptr) {
  gcview::MM::free(ptr, false /* is_array */);
}

inline void operator delete[](void* ptr) {
  gcview::MM::free(ptr, true /* is_array */);
}

#else // GCVIEW_ENABLE_MM_SUMMARY

namespace gcview {

class MM {
public:
  static void print_report() { }
};

}

#endif // GCVIEW_ENABLE_MM_SUMMARY

#endif // _GCVIEW_MM_HPP
