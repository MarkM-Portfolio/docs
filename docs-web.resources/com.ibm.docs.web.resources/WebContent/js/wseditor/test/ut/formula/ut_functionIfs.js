dojo.provide('websheet.tests.ut.formula.ut_function_countifs');

/**
 * UT suite, function for _countifs
 */

describe('Function _countifs', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	websheet.functions.Formulas.init();
	var parser = new websheet.parse.FormulaParser();
	var func = websheet.functions.FormulaList._countifs;
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});

	it('throw #VALUE! when range sizes are different', function(){
		var formula = '=COUNTIFS(A1:A3, 1, B1:B3, "A", C1:C5, ">10")';
		var cell = _document.getOrCreateValueCell('Sheet1', 10, 1, formula, true);
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){websheet.functions.FormulaList._countifs._checkRangeSize(this);})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
		
		formula = '=SUMIFS(A1:A5, B1:B3, "A", C1:C3, ">10")';
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		var prefixRange = websheet.functions.FormulaList._countif._getRange(func.args[0]);
		var baseRange = websheet.functions.FormulaList._countif._getRange(func.args[1]);
		expect(function(){websheet.functions.FormulaList._countifs._checkRangeSize(this, baseRange, prefixRange);})
		  .toThrow(websheet.Constant.ERRORCODE['519']);
	});
	
	it('deletes unsatisfied items from the array that meets previous criteria', function(){
		var results = [ [], [{row: 5, col: 4}], [],[{row: 3, col: 4}, {row: 3, col: 5}]];
		spyOn(func, 'getSatisfyCriteria').andCallFake(function() {
			return results.shift();
		});
		var delta = {row: 2, col: 3, sheetName: 'Sheet1'};
		var preSatisfyCells = [{row: 1, col: 1, rowSize: 1, colSize:3}, {row: 2, col: 2}, {row:3, col:1}, {row:3, col:3}];
		func._satisfy(this, delta, "Test*", preSatisfyCells);
		expect(preSatisfyCells).toEqual([{row: 3, col: 1}, {row: 1, col: 1}, {row: 1, col: 2},]);
		expect(func.getSatisfyCriteria.calls.length).toBe(4);
	});
	
	it('terminates when no satisfied cell is found', function(){
		var formula = '=COUNTIFS(A1:A3, , B1:B3, #N/A, C1:C3, ">10")';
		var cell = _document.getOrCreateValueCell('Sheet1', 10, 1, formula, true);
		func.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		var preSatisfyCells = [{row: 1, col: 2}];
		spyOn(func, 'exec').andCallFake(function() {
			return preSatisfyCells;
		});
		spyOn(func, '_satisfy').andCallFake(function() {
			expect(arguments[3]).toBe(preSatisfyCells);
			arguments[3].splice(0);
		});
		var result= func.getSatisfyCells(this);
		expect(result).toBeNull();
		expect(func._satisfy.calls.length).toBe(1);
	});
});