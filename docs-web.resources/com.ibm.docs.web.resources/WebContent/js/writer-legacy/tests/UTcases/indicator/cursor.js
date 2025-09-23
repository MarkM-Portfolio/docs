dojo.provide("writer.tests.UTcases.indicator.cursor");
dojo.require("writer.controller.Cursor");
describe("writer.tests.UTcases.indicator.cursor", function() {
	
	pe.scene = {
			addResizeListener:function(){},
			isIndicatorAuthor : function(){return true},
			getUsersColorStatus : function(){return true}
	}
	
	concord.util.user.getUserFullName = function(){
		return "aaa"
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
	
	it("cursor init", function(){
		
		var shell = {};
		var shellDom = dojo.create("div", {}, dojo.body());
		shell.domNode = function(){
			return shellDom;
		}
		var cursor = new writer.controller.Cursor({
			userId: "xx",
			color: "#303030",
			blinkable: false,
			shell: shell
		});
		
		expect(cursor._blinkable).toEqual(false);
		expect(cursor._userId).toEqual("xx");
		
		cursor.show();
		expect(dojo.style(cursor._domNode, "display")).toEqual("block");
		expect(dojo.style(cursor._domNode, "visibility")).toEqual("visible");
		
		cursor.hide();
		expect(dojo.style(cursor._domNode, "visibility")).toEqual("hidden");
	});
	
	it("cursor co-editor-indicator", function(){
		var shell = {};
		var shellDom = dojo.create("div", {id: "editor"}, dojo.body());
		shell.domNode = function(){
			return shellDom;
		}
		var cursor = new writer.controller.Cursor({
			userId: "xx",
			color: "#303030",
			blinkable: false,
			shell: shell
		});
		
		cursor.hide();
		
		cursor.showCoEditIndicator();
		expect(cursor.coEditIndicator == null).toEqual(true);
		
		cursor.show();
		
		cursor.showCoEditIndicator();
		expect(cursor.coEditIndicator == null).toEqual(false);
		expect(cursor.coEditIndicator.domNode.parentNode).toEqual(shellDom);
		
		cursor.posCoEditIndicator();
		cursor.detachCoEditIndicator()
		expect(cursor.coEditIndicatorAnim == null).toEqual(true);
		expect(cursor.coEditIndicator).toEqual(null);
		
		cursor.showCoEditIndicator();
		cursor.detachCoEditIndicator(true);
		expect(cursor.coEditIndicator == null).toEqual(false);
		expect(cursor.coEditIndicatorAnim == null).toEqual(false);
		
		cursor.destroy();
		expect(cursor.coEditIndicator == null).toEqual(true);
		expect(cursor.coEditIndicatorAnim == null).toEqual(true);
	});
	
});