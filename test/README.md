GCview test cases
===================

summary
-------

The testsuite is written in python using the nosetests framework.
https://nose.readthedocs.org/en/latest/

The goal of the tests are regression tests to verify v8 contains the gcview functionality and generates valid json data.   The v8 shell is run generating various trace logs files.  The log files are run through the python script json_reader.py to verify the output matches the json format expected by the html user interface.

setup
-----

requirements: python 2.x and nose module

installation:
$ pip install nose

note: you probably have to run pip install with sudo.  An alternative is to install virtualenv to create a custom python environment from which
you can pip install nose then add your virtualenv directory/bin to your PATH.   See http://www.virtualenv.org/en/latest/ for notes on installing
virtualenv.

running tests
-------------

> $ export V8=$HOME/workspace/v8/out/ia32.release/d8
> $ cd v8/src/gcview/test
> $ nosetests ./gcview_tests.py
> ..........
> ----------------------------------------------------------------------
> Ran 10 tests in 0.637s
>
> OK

testplan
--------

* test_usage - asserts the --gcview flags are shown in the --help usage
* test_gcview_enable - asserts running v8 with --gcview_enable creates the gcview_v8_trace file
* test_no_gcview_enable - assert without --gcview_enable does not create gcview_v8_trace file
* test_gcview_level_default - assert by default the level is medium
* test_gcview_level_lessthan0 and _greaterthan2 - asserts below 0 is same as 0 and greater than 2 (max) level is same as 2
* test_gcview_level0-2 - asserts levels 0-2 generates a trace file with levels low, medium, high respectively

*notes*:
all tests use the json_reader.py script to verify the json data is valid

junit output
------------
For use with jenkins nose has a flag to produce output in junit xml format
> $ nosetests --with-xunit ./gcview_tests.py

also you can specify the filename with --xunit-file=FILE otherwise will produce nosetests.xml


debugging tests
---------------

There are a couple of ways to debug a failing testcase with pdb (python commandline debugger)

* programatically set a breakpoint before any line of code by adding this line to the test code
> from nose.tools import set_trace; set_trace()

* automatically break at first failure or error (-s is necessary so nose does not capture stdout)
> nosetests -s --pdb ./gcview_tests.py

* also if you want more verbose output (and stdout to appear)
> nosetests -v -s ./gcview_tests.py
