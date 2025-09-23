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

//dojo.provide("concord.tests.jasmine_doh_adapter");
dojo.provide("websheet.test.jasmine_doh_adapter");
/**
 * This script adapts doh assertion API to Jasmine "expect"s. Loading this script will
 * re-write all doh assertions.
 * 
 * Due to Jasmine's BDD test style, all expects must be in a Jasmine's "spec", i.e. a Jasmine it() function.
 * Failing to do so will generate a Jasmine exception. This adapter will automatically catch the exception and
 * log an error to console... which can be turned off.
 * 
 *  Hints in the assertions will be logged prior to the expection... which can be turned off.
 */

(function(global) {
	
	var _AUTO_CATCH_JASMINE_EXCEPTION = true;
	
	var _LOG_HINTS = false;
	
	if (global.doh == null) {
		global.doh = {};
	}
	
	// re-write all doh assertions
	var _jasmine_expect = function(/*Object*/ expected, /*Object*/ actual, /*String?*/ hint, /* string */ op) {
		if (hint != null && _LOG_HINTS) {
			console.log("DOH hint: ", hint);
		}
		
		try
		{
			switch (op) {
			case "is":
				expect(actual).toEqual(expected);
				break;
			case "isNot":
				expect(actual).not.toEqual(expected);
				break;
			case "t":
				expect(actual).toBeTruthy();
				break;
			case "f":
				expect(actual).toBeFalsy();
				break;
			default:
				break;
			}
		}
		catch (e)
		{
			if (e instanceof TypeError && _AUTO_CATCH_JASMINE_EXCEPTION) {
				// calling expect out of Jasmine it() will cause a TypeError, catch it and log
				console.warn("calling expection, expected ", expected, ", actual ", actual, " out of Jasmine it(). Ignore it.");
			} else {
				throw e;
			}
		}
	};
	
	doh.t = doh.assertTrue = function(/*Object*/ condition, /*String?*/ hint){
		_jasmine_expect(null, condition, hint, "t");
	};
	
	doh.f = doh.assertFalse = function(/*Object*/ condition, /*String?*/ hint){
		_jasmine_expect(null, condition, hint, "f");
	};
	
	doh.e = doh.assertError = function(/*Error object*/expectedError, /*Object*/scope, /*String*/functionName, /*Array*/args, /*String?*/ hint){
		//	summary:
		//		Test for a certain error to be thrown by the given function.
		//	example:
		//		t.assertError(dojox.data.QueryReadStore.InvalidAttributeError, store, "getValue", [item, "NOT THERE"]);
		//		t.assertError(dojox.data.QueryReadStore.InvalidItemError, store, "getValue", ["not an item", "NOT THERE"]);
		try{
			scope[functionName].apply(scope, args);
		}catch (e){
			_jasmine_expect(expectedError, e, hint, "is");
		}
	};
	
	doh.is = doh.strictIs = doh.assertEqual = function(/*Object*/ expected, /*Object*/ actual, /*String?*/ hint) {
		_jasmine_expect(expected, actual, hint, "is");
	};
	
	doh.isNot = doh.assertNotEqual = function(/*Object*/ notExpected, /*Object*/ actual, /*String?*/ hint) {
		_jasmine_expect(notExpected, actual, hint, "isNot");
	};
	
})(window);
