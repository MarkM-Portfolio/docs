dojo.provide("websheet.test.ut.rulesObj.ruleVal");

/**
 * UT suite, function for rulesObj.
 */

describe("websheet.test.ut.rulesObj.ut_ruleVal", function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	beforeEach(function() {
		utils.bindDocument(_document);
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("getData4Range", function() {
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val._cacheData = {"dv1":[1,2,3]};
		expect(val.getData4Range("dv1")).toEqual([1,2,3]);
	});
	
	it("clearData", function() {
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val._cacheData = {};
		val.clearData("dv1");
		
		val._cacheData = {"dv1":[undefined,[1,2,3]]};
		val.clearData("dv1");
		
		val._cacheData = {"dv1":[[1,2,3]]};
		val.clearData("dv1");
		expect(val.getData4Range("dv1")).toEqual(null);
	});
	
	it("clareData4Cell", function() {
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val._cacheData = {};
		val.clareData4Cell("dv1");
		
		val._cacheData = {"dv1":[undefined,[1,2,3]]};
		val.clareData4Cell("dv1",0,0,0,1);
		
		val._cacheData = {"dv1":[[1,2,3]]};
		val.clareData4Cell("dv1", 0,0,0,1);
		expect(val._cacheData["dv1"]).toEqual([[ undefined, undefined, 3 ]]);
	});
	
	it("setValue4Range", function() {
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val.setValue4Range(33, "dv1", 2,2);
		expect(val._cacheData["dv1"]).toEqual([undefined, undefined, [ undefined, undefined, 33 ]]);
	});
	
	it("getValue", function() {
		var val = new websheet.model.RulesObject.RuleVal(3);
		expect(val.getValue()).toEqual(3);
		
		var val = new websheet.model.RulesObject.RuleVal("=$a$1");
		val.parseFormulaValue();
		val._calculatedValue = 2;
		expect(val.getValue()).toEqual(2);
		
		var val = new websheet.model.RulesObject.RuleVal("true");
		expect(val.getValue()).toBe(true);
	});
	
	it("createTokenArray4Index", function() {
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4CF(parsedRef, "cf1");
		var cf1 = new websheet.model.RulesObject.ConditionalFormat(area, _document, {preserve: true, pivot: true, "criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","gte":true,"val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":"$E$1"}]}]});
		cf1.parse();
		
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val.parseFormulaValue();
		
		var ret = val.createTokenArray4Index("Sheet1", area.getRefTokens(), 3,4);
		expect(ret.length).toBe(2);
	});
	
	it("clone", function() {
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val.parseFormulaValue();
		var ret = val.clone();
		expect(ret._value).toEqual("=a1");
	});
	
	it("isFormula", function() {
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val.parseFormulaValue();
		expect(val.isFormula()).toEqual(true);
	});
	
	it("getTokenLength", function() {
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val.parseFormulaValue();
		expect(val.getTokenLength()).toEqual(1);
	});
	
	it("updateValue", function() {
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val.parseFormulaValue();
		
	});
	
	it("compare", function() {
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4CF(parsedRef, "cf1");
		var cf1 = new websheet.model.RulesObject.ConditionalFormat(area, _document, {preserve: true, pivot: true, "criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","gte":true,"val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":4}]}]});
		cf1.parse();
		
		var cf2 = new websheet.model.RulesObject.ConditionalFormat(area, _document, {preserve: true, pivot: true, "criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","gte":true,"val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":4}]}]});
		cf2.parse();
		
		var val1 = new websheet.model.RulesObject.RuleVal("=a1");
		val1.parseFormulaValue();
		var val2 = new websheet.model.RulesObject.RuleVal("=a2");
		val2.parseFormulaValue();
		
		var ret = val1.compare(val2, area, area, 0);
		expect(ret).toBe(false);
		
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4CF(parsedRef, "cf1");
		var ret = val1.compare(val2, area, area, 0);
		expect(ret).toBe(false);
	});
	
	it("parseFormulaValue", function() {
		var val = new websheet.model.RulesObject.RuleVal("=a1");
		val.parseFormulaValue();
		doh.is(val.VALUETYPE.RELFORMULA, val._type, "");
		doh.is(1, val._tokenArray.length, "");
		
		val = new websheet.model.RulesObject.RuleVal("= $a$1");
		val.parseFormulaValue();
		doh.is(val.VALUETYPE.ABSFORMULA, val._type, "");
		doh.is(1, val._tokenArray.length, "");
		
		val = new websheet.model.RulesObject.RuleVal("= a");
		val.parseFormulaValue();
		// The definition of a named range is an absolute address
		doh.is(val.VALUETYPE.ABSFORMULA, val._type, "");
		doh.is(1, val._tokenArray.length, "");
		
		val = new websheet.model.RulesObject.RuleVal("= a +");
		val.parseFormulaValue();
		doh.is(val.VALUETYPE.ERROR, val._type, "");
	});
});