dojo.provide("websheet.test.ut.formula.sharedFormulaRef4CF");

/**
 * UT suite, function for data SharedFormulaRef4DV.
 */

describe("websheet.test.ut.model.ut_sharedFormulaRef4CF", function() {
	var _document = new websheet.model.Document();
	var sharedFormulaRef;
	beforeEach(function() {
		utils.bindDocument(_document);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		sharedFormulaRef = new websheet.parse.SharedFormulaRef4CF(parsedRef, "src3");
		var cf = new websheet.model.RulesObject.ConditionalFormat(sharedFormulaRef, _document);
		cf.parse();
		sharedFormulaRef.data = cf;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("generateId", function() {
		sharedFormulaRef.constructor.prototype._cfIdCount = undefined;
		sharedFormulaRef._generateId();
		doh.is(sharedFormulaRef._id,"src1","");	
	});
		
	it("getNextId", function() {
		sharedFormulaRef.constructor.prototype._cfIdCount = undefined;
		expect(sharedFormulaRef.getNextId()).toBe("src1");
		
		expect(sharedFormulaRef.getNextId()).toBe("src1");
	});
	
	it("isPartialDirty", function() {
		expect(sharedFormulaRef.isPartialDirty()).toBe(true);
		
		sharedFormulaRef.result = [[1,undefined]];	
		
		expect(sharedFormulaRef.isPartialDirty({startRow:1, endRow:2, startCol : 1, endCol:2})).toBe(true);
		expect(sharedFormulaRef.isPartialDirty({startRow:1, endRow:1, startCol : 1, endCol:1})).toBe(false);
		
		sharedFormulaRef.dirty = false;
		expect(sharedFormulaRef.isPartialDirty()).toBe(false);
	});
	
	it("setDirtyAndUpdate", function() {
		sharedFormulaRef.setDirtyAndUpdate();
	});
	
	it("_clearResult", function() {
		sharedFormulaRef._clearResult(1,1,2,2);
		sharedFormulaRef.result = [[1,2]];
		sharedFormulaRef._clearResult(0,0,1,1);
		expect(sharedFormulaRef.result).toEqual([ [ undefined, undefined ] ]);
	});
	
	it("_range2Show", function() {
		sharedFormulaRef._range2Show();
		expect(sharedFormulaRef.dirty).toBe(true);
	});
	
	it("setCurrRangeNotify", function() {
		var data = {main:{}};
		sharedFormulaRef.setCurrRangeNotify(data, sharedFormulaRef, {startRow:1, endRow:1, startCol : 1, endCol:1});
		sharedFormulaRef.setCurrRangeNotify(data, sharedFormulaRef, {startRow:0, endRow:3, startCol : 0, endCol:3});
	});
});