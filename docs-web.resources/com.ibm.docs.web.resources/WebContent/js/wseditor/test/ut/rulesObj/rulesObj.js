dojo.provide("websheet.test.ut.rulesObj.rulesObj");

/**
 * UT suite, function for rulesObj.
 */

describe("websheet.test.ut.rulesObj.ut_rulesObj", function() {
	var _document = new websheet.model.Document();
	var _sheet = new websheet.model.Sheet(_document);
	
	var area;
	beforeEach(function() {
		utils.bindDocument(_document);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4DV(parsedRef, "dv1");
		_document._areaManager = _document.getAreaManager(); 
	});
	
	afterEach(function() {
		_sheet._rows = [];
		utils.unbindDocument();
	});
	
	it("rangeNum", function() {
		var dataValidation = builders.dataValidation(area, _document).finish();
		doh.is(1, dataValidation.rangeNum(), "data validation object has one range");
	});
	
	it("addRange, rangeNum should be 2", function() {
		var dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).finish();
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 3,3,4,4,websheet.Constant.RANGE_MASK);
		var area2 = new websheet.parse.Area(parsedRef, "dv2", websheet.Constant.RangeUsage.DATA_VALIDATION);
		dataValidation.addRange(area2, true);
		doh.is(2, dataValidation.rangeNum(), "data validation object has one range");
	});
	
	it("removeRange, rangeNum should be correct", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"list","errorStyle":"warning","IME":"noControl","allowBlank":false,"showDropDown":true,"showInputMsg":true,"showErrorMsg":true,"promptTitle":"Please select response from list","operator":"between","value1":"\"Y, N, CU, CO, F, 3, \""}).finish();
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 3,3,4,4,websheet.Constant.RANGE_MASK);
		var area2 = new websheet.parse.Area(parsedRef, "dv2", websheet.Constant.RangeUsage.DATA_VALIDATION);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 3,3,4,4,websheet.Constant.RANGE_MASK);
		var area3 = new websheet.parse.Area(parsedRef, "dv3", websheet.Constant.RangeUsage.DATA_VALIDATION);

		dataValidation.addRange(area2);
		dataValidation.addRange(area3);
		
		dataValidation.removeRange(area);
		doh.is(2, dataValidation.rangeNum(), "data validation object has two ranges");
		
		dataValidation.removeRange(area3);
		doh.is(1, dataValidation.rangeNum(), "data validation object has one range");
		
		dataValidation.removeRange(area2);
		doh.is(0, dataValidation.rangeNum(), "data validation object doesn't have range");
	});
	
	it("parse", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"whole","operator":"between","value1":"a1","value2":"$b$1"}).finish();
		dataValidation.parse();
		doh.is(0, 0, "data validation parse");
	});
		
	it("_parseBaseRef", function() {
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 3,3,4,4,websheet.Constant.RANGE_MASK);
		var area2 = new websheet.parse.Area(parsedRef, "dv2", websheet.Constant.RangeUsage.DATA_VALIDATION);
		var dataValidation = builders.dataValidation(area2, _document).finish();
		dataValidation.addRange(area);
		dataValidation._parseBaseRef();
		doh.is(1, dataValidation._topRow, "topRow of data validation should be 1");
		doh.is(1, dataValidation._leftCol, "leftCol of data validation should be 1");
	});
	
	it("_generateRefToken", function() {
		var dataValidation = builders.dataValidation(area, _document).finish();
		var val = new websheet.model.RulesObject.RuleVal("= Sheet2!a1");
		val.parseFormulaValue();
		var token = dataValidation._generateRefToken(val._tokenArray[0]);
		doh.is(true, token._calculateValue instanceof websheet.parse.Area, "");
		
		var val = new websheet.model.RulesObject.RuleVal("= a1");
		val.parseFormulaValue();
		var token = dataValidation._generateRefToken(val._tokenArray[0]);
		doh.is(true, token._calculateValue instanceof websheet.parse.Area, "");
		
		var val = new websheet.model.RulesObject.RuleVal("= a");
		val.parseFormulaValue();
		var token = dataValidation._generateRefToken(val._tokenArray[0]);
		doh.is(true, token._calculateValue instanceof websheet.parse.UndefinedNameArea, "");
	});
	
	it("_updateTokenArrays", function() {
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4CF(parsedRef, "cf1");
		var cf1 = new websheet.model.RulesObject.ConditionalFormat(area, _document, {preserve: true, pivot: true, "criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","gte":true,"val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":"$E$1"}]}]});
		cf1.parse();
		
		cf1._updateTokenArrays(area.getRefTokens());
	});	
});