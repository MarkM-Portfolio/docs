dojo.provide('websheet.tests.ut.formula.ut_function_pmt');

/**
 * UT suite, for loan functions
 */

describe('Function pmt', function() {
	var pmt = new websheet.functions.pmt();
	
	var roundToTwo = function(v) {
		return Math.round(v * 100) / 100;
	};

	it('calculates the payment(PMT)', function(){
		expect(roundToTwo(pmt._calcPayment(0, 12, 0, 0, 0))).toBe(0);
		expect(roundToTwo(pmt._calcPayment(0, 24, 0, 12000, 1))).toBe(-500);
		expect(roundToTwo(pmt._calcPayment(0.1, -3, 1000, 0, 1))).toBe(274.65);
		expect(roundToTwo(pmt._calcPayment(0, 12, 5000, 0, 1))).toBe(-416.67);
		expect(roundToTwo(pmt._calcPayment(0.075 / 12, 2 * 12, 5000, 0, 1))).toBe(-223.60);
		expect(roundToTwo(pmt._calcPayment(0.06 / 52, 4 * 52, 8000, 0, 0))).toBe(-43.28);
		expect(roundToTwo(pmt._calcPayment(0.0525, 10, 6500, 0, 0))).toBe(-852.03);
		expect(roundToTwo(pmt._calcPayment(0.08 / 12, 3 * 12, 5000, -1000, 0))).toBe(-132.01);
		expect(roundToTwo(pmt._calcPayment(0.05, 24, 3000000, 0, 0))).toBe(-217412.70);
		expect(roundToTwo(pmt._calcPayment(0.05, 24, 3000000, 0, 1))).toBe(-207059.72);
		expect(roundToTwo(pmt._calcPayment(-0.05, 24, 3000000, -1000000, 0))).toBe(8759.25);
		expect(roundToTwo(pmt._calcPayment(-0.05, 24.1, -3000000, -1000000, 1))).toBe(138828.13);
	});
	
	it('calculates the interest payment for a given period(IPMT)', function(){
		expect(roundToTwo(pmt._calcInterest(0.05, 1, 24, 3000000, 0, 0))).toBe(-150000);
		expect(roundToTwo(pmt._calcInterest(0.05, 1.5, 24, 3000000, 0, 0))).toBe(-148335.24);
		expect(roundToTwo(pmt._calcInterest(0.05, 12, 24, 3000000, 0, 0))).toBe(-102114.10);
		expect(roundToTwo(pmt._calcInterest(0.05, 24, 24, 3000000, 0, 0))).toBe(-10352.99);
		expect(roundToTwo(pmt._calcInterest(0.05, 24.5, 24, 3000000, 0, 0))).toBe(-5239.63);
		expect(roundToTwo(pmt._calcInterest(0.05, 10, 24, 3000000, 1000000, 0))).toBe(-100444.63);
		expect(roundToTwo(pmt._calcInterest(0.05, 1, 24, 3000000, 0, 1))).toBe(0);
		expect(roundToTwo(pmt._calcInterest(0.05, 2, 24, 3000000, 0, 1))).toBe(-139647.01);
		expect(roundToTwo(pmt._calcInterest(0.05, 24, 24, 3000000, 0, 1))).toBe(-9859.99);
		expect(roundToTwo(pmt._calcInterest(0.05, 24.5, 24, 3000000, 0, 1))).toBe(-4990.12);
		expect(roundToTwo(pmt._calcInterest(0.05, 10, 24, 3000000, 1000000, 1))).toBe(-95661.56);
		expect(roundToTwo(pmt._calcInterest(-0.05, 10, 24, 3000000, -1000000, 1))).toBe(102922.26);
		expect(roundToTwo(pmt._calcInterest(-0.05, 10, 24.1, -3000000, -1000000, 1))).toBe(-48181.28);
		expect(roundToTwo(pmt._calcInterest(2, 1, 0.5, 1000, 50, 0))).toBe(-2000);
		expect(roundToTwo(pmt._calcInterest(2, 1.4, 0.5, 1000, 50, 0))).toBe(-416.95);
	});

});

describe('Function ipmt&ppmt', function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var parser = new websheet.parse.FormulaParser();
	var ipmt = new websheet.functions.ipmt();
	var ppmt = new websheet.functions.ppmt();
	var formula;
	var cell = _document.getOrCreateValueCell('Sheet1', 1, 1, formula, true);

	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});

	it('throw #NUM! when per < 1 or (per - nper >= 1)', function(){		
		formula = '=IPMT(0.05, 0.9, 24, 5000)';	
		ipmt.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){ipmt.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);	
		
		formula = '=IPMT(0.05, 25, 24, 5000, 1000, 1)';	
		ipmt.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){ipmt.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=PPMT(0.05, 0.9, 24, 5000)';		
		ppmt.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){ppmt.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);
		
		formula = '=PPMT(0.05, 25, 24, 5000, 1000, 1)';		
		ppmt.args = parser.parseFormula(formula, cell).tokenTree.tokenList;
		expect(function(){ppmt.calc();})
		  .toThrow(websheet.Constant.ERRORCODE['504']);	
	});
});
