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

#include <stdio.h>

#include "mm.hpp"

#if GCVIEW_ENABLE_MM_SUMMARY

namespace gcview {

size_t MM::_curr_allocated_count = 0;
unsigned long long MM::_total_allocated_bytes = 0;
unsigned long long MM::_total_array_allocated_bytes = 0;

void* MM::alloc(size_t size_bytes, bool is_array) {
  void *res = malloc(size_bytes);

  if (res != NULL) {
    _curr_allocated_count += 1;
    if (!is_array) {
      _total_allocated_bytes += (unsigned long long) size_bytes;
    } else {
      _total_array_allocated_bytes += (unsigned long long) size_bytes;
    }
  }

  if (GCVIEW_ENABLE_MM_TRACING) {
    print_alloc_event(true /* is_alloc */, size_bytes, res, is_array);
  }

   return res;
}

void MM::free(void* ptr, bool is_array) {
  if (GCVIEW_ENABLE_MM_TRACING) {
    print_alloc_event(false /* is_alloc */, 0 /* size_ bytes */,
                      ptr, is_array);
  }

  if (ptr != NULL) {
    _curr_allocated_count -= 1;
  }

  ::free(ptr);
}

void MM::print_alloc_event(bool is_alloc, size_t size_bytes,
                           void* ptr, bool is_array) {
  printf(">> GCview - %s %p %ld %s (curr alloc count: %ld)\n",
         (is_alloc) ? "alloc" : "free",
         ptr, size_bytes,
         (is_array) ? "array" : "obj", _curr_allocated_count);
}

void MM::print_report() {
  printf("\n");
  printf("## GCview allocations\n");
  printf("##   allocated count       %20ld\n", _curr_allocated_count);
  printf("##   total allocated       %20lld bytes\n", _total_allocated_bytes);
  printf("##   total array allocated %20lld bytes\n", _total_array_allocated_bytes);
}

}

#endif // GCVIEW_ENABLE_MM_SUMMARY
