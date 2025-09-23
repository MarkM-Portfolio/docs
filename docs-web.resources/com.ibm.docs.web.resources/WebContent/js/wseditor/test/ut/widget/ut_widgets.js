dojo.provide("websheet.tests.ut.model.ut_multiple_column_sort");

dojo.require("websheet.dialog.sortRange");

describe("websheet.tests.ut.widget.ut_widgets", function()
{
	dojo.setObject("contextPath", "/docs");
	dojo.setObject("window.staticRootPath", "/static");

	var _document = new websheet.model.Document();
	_document._createSheet("Sheet1", "os1", 1);
	websheet.Constant.init();
	
	beforeEach(function() {
		utils.bindDocument(_document);
	});
	
	afterEach(function() {
	});
	
	it("sort dialog", function() {
		// moke data
		dojo.setObject("websheet.Main.scene", {nls:{}});
		// end moke data
		var sortDialog = new websheet.dialog.sortRange(websheet.Main, "Sort");
		sortDialog.reset();
		sortDialog.updateOptionsForAllRules();
		sortDialog.onOk(websheet.Main);
	});
});