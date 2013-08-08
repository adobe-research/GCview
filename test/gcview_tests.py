#!/usr/bin/env python

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

# testcases for gcview
# first time setup:
#     $ pip install -g nose
#
# to run:
#     $ export V8=$HOME/workspace/v8/out/ia32.release/d8
#     $ nosetests -v ./gcview_tests.py

import re, subprocess, time, os
from nose.tools import with_setup

# global variables
basedir = '..'
# the full path to the v8 shell
v8 = os.environ.get('V8')
if v8 == None:
    v8 = basedir + '/out/ia32.release/d8'
# the script to verify the o
jsonreader = basedir + '/src/gcview/json_reader.py'
# the default trace output file name
default_outfile = './gcview_v8_trace' 

# utility functions
def run_command(cmd,argslist=None,dir='.'):
    """ runs a command in the shell
        cmd: executable
        args: array of arguments
        dir: the directory to run executable 
        returns: time(ms), subprocess object, stdout
    """
    start_time = time.time()
    if argslist:
        proc = subprocess.Popen(argslist,executable=cmd,cwd=dir,stdout=subprocess.PIPE,stderr=subprocess.PIPE,shell=True)
    else:
        proc = subprocess.Popen(cmd,cwd=dir,stdout=subprocess.PIPE,stderr=subprocess.PIPE,shell=True)
    # used to use wait() here but it deadlocks, the docs recommend communicate()
    ( stdout_str, stderr_str ) = proc.communicate()
    exec_time = time.time() - start_time
    return exec_time, proc, stdout_str

# list of all trace log files used by testcases, these files will be deleted for each testcase
file_list = ['gcview_v8_trace','gcview_v8_custom.json']
def tracefile_cleanup():
    """ cleans up trace log files """
    for f in file_list:
        if os.path.exists(f):
            os.unlink(f)

# testcases
@with_setup(tracefile_cleanup)
def test_usage():
    """ test_usage: switch --help contains --gcview-enable, --gcview-level, --gcview-trace-file """
    # run v8 with --help
    time, proc, stdout_str = run_command(v8,['--help'])
    gcview_args = re.findall('--gcview_\w+', stdout_str)
    # sort result so order of arguments does not matter
    gcview_args.sort()
    assert gcview_args == ['--gcview_enable','--gcview_level','--gcview_trace_file']

@with_setup(tracefile_cleanup)
def test_gcview_enable():
    """ test_gcview_enable: --gcview-enable switch creates the default trace output file """
    # remove any existing trace files
    time, proc, stdout_str = run_command(v8,['--gcview-enable','./fib.js'])
    # assertions exit code 0 and output file exists
    assert proc.returncode == 0
    assert os.path.exists(default_outfile)

@with_setup(tracefile_cleanup)
def test_not_gcview_enable():
    """ test_not_gcview_enable: without gcview_enable switch no trace output file is created """
    if os.path.exists(default_outfile):
        os.unlink(default_outfile)
    time, proc, stdout_str = run_command(v8,['./fib.js'])
    assert proc.returncode == 0
    assert os.path.exists(default_outfile) == False

@with_setup(tracefile_cleanup)
def test_gcview_level_default():
    """ test_gcview_level_default: level is medium by default """
    if os.path.exists(default_outfile):
        os.unlink(default_outfile)
    time, proc, stdout_str = run_command(v8,['--gcview-enable','./fib.js'])
    assert proc.returncode == 0
    assert os.path.exists(default_outfile)
    time, proc, stdout_str = run_command('python ./json_reader.py ./test/gcview_v8_trace', dir=basedir)
    assert re.search("\"Level\".*'Medium'", stdout_str)

@with_setup(tracefile_cleanup)
def test_gcview_level_lessthan0():
    """ test_gcview_level_lessthan0: switch --gcview-level=-1 changes the trace level to low, same as 0 """
    if os.path.exists(default_outfile):
        os.unlink(default_outfile)
    time, proc, stdout_str = run_command(v8,['--gcview-enable','--gcview-level=-1','./fib.js'])
    assert proc.returncode == 0
    assert os.path.exists(default_outfile)
    time, proc, stdout_str = run_command('python ./json_reader.py ./test/gcview_v8_trace', dir=basedir)
    assert proc.returncode == 0
    assert re.search("\"Level\".*'Low'", stdout_str)

@with_setup(tracefile_cleanup)
def test_gcview_level_0():
    """ test_gcview_level_0: switch --gcview-level=0 changes the trace level to low """
    if os.path.exists(default_outfile):
        os.unlink(default_outfile)
    time, proc, stdout_str = run_command(v8,['--gcview-enable','--gcview-level=0','./fib.js'])
    assert proc.returncode == 0
    assert os.path.exists(default_outfile)
    time, proc, stdout_str = run_command('python ./json_reader.py ./test/gcview_v8_trace', dir=basedir)
    assert proc.returncode == 0
    assert re.search("\"Level\".*'Low'", stdout_str)

@with_setup(tracefile_cleanup)
def test_gcnoop_level_1():
    """ test_gcview_level_1: switch --gcview-level=1 changes the trace level to medium """
    if os.path.exists(default_outfile):
        os.unlink(default_outfile)
    time, proc, stdout_str = run_command(v8,['--gcview-enable','--gcview-level=1','./fib.js'])
    assert proc.returncode == 0
    assert os.path.exists(default_outfile)
    time, proc, stdout_str = run_command('python ./json_reader.py ./test/gcview_v8_trace', dir=basedir)
    assert re.search("\"Level\".*'Medium'", stdout_str)

@with_setup(tracefile_cleanup)
def test_gcview_level_2():
    """ test_gcview_level_2: switch --gcview-level=2 changes the trace level to high """
    if os.path.exists(default_outfile):
        os.unlink(default_outfile)
    time, proc, stdout_str = run_command(v8,['--gcview-enable','--gcview-level=2','./fib.js'])
    assert proc.returncode == 0
    assert os.path.exists(default_outfile)
    time, proc, stdout_str = run_command('python ./json_reader.py ./test/gcview_v8_trace', dir=basedir)
    assert proc.returncode == 0
    assert re.search("\"Level\".*'High'", stdout_str)

@with_setup(tracefile_cleanup)
def test_gcview_level_greaterthan2():
    """ test_gcview_level_greaterthan2: switch --gcview-level=3 changes the trace level to high same as 2"""
    if os.path.exists(default_outfile):
        os.unlink(default_outfile)
    time, proc, stdout_str = run_command(v8,['--gcview-enable','--gcview-level=2','./fib.js'])
    assert proc.returncode == 0
    assert os.path.exists(default_outfile)
    time, proc, stdout_str = run_command('python ./json_reader.py ./test/gcview_v8_trace', dir=basedir)
    assert proc.returncode == 0
    assert re.search("\"Level\".*'High'", stdout_str)

@with_setup(tracefile_cleanup)
def test_gcview_trace_file():
    """ test_gcview_trace_file: switch --gcview-trace-file= sets the trace filename"""
    if os.path.exists(default_outfile):
        os.unlink(default_outfile)
    if os.path.exists('./gcview_v8_custom.json'):
        os.unlink('./gcview_v8_custom.json')
    time, proc, stdout_str = run_command(v8, ['--gcview-enable','--gcview-trace-file=./gcview_v8_custom.json','./fib.js'])
    assert proc.returncode == 0
    assert os.path.exists('./gcview_v8_custom.json')
    assert os.path.exists(default_outfile) == False
    time, proc, stdout_str = run_command('python ./json_reader.py ./test/gcview_v8_custom.json', dir=basedir)
    assert proc.returncode == 0

if __name__ == '__main__':
    print("to run testcases do:\n    nosetests -v ./gcview_tests.py")
