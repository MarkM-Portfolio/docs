dojo.provide("websheet.test.ut.rulesObj.dataValidation");

/**
 * UT suite, function for data validation.
 */

describe("websheet.test.ut.rulesObj.ut_dataValidation", function() {
	var _document = new websheet.model.Document();
	var _sheet = new websheet.model.Sheet(_document);
	var area;
	websheet.Constant.init();
	beforeEach(function() {
		utils.bindDocument(_document);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.SharedFormulaRef4DV(parsedRef, "dv1");

	});
	
	afterEach(function() {
		_sheet._rows = [];
		utils.unbindDocument();
	});
	
	it("getType", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"list","errorStyle":"warning","IME":"noControl","allowBlank":false,"showDropDown":true,"showInputMsg":true,"showErrorMsg":true,"promptTitle":"Please select response from list","operator":"between","value1":"\"Y, N, CU, CO, F, 3, \""}).finish();
		doh.is("list", dataValidation.getType(), "data validation's type is list");
	});
	
	it("getOperator", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"whole","operator":"between","value1":"sum(a1)","value2":"sum(b1)"}).finish();
		doh.is("between", dataValidation.getOperator(), "data validation's operator is between");
	});
	
	it("getPrompt", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"whole","operator":"between","value1":"sum(a1)","value2":"sum(b1)"}).finish();
		doh.is(null, dataValidation.getPrompt(), "data validation's getPrompt");
	});
	
	it("isShowList", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"list","errorStyle":"warning","IME":"noControl","allowBlank":false,"showDropDown":true,"showInputMsg":true,"showErrorMsg":true,"promptTitle":"Please select response from list","operator":"between","value1":"\"Y, N, CU, CO, F, 3, \""}).finish();
		doh.is(true, dataValidation.isShowList(), "data validation should show list");
	});
	
	it("clearAllData", function() {
		var dataValidation = builders.dataValidation(area, _document).value1Map({"dv1":[1,2,3]}).finish();
		dataValidation.clearAllData("dv1", [true]);
		doh.is(null,dataValidation._value1._cacheData["dv1"],"data is cleraed");
	});
	
	it("clearData4Cell", function() {
		var dataValidation = builders.dataValidation(area, _document).value2Map({"dv1":[[1,2,3],[3,4,5],[null,4,null]]}).finish();
		dataValidation.clearData4Cell("dv1", 1, 1, 1, 1, [undefined,true]);
		doh.is([[1,2,3],[3,undefined,5],[null,4,null]],dataValidation._value2._cacheData["dv1"],"data is cleraed");
		
		dataValidation.clearData4Cell("dv1", 1, 3, 1, 1, [undefined,true]);
		doh.is([[1,2,3],[3,undefined,5],[null,4,null]],dataValidation._value2._cacheData["dv1"],"data is cleraed");
	});
	
//	it("_setDataCache", function() {
//		var dataValidation = builders.dataValidation(area, _document).finish();
//		builders.sheet(_sheet).row(1, [["a"]]).done();
//		builders.sheet(_sheet).row(2, [null,["a"]]).done();
//		var cell = _sheet._rows[0].getCell(1);
//		dataValidation._setDataCache(area,cell,3, true);
//		doh.is([[3]],dataValidation._value2Map["dv1"],"");
//		
//		cell = _sheet._rows[1].getCell(2);
//		dataValidation._setData4Cell(area,cell,3, true);
//		doh.is([[3],[null,3]],dataValidation._value2Map["dv1"],"");
//	});
	
	it("_getData4Cell, ABSFORMULA", function() {
		var dataValidation = builders.dataValidation(area, _document).value1Type(5).value2Type(5).value1Data("aa").value2Data(3).finish();
		doh.is("aa",dataValidation._getData4Cell(area),"");
		doh.is(3,dataValidation._getData4Cell(area,null, true),"");
	});
	
	it("_getData4Cell, RELFORMULA", function() {
		var dataValidation = builders.dataValidation(area, _document).value1Type(6).value1Map({"dv1":[null,[3,4]]}).finish();
		builders.sheet(_sheet).row(1, [["a"]]).done();
		builders.sheet(_sheet).row(2, [null,["a"]]).done();
		var cell = _sheet._rows[0].getCell(1);
		doh.is(null,dataValidation._getData4Cell(area, cell),"");
		cell = _sheet._rows[1].getCell(2);
		doh.is(4,dataValidation._getData4Cell(area,cell),"");
	});
	
	it("_getData4List", function() {
		var dataValidation = builders.dataValidation(area, _document).value1Map({"dv1":[null,[{"showList":"a",vList:2},{"showList":"a",vList:2}]]}).finish();
		doh.is({ showList : 'a', vList : 2 },dataValidation._getData4List(area, 2, 1, true),"");
		doh.is(2,dataValidation._getData4List(area, 2, 2, false),"");
		doh.is(null,dataValidation._getData4List(area, 1, 1, false),"");
	});
		
	it("_toJSON", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"list","errorStyle":"warning","IME":"noControl","allowBlank":false,"showDropDown":true,"showInputMsg":true,"showErrorMsg":true,"promptTitle":"Please select response from list","operator":"between","value1":"\"Y, N, CU, CO, F, 3, \""}).finish();
		var json = dataValidation._toJSON();
		doh.is(true,json != null,"");
	});
	
	it("compare", function() {
		var dataValidation1 = builders.dataValidation(area, _document, {"type":"list","operator":"between","value1":"\"Y, N, CU, CO, F, 3, \""}).finish();
		var dataValidation2 = builders.dataValidation(area, _document, {"type":"whole","operator":"between","value1":"1"}).finish();
		area.data = dataValidation2;
		
		doh.is(false, dataValidation1.compare(area, area),"");
		
		var dataValidation1 = builders.dataValidation(area, _document, {"type":"whole","operator":"==","value1":"1"}).finish();
		doh.is(false, dataValidation1.compare(area, area),"");
		
		var dataValidation1 = builders.dataValidation(area, _document, {"type":"whole","operator":"between","value1":"1", "prompt":"abc"}).finish();
		doh.is(false, dataValidation1.compare(area, area),"");
		
		var dataValidation1 = builders.dataValidation(area, _document, {"type":"whole","operator":"between","value1":"sum(a1)"}).finish();
		doh.is(false, dataValidation1.compare(area, area),"");
		
		var dataValidation1 = builders.dataValidation(area, _document, {"type":"whole","operator":"between","value1":"sum(a1)", "value2":"sum(a2)"}).finish();
		doh.is(false, dataValidation1.compare(area, area),"");

		var dataValidation1 = builders.dataValidation(area, _document, {"type":"whole","operator":"between","value1":1, "value2":2}).finish();
		var dataValidation2 = builders.dataValidation(area, _document, {"type":"whole","operator":"between","value1":1,"value2":2}).finish();
		area.data = dataValidation2;
		doh.is(true, dataValidation1.compare(area, area),"");
	});
	
	it("_validateNumber", function() {
		var dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator(">").finish();
		doh.is(true,dataValidation._validateNumber(2),"");
		doh.is(false,dataValidation._validateNumber(0),"");
		
		dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator(">=").finish();
		doh.is(true,dataValidation._validateNumber(1),"");
		doh.is(false,dataValidation._validateNumber(0),"");
		
		dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator("<").finish();
		doh.is(true,dataValidation._validateNumber(0),"");
		doh.is(false,dataValidation._validateNumber(1),"");
		dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator("<=").finish();
		doh.is(true,dataValidation._validateNumber(0),"");
		doh.is(true,dataValidation._validateNumber(1),"");
		
		dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator("!=").finish();
		doh.is(true,dataValidation._validateNumber(0),"");
		doh.is(false,dataValidation._validateNumber(1),"");
		
		dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator("==").finish();
		doh.is(true,dataValidation._validateNumber(1),"");
		doh.is(false,dataValidation._validateNumber(3),"");
		
		dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator("between").finish();
		doh.is(true,dataValidation._validateNumber(1),"");
		doh.is(false,dataValidation._validateNumber(0),"");
		
		dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator("notBetween").finish();
		doh.is(true,dataValidation._validateNumber(0),"");
		doh.is(false,dataValidation._validateNumber(1),"");
		
		dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator("").finish();
		doh.is(true,dataValidation._validateNumber(0),"");
	});
	
	it("_validateDecimal", function() {
		var dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator(">").finish();
		builders.sheet(_sheet).row(1, [[3]]).done();
		builders.sheet(_sheet).row(2, [null,["a"]]).done();
		var cell = _sheet._rows[0].getCell(1);
		doh.is(true,dataValidation._validateDecimal(cell),"");
		cell = _sheet._rows[1].getCell(2);
		doh.is(false,dataValidation._validateDecimal(cell),"");
	});	
	
	it("_validateWhole", function() {
		var dataValidation = builders.dataValidation(area, _document).value1(1).value2(3).operator(">").finish();
		builders.sheet(_sheet).row(1, [[3]]).done();
		builders.sheet(_sheet).row(2, [null,[3.3]]).done();
		var cell = _sheet._rows[0].getCell(1);
		doh.is(true,dataValidation._validateWhole(cell),"");
		cell = _sheet._rows[1].getCell(2);
		doh.is(false,dataValidation._validateWhole(cell),"");
	});	
	
	it("_validateTextLen", function() {
		var dataValidation = builders.dataValidation(area, _document).value1(0).value2(3).operator(">").finish();
		builders.sheet(_sheet).row(1, [[3]]).done();		
		var cell = _sheet._rows[0].getCell(1);
		doh.is(true,dataValidation._validateTextLen(cell),"");	
	});	
	
	it("_validateCustom", function() {
		var dataValidation = builders.dataValidation(area, _document).value1(0).value2(3).operator(">").finish();
		builders.sheet(_sheet).row(1, [[3]]).done();		
		var cell = _sheet._rows[0].getCell(1);
		doh.is(false,dataValidation._validateCustom(cell),"");	
	});	
	
	it("_validateList", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"list","errorStyle":"warning","IME":"noControl","allowBlank":false,"showDropDown":true,"showInputMsg":true,"showErrorMsg":true,"promptTitle":"Please select response from list","operator":"between","value1":"\"Y, N, CU, CO, F, 3, \""}).finish();
		builders.sheet(_sheet).row(1, [[3]]).done();		
		var cell = _sheet._rows[0].getCell(1);
		doh.is(true,dataValidation._validateList(area,cell),"");	
	});	
	
	it("_getRelativeRangeInfo", function() {
		var dataValidation = builders.dataValidation(area, _document).topRow(1).leftCol(1).finish();
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 3,3,4,4,websheet.Constant.RANGE_MASK);
		var area2 = new websheet.parse.Area(parsedRef, "dv2");

		var ref = dataValidation._getRelativeRangeInfo(2,2,area2, parsedRef.refMask, area);
		doh.is(4,ref.startRow,"");	
	});	
	
	it("createNewInstance", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"list","errorStyle":"warning","IME":"noControl","allowBlank":false,"showDropDown":true,"showInputMsg":true,"showErrorMsg":true,"promptTitle":"Please select response from list","operator":"between","value1":"=A2"})
		.finish();
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 3,3,4,4,websheet.Constant.RANGE_MASK);
		var area2 = new websheet.parse.Area(parsedRef, "dv2", websheet.Constant.RangeUsage.DATA_VALIDATION);
		var dv = dataValidation.createNewInstance(area2);
		doh.is(true,dv != null,"");	
	});
	
	it("_getTokenList", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"whole","value2":"=a3","IME":"noControl","allowBlank":false,"showDropDown":true,"showInputMsg":true,"showErrorMsg":true,"promptTitle":"Please select response from list","operator":"between","value1":"=A2"})
		.finish();
		var list = dataValidation._getTokenList();
		doh.is(2, list.length,"");	
	});
	
	it("getTokenIdxs", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"whole","value2":"=a3","IME":"noControl","allowBlank":false,"showDropDown":true,"showInputMsg":true,"showErrorMsg":true,"promptTitle":"Please select response from list","operator":"between","value1":"=A2"})
		.finish();
		var list = dataValidation._getTokenList();
		var ret = dataValidation.getTokenIdxs(list[0]._calculateValue, list);
		doh.is(true, ret[0],"");
	});
	
	it("clearAll", function() {
		var dataValidation = builders.dataValidation(area, _document, {"type":"whole","value2":"=a3","IME":"noControl","allowBlank":false,"showDropDown":true,"showInputMsg":true,"showErrorMsg":true,"promptTitle":"Please select response from list","operator":"between","value1":"=A2"})
		.finish();
		dataValidation.clearAll();
	});
});