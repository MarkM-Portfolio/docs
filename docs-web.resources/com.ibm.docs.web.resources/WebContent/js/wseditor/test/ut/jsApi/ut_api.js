dojo.provide("websheet.test.ut.jsApi.ut_api");

describe("Ut for js api", function() {
	websheet.Constant.init();
	pe.lotusEditor = websheet.Main;
	
	var _document = new websheet.model.Document();
	var _sheet;
	beforeEach(function() {
		_sheet =_document._createSheet("Sheet1", "os1", 1);	
		utils.bindDocument(_document);
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
//	it("execCommand", function(){
//		websheet.api.execCommand("bold", []);
//	});
	
	it("notify", function() {
		websheet.api.notify("event1","text");
		expect('error').toBe('error');
	});
	
	it("getSelectedTextInScope", function() {
		websheet.api.getSelectedTextInScope();
		websheet.api.getSelectedTextInScope("cell");
		//expect(str.detail).toBe("");
		
		builders.sheet(_sheet).row(1, [
				                          [1, , websheet.Constant.ValueCellType.BOOLEAN << 3]
			                            ]).done();
		var str = websheet.api.getSelectedTextInScope("cell");
		expect(str.detail).toBe("TRUE");
	});
	
	it("selectTextInScope", function() {
		websheet.api.selectTextInScope();
		websheet.api.selectTextInScope("cell");
		websheet.api.selectTextInScope("cell", "nextSibling");
		builders.sheet(_sheet).row(1, [
				                          [1]
			                            ]).done();
		var str = websheet.api.selectTextInScope("cell", "self");
		expect(str.status).toBe('success');
		
		var str = websheet.api.selectTextInScope("cell", "nextSibling");
		expect(str.status).toBe('error');
		
		builders.sheet(_sheet).row(2, []).done();
		builders.sheet(_sheet).row(3, [
				                          ["abc"]
			                            ]).done();
		var str = websheet.api.selectTextInScope("cell", "nextSibling");
		expect(str.status).toBe('success');
	});
	
	it("setTextInScope", function() {
		websheet.api.setTextInScope("abc");
		websheet.api.setTextInScope(null, "cell");
		websheet.api.setTextInScope(["abc"], "cell");
		builders.sheet(_sheet).row(1, [
				                          [1, , websheet.Constant.ValueCellType.BOOLEAN << 3]
			                            ]).done();
		var str = websheet.api.setTextInScope("abc", "cell");
		expect(str.status).toBe('success');
	});
});