dojo.provide("websheet.test.ut.formula.sharedReferenceRef");

/**
 * UT suite, function for data SharedReferenceRef.
 */

describe("websheet.test.ut.model.ut_sharedReferenceRef", function() {
	var _document = new websheet.model.Document();
	var sharedRef;
	beforeEach(function() {
		utils.bindDocument(_document);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		sharedRef = new websheet.parse.SharedReferenceRef(parsedRef, 1, 1);
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("update", function() {
		var range = {sheetName:"Sheet1", startRow: 3, startCol: 1, endRow: 10000, endCol: 1024};
		sharedRef.update(range, -1, 0, {"_source": {}});
		doh.is(true,true,"");
		
		var range = {sheetName:"Sheet1", startRow: 8, startCol: 1, endRow: 10000, endCol: 1024};
		sharedRef.update(range, -1, 0, {"_source": {"data":{}}});
		doh.is(true,true,"");	
	});
	
	
});