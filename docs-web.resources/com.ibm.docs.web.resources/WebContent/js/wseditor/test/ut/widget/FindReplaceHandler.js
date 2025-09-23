dojo.provide("websheet.test.ut.widget.FindReplaceHandler");

/**
 * UT suite, function for findReplaceHandler.
 */

describe("websheet.test.ut.widget.ut_FindReplaceHandler", function() {
	var _document = new websheet.model.Document();
	var styleManager = _document._styleManager;
	var findReplaceHdl;
	beforeEach(function() {
		utils.bindDocument(_document);
		websheet.Main.scene = pe.scene;
		findReplaceHdl = new websheet.widget.FindReplaceHandler(websheet.Main);
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	describe("Find matching data in a selected range ", function(){
		it("Find the first matching cell in a range", function(){
			var sheet = builders.sheet(_document,"Sheet1").row([2],[[],[3],[4],[2]]).row([3],[[],[2],[5],[7]]).done();
			var rInfo = {"sheetName":"Sheet1","startRow" : 2, "startCol" : 2, "endRow" : 3, "endCol":4};
			
			var cell = findReplaceHdl._findNextInRange("2", rInfo);
			expect(cell.getRow()).toBe(2);
			expect(cell.getCol()).toBe(4);
			
			cell = findReplaceHdl._findNextInRange("2", rInfo);
			expect(cell.getRow()).toBe(3);
			expect(cell.getCol()).toBe(2);
			
			cell = findReplaceHdl._findNextInRange("2", rInfo);
			expect(cell.getRow()).toBe(2);
			expect(cell.getCol()).toBe(4);
			
			cell = findReplaceHdl._findNextInRange("2", rInfo, true);
			expect(cell.getRow()).toBe(2);
			expect(cell.getCol()).toBe(4);
			expect(findReplaceHdl._lastRowIndex).toBe(3);
			expect(findReplaceHdl._lastColIndex).toBe(2);
			
			cell = findReplaceHdl._findNextInRange("2", rInfo, true);
			expect(cell.getRow()).toBe(3);
			expect(cell.getCol()).toBe(2);
			expect(findReplaceHdl._lastRowIndex).toBe(3);
			expect(findReplaceHdl._lastColIndex).toBe(3);			
			
			rInfo = {"sheetName":"Sheet1","startRow" : 1, "startCol" : 2, "endRow" : 5, "endCol":3};			
			findReplaceHdl._lastRowIndex = 1;
			findReplaceHdl._lastColIndex = 1;
			var cell = findReplaceHdl._findNextInRange("2", rInfo);
			expect(cell.getRow()).toBe(3);
			expect(cell.getCol()).toBe(2);
			expect(findReplaceHdl._lastRowIndex).toBe(3);
			expect(findReplaceHdl._lastColIndex).toBe(2);
			
			builders.sheet(sheet).row([5,"hide"]).row([6],[[],[3],[2],[4]]).row([7,2,"hide"],[[],[5],[2],[8]]).row([10],[[],[2],[4],[5]]);
			rInfo = {"sheetName":"Sheet1","startRow" : 5, "startCol" : 2, "endRow" : 10, "endCol":4};
			findReplaceHdl._lastRowIndex = 6;
			findReplaceHdl._lastColIndex = 4;
			var cell = findReplaceHdl._findNextInRange("2", rInfo);
			expect(cell.getRow()).toBe(10);
			expect(cell.getCol()).toBe(2);
			expect(findReplaceHdl._lastRowIndex).toBe(10);
			expect(findReplaceHdl._lastColIndex).toBe(2);
			
			var cell = findReplaceHdl._findNextInRange("3", rInfo);
			findReplaceHdl._lastRowIndex = 6;
			findReplaceHdl._lastColIndex = 4;
			var cell = findReplaceHdl._findNextInRange("3", rInfo);
			expect(cell.getRow()).toBe(6);
			expect(cell.getCol()).toBe(2);
			expect(findReplaceHdl._lastRowIndex).toBe(6);
			expect(findReplaceHdl._lastColIndex).toBe(2);
			
			
		});
		
		it("Find the first matching cell in a row of rang(startCol and endCol)", function(){
			var sheet = builders.sheet(_document,"Sheet1").row(
					[1],
					[[],[3],[4],[2],[3],[8,"colspan", 3],[],[],[],[3],[8]]).done();
			var colsMap = {};
			var reg = new RegExp("4","ig");
			var row = sheet.getRow(1,false);
			var cell = findReplaceHdl._findNextInRowOfRange(row, reg, 2, 5, colsMap);			
			expect(cell.getRow()).toBe(1);
			expect(cell.getCol()).toBe(3);
			
			reg = new RegExp("3","ig");
			colsMap = {"2" : true};
			var cell = findReplaceHdl._findNextInRowOfRange(row, reg, 2, 5, colsMap);			
			expect(cell.getRow()).toBe(1);
			expect(cell.getCol()).toBe(5);
			
			reg = new RegExp("8","ig");
			var cell = findReplaceHdl._findNextInRowOfRange(row, reg, 5, 11, colsMap);			
			expect(cell.getRow()).toBe(1);
			expect(cell.getCol()).toBe(6);
			
			var cell = findReplaceHdl._findNextInRowOfRange(row, reg, 7, 11, colsMap);			
			expect(cell.getRow()).toBe(1);
			expect(cell.getCol()).toBe(11);
			
			var cell = findReplaceHdl._findNextInRowOfRange(row, reg, 1, 3, colsMap);			
			expect(cell).toBe(null);
		});

		it("Find all matching cells in a range", function(){
			var sheet = builders.sheet(_document,"Sheet1").row([2],[[],[3],[4],[3]]).row([3],[[],[2],[3],[3]]).done();;
			
			var rInfo = {"sheetName":"Sheet1","startRow" : 1, "startCol" : 2, "endRow" : 5, "endCol":3};
			var cells = findReplaceHdl._findAllInRange("3", rInfo);
			expect(cells.length).toBe(2);
			
			rInfo = {"sheetName":"Sheet1","startRow" : 2, "startCol" : 3, "endRow" : 3, "endCol":4};
			cells = findReplaceHdl._findAllInRange("3", rInfo);
			expect(cells.length).toBe(3);
		});
	});
});