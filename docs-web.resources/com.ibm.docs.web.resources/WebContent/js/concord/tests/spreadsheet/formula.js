/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.tests.spreadsheet.formula");



doh.register("tests.spreadsheet.formula", [
    function testIsFormula()
    {
		var isFormula = websheet.parse.FormulaParseHelper.isFormula;
		doh.assertFalse( isFormula("=") );
    	doh.assertFalse( isFormula("{=}") );
    	doh.assertFalse( isFormula("a=") );
    	doh.assertFalse( isFormula("asdf") );
    	doh.assertTrue( isFormula("=A1+A3") );
    	doh.assertTrue( isFormula("=asdf") );
    	doh.assertTrue( isFormula("{=A1+A3}") );
    },
    function testAverage()
    {
    	var c = websheet.functions.Complete;
    	doh.assertTrue( c.AVERAGE([1,2,3]) == 2 );
    	doh.assertTrue( c.AVERAGE([3]) == 3 );
    	//doh.assertTrue( c.AVERAGE([]) == 0 );
    },
    function testSum()
	{
    	var c = websheet.functions.Complete;
        doh.assertTrue( c.SUM([1,2,3]) == 6 );
        doh.assertTrue( c.SUM([1]) == 1);
        doh.assertTrue( c.SUM([]) == 0 );
	},
	  {
		testType : "",
		name: "sample_Fixture_case",
	    setUp: function(){
	    },
	    runTest: function(){
	    	doh.t(true);//doh.t == doh.assertTrue
	    	doh.f(false);//doh.f == doh.assertFalse
	    },
	    tearDown: function(){
	    }
	  },

	  {
		  testType: "perf", //Define this as a performance test.  Used to select the runner in D.O.H.
		  trialDuration: 100, //Define that a trial (test run) of the performance test should run minimally for 100ms (however many runs of the function this means.  It is calibrated).
		  trialIterations: 10, //Run 10 trials of the test function.
		  trialDelay: 100, //Wait 100MS between each trial to allow for GC, etc.
		  name: "sampe_Fixture_performace_case",
		  setUp: function(){
		    //Setup to do before the trial runs of runTest.
		  },
		  runTest: function(){
		    //Our test function to do performance profiling.
		    for( var i = 0;i < 100;i++);//do something you need to test performance here.
		  },
		  tearDown: function(){
		    //cleanup to do after all the trials.
		  }
		}

	  // ...
	]);
