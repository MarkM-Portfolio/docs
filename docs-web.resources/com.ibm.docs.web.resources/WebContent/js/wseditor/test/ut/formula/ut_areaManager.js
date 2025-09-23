dojo.provide("websheet.tests.ut.formula.ut_areaManager");
/**
 * UT suite, function for areaManager to store,remove area, every event notification
 */

describe("websheet.test.ut.formula.ut_areaManager", function() {
	
	var broadcaster = new websheet.listener.BroadCaster();
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var areaMgr = null;
	
	beforeEach(function() {
		utils.bindDocument(_document);
		areaMgr = _document.getAreaManager(broadcaster);
		areaMgr.maxSheetRows = 20;
		areaMgr.maxSheetCols = 10;
		var rowPerPage = 3;
		var colPerPage = 2;
		areaMgr.constructor.prototype.ROW_PER_PAGE = 3;
		areaMgr.constructor.prototype.COL_PER_PAGE = 2;
		areaMgr.ROWS_PAGE_SIZE = Math.floor((areaMgr.maxSheetRows - 1) / areaMgr.ROW_PER_PAGE) + 1;
		areaMgr.COLS_PAGE_SIZE = Math.floor((areaMgr.maxSheetCols - 1) / areaMgr.COL_PER_PAGE) + 1;
		
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("getSharedRefs4DeleteUndo", function() {
		var ret = areaMgr.getSharedRefs4DeleteUndo();
		doh.is(true, dojo.isObject(ret),"");
	});
	
	it("addSharedRef4DeleteUndo", function() {
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		var sRef = new websheet.parse.SharedFormulaRefBase(parsedRef, "sr1");
		areaMgr.addSharedRef4DeleteUndo(sRef);
		var ret = areaMgr.getSharedRefs4DeleteUndo();
		doh.is(1, Object.keys(ret).length,"");
	});
	
	it("start listen to existing reference", function(){
		var cell = _document.getOrCreateValueCell("Sheet1",1,1,"abc", true );
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,2,4,4,websheet.Constant.RANGE_MASK);
		var ref = areaMgr.startListeningArea(parsedRef, cell);
		expect(ref.getStartRow()).toBe(1);
		expect(ref.getEndRow()).toBe(4);
		expect(ref.getStartCol()).toBe(2);
		expect(ref.getEndCol()).toBe(4);
		expect(ref.getUsage()).toBe(websheet.Constant.RangeUsage.REFERENCE);
		expect(ref instanceof websheet.parse.Reference).toBe(true);
		expect(ref.getAllListener().length).toBe(1);
		var ref2 = areaMgr.startListeningArea(parsedRef, cell);
		expect(ref == ref2).toBe(true);
		expect(ref.getAllListener().length).toBe(2);
		areaMgr.endListeningArea(ref, cell);
		expect(ref.getAllListener().length).toBe(1);
		// make sure ref is still in areaManager
		var ref3 = areaMgr.getReference(parsedRef);
		expect(ref3 == ref).toBe(true);
		areaMgr.endListeningArea(ref, cell);
		ref3 = areaMgr.getReference(parsedRef);
		expect(ref3 == null).toBe(true);
	});
	
	it("test unname range", function() {
		//{"w":1024,"h":768,"x":0,"y":0,"ex":64,"ey":3,"z":1,"pt":"relative","href":"Pictures/1404554676596.jpg"});
		// insert img1, img2
		formulaTestHelper.broadcastInsertRange(broadcaster, "img1", "Sheet1!B4:D8", websheet.Constant.RangeUsage.IMAGE);
		var imageArea1 = areaMgr.getRangeByUsage("img1", websheet.Constant.RangeUsage.IMAGE);
		
		formulaTestHelper.broadcastInsertRange(broadcaster, "img2", "Sheet1!B4:D8", websheet.Constant.RangeUsage.IMAGE);
		var imageArea2 = areaMgr.getRangeByUsage("img2", websheet.Constant.RangeUsage.IMAGE);
		
		expect(imageArea1 == imageArea2).toBe(false);
		expect(imageArea1.compare(imageArea2.getParsedRef())).toBe(websheet.Constant.AreaRelation.EQUAL);
		
		//update img1
		formulaTestHelper.broadcastUpdateRange(broadcaster, "img1", "Sheet3!C9:D9", websheet.Constant.RangeUsage.IMAGE);
		expect(areaMgr.consistencyCheck()).toBe(true);
		
		expect(imageArea1.getStartRow()).toBe(9);
		expect(imageArea1.getEndRow()).toBe(9);
		expect(imageArea1.getStartCol()).toBe(3);
		expect(imageArea1.getEndCol()).toBe(4);
		expect(imageArea1.getUsage()).toBe(websheet.Constant.RangeUsage.IMAGE);
		
		expect(imageArea2.getStartRow()).toBe(4);
		expect(imageArea2.getEndRow()).toBe(8);
		expect(imageArea2.getStartCol()).toBe(2);
		expect(imageArea2.getEndCol()).toBe(4);
		expect(imageArea2.getUsage()).toBe(websheet.Constant.RangeUsage.IMAGE);
		
		//delete img1
		formulaTestHelper.broadcastDeleteRange(broadcaster, "img1",websheet.Constant.RangeUsage.IMAGE);
		imageArea1 = areaMgr.getRangeByUsage("img1", websheet.Constant.RangeUsage.IMAGE);
		expect(imageArea1).toBe(null);
		expect(areaMgr.areaConsistencyCheck(imageArea2.getParsedRef(),imageArea2, true)).toBe(true);
	});

	it("test name range", function() {
		formulaTestHelper.broadcastInsertRange(broadcaster, "Abc", "'1A'!P129:Z512", websheet.Constant.RangeUsage.NAME);
		var nameArea = areaMgr.getRangeByUsage("Abc", websheet.Constant.RangeUsage.NAME);
		expect(nameArea instanceof websheet.parse.NameArea).toBe(true);
		
		formulaTestHelper.broadcastInsertRange(broadcaster, "C_L", "Sheet3!$B:$B", websheet.Constant.RangeUsage.NAME);
		var colNameArea = areaMgr.getRangeByUsage("C_L", websheet.Constant.RangeUsage.NAME);
		expect(colNameArea instanceof websheet.parse.NameArea).toBe(true);
		
		expect(colNameArea.getType() == websheet.Constant.RangeType.COLUMN).toBe(true);
		// they have different type
		expect(colNameArea.compare(websheet.Helper.parseRef("Sheet3!B1:B1048576"))).toBe(websheet.Constant.AreaRelation.GREATER);
		expect(areaMgr.areaConsistencyCheck(colNameArea.getParsedRef(),colNameArea, true)).toBe(true);
		
		formulaTestHelper.broadcastInsertRange(broadcaster, "Name2", "'1A'!P129:Z512", websheet.Constant.RangeUsage.NAME);
		var nameArea2 = areaMgr.getRangeByUsage("Name2", websheet.Constant.RangeUsage.NAME);
		expect(nameArea == nameArea2).toBe(false);
		expect(nameArea2.compare(nameArea.getParsedRef())).toBe(websheet.Constant.AreaRelation.EQUAL);
		
		// delete name "Abc", it does not exist in areaManager anymore
		formulaTestHelper.broadcastDeleteRange(broadcaster, "abc",websheet.Constant.RangeUsage.NAME);
		expect(areaMgr.areaConsistencyCheck(nameArea.getParsedRef(),nameArea, false)).toBe(true);
		
		expect(areaMgr.consistencyCheck()).toBe(true);
	});
	
	it("test reference", function(){
		var range1 = websheet.Helper.parseRef("'1A'!B4:D8");
		
		formulaTestHelper.broadcastInsertRange(broadcaster, "Name", "'1A'!B4:D8", websheet.Constant.RangeUsage.NAME);
		var nameRef = areaMgr.getRangeByUsage("name", websheet.Constant.RangeUsage.NAME);
		//start listen range1
		var cell = _document.getOrCreateValueCell("Sheet1",1,1,"=name", true );
		var ref1 = areaMgr.startListeningArea(range1, cell);
		expect(ref1 instanceof websheet.parse.Reference).toBe(true);
		
		expect(ref1 == nameRef).toBe(false);
		expect(ref1.getUsage()).toBe(websheet.Constant.RangeUsage.REFERENCE);
		expect(ref1.hasListener(cell)).toBe(true);
		expect(ref1.getAllListener().length).toBe(1);
		
		var range2 = websheet.Helper.parseRef("$B$4:$D$8");
		range2.setSheetName("1A");
		
		var cell2 = _document.getOrCreateValueCell("Sheet1",1,1,"test", true );
		var ref2 = areaMgr.startListeningArea(range2, cell2);
		expect(ref1 == ref2).toBe(true);
		
		var nameArea = areaMgr.startListeningNameArea("name", cell);
		expect(nameRef == nameArea).toBe(true);
		expect(nameRef.hasListener(cell)).toBe(true);
		
		//end listen
		var bEnd = areaMgr.endListeningArea(ref1, cell);
		expect(bEnd && !ref1.hasListener(cell)).toBe(true);
		expect(ref1.hasListener(cell2)).toBe(true);
		expect(areaMgr.areaConsistencyCheck(ref1.getParsedRef(),ref1, true)).toBe(true);
		
		bEnd = areaMgr.endListeningArea(ref2, cell2);
		expect(bEnd && !ref2.hasListener()).toBe(true);
		// do not exist because reference do not have any listener
		expect(areaMgr.areaConsistencyCheck(ref1.getParsedRef(),ref1, false)).toBe(true);
		
		//end listening name area, even it has no listener anymore, it can not be removed from areaManager
		areaMgr.endListeningNameArea("name",cell);
		expect(nameRef.hasListener()).toBe(false);
		expect(areaMgr.areaConsistencyCheck(nameRef.getParsedRef(),nameRef, true)).toBe(true);
		
		nameRef = areaMgr.getRangeByUsage("name", websheet.Constant.RangeUsage.NAME);
		expect(nameRef != null).toBe(true);
		expect(areaMgr.consistencyCheck()).toBe(true);
		
	});
	
	it("test undefined name range", function(){
		var cell = _document.getOrCreateValueCell("Sheet1",1,1,"=n", true );
		var unameArea = areaMgr.startListeningNameArea("N", cell);
		expect(unameArea instanceof websheet.parse.UndefinedNameArea).toBe(true);
		expect(unameArea.getId()).toBe("N");
		expect(unameArea == areaMgr.undefinedNameAreas["n"]).toBe(true);
		
		formulaTestHelper.broadcastInsertRange(broadcaster, "N", "'1A'!B4:D8", websheet.Constant.RangeUsage.NAME);
		var nameRef = areaMgr.getRangeByUsage("n", websheet.Constant.RangeUsage.NAME);
		expect(areaMgr.undefinedNameAreas["n"] == null).toBe(true);
		expect(unameArea.hasListener()).toBe(false);
		expect(nameRef.hasListener(cell)).toBe(true);
		
		formulaTestHelper.broadcastDeleteRange(broadcaster, "n",websheet.Constant.RangeUsage.NAME);
		nameRef = areaMgr.getRangeByUsage("n", websheet.Constant.RangeUsage.NAME);
		expect(nameRef == null).toBe(true);
		unameArea = areaMgr.undefinedNameAreas["n"];
		expect(unameArea.hasListener(cell)).toBe(true);
	});
	
	it("test rename sheet event for 3D reference", function(){
		_document._createSheet("Sheet1");
		_document._createSheet("Sheet2");
		_document._createSheet("Sheet3");
		var formula = "=SUM(Sheet1:Sheet2!3:10,Sheet2:Sheet3!$A1:$B200,Sheet1:Sheet3!F:H)";
		var cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		var parser = new websheet.parse.FormulaParser();
		var result = parser.parseFormula(formula, cell);
		var tokenArray = cell._tokenArray;
		var parsedRef1 = websheet.Helper.parseRef("Sheet1:Sheet2!3:10");
		var r1 = areaMgr.startListeningArea(parsedRef1);
		expect(r1==cell._tokenArray[0].getValue()).toBe(true);
		var r2 = areaMgr.startListeningArea(websheet.Helper.parseRef("Sheet2!$A1:$B200"));
		expect(r2==cell._tokenArray[1].getValue()).toBe(false);
		
		//rename sheet
		formulaTestHelper.broadcastRenameSheet(broadcaster, "Sheet1", "Sheet 1");
		expect(cell._tokenArray[0].getAddress()).toBe("'Sheet 1:Sheet2'!3:10");
		expect(cell._tokenArray[1].getAddress()).toBe("Sheet2:Sheet3!$A1:$B200");
		expect(cell._tokenArray[2].getAddress()).toBe("'Sheet 1:Sheet3'!F:H");
	});
//	
	it("test row event for 3D reference", function(){
		_document._createSheet("Sheet1");
		_document._createSheet("Sheet2");
		_document._createSheet("Sheet3");
		var formula = "=SUM(Sheet1:Sheet2!3:10,Sheet2:Sheet3!$A1:$B200,Sheet1:Sheet3!F:H)";
		var cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		var parser = new websheet.parse.FormulaParser();
		var result = parser.parseFormula(formula, cell);
		// insert row
		formulaTestHelper.broadcastRowCol(broadcaster, "Sheet2!2:3", true, false);
		expect(cell._tokenArray[0].getAddress()).toBe("Sheet1:Sheet2!3:10");
		expect(cell._tokenArray[1].getAddress()).toBe("Sheet2:Sheet3!$A1:$B200");
		expect(cell._tokenArray[2].getAddress()).toBe("Sheet1:Sheet3!F:H");
	});
	
	it("test insert sheet event for 3D reference", function(){
		_document._createSheet("Sheet1");
		_document._createSheet("Sheet2");
		_document._createSheet("Sheet3");
		var formula = "=SUM(Sheet1:Sheet2!3:10,Sheet2:Sheet3!$A1:$B200,Sheet1:Sheet3!F:H)";
		var cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		var parser = new websheet.parse.FormulaParser();
		var result = parser.parseFormula(formula, cell);
		_document._createSheet("Sheet4", null, 2);
		formulaTestHelper.broadcastInsertSheet(broadcaster, "Sheet4", 2);
		expect(cell._tokenArray[0].isUpdate()).toBe(true);
		expect(cell._tokenArray[1].isUpdate()).toBe(false);
		expect(cell._tokenArray[2].isUpdate()).toBe(true);
	});
	
	it("test delete sheet event for 3D reference", function(){
		_document._createSheet("Sheet1");
		_document._createSheet("Sheet2");
		_document._createSheet("Sheet3");
		var formula = "=SUM(Sheet1:Sheet2!3:10,Sheet2:Sheet3!$A1:$B200,Sheet1:Sheet3!F:H)";
		var cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		var parser = new websheet.parse.FormulaParser();
		var result = parser.parseFormula(formula, cell);
		formulaTestHelper.broadcastDeleteSheet(broadcaster, "Sheet2","xxdfesdf23");
		expect(cell._tokenArray[0].getAddress()).toBe("Sheet1!3:10");
		expect(cell._tokenArray[1].getAddress()).toBe("Sheet3!$A1:$B200");
		expect(cell._tokenArray[2].getAddress()).toBe("Sheet1:Sheet3!F:H");
	});
	
	it("test move sheet event for 3D reference", function(){
		_document._createSheet("Sheet1");
		_document._createSheet("Sheet2");
		_document._createSheet("Sheet3");
		var formula = "=SUM(Sheet1:Sheet2!3:10,Sheet2:Sheet3!$A1:$B200,Sheet1:Sheet3!F:H)";
		var cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		var parser = new websheet.parse.FormulaParser();
		var result = parser.parseFormula(formula, cell);

		formulaTestHelper.broadcastMoveSheet(broadcaster, "Sheet2",1,2);
		expect(cell._tokenArray[0].getAddress()).toBe("Sheet2!3:10");
		expect(cell._tokenArray[1].getAddress()).toBe("Sheet2:Sheet3!$A1:$B200");
		expect(cell._tokenArray[2].getAddress()).toBe("Sheet1:Sheet3!F:H");
		
	});
	
	it("test row event",function(){
		var cell = _document.getOrCreateValueCell("Sheet1",1,1,"=Sheet1!$B$1:E10 + test", true );
		
		formulaTestHelper.broadcastInsertRange(broadcaster, "test", "Sheet1!B4:D$8", websheet.Constant.RangeUsage.NAME);
		var nameRef = areaMgr.getRangeByUsage("test", websheet.Constant.RangeUsage.NAME);
		
		cell.deserializeTokenArray([[1,16],[19,23]]);
		var token = cell._tokenArray[0];
		var nameToken = cell._tokenArray[1];
		
		var cell1 = _document.getOrCreateValueCell("Sheet1",2,2,"=A1", true );
		cell1.deserializeTokenArray([[1,3]]);
		var token1 = cell1._tokenArray[0];
		
		var cell2 = _document.getOrCreateValueCell("Sheet1",3,2,"=sum(D:D)", true);
		cell2.deserializeTokenArray([[5,8]]);
		var token2 = cell2._tokenArray[0];
		token2.setProp(websheet.Constant.RefType.IGNORESET);
		
		var cell3 = _document.getOrCreateValueCell("Sheet1",3,3,"=sum(unknown)", true);
		cell3.deserializeTokenArray([[5,12]]);
		var undefineNameToken = cell3._tokenArray[0];
		
		cell.setDirty(false);
		cell1.setDirty(false);
		cell2.setDirty(false);
		cell3.setDirty(false);
		
		formulaTestHelper.broadcastInsertRange(broadcaster, "unknown", "Sheet1!$1:$2", websheet.Constant.RangeUsage.NAME);
		expect(undefineNameToken.getTokenType()).toBe(websheet.parse.tokenType.NAME);
		expect(undefineNameToken.getValue() instanceof websheet.parse.NameArea).toBe(true);
		expect(cell3.isDirty()).toBe(true);
		expect(cell.isDirty()).toBe(true);//trackformula to cell
		expect(cell1.isDirty()).toBe(true);//trackformula to cell1, and track to cell3, then stop
		
		expect(cell2.isDirty()).toBe(false);
		
		//clear the cell and formula chain status
		cell1.setDirty(false);
		cell.setDirty(false);
		cell3.setDirty(false);
		areaMgr.clearTrackList(areaMgr.fCellHead, areaMgr.fCellLast);
		areaMgr.fCellHead = areaMgr.fCellLast = null;
		
		var cell4 = _document.getOrCreateValueCell("Sheet1",3,4,"=D1:D$1048574", true);
		cell4.deserializeTokenArray([[1,13]]);
		var token4 = cell4._tokenArray[0];
		
		// insert row 2:3
		formulaTestHelper.broadcastRowCol(broadcaster, "Sheet1!2:3", true, false);
		expect(token.getAddress()).toBe("Sheet1!$B$1:E12");
		expect(nameToken.getAddress()).toBe("Sheet1!B6:D$10");
		expect(token1.getAddress()).toBe("A1");
		expect(token2.getAddress()).toBe("D:D");
		expect(undefineNameToken.getAddress()).toBe("Sheet1!$1:$4");
		expect(token4.getAddress()).toBe("D1:D$1048576");
		expect(token2.getValue().compare(token4.getValue().getParsedRef())).toBe(websheet.Constant.AreaRelation.GREATER);
		
		expect(cell.isDirty()).toBe(true);
		expect(cell._bUpdateFormula).toBe(true);
		
		expect(cell1.isDirty()).toBe(true);//impacted by cell
		expect(!cell1._bUpdateFormula).toBe(true);
		
		expect(cell2.isDirty()).toBe(true);
		
		expect(cell3.isDirty()).toBe(true);
		
		expect(cell4.isDirty()).toBe(true);
		expect(cell4._bUpdateFormula).toBe(true);
		
		expect(areaMgr.consistencyCheck()).toBe(true);
		
		//delete row
		formulaTestHelper.broadcastRowCol(broadcaster, "Sheet1!6:15", true, true);
		expect(token.getAddress()).toBe("Sheet1!$B$1:E5");
		expect(nameToken.getAddress()).toBe("Sheet1!#REF!");
		expect(token1.getAddress()).toBe("A1");
		expect(token2.getAddress()).toBe("D:D");
		expect(undefineNameToken.getAddress()).toBe("Sheet1!$1:$4");
		expect(token4.getAddress()).toBe("D1:D$1048566");
		
		var undoCells = areaMgr.getCells4DeleteUndo();//contains cell
		expect(undoCells.length).toBe(1);
		for(var cellId in undoCells){
			var c = undoCells[cellId];
			expect(c._rawValue == "=Sheet1!$B$1:E12 + test");
		}
		var undoRanges = areaMgr.getRanges4DeleteUndo();//contains name
		var nameRanges = undoRanges[websheet.Constant.RangeUsage.NAME];
		var nameRange = nameRanges["test"];
		expect(nameRange.usage == websheet.Constant.RangeUsage.NAME).toBe(true);
		expect(websheet.Helper.compareRange(nameRange.parsedref, {sheetName:"Sheet1",startRow:6, endRow:10, startCol:2, endCol:4})).toBe(websheet.Constant.RangeRelation.EQUAL);
	});
});
