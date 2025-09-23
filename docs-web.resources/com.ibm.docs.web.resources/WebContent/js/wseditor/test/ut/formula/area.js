dojo.provide("websheet.test.ut.formula.area");
/**
 * UT suite, function for area, reference, name and undefined name
 */

describe("websheet.test.ut.formula.ut_area", function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	var area;
	
	beforeEach(function() {
		utils.bindDocument(_document);
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
		area = new websheet.parse.Area(parsedRef, "img1", websheet.Constant.RangeUsage.IMAGE);
	});
	
	afterEach(function() {
		area = null; 
		utils.unbindDocument();
		
	});
	
	it("create an area with rangeInfo !A1:B2", function(){
		
		expect(area.getStartRow()).toBe(1);
		expect(area.getEndRow()).toBe(2);
		expect(area.getStartCol()).toBe(1);
		expect(area.getEndCol()).toBe(2);
		expect(area.getId()).toBe("img1");
		expect(area.getUsage()).toBe(websheet.Constant.RangeUsage.IMAGE);
		var rangeInfo = area._getRangeInfo();
		expect(rangeInfo.sheetName).toBe("Sheet1");
		expect(area.getType()).toBe(websheet.Constant.RangeType.RANGE);
		expect(area.isValid()).toBe(true);
	});
	
	it("set area invalid sheet name", function(){
		area.setInvalidSheetName();
		expect(area.isValid()).toBe(false);
		area.recoverSheetName("Sheet1");
		expect(area.isValid()).toBe(true);
	});
	
	it("update area", function(){
		var event = {_source:{}};
		
		var updateRange = {sheetName:"Sheet1",
				   startRow:2,
				   startCol: 1,
				   endRow : websheet.Constant.MaxRowNum,
				   endCol : websheet.Constant.MaxColumnIndex};
		//insert rows 2:4
		var positionChange = area.update(updateRange, 3, 0,event);
		expect(positionChange).toBe(true);
		expect(area.getStartRow()).toBe(1);
		expect(area.getEndRow()).toBe(5);
		expect(area.getStartCol()).toBe(1);
		expect(area.getEndCol()).toBe(2);
		expect(event._source.data.sizeChanged).toBe(true);
		expect(event._source.data.collectUndo).toBe(false);
		//insert rows 10:10
		updateRange.startRow = 10;
		positionChange = area.update(updateRange, 1, 0,event);
		expect(positionChange).toBe(false);
		expect(event._source.data.sizeChanged).toBe(false);
		expect(event._source.data.collectUndo).toBe(false);
		//delete rows 1:4
		updateRange.startRow = 5;
		positionChange = area.update(updateRange, -4, 0,event);
		expect(positionChange).toBe(true);
		expect(area.getStartRow()).toBe(1);
		expect(area.getEndRow()).toBe(1);
		expect(area.getStartCol()).toBe(1);
		expect(area.getEndCol()).toBe(2);
		expect(event._source.data.sizeChanged).toBe(true);
		expect(event._source.data.collectUndo).toBe(true);
	});
	
	it("create a reference with B:C", function(){
		var parsedRef = new websheet.parse.ParsedRef("Sheet1", -1,2,-1,3, websheet.Constant.DEFAULT_COLS_MASK);
		var reference = new websheet.parse.Reference(parsedRef);
		expect(reference.getStartRow()).toBe(1);
		expect(reference.getEndRow()).toBe(websheet.Constant.MaxRowNum);
		expect(reference.getStartCol()).toBe(2);
		expect(reference.getEndCol()).toBe(3);
		expect(reference.getUsage()).toBe(websheet.Constant.RangeUsage.REFERENCE);
		var containRefId = (reference.getId().indexOf("rf") == 0);
		expect(containRefId).toBe(true);
		var event = {_source:{}};
		// delete rows 2:4
		var updateRange = {sheetName:"Sheet1",
				   startRow: 5,
				   startCol: 1,
				   endRow : websheet.Constant.MaxRowNum,
				   endCol : websheet.Constant.MaxColumnIndex};
		var positionChange = reference.update(updateRange, -3, 0,event);
		expect(positionChange).toBe(false);
		expect(event._source.data.sizeChanged).toBe(true);
		expect(event._source.data.collectUndo).toBe(false);
		expect(reference.getStartRow()).toBe(1);
		expect(reference.getEndRow()).toBe(websheet.Constant.MaxRowNum);
		expect(reference.getStartCol()).toBe(2);
		expect(reference.getEndCol()).toBe(3);
		//delete cols A:F
		updateRange = {sheetName:"Sheet1",
				   startRow: 1,
				   startCol: 7,
				   endRow : websheet.Constant.MaxRowNum,
				   endCol : websheet.Constant.MaxColumnIndex};
		positionChange = reference.update(updateRange, 0, -6,event);
		expect(positionChange).toBe(true);
		expect(event._source.data.sizeChanged).toBe(true);
		expect(event._source.data.collectUndo).toBe(true);
		expect(reference.getStartRow()).toBe(1);
		expect(reference.getEndRow()).toBe(websheet.Constant.MaxRowNum);
		expect(reference.getStartCol()).toBe(-1);
		expect(reference.getEndCol()).toBe(-1);
		expect(reference.isValid()).toBe(false);
	});
	
	it("create a name range with Sheet1!$3:$4", function(){
		var parsedRef = websheet.Helper.parseRef("Sheet1!$3:$4");
		var nameArea = new websheet.parse.NameArea(parsedRef, "Abc");
		expect(nameArea.getId()).toBe("Abc");
		expect(nameArea.getUsage()).toBe(websheet.Constant.RangeUsage.NAME);
		expect(nameArea.getMask()).toBe(parsedRef.refMask);
		expect(nameArea.getType()).toBe(websheet.Constant.RangeType.ROW);
		
	});
	
	it("create an undefined name", function(){
		var uname = new websheet.parse.UndefinedNameArea("undefinedName");
		expect(uname.getId()).toBe("undefinedName");
	});
});
