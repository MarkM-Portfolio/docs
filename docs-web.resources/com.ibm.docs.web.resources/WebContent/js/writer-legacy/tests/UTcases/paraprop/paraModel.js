dojo.provide("writer.tests.UTcases.paraprop.paraModel");

describe("writer.tests.UTcases.paraprop.paraModel", function() {

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

	it("json to model", function() {
console.log("json to model")
		var doc = loadTestData();

		var paraData = {
			"t": "p",
			"id": "id_001",
			"pPr": {
				"t": "pPr",
				"keepLines": {},
				"pageBreakBefore": {}
			},
			"c": "hello",
			"fmt": [{
				"rt": "rPr",
				"s": "0",
				"l": "5"
			}]
		};
		var paraObj = new writer.model.Paragraph(paraData, {}, true);
		expect(paraObj.isPageBreakBefore()).toEqual(true);
		expect(paraObj.isKeepLines()).toEqual(true);
		expect(paraObj.isWidowControl()).toEqual(true);
	});

	it("Set Get pageBreakBefore Method", function() {

		var doc = loadTestData();

		var paraData = {
			"t": "p",
			"id": "id_001",
			"pPr": {},
			"c": "hello",
			"fmt": [{
				"rt": "rPr",
				"s": "0",
				"l": "5"
			}]
		};
		var paraObj = new writer.model.Paragraph(paraData, {}, true);
		expect(paraObj.isPageBreakBefore()).toEqual(null);

		var prop = paraObj.directProperty;
		paraObj.parent = pe.lotusEditor.document;
		spyOn(prop, 'getMessage').andCallFake(function() {
			if (this.changedRecord.length == 0)
				return null;
			else
				return true;
		});

		spyOn(prop, 'setPageBreakBefore').andCallThrough();
		spyOn(paraObj.parent, 'update').andCallFake(function() {
			//console.log("update Parent");
		});
		spyOn(prop, 'isPageBreakBefore').andCallThrough();
		
		paraObj.setPageBreakBefore(true);
		expect(paraObj.directProperty.setPageBreakBefore).toHaveBeenCalledWith(true);
		expect(paraObj.parent.update).toHaveBeenCalled();		
		expect(paraObj.isPageBreakBefore()).toBe(true);
		expect(paraObj.directProperty.isPageBreakBefore).toHaveBeenCalled();
	});

	it("Set Get Keeplines Method", function() {

		var doc = loadTestData();

		var paraData = {
			"t": "p",
			"id": "id_001",
			"pPr": {},
			"c": "hello",
			"fmt": [{
				"rt": "rPr",
				"s": "0",
				"l": "5"
			}]
		};
		var paraObj = new writer.model.Paragraph(paraData, {}, true);
		expect(paraObj.isKeepLines()).toEqual(null);

		var prop = paraObj.directProperty;
		paraObj.parent = pe.lotusEditor.document;
		spyOn(prop, 'getMessage').andCallFake(function() {
			if (this.changedRecord.length == 0)
				return null;
			else
				return true;
		});

		spyOn(prop, 'setKeepLines').andCallThrough();
		spyOn(paraObj.parent, 'update').andCallFake(function() {
			//console.log("update Parent");
		});
		spyOn(prop, 'isKeepLines').andCallThrough();
		
		paraObj.setKeepLines(true);
		expect(paraObj.directProperty.setKeepLines).toHaveBeenCalledWith(true);
		expect(paraObj.parent.update).toHaveBeenCalled();		
		expect(paraObj.isKeepLines()).toBe(true);
		expect(paraObj.directProperty.isKeepLines).toHaveBeenCalled();
	});

	it("Set Get widowControl Method", function() {

		var doc = loadTestData();

		var paraData = {
			"t": "p",
			"id": "id_001",
			"pPr": {},
			"c": "hello",
			"fmt": [{
				"rt": "rPr",
				"s": "0",
				"l": "5"
			}]
		};
		var paraObj = new writer.model.Paragraph(paraData, {}, true);
		expect(paraObj.isWidowControl()).toEqual(true);

		var prop = paraObj.directProperty;
		paraObj.parent = pe.lotusEditor.document;
		spyOn(prop, 'getMessage').andCallFake(function() {
			if (this.changedRecord.length == 0)
				return null;
			else
				return true;
		});

		spyOn(prop, 'setWidowControl').andCallThrough();
		spyOn(paraObj.parent, 'update').andCallFake(function() {
			//console.log("update Parent");
		});
		spyOn(prop, 'isWidowControl').andCallThrough();
		
		paraObj.setWidowControl(false);
		expect(paraObj.directProperty.setWidowControl).toHaveBeenCalledWith(false);
		expect(paraObj.parent.update).toHaveBeenCalled();		
		expect(paraObj.isWidowControl()).toBe(false);
		expect(paraObj.directProperty.isWidowControl).toHaveBeenCalled();
	});

});