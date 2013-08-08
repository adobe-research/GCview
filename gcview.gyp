# Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

{
  'targets': [

    {
      'target_name' : 'gcview',
      'type': 'static_library',
      'include_dirs' : [
          'src/'
      ],
      'sources': [
          'src/array.hpp',
          'src/data.cpp',
          'src/data.hpp',
          'src/gcview.cpp',
          'src/gcview.hpp',
          'src/json.hpp',
          'src/mm.cpp',
          'src/mm.hpp',
          'src/space.cpp',
          'src/space.hpp',
          'src/utils.cpp',
          'src/utils.hpp',
          'src/vector.hpp'
        ]
    },

    {
      'target_name' : 'data_units',
      'type' : 'executable',
      'include_dirs' : [
          'src/'
      ],
      'dependencies' : [
          'gcview'
      ],
      'sources' : [
          'units/data_units.cpp'
      ]
    },

    {
      'target_name' : 'units',
      'type' : 'executable',
      'include_dirs' : [
          'src/'
      ],
      'dependencies' : [
          'gcview'
      ],
      'sources' : [
          'units/units.cpp'
      ]
    },

    {
      'target_name' : 'stress_units',
      'type' : 'executable',
      'include_dirs' : [
          'src/'
      ],
      'dependencies' : [
          'gcview'
      ],
      'sources' : [
          'units/stress_units.cpp'
      ]
    },

    {
      'target_name' : 'data_updates_units',
      'type' : 'executable',
      'include_dirs' : [
          'src/'
      ],
      'dependencies' : [
          'gcview'
      ],
      'sources' : [
          'units/data_updates_units.cpp'
      ]
    },

    {
      'target_name' : 'value_units',
      'type' : 'executable',
      'include_dirs' : [
          'src/'
      ],
      'dependencies' : [
          'gcview'
      ],
      'sources' : [
          'units/value_units.cpp'
      ]
    }
  ]
}
