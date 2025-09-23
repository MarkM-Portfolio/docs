dojo.provide("websheet.test.ut.formula.sharedFormulaRef4DV");

/**
 * UT suite, function for data SharedFormulaRef4DV.
 */

describe("websheet.test.ut.model.ut_sharedFormulaRef4DV", function() {
	var _document = new websheet.model.Document();
	var sharedFormulaRef;
	beforeEach(function() {
		utils.bindDocument(_document);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		sharedFormulaRef = new websheet.parse.SharedFormulaRef4DV(parsedRef, "srd3");
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("generateId", function() {
		sharedFormulaRef.constructor.prototype._dvIdCount = undefined;
		sharedFormulaRef._generateId();
		doh.is(sharedFormulaRef._id,"srd1","");	
	});
		
	it("getNextId", function() {
		sharedFormulaRef.constructor.prototype._dvIdCount = undefined;
		expect(sharedFormulaRef.getNextId()).toBe("srd1");
		
		expect(sharedFormulaRef.getNextId()).toBe("srd1");
	});
});