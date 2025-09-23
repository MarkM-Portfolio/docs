+Summary

This document details the design of IBM Docs Spreadsheet JavaScript UT/API/Performance tests. It also covers
some of the public utility code in /com.ibm.docs.web.resources/WebContent/js/concord/test; the test utility tools
in /com.ibm.docs.web.resources/teststools/ (`teststools` is a bad folder name anyway). This document can provide a 
general guide for everyone about how to start a UT/API/Performance test.
We are still exploring this area. This document is open for everyone to update. If you -- the readers -- have any
questions, you can first refer to the Q&A part, and later discuss with your classmates.



+Changelog

Note: to edit this file, set tab size to 4 and use spaces other than tab character. 
                                                                                                            
    Date(M/D/Y)     Update Summary                                                      Author
    --------------------------------------------------------------------------------------------------------
	02/17/2014      Initial Version                                                     Han Bing Feng
	02/19/2014      How to run UT                                                       Han Bing Feng
	02/19/2014      Add best practice: use xit and xdescribe instead of comments        Han Bing Feng
    02/20/2014      Add more content to best practice: about global                     Han Bing Feng
                    Add best practice: don't change stub to "real" or otherwise
                    Add best practice: in which runner do I put my new case         
    02/21/2014      Add Jasmine library location                                        Han Bing Feng
                    Add best practice: Add a new function to existing stubs
    03/21/2014		Add best practice: Careful when expect(a).not.toBe(null)			Han Bing Feng 
    07/31/2014      Update UT, PVT (PVT is not performance unit test)                   liuzhen@cn.ibm.com                         
	
	
+Table of contents

    Overview
                Overview of the whole picture: the tools we are using, the features we can achieve, the terminology, etc.
     
    Unit test
                How to write JavaScript unit tests.
    
    Performance unit test
                How to write JavaScript unit tests to profile unit functions. 
                
    API test
                How to write API tests.
                
    Q&A
            	Miscellaneous questions that everyone may encounter.


            	
+Overview
    
Current Spreadsheet JavaScript tests aims to provide a foundation for developers/testers to:
    
    1.  Write UT/API/Performance tests based on a unified platform.
    2.  Can run UT/API tests using command line. This is to integrate UT/API running in CI pipeline.
    3.  Can report UT code coverage.
    
++The big picture

             +----------------------------+-------------------------+
             |      *API test*            |                         |
             +----------------------------+-------------------------+-----------------------+
             |  (file deleted)            |  (file deleted)         | Command line running  |
             +----------------------------+-------------------------+------------+          |
             |               (file deleted)                         |   *UT*     |          |
             +------------------------------------------------------+------------+          |
             |                          jasmine_doh_adapter                                 |
             |                          jasmine_seed                                        |
             +------------------------------------------------------------------------------+
             |                             Jasmine                                          |                       
             +-------------------------------------------------------------------+----------+
                                                                                 | PhantomJS|                                                
                                                                                 +----------+
                                                                                 | JSCover  |
                                                                                 +----------+
                                                                                             
++The tools

    1.  Jasmine is the advanced test framework we build our cases on. It is a BDD-style test framework. The official
        site is http://pivotal.github.io/jasmine/, containing a short yet sufficient introduction and document.
        This document will not provide basic details about Jasmine such as 
            *   How to define suites.
            *   How to define specs.
            *   How to write assertions.
        These are all very basics of Jasmine, please turn to its website to get the knowledge.
    2.  JSCover is a tool that measures JavaScript code coverage. Refer to its official site http://tntim96.github.io/JSCover/
        for document.
        JSCover is used in the big picture as a web server that feeds instrumented JavaScript code to PhantomJS, later
        report the code coverage.
    3.  PhantomJS is a headless web browser based on Google Chrome.  http://phantomjs.org/ is its site.
        PhantomJS is a "browser" that is controllable with command line and JavaScript. It is used to execute test cases
        automatically in command line. Right now it can execute UT cases.


++The enrichments we add

    Will be covered in next section about file layout.
    
++Terminology

    UT
        A unit test (UT) is a test to a function unit. Running unit test doesn't require the whole product to be deployed.
        UT can be run in command line and is able to generate code coverage report.
        
    API test
        An API test is a test to a complete scenario. Running API test requires the product to be deployed. Right now
        API tests can only run in browsers.
        
    Performance unit test
        A performance unit test is a test to profile a function unit. Similar to unit tests, running performance unit test
        doesn't require the whole product to be deployed.
        
++File layout

    /+com.ibm.docs.web.resources
     |
     /+teststools                       [Test tools and scripts to run UT in command line and generate code coverage]
      +-run_jscover.py                  [Python script to setup JSCover server and call PhantomJS to run cases in command
      |                                  line]
      +-run_jscover_server.bat          [Script to start JSCover server]
      +-run_jscover_server_spreadsheet_ut.bat   [Script to start JSCover server to feed instrumented JavaScript for spradsheet ut]
      +-gen_jscover_spreadsheet_ut.bat  [Script to run a full spreadsheet unit test and generate code coverage report
      |                                  in /jscover-report.]
      +-gen_jscover_spreadsheet_api.bat [Script to run a full spreadsheet API test, _TODO_ not fully functional]
      /+utils                           [JSCover and PhantomJS bin files]
       +-js.jar                         [JSCover binary files.
       +-JSCover.jar                     .
       +-JSCover-all.jar                 .]
       /+phantomjs-1.9.7-linux-x86_64   [PhantomJS Linux x64 binary]
       /+phantomjs-1.9.7-windows        [PhantomJS Windows x64 binary]
      /+js                              [PhantomJS JavaScript scripts]
       +-jasmine_runner.js              [PhantomJS JavaScript script to load Jasmine runner HTML page, waits till the
       |                                 finishes running and export the code coverage report if it has.]
      /+jscover-report                  [If ever run jasmine_runner.js, the coverage report is here.]
     /+WebContent
      /+js
       /+util
        /+jasmine-1.3.1                 [Jasmine library]
       /+wseditor
        /+test
         /+api                          [All API scripts]
         /+performance                  [PVT related files]
         /+stubs                        [Stubs used by UT scripts. The sub directory layout is a mapping of the 'real'
          |                              ones in /wseditor/js/.]
         /+data                         [Test data files for UT and performance UT. To be loaded through xhr in case.]
         /+ut							[Unit test scripts and runner. Note, the sub directory structure is tend to change.]
          +runner_formatter.html		[Runner that loads all models except cell as stub. Includes test script of
          +runner_model.html			[Runner that loads all models. Includes test script of
          +actions.js                   [Wraps all actions based on Spreadsheet API, used for API test.]
          +checkers.js                  [All utilities need for verify case state. Used both in API test and unit test.]
          +...                          [Other utilities including deferreds used in API test and builders used across
          |                              all types of tests.]



+Unit test

UT aims to cover the most basic, tiny unit functions which completes a whole user scenario. A basic framework is built up
and evolving for everyone to write unit test cases.
Currently unit test covered function areas are listed in section _Current coverage_. Current scope is limited but we
are working to enlarge it, finally cover all important function areas.
We need to write unit test cases for (list by priority):
    1.  New features. If the target new feature is in a function area that unit test doesn't cover yet, discuss with
        team mates to create a new test case base, which usually includes runner and appropriate stubs.
    2.  New defects for new features and for old features. The defect root cause is covered in current unit test scope.
    3.  Important, basic, public functions, such as toRangeJSON. Discuss this area with team members if you want to
        add cases to test a new public function.


++How to run UT

In browser, browse to
    http://<host>/docs/js/wseditor/test/ut/<runner_name>

Need to start WAS. Here WAS only acts as a web server to feed files.

++Current Coverage

Again, the function area covered by unit test is expected to grow larger in the future. This section is going to be
updated often.
    /+wseditor
     /+js
      /+i18n
       +Number.js
       +numberRecognizer.js
      /+style
       +StyleCode.js
       +StyleManager.js
      /+model                           [All model operations except formulas.]
       +_cell.js
       +Cell.js
       +StyleCell.js
       +Row.js
       +Column.js
       +Sheet.js
       +ModelHelper.js                  [Helper functions that not related to formulas.]
      +Utils.js                         [Helper functions that related to covered function areas.]
      +Formatter.js                     [Only formatStyle() function.]
      
++Stub files and "real" files

In /wseditor/test/stubs there are various stub files. Stubs are used across UT and performance UT when the "real"
object:
    *   Is not a test subject.
    *   Is complicated to construct, which may:
        -   Have to provide a lot of complicated input.
        -   Introduce more dependency.
    *   Have complicated, error-prone code that we are not willing to test in the test scripts.

A stub is easy, and should be easy, to implement. Take one for example,

    /wseditor/test/stubs/stubIDManager.js:
    
    
    dojo.provide("websheet.tests.stubs.model.stubIDManager");                       // normal dojo.provide() declaration
                                                                                       of itself.
    dojo.provide("websheet.model.IDManager");                                       // pretend itself to be the "real"
                                                                                       one. When other "real" files 
                                                                                       require this file by the name,
                                                                                       they will get this stub one.
    dojo.require("websheet.functions.IObject");                                     
    
    dojo.declare("websheet.model.IDManager", websheet.functions.IDManager, {        // Declare as if it is a "real"
                                                                                       class. Extending the interface
                                                                                       which the "real" one does.
        .
        .
        /*int*/ getRowIndexById: function(sid, /*string*/ id) {                     // A stub method we are implementing.
                                                                                       We don't implement it smart.
                                                                                       Instead we implement it silly and
                                                                                       most easy to write. Here to return
                                                                                       a row index by its ID, simply
                                                                                       returns the number after 2 characters,
                                                                                       minus by 1. So "ro1" -> 0, "ro2" -> 1.
                                                                                       Later cases can follow this consumption
                                                                                       so we don't bother initializing an
                                                                                       IDManager.
            // summary: returns number after "ro"
            return parseInt(id.substring(2)) - 1;
        },
        .
        .
    });
    
Considering the characteristic that stubs have. A stub and its "real" opponent can't exist in one code base. For example,
if stubIDManager is used, we can't require the "real" IDManager and test it in one code base (i.e. one runner, will talk
it in later section.). Or the cases that rely on the stubIDManager will fail. If 2 set of cases need conflicting stub
and "real" files, split them to different runners.

++Runner and script files

A runner file is a HTML file that loads all necessary files to form a code base to run the test scripts. A runner file
must build a code base with test subject files and appropriate stub files. As mentioned in section _Stub files and 
"real" files_, stub and its "real" opponent can't exist in one code base. So split them to different runners. Otherwise,
if you need to add new cases and the cases uses same set of test subject "real" files and stub files from a runner, you
can include your case into the runner.

Take runner_model.html or runner_formatter.html for example, runner_formatter.html loads sheet, row and column as stub,
while runner_model.html loads them for real. So cases loaded in runner_formatter.html can't be included into runner_model.html.

Refer to runner_model.html and runner_formatter.html for runner details. 

++Script files best practice

+++Keep global object clean

Script files such as ut_cell.js, ut_style.js are loaded in same code base, that is, they share same global scope, in browser
context, it means the "window" object. So be extra careful when setting variables to "window" object since they affect more
than the script you are writing.

Only set global settings to "window". Don't set properties/variables explicitly or implicitly to "window".

Don't set temporary variables or helper functions limited to one script file to "window".

For example,

    dojo.provide("websheet.test.ut.ut_blah.js");
    
    /*
     *  Do not write anything in this area. Anything set here goes to the "window" object and will be visible to all 
     *  scriptes loaded in current runner. What's more, this area is executed once the script is loaded. This area from
     *  all scripts will be executed one by one before any case can run. This will mess up your case design.
     *  Again, do not write anything in this area.
     */
    
    describe("some suite", function() {
        var testdata;                                               // Declare a temporary variable that will be used
                                                                    // across cases.
        var someStaticObject = new MyObj();                         // Declare a temporary variable and initialize here.
        
        window.app.someObjectReference = someStaticObject;          // Don't do this. In other script the code in this area
                                                                    // will be executed before any case can run, which will
                                                                    // re-set window.app.someObjectReference if they do so.
                                                                    // so in cases we will not get the someStaticObject
                                                                    // declared in this script.
        
        var helper = function() {                                   // Define helper function here.  
            ;               
        };
        
        beforeEach(function() {
            window.app.someObjectReference = someStaticObject       // bind the someStaticObject to "window" in beforeEach()
            testdata = "blah";                              
        });
        
        afterEach(function() {
            delete window.app.someObjectReference;                  // It is best to unbind the object reference to window in global.
                                                                    // So we can keep a consist, controllable scope across cases.
        });
        
        it("can do something", function() {
            someStaticObject.do(testdata);                          // testdata, someStaticObject and helper is visible
            helper(testdata);                                       // and usable in cases.
        });
    
    });
    
+++Use xit() and xdescribe() instead of comment deprecated case

Use xit() and xdescribe() to declare unused cases or unfinished cases, don't use comment. This is to keep the cases clean.
If a case should never be enabled again, delete it.

+++Don't change stub to its "real" opponent, or otherwise

When add a case to an existing runner, it is possible that the dependency of the test subject code can't meet. If you
consider to change the dependency scripts loaded by the runner, for example, change one stub to its "real" opponent or
otherwise, HOLD ON! Don't do this. If any other scripts contained in this runner depend on the logic defined in a stub
script, changing it may ruin the already passed case.

It is recommended to create a new runner in this case. If you insist in changing the old runner, do changes carefully 
and repeatedly run the runner to make all old cases pass.

+++With several runners at hand, if I need to add a new bunch of cases to a new function area, which runner do I use,
   or do I need to create a new runner

It depends.
Runners, despite the names indicating their designed target function area, should only differ with each other about the
dependency scripts they load. The "real" files set and the stub files set, in one runner, must be different from the sets
from any other runner. If for one runners, both the stub set and the "real" set are subsets of the sets from another runner,
than the 2 runners should be merged.

So you need to understand the dependencies the subject function area need, know which part need to be "real" and which part
not necessary. Find a runner that the stub set and the "real" set meet your need. If more than one runner is ok, choose
one that logically nearest to the subject function area. If no runner meets your need, create a new one.

+++Add a new function to existing stubs

Since stubs are implemented quick and silly at first, it is normal that it misses some functions that your case depends.
It is very OK to add missing properties and functions, as long as to keep your stub function implementation to be quick
and silly.
Do not ever try to move whole "real" implementation to stub. If you have to move "real" implementation, either:
    *   Re-consider your case implementation, if a simpler stub implementation is possible
    *   Use "real" file instead of the stub. But discuss with teammates before doing so
Remember that a stub implementation that can't be understood by first glance is not a good implementation.


++Running UT in command line

A set of scripts and tools are prepared to run UT in command line and generate code coverage report.

To run the command line tools, Python27 is needed.

Suppose Python27 is installed and path to python.exe is added to system path. Go to directory /com.ibm.docs.web.resources/testtools,
run "gen_jscover_spreadsheet_ut.bat".

Wait till the running completes. The coverage report can be found in /com.ibm.docs.web.resources/testtools/jscover-report/jscoverage.html.
A log file test_run.log is generated in the same directory with all browser console log content.

+++When a new runner is added

When a new UT runner is added, add the runner path to /wseditor/test/ut/suite.json.html. Add this by adding a JSON
object with key "suite-url" in it:
    [
        { "suite-url": "/wseditor/test/ut/runner_model.html" },
        { "suite-url": "/wseditor/test/ut/runner_formatter.html" },
        { "suite-url": "/wseditor/test/ut/runner_new.html" }
    ]



+Performance unit test

_TODO_



+API test

_TODO_


+PVT test

Nearly nothing needs to be added atop API test.



+Q&A

Q1: I construct a new object in a test local variable in beforeEach(), but a member field in the object seems 
    not initialized across cases. Why?
        describe("my test", function() {
            var myobj;
            
            beforeEach(function() {
                myobj = new MyObj();                                    // in constructor, a property _propertyA is
                                                                        // initialized as { }
            });
            
            it("can set _propertyA", function() {
                myobj._propertyA["A"] = "a";
            });
            
            it("should get an empty myobj after beforeEach()", function() {
                expect.(myobj._propertyA["A"]).toBe(undefined);                   // fails, it is "a".
            });
        });

A1: It happens when MyObj is constructed via dojo.declare(). The property is declared as a "member field" in the Dojo
    declared class, like following,
        dojo.declare("MyObj", null, {
            _propertyA: { }
            constructor: function() {
                ;
            }
        });
    _propertyA will not be re-initialized by calling 
        new MyObj();
    
    Either:
        1,  call this._propertyA = {} in constructor, not in field declaration part.
        2,  call myobj._propertyA = {} after constructing myobj in beforeEach().

Q2: In embedded describe(), is the beforeEach() and afterEach() from outer describe() executed? In which order?

A2: Yes, outer beforeEach() and afterEach() will be executed. Order:
    
    Outer beforeEach()
        Embedded beforeEach()
        Embedded it()
        Embedded afterEach()
    Outer afterEach()         

    
    