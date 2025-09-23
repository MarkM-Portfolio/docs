dojo.provide("websheet.test.ut.rulesObj.conditionalCriteria");

/**
 * UT suite, function for rulesObj.
 */

describe("websheet.test.ut.rulesObj.ut_conditionalCriteria", function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	beforeEach(function() {
		utils.bindDocument(_document);
		
		var sheet = builders.sheet(_document).row(1, [[1], [true],  [10.1], ["aa"], [1] ,  [11] ])
									         .row(2, [[2], [false], [0.1],  ["aa"], [2] ,  [2] ])
									         .row(3, [[3], [0],     [100],  ["cc"], [3] ,  [13.2] ])
									         .row(4, [[4], [1],     [0],    ["dd"], [4] ,  [4] ])
									         .row(5, [[5], [2],     [-0.2], ["ee"], [5] ,  [5] ])
									         .row(6, [[6], [3],     [-10],  ["ff"], [6] ,  [6] ])
									         .row(7, [[7], [4],     [-3],   ["ff"], [7] ,  [5.7] ])
									         .row(8, [[8], [5],     [12.5], ["gg"], [8] ,  [8] ])
									         .row(9, [[9], ["6"],   [-0],   ["hh"], [9] ,  [9] ])
									         .row(10,[[10],[7],     [true], ["ii"], [30],  [30]])
											 .row(11,[[true],[true],[true], [true], [true],[21.2]]).done();
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("constructor", function() {
		var conditionalCriteria = new websheet.model.RulesObject.ConditionalCriteria(_document, {dxfid: true, stopIfTrue : true, "type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"}]});
		doh.is(1,conditionalCriteria._cfvos.length,"");
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "aboveAverage", "cfvos":[{"type":"aboveAverage","val":0},{"type":"equalAverage","val":1},{"type":"stdDev","val":1}]});
		expect(cc._aboveAverage).toBe(0);
		expect(cc._equalAverage).toBe(1);
		expect(cc._stdDev).toBe(1);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "top10", "cfvos":[{"type":"bottom","val":0},{"type":"percent","val":1},{"type":"rank","val":1}]});
		expect(cc._bottom).toBe(0);
		expect(cc._percent).toBe(1);
		expect(cc._rank).toBe(1);

		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "timePeriod", "cfvos":[{"type":"timePeriod","val":"lastMonth"}]});
		expect(cc._timePeriod).toBe("lastMonth");
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "endsWith", "cfvos":[{"type":"text","val":"lastMonth"}]});
		expect(cc._text).toBe("lastMonth");
	});
	
	it("getTokenList", function() {
		var conditionalCriteria = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		var ret = conditionalCriteria.getTokenList();
		expect(ret.length).toBe(2);
		
		var ret = conditionalCriteria.getTokenList(3);
	});
	
	it("_optimizeHideCell", function() {
		var conditionalCriteria = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		expect(conditionalCriteria._optimizeHideCell()).toBe(true);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "aboveAverage", "cfvos":[{"type":"aboveAverage","val":0},{"type":"equalAverage","val":1},{"type":"stdDev","val":1}]});
		expect(cc._optimizeHideCell()).toBe(false);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "timePeriod", "cfvos":[{"type":"timePeriod","val":"lastMonth"}]});
		expect(cc._optimizeHideCell()).toBe(true);
	});
	
	it("clearAllData", function() {
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		cc._result = {"cf1": [1,2,3]};
		cc._absResult = 3;
		
		cc.clearAllData("cf1", [undefined, true]);
		expect(cc._result).toEqual([]);
		expect(cc._absResult).toEqual(undefined);
		
		cc.clearAllData("cf2");
	});
	
	it("clearData4Cell", function() {
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		cc._result = {"cf1": [1,2,3]};
		cc.clearData4Cell("cf1", 1,1,2,3, [undefined, true]);
		
		cc.clearData4Cell("cf2");
	});
	
	it("clearResult", function() {
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		cc._result={"cf1":[[1,2,3],[1]]};
		cc.clearResult("cf1", 0,1,2,3);
		expect(cc._result).toEqual( { cf1 : [ [ 1, undefined, undefined ], [ 1 ] ] } );
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "aboveAverage", "cfvos":[{"type":"aboveAverage","val":0},{"type":"equalAverage","val":1},{"type":"stdDev","val":1}]});
		cc._result= {"cf1":[[1,2,3],[1]], "cf2":[12,3]};
		expect(cc.clearResult("cf1",1,1,2,3)).toBe(true);
		expect(cc._result).toEqual({ cf2 : [ 12, 3 ] });
	});
	
	it("clone", function() {
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		var ret = cc.clone();
		expect(ret._type).toBe("cellIs");
		expect(ret._cfvos.length).toBe(2);
	});
	
	it("clearAll", function() {
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		cc._result= {"cf1":[[1,2,3],[1]], "cf2":[12,3]};
		cc.clearAll("cf1");
		expect(cc._result).toEqual({ cf2 : [ 12, 3 ] });
	});
	
	it("getTokenIdxs", function() {

	});
	
	it("getJSON4Range", function() {
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {colors:[1,2,3],dxfid: true, stopIfTrue :true, "type" : "aboveAverage", "cfvos":[{"type":"aboveAverage","val":0},{"type":"equalAverage","val":1},{"type":"stdDev","val":1}]});
		cc.getJSON4Range();
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "top10", "cfvos":[{"type":"bottom","val":0},{"type":"percent","val":1},{"type":"rank","val":1}]});
		cc.getJSON4Range();
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "timePeriod", "cfvos":[{"type":"timePeriod","val":"lastMonth"}]});
		cc.getJSON4Range();
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "endsWith", "cfvos":[{"type":"text","val":"lastMonth"}]});
		cc.getJSON4Range();
	});
	
	it("getResult4Cell", function() {
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		cc._absResult = true;
		var ret = cc.getResult4Cell();
		expect(ret.s).toBe("ce2");
		
		cc._absResult = false;
		var ret = cc.getResult4Cell();
		expect(ret).toBe(null);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs", stopIfTrue : true, "priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		cc._absResult = true;
		var ret = cc.getResult4Cell();
		expect(ret.s).toBe("ce2");
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs","priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		var ret = cc.getResult4Cell();
		expect(ret).toBe(null);
		
		cc._result = {};
		var ret = cc.getResult4Cell();
		expect(ret).toBe(null);
		
		cc._result.cf1 = [];
		var ret = cc.getResult4Cell("cf1");
		expect(ret).toBe(null);
		
		cc._result.cf1 = [[false,true]];
		var ret = cc.getResult4Cell("cf1", 0, 0);
		expect(ret).toBe(null);
		
		var ret = cc.getResult4Cell("cf1", 0, 1);
		expect(ret.s).toBe("ce2");
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs", stopIfTrue : true, "priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		cc._result = {"cf1":[[false,true]]};
		var ret = cc.getResult4Cell("cf1", 0, 1);
		expect(ret.s).toBe("ce2");
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"colorScale", stopIfTrue : true, "priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		cc._result ={"cf1" : [[undefined,12]]};
		
		var ret = cc.getResult4Cell("cf1", 0, 0);
		expect(ret).toBe(null);
		
		var ret = cc.getResult4Cell("cf1", 0, 1);
		expect(ret.c).toBe(12);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"colorScale", "priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":"E1"},{"type":"element","val":"F1"}]});
		cc._result = {"cf1" : [[undefined,12]]};
		var ret = cc.getResult4Cell("cf1", 0, 1);
		expect(ret.c).toBe(12);
	});
		
	it("cal4Range", function() {
		_document._createSheet("Sheet1");
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "top10", "cfvos":[{"type":"bottom","val":0},{"type":"percent","val":1},{"type":"rank","val":1}]});
		var cb = function(){
			
		};
		
		cc.cal4Range(null, {startRow:3000000, endRow:2000000}, cb);
		expect(cc._result).toBe(null);
		
		cc.cal4Range(null, {startCol:3000, endCol:2048}, cb);
		expect(cc._result).toBe(null);
		
		cc._result = {"cf1":[]};
		cc.cal4Range({_id: "cf1"}, {startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		expect(cc._result).toEqual({"cf1":[]});
		
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4CF(parsedRef, "cf1");
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs", stopIfTrue : true, "priority":2,"styleid":"ce2","operator":"greaterThan","cfvos":[{"type":"element","val":4}]});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"beginsWith", stopIfTrue : true, "priority":2,"styleid":"ce2","cfvos":[{"type":"text","val":"ab"}]});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);

		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"notContainsBlanks", stopIfTrue : true, "priority":2,"styleid":"ce2"});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"expression", stopIfTrue : true, "priority":2,"styleid":"ce2","cfvos":[{"type":"element","val":4}]});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "top10", "cfvos":[{"type":"bottom","val":0},{"type":"percent","val":1},{"type":"rank","val":1}]});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "aboveAverage", "cfvos":[{"type":"aboveAverage","val":0},{"type":"equalAverage","val":1},{"type":"stdDev","val":1}]});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "uniqueValues"});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "duplicateValues"});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "colorScale", "cfvos":[{"type":"min"}, {"type":"max"}]});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		cc._type = "other";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
	});
	
	it("_cal4CellWithCfvos", function() {
		var cb = function(){
			
		};
		_document._createSheet("Sheet1");
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4CF(parsedRef, "cf1");
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"cellIs", stopIfTrue : true, "priority":2,"styleid":"ce2","operator":"lessThan","cfvos":[{"type":"element","val":3}]});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		cc._result = {cf1:[[true]]};
		var cfvos = new websheet.model.RulesObject.ConditionalFvos("E1", {"type":"element", val: "E1"});
		cc._cfvos[0] = cfvos;
		cfvos._cacheData = {"cf1":[[1, "w"],[0,true]]};
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._operator = "greaterThan";
		cfvos._cacheData = {"cf1":[["", "w"],[{errorCode:555},true]]};
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._operator = "greaterThanOrEqual";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._operator = "lessThanOrEqual";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._operator = "equal";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._operator = "notEqual";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		var cfvos = new websheet.model.RulesObject.ConditionalFvos("E1", {"type":"element", val: "E1"});
		cc._cfvos.push(cfvos);
		cfvos._cacheData = {"cf1":[[1, "w"],[0,true]]};
		cc._operator = "between";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cfvos._cacheData = {"cf1":[["", "w"],[{errorCode:555},true]]};
		cc._operator = "notBetween";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._operator = "other";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._type = "containsText";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._type = "endsWith";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._type = "notContainsText";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._operator = "notBetween";
		cc._type = "cellIs";
		var cfvos = new websheet.model.RulesObject.ConditionalFvos("$E$1", {"type":"element", val: "$E$1"});
		cfvos._calculatedValue = {errorCode:555};
		cfvos._isDirty = false;
		cc._cfvos[1] = cfvos;
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._cfvos[0] = cfvos;
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
	});	
	
	it("_cal4CfvosOnly", function() {
		var cb = function(){
			
		};
		_document._createSheet("Sheet1");
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4CF(parsedRef, "cf1");
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"expression", stopIfTrue : true, "priority":2,"styleid":"ce2"});
		
		var cfvos = new websheet.model.RulesObject.ConditionalFvos("E1", {"type":"element", val: "E1"});
		cc._cfvos = [cfvos];
		cfvos._cacheData = {"cf1":[[true, "w"],[0,1]]};
		
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"expression", stopIfTrue : true, "priority":2,"styleid":"ce2","cfvos":[{"type":"element","val":false}]});
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
	});	
	
	it("_cal4CellOnly", function() {
		var cb = function(){
			
		};
		_document._createSheet("Sheet1");
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4CF(parsedRef, "cf1");
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type":"containsBlanks", stopIfTrue : true, "priority":2,"styleid":"ce2"});
		
		cc._result = {"cf1":[[true]]};
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._type = "containsErrors";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._type = "notContainsErrors";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._type = "timePeriod";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
		
		delete cc._result;
		cc._type = "other";
		cc.cal4Range(area, {sheetName: "Sheet1", startRow: 1, endRow:2, startCol:1, endCol:2}, cb);
	});	
	
	it("_calTimeperiod", function() {
		var _sheet = _document._createSheet("Sheet1");
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document);
		
		cc._calTimeperiod();

		cc._timePeriod = "lastMonth";
		builders.sheet(_sheet).row(1, [
		                          [10000, , websheet.Constant.ValueCellType.NUMBER << 3]
		                            ]).done();
		var cell = _sheet._rows[0].getCell(1);
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "last7Days";
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "lastWeek";
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "nextMonth";
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "nextWeek";
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "thisMonth";
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "thisWeek";
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "today";
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "tomorrow";
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "yesterday";
		cc._calTimeperiod(cell);
		
		cc._timePeriod = "other";
		cc._calTimeperiod(cell);
		
		cell._calculatedValue = "abc";
		cc._calTimeperiod(cell);
		
		cell._calculatedValue = -1;
		cc._calTimeperiod(cell);
	});
	
	it("_calc4Duplicates", function() {
		var parsedRef = new  websheet.parse.ParsedRef("st0",1,4,10,4,websheet.Constant.RANGE_MASK);
		var range = {_parsedRef: parsedRef, _id: "test"};
		var results = {};
		var ranges = [range];
		var result = results["test"] = [];		
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "uniqueValues", "styleid": "ce1", "priority": 1});
		
		var callBack1 = function() {
			expect(result[0][0]).toBe(false);
			expect(result[1][0]).toBe(false);
			expect(result[2][0]).toBe(true);
			expect(result[3][0]).toBe(true);
			expect(result[4][0]).toBe(true);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(true);
			expect(result[8][0]).toBe(true);
			expect(result[9][0]).toBe(true);
		};
		cc._calc4Duplicates(true, ranges, results, callBack1);
		
		var callBack2 = function() {
			expect(result[0][0]).toBe(true);
			expect(result[1][0]).toBe(true);
			expect(result[2][0]).toBe(false);
			expect(result[3][0]).toBe(false);
			expect(result[4][0]).toBe(false);
			expect(result[5][0]).toBe(true);
			expect(result[6][0]).toBe(true);
			expect(result[7][0]).toBe(false);
			expect(result[8][0]).toBe(false);
			expect(result[9][0]).toBe(false);			
			
		};
		cc._calc4Duplicates(false, ranges, results, callBack2);
	});
	
	it("_calc4TopN", function() {
		var parsedRef = new  websheet.parse.ParsedRef("st0",1,1,10,1,websheet.Constant.RANGE_MASK);
		var range = {_parsedRef: parsedRef, _id: "test"};
		var results = {};
		var ranges = [range];
		var result = results["test"] = [];	
		var cc1 = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "top10", "cfvos":[{"type":"bottom","val":0}]});
		
		var callBack1 = function() {
			expect(result[0][0]).toBe(false);
			expect(result[1][0]).toBe(false);
			expect(result[2][0]).toBe(false);
			expect(result[3][0]).toBe(false);
			expect(result[4][0]).toBe(false);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(false);
			expect(result[8][0]).toBe(true);
			expect(result[9][0]).toBe(true);
		};
		/*(percent, bottom, rank, baseRange, result, callBack)*/
		cc1._calc4TopN(false, false, 2, ranges, results, callBack1);
		
		var callBack2 = function() {
			expect(result[0][0]).toBe(true);
			expect(result[1][0]).toBe(true);
			expect(result[2][0]).toBe(false);
			expect(result[3][0]).toBe(false);
			expect(result[4][0]).toBe(false);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(false);
			expect(result[8][0]).toBe(false);
			expect(result[9][0]).toBe(false);
		};		
		/*(percent, bottom, rank, baseRange, result, callBack)*/
		cc1._calc4TopN(false, true, 2, ranges, results, callBack2);
		
		var callBack3 = function() {
			expect(result[0][0]).toBe(false);
			expect(result[1][0]).toBe(false);
			expect(result[2][0]).toBe(false);
			expect(result[3][0]).toBe(false);
			expect(result[4][0]).toBe(false);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(true);
			expect(result[8][0]).toBe(true);
			expect(result[9][0]).toBe(true);
		};
		/*(percent, bottom, rank, baseRange, result, callBack)*/
		cc1._calc4TopN(true, false, 30, ranges, results, callBack3);		
		
		var callBack4 = function() {
			expect(result[0][0]).toBe(true);
			expect(result[1][0]).toBe(true);
			expect(result[2][0]).toBe(true);
			expect(result[3][0]).toBe(false);
			expect(result[4][0]).toBe(false);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(false);
			expect(result[8][0]).toBe(false);
			expect(result[9][0]).toBe(false);
		};		
		/*(percent, bottom, rank, baseRange, result, callBack)*/
		cc1._calc4TopN(true, true, 30, ranges, results, callBack4);	
		
		parsedRef = new  websheet.parse.ParsedRef("st0",1,2,10,2,websheet.Constant.RANGE_MASK);
		range = {_parsedRef: parsedRef, _id: "test"};
		results = {};
		ranges = [range];
		result = results["test"] = [];			
		var callBack5 = function() {
			expect(result[0][0]).toBe(false);
			expect(result[1][0]).toBe(false);
			expect(result[2][0]).toBe(true);
			expect(result[3][0]).toBe(true);
			expect(result[4][0]).toBe(true);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(false);
			expect(result[8][0]).toBe(false);
			expect(result[9][0]).toBe(false);
		};		
		/*(percent, bottom, rank, baseRange, result, callBack)*/
		cc1._calc4TopN(false, true, 3, ranges, results, callBack5);		
		
		var callBack6 = function() {
			expect(result[0][0]).toBe(false);
			expect(result[1][0]).toBe(false);
			expect(result[2][0]).toBe(true);
			expect(result[3][0]).toBe(false);
			expect(result[4][0]).toBe(false);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(false);
			expect(result[8][0]).toBe(false);
			expect(result[9][0]).toBe(false);
		};		
		/*(percent, bottom, rank, baseRange, result, callBack)*/
		cc1._calc4TopN(true, true, 10, ranges, results, callBack6);	
		cc1._calc4TopN(true, true, 20, ranges, results, callBack6);
		
		var callBack7 = function() {
			expect(result[0][0]).toBe(false);
			expect(result[1][0]).toBe(false);
			expect(result[2][0]).toBe(false);
			expect(result[3][0]).toBe(false);
			expect(result[4][0]).toBe(false);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(false);
			expect(result[8][0]).toBe(false);
			expect(result[9][0]).toBe(true);
		};		
		/*(percent, bottom, rank, baseRange, result, callBack)*/
		cc1._calc4TopN(true, false, 10, ranges, results, callBack7);		
		cc1._calc4TopN(true, false, 20, ranges, results, callBack7);	
	});
	
	it("_calc4Average", function() {
		var parsedRef = new  websheet.parse.ParsedRef("st0",1,3,10,3,websheet.Constant.RANGE_MASK);
		var range = {_parsedRef: parsedRef, _id: "test"};
		var results = {};
		var ranges = [range];
		var result = results["test"] = [];	
		var cc = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "aboveAverage", "cfvos":[{"type":"aboveAverage","val":0},{"type":"equalAverage","val":1},{"type":"stdDev","val":1}]});
		
		var callBack1 = function() {
			expect(result[0][0]).toBe(false);
			expect(result[1][0]).toBe(false);
			expect(result[2][0]).toBe(true);
			expect(result[3][0]).toBe(false);
			expect(result[4][0]).toBe(false);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(true);
			expect(result[8][0]).toBe(false);
			expect(result[9][0]).toBe(false);
		};	
		/*(include, above, stddev, baseRange, result, callBack)*/
		cc._calc4Average(false, true, 0, ranges, results, callBack1);		
		cc._calc4Average(true, true, 0, ranges, results, callBack1);

		var callBack2 = function() {
			expect(result[0][0]).toBe(true);
			expect(result[1][0]).toBe(true);
			expect(result[2][0]).toBe(false);
			expect(result[3][0]).toBe(true);
			expect(result[4][0]).toBe(true);
			expect(result[5][0]).toBe(true);
			expect(result[6][0]).toBe(true);
			expect(result[7][0]).toBe(false);
			expect(result[8][0]).toBe(true);
			expect(result[9][0]).toBe(false);
		};	

		/*(include, above, stddev, baseRange, result, callBack)*/
		cc._calc4Average(false, false, 0, ranges, results, callBack2);
		cc._calc4Average(true, false, 0, ranges, results, callBack2);
		
		var callBack3 = function() {
			expect(result[0][0]).toBe(false);
			expect(result[1][0]).toBe(false);
			expect(result[2][0]).toBe(true);
			expect(result[3][0]).toBe(false);
			expect(result[4][0]).toBe(false);
			expect(result[5][0]).toBe(false);
			expect(result[6][0]).toBe(false);
			expect(result[7][0]).toBe(false);
			expect(result[8][0]).toBe(false);
			expect(result[9][0]).toBe(false);
		};	
		/*(include, above, stddev, baseRange, result, callBack)*/
		cc._calc4Average(false, true, 1, ranges, results, callBack3);
	});
	
	it("_calc4ColorScale", function() {
		var parsedRef = new  websheet.parse.ParsedRef("st0",1,1,10,1,websheet.Constant.RANGE_MASK);
		var range = {_parsedRef: parsedRef, _id: "test"};
		var results = {};
		var ranges = [range];
		var result = results["test"] = [];
		var cc2d = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "colorScale", "cfvos":[{"type":"min"}, {"type":"max"}], "colors":["#f8696b", "#63be7b"]});
		
		var callBack1 = function() {
			expect(result[0][0]).toBe("#f8696b");
			expect(result[1][0]).toBe("#e7726c");
			expect(result[8][0]).toBe("#73b479");
			expect(result[9][0]).toBe("#63be7b");
		};	
		/*(baseRange, result, callBack)*/
		cc2d._calc4ColorScale(ranges, results, callBack1);
		
		
		parsedRef = new  websheet.parse.ParsedRef("st0",1,5,10,5,websheet.Constant.RANGE_MASK);
		range = {_parsedRef: parsedRef, _id: "test"};
		results = {};
		ranges = [range];
		result = results["test"] = [];		
		var cc2dpercent = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "colorScale", "cfvos":[{"type":"percent", "val": 10}, {"type":"percent", "val": 90}], "colors":["#C00000", "#002060"]});
		var callBack2 = function() {
			/*#C00000, #C00000, #C00000, #C00000, #B70104, #AF0208, #A7040C, #9F0510, #960715, #002060*/
			expect(result[0][0]).toBe("#c00000");
			expect(result[1][0]).toBe("#c00000");
			expect(result[2][0]).toBe("#c00000");
			expect(result[3][0]).toBe("#bf0000"); // C00000
			expect(result[4][0]).toBe("#b60104"); // B70104
			expect(result[5][0]).toBe("#ae0208"); // AF0208
			expect(result[6][0]).toBe("#a6040c"); // A7040C
			expect(result[7][0]).toBe("#9e0510"); // 9F0510
			expect(result[8][0]).toBe("#950715"); // 960715
			expect(result[9][0]).toBe("#002060");
		};	
		/*(baseRange, result, callBack)*/
		cc2dpercent._calc4ColorScale(ranges, results, callBack2);		
		
		var cc2dpercentile = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "colorScale", "cfvos":[{"type":"percentile", "val": 10}, {"type":"percentile", "val": 90}], "colors":["#C00000", "#002060"]});
		var callBack3 = function() {
			/*#C00000, #BE0001, #AA030B, #950715, #800A20, #6B0E2A, #561135, #41153F, #2C184A, #002060*/
			expect(result[0][0]).toBe("#c00000");
			expect(result[1][0]).toBe("#bd0001");
			expect(result[2][0]).toBe("#a9030b");
			expect(result[3][0]).toBe("#940715");
			expect(result[4][0]).toBe("#7f0a20");
			expect(result[5][0]).toBe("#6a0e2a");
			expect(result[6][0]).toBe("#551135");
			expect(result[7][0]).toBe("#40153f");
			expect(result[8][0]).toBe("#2b184a");
			expect(result[9][0]).toBe("#002060");
		};	
		/*(baseRange, result, callBack)*/
		cc2dpercentile._calc4ColorScale(ranges, results, callBack3);					
		
		var cc3dpercent = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "colorScale", "cfvos":[{"type":"percent", "val": 10}, {"type":"percent", "val": 50}, {"type":"percent", "val": 90}], "colors":["#C00000", "#ffeb84", "#002060"]});		
		var callBack4 = function() {
			/*#C00000, #C00000, #C00000, #C00201, #C5160C, #CB2A17, #D03E23, #D6532E, #DB673A, #002060*/ 
			expect(result[0][0]).toBe("#c00000");
			expect(result[1][0]).toBe("#c00000");
			expect(result[2][0]).toBe("#c00000");
			expect(result[3][0]).toBe("#c00201");
			expect(result[4][0]).toBe("#c5160c");
			expect(result[5][0]).toBe("#cb2a17");
			expect(result[6][0]).toBe("#d03e23");
			expect(result[7][0]).toBe("#d6532e");
			expect(result[8][0]).toBe("#db673a");
			expect(result[9][0]).toBe("#002060");
		};	
		/*(baseRange, result, callBack)*/
		cc3dpercent._calc4ColorScale(ranges, results, callBack4);
		
		var cc3dpercentile = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "colorScale", "cfvos":[{"type":"percentile", "val": 10}, {"type":"percentile", "val": 50}, {"type":"percentile", "val": 90}], "colors":["#C00000", "#ffeb84", "#002060"]});
		var callBack5 = function() {
			/*#C00000, #C10603, #D34728, #E4894D, #F6CA71, #E9D981, #BBB57B, #8E9174, #606D6E, #002060*/
			expect(result[0][0]).toBe("#c00000");
			expect(result[1][0]).toBe("#c10603");
			expect(result[2][0]).toBe("#d34728");
			expect(result[3][0]).toBe("#e4894d");
			expect(result[4][0]).toBe("#f6ca71");
			expect(result[5][0]).toBe("#e8d880");
			expect(result[6][0]).toBe("#bab47a");
			expect(result[7][0]).toBe("#8d9073");
			expect(result[8][0]).toBe("#5f6c6d");
			expect(result[9][0]).toBe("#002060");
		};	
		/*(baseRange, result, callBack)*/
		cc3dpercentile._calc4ColorScale(ranges, results, callBack5);		
		
		parsedRef = new websheet.parse.ParsedRef("st0",1,6,11,6,websheet.Constant.RANGE_MASK);
		range = {_parsedRef: parsedRef, _id: "test"};
		results = {};
		ranges = [range];
		result = results["test"] = [];		
		var cc3dpercent2 = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "colorScale", "cfvos":[{"type":"percent", "val": 10}, {"type":"percent", "val": 50}, {"type":"percent", "val": 90}], "colors":["#C00000", "#ffeb84", "#002060"]});
		var callBack6 = function() {
			/*#E28249, #C00000, #EFB062, #C00000, #C10402, #C6190E, #C5120A, #D24325, #D75831, #002060, #898D74*/ 
			expect(result[0][0]).toBe("#e28249");
			expect(result[1][0]).toBe("#c00000");
			expect(result[2][0]).toBe("#efb062");
			expect(result[3][0]).toBe("#c00000");
			expect(result[4][0]).toBe("#c10402");
			expect(result[5][0]).toBe("#c6190e");
			expect(result[6][0]).toBe("#c5120a");
			expect(result[7][0]).toBe("#d24325");
			expect(result[8][0]).toBe("#d75831");
			expect(result[9][0]).toBe("#002060");
			expect(result[10][0]).toBe("#888c73");
		};	
		/*(baseRange, result, callBack)*/
		cc3dpercent2._calc4ColorScale(ranges, results, callBack6);		
		
		var cc3dpercentile2 = new websheet.model.RulesObject.ConditionalCriteria(_document, {"type" : "colorScale", "cfvos":[{"type":"percentile", "val": 10}, {"type":"percentile", "val": 50}, {"type":"percentile", "val": 90}], "colors":["#C00000", "#ffeb84", "#002060"]});
		var callBack7 = function() {
			/*#C6BD7C, #C00000, #9B9C76, #C00000, #CF3A21, #DF7542, #DA6338, #FFEB84, #ECDC82, #002060, #002060*/ 
			expect(result[0][0]).toBe("#c5bc7b");
			expect(result[1][0]).toBe("#c00000");
			expect(result[2][0]).toBe("#9a9b75");
			expect(result[3][0]).toBe("#c00000");
			expect(result[4][0]).toBe("#cf3a21");
			expect(result[5][0]).toBe("#df7542");
			expect(result[6][0]).toBe("#da6338");
			expect(result[7][0]).toBe("#ffeb84");
			expect(result[8][0]).toBe("#ebdb81");
			expect(result[9][0]).toBe("#002060");
			expect(result[10][0]).toBe("#002060");
		};	
		/*(baseRange, result, callBack)*/
		cc3dpercentile2._calc4ColorScale(ranges, results, callBack7);				
	});

	
//	getResult4Cell
//	cal4Range
//	_cal4CfvosOnly
//	_cal4CellOnly
//	_calTimeperiod
//	_cal4CellWithCfvos	
//	_prepareData
//	_cellCalcFinished
});