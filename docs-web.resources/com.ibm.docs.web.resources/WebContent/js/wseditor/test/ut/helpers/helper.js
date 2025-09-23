dojo.provide("websheet.test.ut.helpers.helper");

/**
 * UT of functions in Helper.js
 */

describe("websheet.test.ut.helpers.ut_helper", function() {
	
	var helper = websheet.Helper;
	var wsconst = websheet.Constant;
	websheet.Constant.init();
	
	beforeEach(function() {
		;
	});
	
	afterEach(function() {
		;
	});
	
	it("getSerialNumberWithDate", function(){
		var date = new Date(2016,2,3);
		expect(helper.getSerialNumberWithDate(date, true)).toBe(42432);
	});
	
	it("getSerialNumberWithYMD", function(){
		expect(helper.getSerialNumberWithYMD(2016,2,3)).toBe(42432);
	});
	
	it("getMSWithSerialNumber", function(){
		expect(helper.getMSWithSerialNumber(-1)).toBe(null);
		expect(helper.getMSWithSerialNumber(42432)).toBe(1456963200000);
	});
	
	it("checkDateValidSpan", function(){
		expect(helper.checkDateValidSpan(-1)).toBe(false);
		expect(helper.checkDateValidSpan(2958465)).toBe(true);
	});
	
	it("getMSDifByTimezoneOffset", function(){
		expect(helper.getMSDifByTimezoneOffset(1,1)).toBe(0);
		expect(helper.getMSDifByTimezoneOffset(2,1)).toBe(60000);
	});
	
	it("weekday", function(){
		var date = new Date(2016,2,3);
		expect(helper.weekday(date,true)).toBe(4);
		expect(helper.weekday(42432)).toBe(4);
		expect(helper.weekday(-1)).toBe(null);
	});
	
	it("month", function(){
		var date = new Date(2016,2,3);
		expect(helper.month(date,true)).toBe(3);
		expect(helper.month(42432)).toBe(3);
		expect(helper.month(-1)).toBe(null);
	});
	
	it("year", function(){
		var date = new Date(2016,2,3);
		expect(helper.year(date,true)).toBe(2016);
		expect(helper.year(42432)).toBe(2016);
		expect(helper.year(-1)).toBe(null);
	});
		
	it("isLastWeek", function(){
		expect(helper.isLastWeek(42427, 42432)).toBe(true);
		expect(helper.isLastWeek(42417, 42432)).toBe(false);
		expect(helper.isLastWeek(42447, 42432)).toBe(false);
	});
	
	it("isNextWeek", function(){
		expect(helper.isNextWeek(42436, 42432)).toBe(true);
		expect(helper.isNextWeek(42417, 42432)).toBe(false);
		expect(helper.isNextWeek(42447, 42432)).toBe(false);
	});
	
	it("isThisWeek", function(){
		expect(helper.isThisWeek(42431, 42432)).toBe(true);
		expect(helper.isThisWeek(42417, 42432)).toBe(false);
		expect(helper.isThisWeek(42447, 42432)).toBe(false);
	});
		
	it("isLastMonth", function(){
		expect(helper.isLastMonth(42422, 42432)).toBe(true);
		expect(helper.isLastMonth(42477, 42432)).toBe(false);
		expect(helper.isLastMonth(42066, 42432)).toBe(false);
		expect(helper.isLastMonth(42341, 42372)).toBe(true);
	});

	it("isThisMonth", function(){
		expect(helper.isThisMonth(42434, 42432)).toBe(true);
		expect(helper.isThisMonth(42477, 42432)).toBe(false);
		expect(helper.isThisMonth(42066, 42432)).toBe(false);
	});
	
	it("isNextMonth", function(){
		expect(helper.isNextMonth(42466, 42432)).toBe(true);
		expect(helper.isNextMonth(42499, 42432)).toBe(false);
		expect(helper.isNextMonth(42066, 42432)).toBe(false);
		expect(helper.isNextMonth(42372, 42341)).toBe(true);
	});
	
	it("isRelativeRef", function() {
		doh.is(true,helper.isRelativeRef(31),"");
		doh.is(false,helper.isRelativeRef(64),"");
	});
	
	it("parseValue", function() {
		var VALUETYPE = websheet.Constant.valueType;
		doh.is(VALUETYPE.NUMBER,helper.parseValue(1),"");
		doh.is(VALUETYPE.UNKNOWN,helper.parseValue([1,2]),"");
		doh.is(VALUETYPE.STRING,helper.parseValue("\"aa\""),"");
		doh.is(VALUETYPE.BOOLEAN,helper.parseValue("true"),"");
		doh.is(VALUETYPE.FORMULA,helper.parseValue("=sum(a)"),"");
	});
	
	it("rangeIntersection", function() {
		var range1 = {sheetName:"Sheet1", startRow: 1, startCol: 1, endRow: 3, endCol: 3};
		var range2 = {sheetName:"Sheet1", startRow: 1, startCol: 1, endRow: 3, endCol: 3};
		var ret = helper.rangeIntersection(range1, range2);
		doh.is(true, ret.startRow == range1.startRow,"");
		
		range2 = {sheetName:"Sheet1", startRow: 2, startCol: 2, endRow: 2, endCol: 2};
		ret = helper.rangeIntersection(range1, range2);
		doh.is(true, ret.startRow == 2,"");
		
		range2 = {sheetName:"Sheet1", startRow: 1, startCol: 1, endRow: 4, endCol: 4};
		ret = helper.rangeIntersection(range1, range2);
		doh.is(true, ret.endRow == 3,"");
		
		range2 = {sheetName:"Sheet1", startRow: 2, startCol: 2, endRow: 4, endCol: 4};
		ret = helper.rangeIntersection(range1, range2);
		doh.is(true, ret.endRow == 3,"");
	});	
	
	it("getRefChangeDeltas", function() {
		var range = {sheetName:"Sheet1", startRow: 3, startCol: 1, endRow: 10000, endCol: 1024};
		var ref = {sheetName:"Sheet1", startRow: 1, startCol: 2, endRow: 9, endCol: 2, refMask: websheet.Constant.RANGE_MASK};
		
		var ret = helper.getRefChangeDeltas(range, ref, -1, 0, 1, 1);
		doh.is([1,1], ret);
		
		var ret = helper.getRefChangeDeltas(range, ref, 1, 0, 1, 1);
		doh.is([2,2], ret);
		
		var range = {sheetName:"Sheet1", startRow: 1, startCol: 3, endRow: 10000, endCol: 1024};
		var ref = {sheetName:"Sheet1", startRow: 2, startCol: 2, endRow: 2, endCol: 9, refMask: websheet.Constant.RANGE_MASK};
		
		var ret = helper.getRefChangeDeltas(range, ref, 0, -1, 1, 1);
		doh.is([0,0], ret);
		
		var ret = helper.getRefChangeDeltas(range, ref, 0, 1, 1, 1);
		doh.is([1,1], ret);
	});	
	
	it("isValidName", function() {
		    var result = wsconst.NameValidationResult;
		    var name = "";
		    expect(helper.isValidName(name)).toBe(result.INVALID_EMPTY);		    
		    
		    name = "c";
		    expect(helper.isValidName(name)).toBe(result.INVALID_RC);
		    
		    name = "R";
		    expect(helper.isValidName(name)).toBe(result.INVALID_RC);
		    
		    name = "trUe";
		    expect(helper.isValidName(name)).toBe(result.INVALID_KEYWORDS);
		    
		    name = "fAlse";
		    expect(helper.isValidName(name)).toBe(result.INVALID_KEYWORDS);
		    
		    name = "_xl";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);

		    name = "_Xlabc";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);

		    name = "Rc";
		    expect(helper.isValidName(name)).toBe(result.INVALID_RC);

		    name = "R1c";
		    expect(helper.isValidName(name)).toBe(result.INVALID_RC);

		    name = "Rca";
		    expect(helper.isValidName(name)).toBe(result.VALID);

		    name = "a1";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);
		    
		    name = "a1048577";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "xFd1";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);
		    
		    name = "xfe1";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "11xFd1";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);
		    
		    name = "_xFd1";
		    expect(helper.isValidName(name)).toBe(result.VALID);

		    name = "百科";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "\\百科";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "\\";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "\\a";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);

		    name = "\\百";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);
		    
		    name = ".百";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);
		    
		    name = " a";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);
		    
		    name = "9百";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);
		    
		    name = "R1c1";
		    expect(helper.isValidName(name)).toBe(result.INVALID_RC);
		    
		    name = "Rc1";
		    expect(helper.isValidName(name)).toBe(result.INVALID_RC);
		    
		    name = "r0c1";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "r0a";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "ar1c1";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "a1c1";
		    expect(helper.isValidName(name)).toBe(result.VALID);

		    name = "r1048577c1";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "r1048576c1";
		    expect(helper.isValidName(name)).toBe(result.INVALID_RC);

		    name = "rc1048577";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "rc1048576";
		    expect(helper.isValidName(name)).toBe(result.INVALID_OTHER);
		    
		    name = "c1048576r";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "rc16485a";
		    expect(helper.isValidName(name)).toBe(result.VALID);
		    
		    name = "rabc1";
		    expect(helper.isValidName(name)).toBe(result.VALID);
	});
	
	it("test array mean and std...", function() {
	    var arr1 = [1,2,3,4,5,6,7,8,9,10];
	    var arr2 = [1.1,2.2,3.3,4.4,5.5,6.6,7.7,8.8,9.9,10.0];
	    var arr3 = [1,2,3,undefined,5,NaN,7,null,9.5,10];
		
		var m = websheet.Math.mean(arr1);
		expect(m).toEqual(5.5);
		var std = websheet.Math.std(arr1, m);
		expect(std).toEqual(3.0276503540974917);
		
		m = websheet.Math.mean(arr2);
		expect(m).toEqual(5.95);
		std = websheet.Math.std(arr2, m);
		expect(std).toEqual(3.1767383692502387);
		
		m = websheet.Math.mean(arr3);
		expect(m).toEqual(5.357142857142857);
		std = websheet.Math.std(arr3, m);
		expect(std).toEqual(3.5906624935876597);
		
//		var arr4 = [];
//		for (var i = 0; i< 10000; i++)
//		{
//			arr4[i] = 1.0 * i + 0.01;
//		}
//		console.time("calc mean for 10000");
//		m = websheet.Math.mean(arr4);
//		console.timeEnd("calc mean for 10000");
//		console.log(m);
	});
	
	
	it("test array duplicate elements...", function() {
		var arr1 = [1];
		var arr2 = [1,2];
		var arr3 = [0,0];
		var arr4 = [1,1,4,4,6,7,8,9,10];
		var arr5 = [1,1,1,4,4,6,4,7,8,9,NaN,undefined,null,10];
		var arr6 = [];
		var arr7 = undefined;
		var ret = helper.getDuplicateElems(arr1);
		expect(ret.length).toEqual(0);
		
		ret = helper.getDuplicateElems(arr2);
		expect(ret.length).toEqual(0);
		
		ret = helper.getDuplicateElems(arr3);
		expect(ret.length).toEqual(1);		
		expect(ret[0]).toEqual(0);
		
		ret = helper.getDuplicateElems(arr4);
		expect(ret.length).toEqual(2);
		expect(ret[0]).toEqual(1);
		expect(ret[1]).toEqual(4);
		
		ret = helper.getDuplicateElems(arr5);
		expect(ret.length).toEqual(2);
		expect(ret[0]).toEqual(1);
		expect(ret[1]).toEqual(4);
		
		ret = helper.getDuplicateElems(arr6);
		expect(ret.length).toEqual(0);
		
		ret = helper.getDuplicateElems(arr7);
		expect(ret.length).toEqual(0);		
	});
	
	it("test array numeric top N...", function() {
		var arr1 = [1,2,3,4,5,6,7,8,9,10];
		var arr2 = [1,1,2.2,3,3,4,8,9,10,10];
		var arr3 = [1,1,1,3,4,9,10,10,10,100,1000];
		var ret = helper.getNumericThreshold(arr1, false, 2);	
		expect(ret).toEqual(9);
		ret = helper.getNumericThreshold(arr1, true, 2);
		expect(ret).toEqual(2);

		ret = helper.getNumericThreshold(arr2, false, 2);	
		expect(ret).toEqual(10);
		ret = helper.getNumericThreshold(arr2, true, 2);
		expect(ret).toEqual(1);
		
		ret = helper.getNumericThreshold(arr3, false, 2);	
		expect(ret).toEqual(100);
		ret = helper.getNumericThreshold(arr3, true, 2);
		expect(ret).toEqual(1);		
		ret = helper.getNumericThreshold(arr3, false, 12);	
		expect(ret).toEqual(1);
		ret = helper.getNumericThreshold(arr3, true, 12);
		expect(ret).toEqual(1000);
		ret = helper.getNumericThreshold(arr3, false, 0);	
		expect(ret).toBeNaN();
		ret = helper.getNumericThreshold(arr3, true, 0);
		expect(ret).toBeNaN();		
	});
	
	it("test array percent top N...", function() {
		var arr1 = [1,2,3,4,5,6,7,8,9,10];
		var arr2 = [];
		for (var i=0; i<100; i++)
		{
			arr2[i] = i*1.0 + 0.1;
		}		
		var arr3 = [];
		var arr4 = undefined;
		var ret = helper.getPercentThreshold(arr1, false, 10);
		expect(ret).toEqual(10);
		ret = helper.getPercentThreshold(arr1, true, 20);
		expect(ret).toEqual(2);
		
		ret = helper.getPercentThreshold(arr2, false, 10);
		expect(ret).toEqual(90.1);
		ret = helper.getPercentThreshold(arr2, true, 20);
		expect(ret).toEqual(19.1);		
		var ret = helper.getPercentThreshold(arr2, false, 101);
		expect(ret).toEqual(0.1);
		ret = helper.getPercentThreshold(arr2, true, 201);
		expect(ret).toEqual(99.1);
		var ret = helper.getPercentThreshold(arr2, false, 0);
		expect(ret).toBeNaN();
		ret = helper.getPercentThreshold(arr2, true, 0);
		expect(ret).toBeNaN();
		
		ret = helper.getPercentThreshold(arr3, false, 10);
		expect(ret).toBeNaN();
		ret = helper.getPercentThreshold(arr3, true, 20);
		expect(ret).toBeNaN();
		
		ret = helper.getPercentThreshold(arr4, false, 10);
		expect(ret).toBeNaN();
		ret = helper.getPercentThreshold(arr4, true, 20);
		expect(ret).toBeNaN();	
	});
	
	it("test array percentile value ...", function() {
		var arr1 = [1,2,3,4,5,6,7,8,9,10];
		var arr2 = [];
		for (var i=0; i<100; i++)
		{
			arr2[i] = i*1.0 + 0.1;
		}
		var arr3 = [1];

		var ret = helper.getPercentileThreshold(arr1, 55);
		expect(ret).toEqual(6);
		//console.log(ret);
		ret = helper.getPercentileThreshold(arr1, 0);
		expect(ret).toEqual(1);
		//console.log(ret);
		ret = helper.getPercentileThreshold(arr1, 100);
		expect(ret).toEqual(10);
		//console.log(ret);
		ret = helper.getPercentileThreshold(arr2, 20);
		//console.log(ret);
		expect(ret).toEqual(19.6);
		ret = helper.getPercentileThreshold(arr2, 0);
		//console.log(ret);
		expect(ret).toEqual(0.1);
		ret = helper.getPercentileThreshold(arr2, 100);
		//console.log(ret);
		expect(ret).toEqual(99.1);
		ret = helper.getPercentileThreshold(arr2, 90);
		//console.log(ret);
		expect(ret).toEqual(89.6);
		
		ret = helper.getPercentileThreshold(arr3, 0);
		//console.log(ret);
		expect(ret).toEqual(1);
		ret = helper.getPercentileThreshold(arr3, 50);
		//console.log(ret);	
		expect(ret).toEqual(1);
		ret = helper.getPercentileThreshold(arr3, 100);
		//console.log(ret);		
		expect(ret).toEqual(1);
	});		
});
