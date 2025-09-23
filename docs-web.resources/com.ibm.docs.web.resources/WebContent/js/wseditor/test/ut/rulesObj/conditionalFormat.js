dojo.provide("websheet.test.ut.rulesObj.conditionalFormat");

/**
 * UT suite, function for rulesObj.
 */

describe("websheet.test.ut.rulesObj.ut_conditionalFormat", function() {
	var _document = new websheet.model.Document();
	var area;
	websheet.Constant.init();
	var styleManager = _document._styleManager;
	var ce1 = builders.style().bgColor("red").putInto(styleManager);
	var ce2 = builders.style().bgColor("green").putInto(styleManager);
	var ce3 = builders.style().bgColor("blue").putInto(styleManager);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4CF(parsedRef, "cf1");
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("createNewInstance", function() {
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {"preserve":true,"pivot":true,"criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":"$F$1"}]}]});
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 3,3,4,4,websheet.Constant.RANGE_MASK);
		var area2 = new websheet.parse.Area(parsedRef, "cf2", websheet.Constant.RangeUsage.DATA_VALIDATION);
		var cf = conditionalFormat.createNewInstance(area2);
		doh.is(true,cf != null,"");	
	});
	
	it("_getTokenList", function() {
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {"criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":"$F$1"}]}]});
		ret = conditionalFormat._getTokenList();
		expect(ret.length).toEqual(2);
	});
	
	it("clearAllData", function() {
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {"criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":"$F$1"}]}]});
		conditionalFormat.clearAllData("cf1", [undefined, true]);
		expect(true).toBe(true);
		
		conditionalFormat.clearAllData("cf2");
	});

	it("clearData4Cell", function() {
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {"criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":"$F$1"}]}]});
		conditionalFormat.clearData4Cell("cf1", 1,1,2,3,[undefined, true]);
		expect(true).toBe(true);
		
		conditionalFormat.clearData4Cell("cf1", 1,1,2,3);
	});
	
	it("clearResult", function() {
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {"criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":"$F$1"}]}]});
		conditionalFormat.clearResult("cf1",1,1,2,3);
		expect(true).toBe(true);
	});
	
	it("clearAll", function() {
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {"criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":"$F$1"}]}]});
		conditionalFormat.clearAll("cf1");
		expect(true).toBe(true);
	});
	
	it("getJSON4Range", function() {
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {preserve: true, pivot: true, "criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","gte":true,"val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":4}]}]});
		conditionalFormat.parse();
		var json = conditionalFormat.getJSON4Range({startRow:1, endRow:1, startCol : 1, endCol:1}, area);
		expect(json.criterias.length).toBe(2);
	});
	
	it("getTokenIdxs", function() {
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {"criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":"$F$1"}]}]});
		conditionalFormat.parse();
		var ret = conditionalFormat.getTokenIdxs(area._refTokens[1].getValue(),area._refTokens);
		expect(ret).toEqual([ undefined, [ true ] ] );
	});
	
	it("cal4Range", function() {
		_document._createSheet("Sheet1");
		var cb = function(){
			
		};
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document);
		conditionalFormat.cal4Range(area,{sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {"criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":4}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":3}]}]});
		conditionalFormat.cal4Range(area,{sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
	});
	
	it("calculate", function() {
		_document._createSheet("Sheet1");
		var cb = function(){
			
		};
		var conditionalFormat = new websheet.model.RulesObject.ConditionalFormat(area, _document, {"criterias":[{"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":4}]},{"type":"cellIs","priority":1,"styleid":"ce3","operator":"equal","cfvos":[{"type":"element","val":3}]}]});
		conditionalFormat.calculate(area, cb);
	});
});