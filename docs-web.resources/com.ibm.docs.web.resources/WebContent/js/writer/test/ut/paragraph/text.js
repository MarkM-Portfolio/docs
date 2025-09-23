define([
	"writer/util/ModelTools",
    "writer/model/abstractNum",
	"writer/model/Document",
	"writer/model/Numbering",
	"writer/model/Paragraph",
	"writer/model/Relations",
	"writer/model/Settings",
	"writer/model/style/Styles"
], function (ModelTools, abstractNum, Document, Numbering, Paragraph, Relations, Settings, Styles) {

	describe("writer.test.ut.paragraph.text", function() {
		
		var loadTestData = function(){
			var jsonData = {"body":[{"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]}]};
			
			pe.lotusEditor.relations = new Relations({});
			pe.lotusEditor.number = new Numbering({});
			pe.lotusEditor.styles = new Styles({});
			pe.lotusEditor.styles.createCSSStyle();
			pe.lotusEditor.setting = new Settings({});
			pe.lotusEditor.relations.loadContent();
			pe.lotusEditor.document = new Document(jsonData, pe.lotusEditor.layoutEngine);
			
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
			var paraObj = new Paragraph( paraData, {}, true );
			var oldTxt = paraObj.text;
			paraObj.insertText("123", 0);
			var newTxt = paraObj.text;
			
			expect("123"+oldTxt).toEqual(newTxt);
		});
		
		it("Insert text at the middle of paragraph", function() {
			
			var doc = loadTestData();
			
			var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
			var paraObj = new Paragraph( paraData, {}, true );
			var oldTxt = paraObj.text;
			paraObj.insertText("123", 2);
			var newTxt = paraObj.text;
			
			expect("he123llo").toEqual(newTxt);
		});
	
		it("Insert text at the end of paragraph", function() {
			
			var doc = loadTestData();
			
			var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
			var paraObj = new Paragraph( paraData, {}, true );
			var oldTxt = paraObj.text;
			paraObj.insertText("123", 5);
			var newTxt = paraObj.text;
			
			expect(oldTxt + "123").toEqual(newTxt);
		});
		
		it("Delete text at the begining of paragraph", function() {
			
			var doc = loadTestData();
			var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
			var paraObj = new Paragraph( paraData, {}, true );
			var oldTxt = paraObj.text;
			paraObj.deleteText(0, 3);
			var newTxt = paraObj.text;
			expect("hel"+newTxt).toEqual(oldTxt);
		});
		
		it("Delete text at the middle of paragraph", function() {
			
			var doc = loadTestData();
			var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
			var paraObj = new Paragraph( paraData, {}, true );
			var oldTxt = paraObj.text;
			paraObj.deleteText(3, 1);
			var newTxt = paraObj.text;
			expect(newTxt).toEqual("helo");
		});
		
		it("Delete text at the end of paragraph", function() {
			
			var doc = loadTestData();
			var paraData = {"t":"p","id":"id_001","c":"hello","fmt":[{"rt":"rPr","s":"0","l":"5"}]};
			var paraObj = new Paragraph( paraData, {}, true );
			var oldTxt = paraObj.text;
			paraObj.deleteText(4, 1);
			var newTxt = paraObj.text;
			expect(newTxt).toEqual("hell");
		});
	});
	
	
});