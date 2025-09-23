dojo.provide("writer.tests.UTcases.paragraph.text");

describe("writer.tests.UTcases.paragraph.text", function() {
	
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
	
	beforeEach(function() {
		loadTestData();
	});
	
	afterEach(function() {
		
	});
	
	it("Insert text at the begining of paragraph", function() {
		
		var doc = loadTestData();
		
		var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
		var paraObj = new writer.model.Paragraph( paraData, {}, true );
		var oldTxt = paraObj.text;
		paraObj.insertText("123", 0);
		var newTxt = paraObj.text;
		
		expect("123"+oldTxt).toEqual(newTxt);
	});
	
	it("Insert text at the middle of paragraph", function() {
		
		var doc = loadTestData();
		
		var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
		var paraObj = new writer.model.Paragraph( paraData, {}, true );
		var oldTxt = paraObj.text;
		paraObj.insertText("123", 2);
		var newTxt = paraObj.text;
		
		expect("he123llo").toEqual(newTxt);
	});

	it("Insert text at the end of paragraph", function() {
		
		var doc = loadTestData();
		
		var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
		var paraObj = new writer.model.Paragraph( paraData, {}, true );
		var oldTxt = paraObj.text;
		paraObj.insertText("123", 5);
		var newTxt = paraObj.text;
		
		expect(oldTxt + "123").toEqual(newTxt);
	});
	
	it("Delete text at the begining of paragraph", function() {
		
		var doc = loadTestData();
		var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
		var paraObj = new writer.model.Paragraph( paraData, {}, true );
		var oldTxt = paraObj.text;
		paraObj.deleteText(0, 3);
		var newTxt = paraObj.text;
		expect("hel"+newTxt).toEqual(oldTxt);
	});
	
	it("Delete text at the middle of paragraph", function() {
		
		var doc = loadTestData();
		var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
		var paraObj = new writer.model.Paragraph( paraData, {}, true );
		var oldTxt = paraObj.text;
		paraObj.deleteText(3, 1);
		var newTxt = paraObj.text;
		expect(newTxt).toEqual("helo");
	});
	
	it("Delete text at the end of paragraph", function() {
		
		var doc = loadTestData();
		var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
		var paraObj = new writer.model.Paragraph( paraData, {}, true );
		var oldTxt = paraObj.text;
		paraObj.deleteText(4, 1);
		var newTxt = paraObj.text;
		expect(newTxt).toEqual("hell");
	});
});
