dojo.provide("writer.tests.UTcases.list.setStartNumber");

describe("writer.tests.UTcases.list.setStartNumber", function() {
	
	var loadTestData = function(){
		var jsonData = {"body":[{"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]}]};
		
		pe.lotusEditor.relations = new writer.model.Relations({});
		pe.lotusEditor.number = new writer.model.Numbering({});
		pe.lotusEditor.styles = new writer.model.style.Styles({});
		pe.lotusEditor.styles.createCSSStyle();
		pe.lotusEditor.setting = new writer.model.Settings({});
		pe.lotusEditor.relations.loadContent();
		pe.lotusEditor.document = new writer.model.Document(jsonData, pe.lotusEditor.layoutEngine);
		
		return pe.lotusEditor.document;
	};
	
	it("Set list start number for first level list item", function() {
		
		var doc = loadTestData();
		
		var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
		var paraObj = new writer.model.Paragraph( paraData, {}, true );
		var oldTxt = paraObj.text;
		paraObj.insertText("123", 0);
		var newTxt = paraObj.text;
		
		expect("123"+oldTxt).toEqual(newTxt);
	});
	
});
