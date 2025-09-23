dojo.provide("websheet.test.ut.fuzzyChecker");

/**
 * Suite of model algorithm from Sheet, Row and Column
 */
describe("websheet.tests.ut.ut_fuzzyChecker", function() {
	var _document = new websheet.model.Document();
	
	var styleManager = _document._styleManager;
	
	styleManager._dcs 
		= websheet.style.DefaultStyleCode
		= styleManager.styleMap[websheet.Constant.Style.DEFAULT_CELL_STYLE]
		= builders.style().defaultStyle().finish();
	
	beforeEach(function() {
		utils.bindDocument(_document);
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("always passes model count check in fuzzy", function() {
		var sheet = builders.sheet().row(1, [["ce0"], ["ce0"]])
			.row(2, [["ce1"], ["ce1"]]).done();
		expect.model(sheet, "fuzzy").hasRows(3)
			.rowAtIndex(1).hasStyleCells(3)
			.rowAtIndex(2).hasStyleCells(5);
		sheet = builders.sheet()
			.columnMeta(1, ["ce0"])
			.columnMeta(2, ["ce0"])
			.done();
		expect.model(sheet, "fuzzy").hasColumns(3);
	});
	
	it("passes row repeat check in fuzzy", function() {
		var sheet = builders.sheet().row([1, 3, 3]).done();
		expect.model(sheet, "fuzzy")
			.rowAtIndex(1).repeats(1);
		expect.model(sheet, "fuzzy")
			.rowAtIndex(1).repeats(2);
		expect.model(sheet, "fuzzy")
			.rowAtIndex(1).repeats(3);
	});
	
	it("passes has row at index check with follow style in fuzzy", function() {
		var sheet = builders.sheet().row([1, 3, 3]).done();
		expect.model(sheet, "fuzzy")
			.rowAtIndex(1).height(3)
			.rowAtIndex(2).height(3)
			.rowAtIndex(3).height(3);
	});
	
	it("passes has style cell at index check with follow style in fuzzy", function() {
		var sid = builders.style().bgColor("black").putInto(styleManager);
		var sheet = builders.sheet().row(1, [[sid, 1]]).done();
		expect.model(sheet, "fuzzy").rowAtIndex(1)
			.styleCellAtIndex(1).hasStyle(sid)
			.styleCellAtIndex(2).hasStyle(sid);
	});
	
	it("passes style cell repeat in fuzzy", function() {
		var sid = builders.style().bgColor("black").putInto(styleManager);
		var sheet = builders.sheet().row(1, [[sid, 1], , [sid], [sid]]).done();
		expect.model(sheet, "fuzzy").rowAtIndex(1)
			.styleCellAtIndex(1).repeats(1);
		expect.model(sheet, "fuzzy").rowAtIndex(1)
			.styleCellAtIndex(1).repeats(2);
		expect.model(sheet, "fuzzy").rowAtIndex(1)
			.styleCellAtIndex(1).repeats(3);
		expect.model(sheet, "fuzzy").rowAtIndex(1)
			.styleCellAtIndex(2).repeats(1);
		expect.model(sheet, "fuzzy").rowAtIndex(1)
			.styleCellAtIndex(2).repeats(2);
	});
	
	it("passes has column at index check with follow style in fuzzy", function() {
		var sheet = builders.sheet()
			.columnMeta(1, [1, 20]).done();
		expect.model(sheet, "fuzzy")
			.colAtIndex(1).width(20)
			.colAtIndex(2).width(20);
	});
	
	it("passes column repeat in fuzzy", function() {
		var sid = builders.style().bgColor("black").putInto(styleManager);
		var sheet = builders.sheet()
			.columnMeta(1, [1, 20])
			.columnMeta(3, [, 20])
			.columnMeta(4, [, 20]).done();
		expect.model(sheet, "fuzzy")
			.colAtIndex(1).repeats(1);
		expect.model(sheet, "fuzzy")
			.colAtIndex(1).repeats(2);
		expect.model(sheet, "fuzzy")
			.colAtIndex(1).repeats(3);
		expect.model(sheet, "fuzzy")
			.colAtIndex(2).repeats(1);
		expect.model(sheet, "fuzzy")
			.colAtIndex(2).repeats(2);
	});	
	
});
