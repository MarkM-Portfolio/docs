dojo.provide("websheet.test.ut.rulesObj.conditionalFvos");

/**
 * UT suite, function for rulesObj.
 */

describe("websheet.test.ut.rulesObj.ut_conditionalFvos", function() {
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	beforeEach(function() {
		utils.bindDocument(_document);
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	it("constructor", function() {
		var cc = new websheet.model.RulesObject.ConditionalFvos("", {"type":"min"});
		expect(cc._type).toEqual(0);
		
		var cc = new websheet.model.RulesObject.ConditionalFvos("E1", {"type":"element", val: "E1"});
		expect(cc._type).toEqual(6);
	});
	
	it("compare", function() {
		
	});

	it("getType", function() {
		var cc = new websheet.model.RulesObject.ConditionalFvos("E1", {"type":"element", val: "E1"});
		expect(cc.getType()).toEqual("element");
	});
});