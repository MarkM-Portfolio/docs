dojo.provide("websheet.test.ut.model.cell");

/**
 * UT suite, function for cell, styleCell.
 */

describe("websheet.test.ut.model.ut_cell", function() {
	
	var _document = new websheet.model.Document();
	var _sheet = new websheet.model.Sheet(_document);
	var _row = new websheet.model.Row(_sheet);
	var styleManager = _document._styleManager;

	// dummy default cell style
	styleManager._dcs 
		= websheet.style.DefaultStyleCode
		= styleManager.styleMap[websheet.Constant.Style.DEFAULT_CELL_STYLE]
		= builders.style().defaultStyle().finish();
	
	websheet.Constant.init();
	
	var MIXED = _document.CellType.MIXED;

	beforeEach(function() {
		utils.bindDocument(_document);
	});
	
	afterEach(function() {
		_row._valueCells = [];
		styleManager._hashCodeIdMap = {};
		styleManager.styleMap = {};
		
		utils.unbindDocument();
	});
	
	it("is about defect 37354, cv of =9^99 with text formatting align wrong", function() {
		var styleCode = builders.style().category("text").currency("").code("").fmcolor("").finish();
		var sid = styleManager.addStyle(styleCode, true);
		
		builders.sheet(_sheet).row(1, [
			                          ["=9^99", 2.9512665430652752e+94, 1], ["=9^99", 2.9512665430652752e+94, 1, sid]
		                            ]).done();
		var row = _sheet._rows[0];
		var cell1 = row.getCell(1, MIXED);
		var cell2 = row.getCell(2, MIXED);
		// Max length for number show value string is 11, it will be rounded;
		doh.is("2.95127E+94", cell1.getShowValue(), "show value right before mixin");
		doh.is("2.95127E+94", cell2.getShowValue(), "shows value right after mixin");
	});
	
	it("is about defect 37389, value 3.0000000000000001E-3 should be format as 0.003", function() {
		builders.sheet(_sheet).row(1, [
			                          [3.0000000000000001E-3, , 0]
		                            ]).done();
		var vcell = _sheet._rows[0].getCell(1);
		doh.is("0.003", vcell.getShowValue(), "show value right is 0.003");
	});
	
	it("is about defect 36010, value 3.2500000000000001E-2 as a calculated value should be format as 0.0325", function() {
		builders.sheet(_sheet).row(1, [
			                          ["=3.2500000000000001E-2", 3.2500000000000001E-2, 1]
		                            ]).done();
		var vcell = _sheet._rows[0].getCell(1);
		doh.is("0.0325", vcell.getShowValue(), "show value right is 0.0325");
	});
	
	it("is about defect 37649, TRUE in edit value in de locale is wrong, try en", function() {
		builders.sheet(_sheet).row(1, [
			                          [1, , websheet.Constant.ValueCellType.BOOLEAN << 3]
		                            ]).done();
		var vcell = _sheet._rows[0].getCell(1);
		doh.is("TRUE", vcell.getShowValue(), "show value is TRUE in en");
		doh.is("TRUE", vcell.getEditValue(), "edit value is TRUE in en");
	});
	
	it("is about defect 37688, string typed cell with currency format should just show the string", function() {
		var styleCode = builders.style().formatCurrency().code("#.##0.00").currency("USD").finish();
		var sid = styleManager.addStyle(styleCode, true);

		builders.sheet(_sheet).row(1, [
			                          ["a", , websheet.Constant.ValueCellType.STRING << 3, sid]
		                            ]).done();
		var cell = _sheet._rows[0].getCell(1, MIXED);
		doh.is("a", cell.getShowValue(), "shows as original string");
	});
	
	it("is defect 37728, boolean typed cell with currency format should just show the boolean", function() {
		var styleCode = builders.style().formatCurrency().code("#.##0.00").currency("USD").finish();
		var sid = styleManager.addStyle(styleCode, true);
		
		builders.sheet(_sheet).row(1, [
			                          [1, , websheet.Constant.ValueCellType.BOOLEAN << 3, sid]
		                            ]).done();		
		
		var cell = _sheet._rows[0].getCell(1, MIXED);
		doh.is("TRUE", cell.getShowValue(), "shows as boolean string");
	});
	
	it("is defect 38899, number typed cell with text format, getEditValue() should return a string", function() {
		var styleCode = builders.style().category("text").currency("").code("@").fmcolor("").finish();
		var sid = styleManager.addStyle(styleCode, true);

		builders.sheet(_sheet).row(1, [
			                          [2204049, , websheet.Constant.ValueCellType.NUMBER << 3, sid]
		                            ]).done();		

		var cell = _sheet._rows[0].getCell(1, MIXED);
		expect(cell.getEditValue()).toBe("2204049");
	});
	
	it("is about defect 39701, un-calculated cell shows formula string as show string", function() {
		builders.sheet(_sheet).row(1, [
			                          ["=E3", , websheet.Constant.ValueCellType.UNKNOWN << 3 | websheet.Constant.ValueCellType.FORMULA]
		                            ]).done();
		var cell = _sheet._rows[0].getCell(1, MIXED);
		expect(cell.getShowValue()).toBe("=E3");
	});

	describe("about de locale", function() {
		
		var _en_nls = websheet.i18n.Number.nls;
		
		beforeEach(function() {
			window.g_locale = "de";
			websheet.i18n.Number.setNLS({"TRUE": "XXX", "FALSE": "OOO"});
		});
		
		afterEach(function() {
			window.g_locale = "en";
			websheet.i18n.Number.nls = _en_nls;
		});
		
		it("is about defect 37649, TRUE in edit value in de locale is wrong", function() {
			builders.sheet(_sheet).row(1, [
				                          [1, , websheet.Constant.ValueCellType.BOOLEAN << 3]
			                            ]).done();
			var cell = _sheet._rows[0].getCell(1);
			doh.is("XXX", cell.getShowValue(), "show value is TRUE in de");
			doh.is("XXX", cell.getEditValue(), "edit value is TRUE in de");
		});
		
		it("is defect 37728, boolean typed cell with currency format should just show the boolean, in de", function() {
			var styleCode = builders.style().formatCurrency().code("#.##0.00").currency("USD").finish();
			var sid = styleManager.addStyle(styleCode, true);
			
			builders.sheet(_sheet).row(1, [
				                          [1, , websheet.Constant.ValueCellType.BOOLEAN << 3, sid]
			                            ]).done();
			var cell = _sheet._rows[0].getCell(1, MIXED);
			doh.is("XXX", cell.getShowValue(), "shows as boolean string");
		});
	});
	
	describe("protection", function() {
		var sidS0, sidh;
		var dcs = "defaultcellstyle";

		beforeEach(function() {
			var code = {};
			code[websheet.Constant.Style.BACKGROUND_COLOR] = "#ff0000";
			sidS0 = styleManager.addStyle(code);
			code = {};
			code[websheet.Constant.Style.PROTECTION_HIDDEN] = true;
			sidH = styleManager.addStyle(code);
		});
		
		it("styleCell, setCellByJson", function(){
			var sheet = builders.sheet(_document,"protected").columnMeta(8,[1,sidS0]).row(1,[[dcs,1]]).done();
			var row = sheet._rows[0];
			var cell = row._styleCells[0];
			
			var code = {};
			cell.setCellByJson({}, null,true);
			code[websheet.Constant.Style.PROTECTION_UNLOCKED] = true;
			doh.is(row._doc._styleManager.addStyle(code), cell._styleId);
			doh.is(false, row.isCellProtected(1));
			
			code[websheet.Constant.Style.BACKGROUND_COLOR] = "#ff0000";
			cell.setCellByJson({style: code}, null,true);
			doh.is(false, row.isCellProtected(1));
			
			code = {};
			code[websheet.Constant.Style.BACKGROUND_COLOR] = "#ff0000";
			cell.setCellByJson({style:code}, null, true);
			doh.is(false, row.isCellProtected(1));
			
			cell.setCellByJson({style:{id: sheet._columns[0]._styleId}}, null, true);
			doh.is(false, row.isCellProtected(1));
		});
		
		it("Cell, getEditValue", function(){
			var sheet = builders.sheet(_document,"protected").columnMeta(4,[1,sidH])
						.row(1,[[21, sidH],[dcs,1],,[22],,[23]]).done();
			var row = sheet._rows[0];
			var cell = row.getCell(1,row._doc.CellType.MIXED);
			doh.is("", cell.getEditValue());
			cell = row.getCell(4,row._doc.CellType.MIXED);
			doh.is("", cell.getEditValue());
			cell = row.getCell(6,row._doc.CellType.MIXED);
			doh.isNot("", cell.getEditValue());
		});
		
		it("_cell, isHidden", function(){
			var sheet = builders.sheet(_document,"protected").columnMeta(5, [1, sidH])
						.row(1,[[sidH,1],,[dcs,1],,[23]]).done();
			var row = sheet._rows[0];
			var cell = row._styleCells[0];
			doh.is(true, cell.isHidden());
			cell = row._styleCells[1];
			doh.is(false, !!cell.isHidden());
			cell = row._valueCells[4];
			doh.is(false,!!cell.isHidden());
			doh.is(true,cell.isHidden(sheet._columns[0]._styleId));
		});	
	});
	it("_cell, setTmpLink", function(){
		builders.sheet(_sheet).row(1, [
				                          ["", , websheet.Constant.ValueCellType.UNKNOWN << 3 | websheet.Constant.ValueCellType.FORMULA]
			                            ]).done();
		var cell = _sheet._rows[0].getCell(1, MIXED);
		cell.setTmpLink("www.ibm.com");
		doh.is(true,cell.hasURL());
		cell.setTmpLink("");
		doh.is(false,cell.hasURL());
		doh.is(true, cell.isLinkFormula());
		doh.is("", cell.getLink());
		cell.setLink("");
	});
});
