#!/usr/bin/python

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

import json, sys

class IncJSONReader:
    def __init__(self, file_name):
        self.file = open(file_name)
        self.BufferSize = 1024
        self.buffer = ''
        self.index = 0

        self.in_double_quotes = False
        self.nesting = [ 0, 0, 0 ]
        self.finished = False

        try:
            while self.get_next_char() != '[':
                pass
        except IOError:
            pass

    def replace_buffer(self):
        buffer = self.file.read(self.BufferSize)
        if not buffer:
            raise IOError
        self.buffer = buffer
        self.index = 0

    def get_next_char(self):
        if self.index == len(self.buffer):
            self.replace_buffer()
        index = self.index
        res = self.buffer[index]
        self.index = index + 1
        return res

    def do_nesting(self, num, opening):
        if not self.in_double_quotes:
            if opening:
                self.nesting[num] += 1
            else:
                if self.nesting[num] == 0:
                    raise IOError
                else:
                    self.nesting[num] -= 1

    def __iter__(self):
        return self

    def next(self):
        if self.finished:
            raise StopIteration

        next_str = ''
        last_was_escape = False
        while True:
            next = self.get_next_char()

            if last_was_escape:
                last_was_escape = False
            elif next == '\\':
                if self.in_double_quotes:
                    last_was_escape = True
            elif next == '"':
                self.in_double_quotes = not self.in_double_quotes
            elif next == '[':
                self.do_nesting(0, True)
            elif next == ']':
                if self.nesting[0] == 0 and \
                        self.nesting[1] == 0 and \
                        self.nesting[2] == 0 and \
                        not self.in_double_quotes:
                    self.finished = True
                    return json.loads(next_str)
                self.do_nesting(0, False)
            elif next == '(':
                self.do_nesting(1, True)
            elif next == ')':
                self.do_nesting(1, False)
            elif next == '{':
                self.do_nesting(2, True)
            elif next == '}':
                self.do_nesting(2, False)
            elif next == ',':
                if self.nesting[0] == 0 and \
                        self.nesting[1] == 0 and \
                        self.nesting[2] == 0 and \
                        not self.in_double_quotes:
                    return json.loads(next_str)

            if next != '\t' and next != '\n':
                next_str += next
