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

#include "units_shared.hpp"

static const unsigned ITERATIONS       =  5000;
static const unsigned ITERATION_PERIOD =   500;

int main() {
  for (unsigned i = 0; i < ITERATIONS; i += 1) {
    doIteration(NULL, NULL);
    if ((i + 1) % ITERATION_PERIOD == 0) {
      printf(">>>> DONE %6u / %6u ITERATIONS\n", i + 1, ITERATIONS);
    }
  }

  MM::print_report();
}
