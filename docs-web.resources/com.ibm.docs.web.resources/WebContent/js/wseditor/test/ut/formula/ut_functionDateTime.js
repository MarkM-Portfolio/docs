dojo.provide('websheet.tests.ut.formula.ut_functionDateTime');

describe('Function EDATE', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	websheet.baseDateStr = websheet.Constant.baseDateStr;
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.edate();
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('throw #VALUE! when start_date or months is not a number', function(){
		func.args = ["text", 1];
		expect(function() {func.getStartDate();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
		
		func.args = ["2017-6-15", "Text"];
		expect(function() {func.getDelta();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
		
		func.args = ["2017-2-29", -1];
		expect(function(){func.getStartDate();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
	
	it('throw #NUM! when start_date is not an valid date', function(){
		func.args = [-1, 1.5];
		expect(function(){func.getStartDate();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		func.args = [1e+21, 1.5];
		expect(function(){func.getStartDate();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #NUM! when start_date plus months yields an invalid date', function(){
		func.args = ["6/15/2017", 95791];
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		func.args = [42901, -1410];
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('return the last day of the month when it is less than the date of start_date', function(){
	    func.args = ["2017-1-31", 1];
		expect(func.calc()).toBe(42794);
		
	    func.args = ["8/31/2017", -14];
		expect(func.calc()).toBe(42551);
	});
	
	it('return the specified date when start_date plus months yields a valid date', function(){
		func.args = [0, 0];
		expect(func.calc()).toBe(0);
		
		func.args = ["2017-1-31", 3.6];
		expect(func.calc()).toBe(42855);
		
		func.args = ["2017-1-31", -3.6];
		expect(func.calc()).toBe(42674);
		
		func.args = ["2017-7-15", 17];
		expect(func.calc()).toBe(43449);
		
		func.args = ["2017-7-15", -17];
		expect(func.calc()).toBe(42415);
		
		func.args = ["2017-6-15", 95790];
		expect(func.calc()).toBe(2958449);
	});
});

describe('Function EOMONTH', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.eomonth();
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('return the last day of the month when start_date plus months yields a valid date', function(){
	    func.args = ["2017-1-31", 1];
		expect(func.calc()).toBe(42794);
		
		func.args = ["2017-1-11", 1];
		expect(func.calc()).toBe(42794);
		
	    func.args = ["8/31/2017", -14];
		expect(func.calc()).toBe(42551);
		
		func.args = ["8/1/2017", -14];
		expect(func.calc()).toBe(42551);
		
		func.args = ["2017-6-15", 95790];
		expect(func.calc()).toBe(2958465);
	});

});