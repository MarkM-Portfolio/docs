dojo.provide("websheet.test.ut.styles.CFStyleManager");

/**
 * UT suite, function for CFStyleManager.
 */

describe("websheet.test.ut.styles.ut_CFStyleManager", function() {
	var _document = new websheet.model.Document();
	var styleManager = _document._styleManager;
	websheet.Constant.init();
	
	var ce1 = builders.style().bgColor("black").putInto(styleManager);
	var ce2 = builders.style().bgColor("red").putInto(styleManager);
	var ce3 = builders.style().bgColor("blue").putInto(styleManager);
	
	var csid = builders.style().bgColor("white").putInto(styleManager); //ce4
	var cfStyles1 = [{p: 3, s: ce1}, {p: 2, s: ce2}, {p: 1, s: ce3}];
	var cfStyles2 = [{p: 3, s: ce1, c: "yellow"}, {p: 2, s: ce2}, {p: 1, s: ce3}];
	var cfStyles3 = [{p: 2, s: ce1}, {p: 2, s: ce2}, {p: 2, s: ce3}];
	var cfStyles4 = [{p: 2, s: ce1}, {p: 2, s: ce2}, {p: 2, s: ce2, c: "red"}];
	var cfStyles5 = [{p: 2, s: ce1}, {p: 2, s: ce2, c: "yellow"}, {p: 2, s: ce2, c: "red"}];
	
	var ranges = [{_parsedRef: {startRow: 1, endRow: 3, startCol: 1, endCol: 1}},
	              {_parsedRef: {startRow: 1, endRow: 3, startCol: 1, endCol: 1}},
	              {_parsedRef: {startRow: 1, endRow: 3, startCol: 1, endCol: 1}}];
	ranges.forEach(function(el) {
		el.result = [];
		el.result[0] = [];
	});
	ranges[0].result[0][0] = cfStyles1;
	ranges[1].result[0][0] = cfStyles2;
	ranges[2].result[0][0] = cfStyles5;
	
	beforeEach(function() {
		utils.bindDocument(_document);		
	});
	
	afterEach(function() {
		utils.unbindDocument(_document);
	});
	
	it("generateID", function() {
		var cfStyleMgr = websheet.style.CFStyleManager(styleManager);
		var id1 = cfStyleMgr.generateID(csid, cfStyles1);
		var id2 = cfStyleMgr.generateID(csid, cfStyles2);
		var id3 = cfStyleMgr.generateID(csid, cfStyles3);
		var id4 = cfStyleMgr.generateID(csid, cfStyles4);
		var id5 = cfStyleMgr.generateID(csid, cfStyles5);
		expect(id1).toBe("ce4-1-ce3--2-ce2--3-ce1");		
		expect(id2).toBe("ce4-1-ce3--2-ce2--3-ce1-yellow");
		expect(id3).toBe("ce4-2-ce1--2-ce2--2-ce3");
		expect(id4).toBe("ce4-2-ce1--2-ce2-red--2-ce2");
		expect(id5).toBe("ce4-2-ce1--2-ce2-red--2-ce2-yellow");
	});

	it("generateStyle", function() {
		var cfStyleMgr = websheet.style.CFStyleManager(styleManager);
		var s11 = cfStyleMgr.generateStyle(csid, ranges, 1, 1);
		var s12 = cfStyleMgr.generateStyle(csid, ranges, 1, 2);
		var s13 = cfStyleMgr.generateStyle(csid, ranges, 1, 3);
		expect(s11==null).toBe(false);
		expect(s12==null).toBe(true);
		expect(s13==null).toBe(true);
		
		var style1 = styleManager.getStyleById(s11);

		var attr = style1.getAttr(websheet.Constant.Style.BACKGROUND_COLOR);
		expect(attr).toBe("red");
	});
});