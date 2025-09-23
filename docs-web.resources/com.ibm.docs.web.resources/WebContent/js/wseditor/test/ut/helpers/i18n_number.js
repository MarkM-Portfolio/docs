dojo.provide("websheet.test.ut.helpers.i18n_number");

/**
 * UT of Formatting functions in i18n.Number
 */

describe("websheet.test.ut.helpers.ut_i18n_number", function() {
	
	websheet.Constant.init();
	
	beforeEach(function() {
		;
	});
	
	afterEach(function() {
		;
	});
	
	it("is defect 37706, format string as fraction will hang", function() {
		var s = "=1.2^8";
		var format = { "category": "fraction", "code": "# ???/???" };
		doh.is("=1.2^8", websheet.i18n.Number.format(s, format), "return the string as-is");
	});
});
