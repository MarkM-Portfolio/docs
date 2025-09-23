dojo.provide('websheet.tests.ut.formula.ut_functionLogical');

/**
 * UT suite for logical functions
 */

describe('Function IFS', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.ifs();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});

	it('throw #N/A if no TRUE conditions are found', function(){
		formula = '=IFS(0, 1, false, 2)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['7']);
	});
	
	it('throw #VALUE! if the logical test resolves to a value other than TRUE or FALSE', function(){
		formula = '=IFS(0, 1, false, 2, "whar", 3)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
		
		formula = '=IFS(0, 1, false, 2, "tRue", 3, 999, 4)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe(3);
	});
	
	it('ignore the error if the logical test resloves to false', function(){
		formula = '=IFS(0, #VALUE!, false, #N/A, true, "Bingo")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc()).toBe('Bingo');
		
		formula = '=IFS(0, #VALUE!, true, #REF!, 999, "Bingo")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['524']);
	});

});


describe('Function IFERROR', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.iferror();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('returns the result of the first argument if it does not evaluates to an error;', function(){
		formula = '=IFERROR(false, 1)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe(false);
		
		formula = '=IFERROR(1, "value if error")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe(1);
		
		formula = '=IFERROR("Bingo", #VALUE!)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe('Bingo');
	});
	
	it('returns the result of the second argument if the first argument evaluates to an error;', function(){
		formula = '=IFERROR(#N/A, 1)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe(1);
		
		formula = '=IFERROR(#VALUE!, "value if error")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe('value if error');
		
		formula = '=IFERROR(#REF!, true)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe(true);
		
		formula = '=IFERROR(#NUM!, #VALUE!)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(this);})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
	
	it('returns an array if the first argument is an array', function(){
		formula = '=IFERROR({1, 2, 3}, "Bingo")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		var result = [[1, 2, 3]];
		expect(func.calc(this)).toEqual(result);
	 
		formula = '=IFERROR({1, #N/A; #VALUE!, 4}, "Bingo")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		result = [[1, 'Bingo'], ['Bingo', 4]];
		expect(func.calc(this)).toEqual(result);
	});
});

describe('Function IFNA', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var func = new websheet.functions.ifna();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it('returns the result of the first argument if it does not evaluates to #N/A;', function(){
		formula = '=IFNA(false, 1)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe(false);
		
		formula = '=IFNA(1, "value if error")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe(1);
		
		formula = '=IFNA("Bingo", #VALUE!)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe('Bingo');
	});
	
	it('returns the result of the second argument if the first argument evaluates to #N/A;', function(){
		formula = '=IFNA(#N/A, 1)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe(1);
		
		formula = '=IFNA(#N/A, "value if error")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe('value if error');
		
		formula = '=IFNA(#N/A, true)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(func.calc(this)).toBe(true);
		
		formula = '=IFNA(#VALUE!, 1)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(this);})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
		
		formula = '=IFNA(#VALUE!, #NUM!)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(this);})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
		
		formula = '=IFNA(#N/A, #NUM!)';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){func.calc(this);})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
	});
	
	it('returns an array if the first argument is an array', function(){ 
		formula = '=IFNA({1, #N/A; #VALUE!, 4}, "Bingo")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		result = [[1, 'Bingo'], [websheet.Constant.ERRORCODE['519'], 4]];
		expect(func.calc(this)).toEqual(result);
	});
	
});