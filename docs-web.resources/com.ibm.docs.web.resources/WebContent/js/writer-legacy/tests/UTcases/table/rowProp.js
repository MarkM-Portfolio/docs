dojo.provide("writer.tests.UTcases.table.rowProp");

describe("writer.tests.UTcases.table.rowProp", function() {

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

	it("json to model no head repeat", function() {
		var doc = loadTestData();

		var paraData = {
			 "trPr": {
            "trHeight": "23.4500pt",
//           "tblHeader": "1"
          }
		};  
		var rowProp = new writer.model.prop.RowProperty(paraData, {}); 
		spyOn(rowProp,'initHeight').andCallThrough();
		expect(rowProp.tblHeaderRepeat).toEqual("none");
	});

	it("json to model with head repeat", function() {

		var paraData = {
            "trHeight": "23.4500pt",
            "tblHeader": "1"
		};  
		var rowProp = new writer.model.prop.RowProperty(paraData, {}); 
		spyOn(rowProp,'initHeight').andCallThrough();
		expect(rowProp.tblHeaderRepeat).toEqual(true);
	});

	it("get TblHeaderRepeat", function() {

		var paraData = {
            "trHeight": "23.4500pt",
            "tblHeader": "1"
		};  
		var rowProp = new writer.model.prop.RowProperty(paraData, {}); 
		spyOn(rowProp,'initHeight').andCallThrough();
		expect(rowProp.tblHeaderRepeat).toEqual(true);
		expect(rowProp.getTblHeaderRepeat()).toEqual(true);
	});

	it("set TblHeaderRepeat", function() {

		var paraData = {
            "trHeight": "23.4500pt",
            "tblHeader": "1"
		};  
		var rowProp = new writer.model.prop.RowProperty(paraData, {}); 
		spyOn(rowProp,'initHeight').andCallThrough();
		expect(rowProp.tblHeaderRepeat).toEqual(true);
		expect(rowProp.getTblHeaderRepeat()).toEqual(true);
		rowProp.setTblHeaderRepeat(null);
		expect(rowProp.getTblHeaderRepeat()).toEqual(true);
		rowProp.setTblHeaderRepeat("none");
		expect(rowProp.getTblHeaderRepeat()).toEqual("none");
		rowProp.setTblHeaderRepeat("none");
		expect(rowProp.getTblHeaderRepeat()).toEqual("none");
	});

	it("toJson", function() {

		var paraData = {
            "trHeight": "23.4500pt",
            "tblHeader": "1"
		};  
		var rowProp = new writer.model.prop.RowProperty(paraData, {}); 
		spyOn(rowProp,'initHeight').andCallThrough();
		expect(rowProp.tblHeaderRepeat).toEqual(true);
		expect(rowProp.getTblHeaderRepeat()).toEqual(true);
		var json = rowProp.toJson();
		expect(json.tblHeader).toEqual("1");
	});
});