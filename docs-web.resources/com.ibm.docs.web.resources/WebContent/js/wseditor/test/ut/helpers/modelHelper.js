dojo.provide("websheet.test.ut.test_helpers");

/**
 * Suite for ModelHelper
 */
describe("websheet.test.ut.helpers.test_modelHelper", function() {

	var wsconst = websheet.Constant;
	var typeconst = wsconst.ValueCellType;

	var mhelper = websheet.model.ModelHelper;
	
	websheet.Constant.init();		

	beforeEach(function() {
		;
	});

	it("can get type from truth boolean", function() {
		expect(mhelper.getCellType("true")).toBe(typeconst.BOOLEAN << 3);
	});
	
	it("can get string type from empty string", function() {
		expect(mhelper.getCellType("")).toBe(typeconst.STRING << 3);
	});
	
	it("can get type from large number", function() {
		expect(mhelper.getCellType("11111111111111111111111")).toBe(typeconst.NUMBER << 3);
	});

	it("can get type from number string length == 32", function() {
		var s = [];
		for (var i = 0; i < 32; i++) {
			s.push("1");
		}
		s = s.join("");
		doh.is(typeconst.NUMBER << 3, mhelper.getCellType(s));
	});
	
	it("can get type from regular string", function() {
		doh.is(typeconst.STRING << 3, mhelper.getCellType("text"));
	});
	
	it("can get type from formula with calculated value", function() {
		doh.is(((typeconst.STRING << 3) | typeconst.FORMULA_NORMAL), mhelper.getCellType("=A1", "text"));
	});
	
	it("can get type from error code", function() {
		doh.is(((typeconst.ERROR << 3) | typeconst.FORMULA_NONE), mhelper.getCellType("#REF!"));
	});
	
	it("can get type from formula without calculated value", function() {
		doh.is(((typeconst.UNKNOWN << 3) | typeconst.FORMULA_NORMAL), mhelper.getCellType("=A1", null));
	});
	
	it("can get type from number", function() {
		doh.is(((typeconst.NUMBER << 3) | typeconst.FORMULA_NONE), mhelper.getCellType(1));
	});
	
	it("can get string type from numeric string when bNoParse is true", function() {
		doh.is(((typeconst.STRING << 3) | typeconst.FORMULA_NONE), mhelper.getCellType("1", null, true));
	});
	
	it("can get string type from boolean string when bNoParse is true", function() {
		doh.is(((typeconst.STRING << 3) | typeconst.FORMULA_NONE), mhelper.getCellType("true", null, true));
	});

	it("can get boolean type from boolean when bNoParse is true", function() {
		doh.is(((typeconst.BOOLEAN << 3) | typeconst.FORMULA_NONE), mhelper.getCellType(true, null, true));
	});
	
	describe("set multiple column width", function(){
		var mHelper = websheet.model.ModelHelper;
		
		var _document = new websheet.model.Document();
		
		beforeEach(function(){
			utils.bindDocument(_document);
		});
		
		afterEach(function(){
			utils.unbindDocument();
		});
		
		it("getColsWidth",function(){
			//when the sheet is empty
			var sheet = builders.sheet(_document,"Sheet1").done();
			var sCol = 2, eCol = 4;
			var widths = mHelper.getColsWidth("Sheet1",sCol,eCol);
			var cnt = Object.keys(widths).length;
			doh.is(3,cnt);
			var strB = websheet.Helper.getColChar(2);
			var strC = websheet.Helper.getColChar(3);
			var strD = websheet.Helper.getColChar(4);
			var strE = websheet.Helper.getColChar(5);
			var strF = websheet.Helper.getColChar(6);
			doh.is(null,widths[strB].w);
			doh.is(null,widths[strC].w);
			doh.is(null,widths[strD].w);
			
			var sheet = builders.sheet(_document,"Sheet1").columnMeta(4,[1,40]).done();
			widths = mHelper.getColsWidth("Sheet1",sCol,eCol);
			var cnt = Object.keys(widths).length;
			doh.is(3,cnt);
			doh.is(null,widths[strB].w);
			doh.is(null,widths[strC].w);
			doh.is(40,widths[strD].w);
			
			widths = mHelper.getColsWidth("Sheet1",4,4);
			var cnt = Object.keys(widths).length;
			doh.is(1,cnt);
			doh.is(40,widths[strD].w);
			
			widths = mHelper.getColsWidth("Sheet1",5,6);
			var cnt = Object.keys(widths).length;
			doh.is(2,cnt);
			doh.is(40,widths[strE].w);
			doh.is(null,widths[strF].w);
		});
	});
	
	
	describe("protection", function() {
		var _document = new websheet.model.Document();
		
		var hsid = null;
		var dcs = "defaultcellstyle";
		beforeEach(function() {
			utils.bindDocument(_document);
			var code = {};
			code[websheet.Constant.Style.PROTECTION_HIDDEN] = true;
			hsid = _document._styleManager.addStyle(code);
		});
		
		afterEach(function() {
			utils.unbindDocument();
		});
		
		it("toCellJSON", function(){
			var sheet = builders.sheet(_document,"protected").columnMeta(4,[1,hsid])
						.row(1,[[21,hsid],[dcs,1],,[22],,[23]]).done();

			var row = sheet._rows[0];
			var mHelper = websheet.model.ModelHelper;
			
			var params1 = {bStyle: true, bValue: true, bHasColStyle: true, forCopy: true};
			var params2 = {bStyle: true, bValue: true, bHasColStyle: true, forCopy: false};
			
			var cell = row.getCell(1,row._doc.CellType.MIXED);
			cell._calculatedValue = cell._rawValue + "c";			
			doh.isNot(mHelper.toCellJSON(cell, params1), mHelper.toCellJSON(cell, params2));
			
			cell = row.getCell(4,row._doc.CellType.MIXED);
			cell._calculatedValue = cell._rawValue + "c";
			doh.isNot(mHelper.toCellJSON(cell, params1), mHelper.toCellJSON(cell, params2));

			cell = row.getCell(6,row._doc.CellType.MIXED);
			cell._calculatedValue = cell._rawValue + "c";
			doh.is(mHelper.toCellJSON(cell, params1), mHelper.toCellJSON(cell, params2));
		});	
	});	
});
