dojo.provide('websheet.tests.ut.formula.ut_functionMath');

/**
 * UT suite for ACOT, ACOTH, COT, COTH, ERFC, FACTDOUBLE,
 * GAMMALN, GCD, LCM, MROUND, MULTINOMIAL, QUOTIENT, 
 * SERIESSUM, SIGN, SQRTPI, SUMSQ, TAN, TANH  functions
 */

describe('Function ACOT', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.acot();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the acot', function(){
		formula = '=ACOT(0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(1.570796327);
		
		formula = '=ACOT(100)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0.009999667);
		
		formula = '=ACOT("-100")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(3.131592987);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=ACOT("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function ACOTH', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.acoth();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the acoth', function(){
		formula = '=ACOTH(2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0.549306144);
		
		formula = '=ACOTH(100)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0.010000333);
		
		formula = '=ACOTH("-2")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(-0.549306144);
	});

	it('throw #NUM! if -1 <= parm <= 1', function(){
		formula = '=ACOTH(1)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=ACOTH(0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=ACOTH("-1")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=ACOTH("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function COT', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.cot();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the cot', function(){
		formula = '=COT(2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(-0.457657554);
		
		formula = '=COT(100)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(-1.702956919);
		
		formula = '=COT("-2")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0.457657554);
		
		formula = '=COT("1E-12")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(1E+12);
	});

	it('throw #NUM! if parm <= -2^27 or parm >= 2^27', function(){
		formula = '=COT(134217728)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=COT("-134217728")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #DIV/0! if parm == 0', function(){
		formula = '=COT(0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['532']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=COT("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function COTH', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.coth();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the coth', function(){
		formula = '=COTH(2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(1.037314721);
		
		formula = '=COTH(100)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(1);
		
		formula = '=COTH("-2")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(-1.037314721);
	});

	it('throw #NUM! if parm <= -2^27 or parm >= 2^27', function(){
		formula = '=COTH(134217728)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=COTH("-134217728")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #DIV/0! if parm == 0', function(){
		formula = '=COTH(0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['532']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=COTH("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function ERFC', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.erfc();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the erfc', function(){
		formula = '=ERFC(0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(1);
		
		formula = '=ERFC(2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0.004677735);
		
		formula = '=ERFC("-100")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(2);
		
		formula = '=ERFC("-2")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(1.995322265);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=ERFC("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function FACTDOUBLE', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.factdouble();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the factdouble', function(){
		formula = '=FACTDOUBLE(0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(1);
		
		formula = '=FACTDOUBLE(10)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(3840);
		
		formula = '=FACTDOUBLE("11")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(10395);
		
		formula = '=FACTDOUBLE("300")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(8.154414069380598e+307);
	});

	it('throw #NUM! if the parm < 0 or the result is infinity', function(){
		formula = '=FACTDOUBLE("-1")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=FACTDOUBLE(301)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=FACTDOUBLE("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function GAMMALN', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.gammaln();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the gammaln', function(){
		formula = '=GAMMALN(0.01)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(4.599479878);
		
		formula = '=GAMMALN(0.1)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(2.252712652);
		
		formula = '=GAMMALN(1)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0);
		
		formula = '=GAMMALN(10)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(12.80182748);
		
		formula = '=GAMMALN(100)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(359.1342054);
		
		formula = '=GAMMALN(1000)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(5905.220423);
		
		formula = '=GAMMALN(10000)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(82099.7175);
	});

	it('throw #NUM! if the parm <= 0', function(){
		formula = '=FACTDOUBLE("-1")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=FACTDOUBLE("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function GCD', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.gcd();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the gcd', function(){
		formula = '=GCD(5,10,15,20)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(5);
		
		formula = '=GCD(5,0,15,20)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(5);
		
		formula = '=GCD({5,10,15,20})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(5);
		
		formula = '=GCD({5,10;15,20})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(5);
	});

	it('throw #NUM! if the parm < 0', function(){
		formula = '=GCD({5,-10,15})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args)})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=GCD({5,"a",15,20})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args);})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function LCM', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.lcm();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the lcm', function(){
		formula = '=LCM(5,10,15,20)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(60);
		
		formula = '=LCM(5,0,15,20)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(0);
		
		formula = '=LCM({5,10,15,20})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(60);
		
		formula = '=LCM({5,10;15,20})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(60);
	});

	it('throw #NUM! if the parm < 0', function(){
		formula = '=LCM({5,-10,15})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args)})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=LCM({5,"a",15,20})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args);})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function MROUND', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.mround();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the mround', function(){
		formula = '=MROUND(10,3)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(9);
		
		formula = '=MROUND("-10","-3")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(-9);
		
		formula = '=MROUND(1.3,0.2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(1.4);
		
		formula = '=MROUND(10,0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(0);
		
		formula = '=MROUND(0,10)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(0);
	});

	it('throw #NUM! if the parms have different signs', function(){
		formula = '=MROUND("-10",3)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=MROUND(10,"-3")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=MROUND("a",3)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
		
		formula = '=MROUND(3,"a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function MULTINOMIAL', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.multinomial();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the multinomial', function(){
		formula = '=MULTINOMIAL(5,6,7)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(14702688);
		
		formula = '=MULTINOMIAL(5,0,7)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(792);
		
		formula = '=MULTINOMIAL({5,6,7})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(14702688);
		
		formula = '=MULTINOMIAL({5;6;7})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(14702688);
	});

	it('throw #NUM! if the parm < 0 or the result is infinity', function(){
		formula = '=MULTINOMIAL({5,-6,7})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args)})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=MULTINOMIAL({0,200,0})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args)})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=MULTINOMIAL({5,"a",7})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args);})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function QUOTIENT', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.quotient();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the quotient', function(){
		formula = '=QUOTIENT(5,2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(2);
		
		formula = '=QUOTIENT(10,2.2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(4);
		
		formula = '=QUOTIENT("-10",3)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(-3);
		
		formula = '=QUOTIENT(5.5,2.667)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(2);
		
		formula = '=QUOTIENT("-7",2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(-3);
		
		formula = '=QUOTIENT(0,2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(0);
	});

	it('throw #DIV/0! if the denominator == 0', function(){
		formula = '=QUOTIENT(5,0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['532']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=QUOTIENT("a",3)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
		
		formula = '=QUOTIENT(3,"a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function SERIESSUM', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.seriessum();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the seriessum', function(){
		formula = '=SERIESSUM(2,1,2,{1,2,3,4,5})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(3186);
		
		formula = '=SERIESSUM(2,1,2,{1;2;3;4;5})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(3186);
		
		formula = '=SERIESSUM(5,1,1,{1,1,1,1,1})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(3905);
		
		formula = '=SERIESSUM("-5",1,1,{1,1,1,1,1})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(-2605);
		
		formula = '=SERIESSUM(5,"-1",1,{1,1,1,1,1})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(156.2);
		
		formula = '=SERIESSUM(5,1,"-1",{1,1,1,1,1})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(6.248);
		
		formula = '=SERIESSUM(5,1,1,{1,1,-1,1,1})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(3655);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=SERIESSUM("a",1,1,{1,1,1,1,1})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args)})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
		
		formula = '=SERIESSUM(5,1,1,{1,1,"a",1,1})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args)})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function SIGN', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.sign();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the sign', function(){
		formula = '=SIGN(0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(0);
		
		formula = '=SIGN(9.5)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(1);
		
		formula = '=SIGN("-9.5")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(-1);
		
		formula = '=SIGN(0.000000001)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(1);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=SIGN("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function SQRTPI', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.sqrtpi();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the sqrtpi', function(){
		formula = '=SQRTPI(5)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(3.963327298);
		
		formula = '=SQRTPI(0.2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0.79266546);
		
		formula = '=SQRTPI(100)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(17.72453851);
		
		formula = '=SQRTPI(0)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0);
	});
	
	it('throw #NUM! if the parm < 0', function(){
		formula = '=SQRTPI("-1")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=SQRTPI("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function SUMSQ', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.sumsq();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the sumsq', function(){
		formula = '=SUMSQ(2,3,4,5)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(54);
		
		formula = '=SUMSQ(2,0,4,5)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(45);
		
		formula = '=SUMSQ(2,"-1",4,5)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(46);
		
		formula = '=SUMSQ({2,3,4,5})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(54);
		
		formula = '=SUMSQ({2,3;4,5})';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(func.args)).toBe(54);
	});

	it('throw #VALUE! if the parm is not number', function(){
		formula = '=SUMSQ(2,"a",4)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(func.args)})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function TAN', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.tangent();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the tan', function(){
		formula = '=TAN(2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(-2.185039863);
		
		formula = '=TAN(100)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(-0.587213915);
		
		formula = '=TAN("-2")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(2.185039863);
		
		formula = '=TAN(' + Math.PI/4 + ')';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(1);
	});

	it('throw #NUM! if parm <= -2^27 or parm >= 2^27', function(){
		formula = '=TAN(134217728)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=TAN("-134217728")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=TAN("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});

describe('Function TANH', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.tanh();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('calculates the tanh', function(){
		formula = '=TANH(2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0.96402758);
		
		formula = '=TANH(100)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(1);
		
		formula = '=TANH("-2")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(-0.96402758);
		
		formula = '=TANH(0.5)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBeCloseTo(0.462117157);
	});

	it('throw #NUM! if parm <= -2^27 or parm >= 2^27', function(){
		formula = '=TANH(134217728)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=TANH("-134217728")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('throw #VALUE! if the parm is not number', function(){
		formula = '=TANH("a")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
});