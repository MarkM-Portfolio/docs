sample("10284.xlsx");
/*
 * Test formula calculation with formalized sample:
 * |Column A - formula string | Column B - real formula | Column C - expected result | Column E - ignored flag |
 * e.g.
 * |'=SUM(1,2,3) | =SUM(1,2,3) | 6 |         | -> =SUM(1,2,3) will be tested with the expected value 6
 * |'=SUM(A:AZ)  | =SUM(A:AZ)  |   | ignored | -> =SUM(A:AZ) will be ignored
 * 
 * Any cell in Column A is not a formula string which should start with "=" 
 * that indicates the current sheet is done, switch to next one
 * |    $ 1.234.5| ...    
 * |             | ...                        -> switch to next sheet
 */
var finished = false,
sheetFinished = false,
defaultTimeout = 120000; //2 mins

beforeEach(function() {
	this.addMatchers({
		toEqualFormula: function(expected, formula, index){
			this.message = function(){
				return "Row"+ index + " Expect '" + this.actual + "' to equal '" + expected + "' as a result of " + formula;
			};
			return (this.actual === expected);
		}
	});	
});
describe("websheet.tests.api.formulas", function() {
	it.asyncly("comparing with expected results", function () {
		return actBy()
		.step(function(deferred) {
			expect.ui().forVisibleRows(function(rowNode, index, checker) {
				var testName = checker.cellAtIndex("A").value();
				if (testName && testName.match("^=")) {
					var result = checker.cellAtIndex("B").value();
					var expectedResult = checker.cellAtIndex("C").value();
					var ignored = checker.cellAtIndex("E").value();
					if (ignored.toLowerCase() != "ignored"){
						expect(result).toEqualFormula(expectedResult, testName, index);
					}
				} else {
					finished = true;
					return true;
				}
			});
			deferred.step();
		}).step(function(deferred) {
			//PgDn
			if (!finished) {
				actions.pageDown();
			}else{
				deferred.step();
			}					
		}).step(function(deferred) {
			//Switch sheets
			if (finished){
				var nextSheet = helpers.nameOfNextSheet();
				if (nextSheet){
					finished = false;
					actions.switchSheet(nextSheet);
				} else{
					sheetFinished = true;
					deferred.step();
				}
			} else {
				deferred.step();
			}	        		
		}).repeatUntil(function() {
			return sheetFinished;
		});
	}, defaultTimeout);
});   
