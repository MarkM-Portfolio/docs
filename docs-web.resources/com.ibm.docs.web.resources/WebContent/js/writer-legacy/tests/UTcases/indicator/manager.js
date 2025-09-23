dojo.provide("writer.tests.UTcases.indicator.manager");
dojo.require("writer.controller.IndicatorManager");

describe("writer.tests.UTcases.indicator.manager", function() {
	
	pe.scene = {
			addResizeListener:function(){},
			isIndicatorAuthor : function(){return true},
			getUsersColorStatus : function(){return true}
	}
	
	var loadTestData = function(){
		
		var jsonData = [{"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]}];
		
		pe.lotusEditor.relations = new writer.model.Relations({});
		pe.lotusEditor.number = new writer.model.Numbering({});
		pe.lotusEditor.styles = new writer.model.style.Styles({});
		pe.lotusEditor.styles.createCSSStyle();
		pe.lotusEditor.setting = new writer.model.Settings({});
		pe.lotusEditor.relations.loadContent();
		pe.lotusEditor.document = new writer.model.Document(jsonData, pe.lotusEditor.layoutEngine);
		
		return pe.lotusEditor.document;
	};
	
	beforeEach(function() {
		loadTestData();
	});
	
	afterEach(function() {
		
	});
	
	it("indicator manager", function(){
		
		var mgr = new writer.controller.IndicatorManager();
		var user1 = {id:"1", getId: function(){return "1"}};
		var range = {
			startParaId : "id_001",
			endParaId: "id_001",
			startParaIndex: 1,
			endParaIndex: 2
		}
		
		mgr.updateUserSelections("1", WRITER.MSGCATEGORY.Content, true, [range])
		var orphan = mgr.userSelections["1"].orphan;
		expect(orphan).toEqual(true)
		mgr.updateUserSelections("1", WRITER.MSGCATEGORY.Content, false, [range]);
		var orphan = mgr.userSelections["1"].orphan;
		expect(orphan).toEqual(false);
		
		mgr.drawUserSelectionsDelayed();
		mgr.drawUserSelections();
		
		mgr.clearUserSelections();
		expect(mgr.userSelections.length).toEqual(0);
		mgr.drawUserSelections();
	});
	
});