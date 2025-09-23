dojo.provide("websheet.test.ut.formula.sharedFormulaRef4RulesObj");

/**
 * UT suite, function for data SharedFormulaRef4DV.
 */

describe("websheet.test.ut.model.ut_sharedFormulaRef4RulesObj", function() {
	var _document = new websheet.model.Document();
	var sharedFormulaRef;
	websheet.Constant.init();
	dojo.setObject("pe.scene.getLocale", function(){
		return "en-us";
	});
	websheet.functions.Formulas.init();
	beforeEach(function() {
		utils.bindDocument(_document);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		sharedFormulaRef = new websheet.parse.SharedFormulaRef4DV(parsedRef, "srd3");
		var dataValidation = builders.dataValidation(sharedFormulaRef, _document, {"value1":"Sheet1!A1:A14", "value2" : "Sheet1!$B$1:$B$14"}).finish();
		dataValidation.parse();
		sharedFormulaRef.data = dataValidation;
		_document.getAreaManager().startListeningArea(parsedRef, sharedFormulaRef, sharedFormulaRef);
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("removPartialRange", function() {
		var rangeInfo = {sheetName: "Sheet1", startRow: 1, startCol : 1, endRow: 1, endCol : 1};
		sharedFormulaRef.removPartialRange(rangeInfo, _document);
		doh.is(true,true,"");	
	});
	
	it("removPartialRange", function() {		
		var rangeInfo = {sheetName: "Sheet1", startRow: 2, startCol : 2, endRow: 1, endCol : 1};
		sharedFormulaRef.removPartialRange(rangeInfo, _document);
		doh.is(true,true,"");	
	});
	
	it("_undoData", function() {
		var ret = sharedFormulaRef._undoData();
		doh.is("Sheet1!A1:A14",ret.criteria.value1,"");
	});
	
	it("deleteRefToken", function() {
		var ret = sharedFormulaRef.deleteRefToken(sharedFormulaRef._refTokens[1], true);
		doh.is(true,true,"");
	});
	
	it("updateAddress", function() {
		var updateRange = {sheetName: "Sheet1", startRow: 2, startCol: 1, endRow: 10000, endCol: 1024, refMask: 31};
		sharedFormulaRef.updateAddress(updateRange,1,0,_document);
		doh.is(true,true,"");
	});	
	
	it("splitSharedReferences", function() {
		sharedFormulaRef.pushInOrder([1,1]);
		sharedFormulaRef.pushInOrder([0,0]);
		var range = {sheetName:"Sheet1", startRow: 2, startCol: 1, endRow: 10000, endCol: 1024};
		sharedFormulaRef.splitSharedReferences(range, 1, 0, _document);
	});
	
	it("splitSharedReferences", function() {
		sharedFormulaRef.pushInOrder([1,1]);
		sharedFormulaRef.pushInOrder([0,0]);
		var range = {sheetName:"Sheet1", startRow: 2, startCol: 1, endRow: 10000, endCol: 1024};
		sharedFormulaRef.splitSharedReferences(range, 0, 1, _document);
	});
	
	it("splitSharedReferences", function() {
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,5,5,websheet.Constant.RANGE_MASK);
		sharedFormulaRef = new websheet.parse.SharedFormulaRef4DV(parsedRef, "srd3");
		var dataValidation = builders.dataValidation(sharedFormulaRef, _document, {"value1":"Sheet1!A1:A14", "value2" : "Sheet1!B1:B14"}).finish();
		dataValidation.parse();
		sharedFormulaRef.data = dataValidation;
		_document.getAreaManager().startListeningArea(parsedRef, sharedFormulaRef, sharedFormulaRef);
		
		sharedFormulaRef.pushInOrder([1,1]);
		sharedFormulaRef.pushInOrder([0,0]);
		var range = {sheetName:"Sheet1", startRow: 2, startCol: 1, endRow: 10000, endCol: 1024};
		sharedFormulaRef.splitSharedReferences(range, 1, 0, _document);	
	});
	
	it("setRangeNotify", function() {
		var updateRange = {sheetName: "Sheet1", startRow: 2, startCol: 1, endRow: 10000, endCol: 1024, refMask: 31};
		sharedFormulaRef.setRangeNotify(sharedFormulaRef, {sheetName:"Sheet1", startRow: 1, startCol: 1, endRow: 2, endCol: 2});
		doh.is(true,true,"");
	});	
	
	it("setRangeNotify", function() {
		sharedFormulaRef._rowSize = 1;
		sharedFormulaRef._colSize = 1;
		var updateRange = {sheetName: "Sheet1", startRow: 2, startCol: 1, endRow: 10000, endCol: 1024, refMask: 31};
		sharedFormulaRef.setRangeNotify(sharedFormulaRef, {sheetName:"Sheet1", startRow: 0, startCol: 0, endRow: 3, endCol: 3});
		doh.is(true,true,"");
	});	
	
	it("_splitFromParent", function() {
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,5,5,websheet.Constant.RANGE_MASK);
		var dv = new websheet.parse.SharedFormulaRef4DV(parsedRef, "srd3");
		dv.data = sharedFormulaRef.data;
		
		sharedFormulaRef.data.addRange(dv);
		sharedFormulaRef._splitFromParent(_document);
		
	});	
});