define([
	"writer/model/Document",
	"writer/model/Numbering",
	"writer/model/Relations",
	"writer/model/Settings",
	"writer/model/style/Styles",
	"writer/model/table/Row"
], function (Document, Numbering, Relations, Settings, Styles, Row) {

	describe("writer.test.ut.table.row", function() {
	
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
	
			Row.parent = {
				update:function(){
					// console.log("table.update");
				}
			} 
			return pe.lotusEditor.document;
		};
	
		beforeEach(function() {
			loadTestData();
		});
	
		afterEach(function() {
	
		});
	
		it("from Json to Model and isTblHeaderRepeat function", function() {
				var rowJson = {
	          "t": "tr",
	          "attr_pre": {
	            "paraId": "w14"
	          },
	          "paraId": "07366B2F",
	          "trPr": {
	            "trHeight": "23.4500pt",
	            "tblHeader": "1"
	          },
	          "tcs": [
	            {
	              "t": "tc",
	              "tcPr": {
	                "t": "tcPr",
	                "tcW": {
	                  "w": "2745",
	                  "type": "dxa"
	                }
	              },
	              "ps": [
	                {
	                  "t": "p",
	                  "id": "id_1859489647950245",
	                  "attr_pre": {
	                    "paraId": "w14"
	                  },
	                  "paraId": "49BA7E28",
	                  "fmt": [
	                    {
	                      "t": "r",
	                      "rt": "rPr",
	                      "s": "0",
	                      "l": "3"
	                    }
	                  ],
	                  "c": "wer"
	                }
	              ],
	              "id": "id_0903292974174348"
	            }
	          ],
	          "id": "id_3981104812310611"
	        };
	
	        var row = new Row(rowJson,{});
	        expect(row.isTblHeaderRepeat()).toEqual(true);
	
		});
	
		it("setTblHeaderRepeat ", function() {
				var rowJson = {
	          "t": "tr",
	          "attr_pre": {
	            "paraId": "w14"
	          },
	          "paraId": "07366B2F",
	          "trPr": {
	            "trHeight": "23.4500pt",
	            "tblHeader": "1"
	          },
	          "tcs": [
	            {
	              "t": "tc",
	              "tcPr": {
	                "t": "tcPr",
	                "tcW": {
	                  "w": "2745",
	                  "type": "dxa"
	                }
	              },
	              "ps": [
	                {
	                  "t": "p",
	                  "id": "id_1859489647950245",
	                  "attr_pre": {
	                    "paraId": "w14"
	                  },
	                  "paraId": "49BA7E28",
	                  "fmt": [
	                    {
	                      "t": "r",
	                      "rt": "rPr",
	                      "s": "0",
	                      "l": "3"
	                    }
	                  ],
	                  "c": "wer"
	                }
	              ],
	              "id": "id_0903292974174348"
	            }
	          ],
	          "id": "id_3981104812310611"
	        };
	        //var table = new writer.model.table.Table({},{});
	        var row = new Row(rowJson,{});
	        row.parent = {
	      			update:function(){
	      			console.log("table.update");
	  			   }
			    };
	        expect(row.isTblHeaderRepeat()).toEqual(true);
	        spyOn(row.rowProperty,"setTblHeaderRepeat").andCallThrough();
	        spyOn(row,"markHeadRepeat").andCallThrough();
	        spyOn(row.parent,"update").andCallThrough();
	    		row.setTblHeaderRepeat("none");
	    		expect(row.rowProperty.setTblHeaderRepeat).toHaveBeenCalledWith("none");
	    		expect(row.markHeadRepeat).toHaveBeenCalled();
	    		expect(row.parent.update).toHaveBeenCalled();
		});
	//for markHeadRepeat function, it needs table as parent,implement unit test in table
		
	
	});

});