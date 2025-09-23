dojo.provide("websheet.test.ut.test_helpers");

/**
 * Suite for SetRangeHelper
 */

describe("websheet.test.ut.helpers.test_setHelper", function() {
	var colMerger = new websheet.model.ColumnMerger({bReplace:true,bColumn:true});
	var _document = new websheet.model.Document();
	var styleManager = _document._styleManager;
	var sidUl;
	websheet.Constant.init();
	
	beforeEach(function() {
		var code = {};
		code[websheet.Constant.Style.PROTECTION_UNLOCKED] = true;
		sidUl = styleManager.addStyle(code);
		utils.bindDocument(_document);
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});

	it("Protection, SetRangeHelper, createModel", function() {
		var sheet = builders.sheet(_document, "sheet", "protected").done();

		var code = {};
		code[websheet.Constant.Style.BACKGROUND_COLOR] = "#ff0000";
		var event = {style:code, index : 1};
		colMerger.setStartIndex(1);
		colMerger.setEndIndex(1);
		colMerger.setSheet(sheet);
		colMerger.setEventList(event); 		
		
		colMerger.createModel(event, 0);
		var col = sheet._columns[0];
		var style = _document._styleManager.getStyleById(col.getStyleId());
		doh.is(false, !styleManager.getAttr(style,websheet.Constant.Style.PROTECTION_UNLOCKED));
		doh.is({style:code, index : 1}, event);
	});	
	it("Protection, SetRangeHelper, changeModel", function() {
		var sheet = builders.sheet(_document,"protected").columnMeta(1,[1,sidUl]).done();
		
		var code = {};
		code[websheet.Constant.Style.BACKGROUND_COLOR] = "#ff0000";
		var event = {style:code, index : 1};
		colMerger.setStartIndex(1);
		colMerger.setEndIndex(1);
		colMerger.setSheet(sheet);
		colMerger.setEventList(event); 		
		colMerger.currentColumn = sheet._columns[0];
		colMerger.modelColumns = sheet._columns;
		
		colMerger.changeModel(event);		
		
		var col = sheet._columns[0];
		var style = _document._styleManager.getStyleById(col.getStyleId());
		doh.is(false, !styleManager.getAttr(style,websheet.Constant.Style.PROTECTION_UNLOCKED));
		doh.is({style:code, index : 1}, event);
	});	
	
	xit("Protection, SetRangeHelper, createModel", function() {
		var sheet = proModelBuilder.buildSheet(_document);

		var rangeJson = {columns:{A : {style:{background_color:"#ff0000"}}}, rows:{3:{cells:{C:{value : 2}}}}};
		sheet.setRange(1, 1048576, 1, 1, rangeJson, {forColumn : true, forReplace: true});
		var col = sheet._columns[0];
		var style = _document._styleManager.getStyleById(col.getStyleId());
		doh.is(false, style.isLocked());
		doh.is({columns:{A : {style:{background_color:"#ff0000"}}}, rows:{3:{cells:{C:{value : 2}}}}}, rangeJson);
	});
	
	xit("Protection, SetRangeHelper, changeModel", function() {
		var sheet = proModelBuilder.buildSheet(_document, 1, [code.m, code.ul]);

		var rangeJson = {columns:{A : {style:{background_color:"#ff0000"}}}, rows:{3:{cells:{C:{value : 2}}}}};
		sheet.setRange(1, 1048576, 1, 1, rangeJson, {forColumn : true, forReplace: true});
		var col = sheet._columns[0];
		var style = _document._styleManager.getStyleById(col.getStyleId());
		doh.is(false, style.isLocked());
		doh.is({columns:{A : {style:{background_color:"#ff0000"}}}, rows:{3:{cells:{C:{value : 2}}}}}, rangeJson);
	});	
});
