dojo.provide("websheet.test.ut.formula.sharedFormulaRefBase");

/**
 * UT suite, function for data SharedFormulaRefBase.
 */

describe("websheet.test.ut.model.ut_sharedFormulaRefBase", function() {
	var _document = new websheet.model.Document();
	var sharedRef;
	beforeEach(function() {
		utils.bindDocument(_document);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		sharedRef = new websheet.parse.SharedFormulaRefBase(parsedRef, "sr2");
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
	
	
	it("generateId", function() {
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		sharedRef = new websheet.parse.SharedFormulaRefBase(parsedRef);
		doh.is(true,sharedRef._id.indexOf("sr") == 0,"");
	});
	
	it("splitSharedReferences", function() {
		var range = {sheetName:"Sheet1", startRow: 1, startCol: 1, endRow: 10000, endCol: 1024};
		sharedRef.splitSharedReferences(range, 1, 0, _document);		
	});
	
	it("pushInOrder", function() {
		sharedRef.pushInOrder([1,1]);
		sharedRef.pushInOrder([0,0]);	
	});
	
	it("setCurrRangeNotify", function() {		
		sharedRef.setCurrRangeNotify({"main":{}}, sharedRef, "Sheet1!A2:B2");
	});	
	
//	it("setDirtyAndUpdate", function() {
//		var sheet = new websheet.model.Sheet(_document, "st1", "Sheet1");
//		sheet._createRow(1, "ro1", 15);
//		sharedRef.setDirtyAndUpdate(true, true, {sheetName:"Sheet1", startRow: 1, startCol: 1, endRow: 2, endCol: 2});
//		
//	});
});