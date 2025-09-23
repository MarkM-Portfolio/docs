define([
	"writer/model/Document",
	"writer/model/Numbering",
	"writer/model/Relations",
	"writer/model/Settings",
	"writer/model/prop/ParagraphProperty",
	"writer/model/style/Styles"
], function (Document, Numbering, Relations, Settings, ParagraphProperty, Styles) {

	describe("writer.test.ut.paraprop.prop", function() {
	
		var loadTestData = function() {
			var jsonData = {
				"body": [{
					"t": "p",
					"id": "id_001",
					"c": "hello",
					"fmt": [{
						"rt": "rPr",
						"s": "0",
						"l": "5"
					}]
				}]
			};
	
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
	
		it("from Json to Model", function() {
	
			var doc = loadTestData();
			var propData = {
		        "t": "pPr",
		        "keepLines": {},
		        "pageBreakBefore": {}
		      };
			var directProperty = new ParagraphProperty(propData);
	
			expect(directProperty.isWidowControl()).toBe(true);
			expect(directProperty.isKeepLines()).toBe(true);
			expect(directProperty.isPageBreakBefore()).toBe(true);
	
		});
	
		it("set Get Widow Prop", function() {
	
			var doc = loadTestData();
			var propData = {};
			var directProperty = new ParagraphProperty(propData);
			expect(directProperty.isWidowControl()).toBe(true);
			directProperty.setWidowControl(false);
			expect(directProperty.isWidowControl()).toBe(false);
			directProperty.setWidowControl(false);
			var jsonMsg = {
				'type': 'widowControl',
				'oldValue': false,
				'newValue': false
			};
			expect(directProperty.changedRecord).not.toContain(jsonMsg);
	
		});
	
		it("set Get keepLines Prop", function() {
	
			var doc = loadTestData();
			var propData = { 
				 "keepLines": {}
				};
			var directProperty = new ParagraphProperty(propData);
			expect(directProperty.isKeepLines()).toBe(true);
			directProperty.setKeepLines(false);
			expect(directProperty.isKeepLines()).toBe(false);
			directProperty.setKeepLines(false);
			var jsonMsg = {
				'type': 'keepLines',
				'oldValue': false,
				'newValue': false
			};
			expect(directProperty.changedRecord).not.toContain(jsonMsg);
	
		});
	
		it("set Get pagebreak Prop", function() {
	
			var doc = loadTestData();
			var propData = { 
				 "pageBreakBefore": {}
				};
			var directProperty = new ParagraphProperty(propData);
			expect(directProperty.isPageBreakBefore()).toBe(true);
			directProperty.setPageBreakBefore(false);
			expect(directProperty.isPageBreakBefore()).toBe(null);
			directProperty.setPageBreakBefore(false);
			var jsonMsg = {
				'type': 'pageBreakBefore',
				'oldValue': "none",
				'newValue': "none"
			};
			expect(directProperty.changedRecord).toContain(jsonMsg);
	
		});
	
	
		it("from model prop to Json --pageBreakBefore", function() {
	
			var doc = loadTestData();
			var propData = {};
			var directProperty = new ParagraphProperty(propData);
			expect(directProperty.isPageBreakBefore()).toBe(null);
			directProperty.setPageBreakBefore(true);
			var resultJsonOne = {
		         "pageBreakBefore": {"val": "1"}
		        };
			expect(directProperty.toJson()).toEqual(resultJsonOne);
			
	
		});
	
		it("from model prop to Json --widowControl", function() {
	
			var doc = loadTestData();
			var propData = {};
			var directProperty = new ParagraphProperty(propData);
			expect(directProperty.isWidowControl()).toBe(true);
			directProperty.setWidowControl(false);
			var resultJsonOne = {
		         "widowControl": {"val": "0"}
		        };
			expect(directProperty.toJson()).toEqual(resultJsonOne);
			
	
		});
	
		it("from model prop to Json --widowControl", function() {
	
			var doc = loadTestData();
			var propData = {};
			var directProperty = new ParagraphProperty(propData);
			expect(directProperty.isKeepLines()).toBe(null);
			directProperty.setKeepLines(true);
			var resultJsonOne = {
		         "keepLines": {"val": "1"}
		        };
			expect(directProperty.toJson()).toEqual(resultJsonOne);
			
	
		});
	
		it("merge prop", function() {
	
			var doc = loadTestData();
			var propData1 = {
				 "keepLines": {},
				 "pageBreakBefore": {}
			};
			var propData2 = {};
			var directProperty = new ParagraphProperty(propData1);
			var directProperty2 = new ParagraphProperty(propData2);
	
			expect(directProperty.isKeepLines()).toBe(true);
			expect(directProperty.isPageBreakBefore()).toBe(true);
			expect(directProperty.isWidowControl()).toBe(true);
	
			expect(directProperty2.isKeepLines()).toBe(null);
			expect(directProperty2.isPageBreakBefore()).toBe(null);
			expect(directProperty2.isWidowControl()).toBe(true);
			directProperty.setKeepLines(true);
	
			directProperty2 = directProperty.merge(directProperty2);
	
			expect(directProperty2.isKeepLines()).toBe(true);
			expect(directProperty2.isPageBreakBefore()).toBe(true);
			
	
		});
	
		it("from model prop to Json --widowControl", function() {
	
			var doc = loadTestData();
			var propData = {};
			var directProperty = new ParagraphProperty(propData);
			expect(directProperty.isKeepLines()).toBe(null);
			directProperty.setKeepLines(true);
			var resultJsonOne = {
		         "keepLines": {"val": "1"}
		        };
			expect(directProperty.toJson()).toEqual(resultJsonOne);
			
	
		});
	
	
	});

});