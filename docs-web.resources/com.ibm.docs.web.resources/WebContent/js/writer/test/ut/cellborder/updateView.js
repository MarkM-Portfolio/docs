define([
	"dojo/dom-style",
	"dojo/query",
	"writer/common/Space",
	"writer/view/text/TextArea",
	"writer/model/Document",
	"writer/model/Numbering",
	"writer/model/Relations",
	"writer/model/Settings",
	"writer/model/style/Styles"
], function (dojoStyle, query, Space, TextArea, Document, Numbering, Relations, Settings, Styles) {
	describe('writer.test.ut.cellborder.updateView', function() {
		var loadTestData = function() {
	        var jsonData = [{
	            "tblPr": {
	                "tblBorders": {
	                    "top": {
	                        "val": "single",
	                        "color": "000000",
	                        "sz": "1pt"
	                    },
	                    "left": {
	                        "val": "single",
	                        "color": "000000",
	                        "sz": "1pt"
	                    },
	                    "insideV": {
	                        "val": "single",
	                        "color": "000000",
	                        "sz": "1pt"
	                    },
	                    "bottom": {
	                        "val": "single",
	                        "color": "000000",
	                        "sz": "1pt"
	                    },
	                    "insideH": {
	                        "val": "single",
	                        "color": "000000",
	                        "sz": "1pt"
	                    },
	                    "right": {
	                        "val": "single",
	                        "color": "000000",
	                        "sz": "1pt"
	                    }
	                }
	            },
	            "tblGrid": [{
	                "t": "gridCol",
	                "w": "478.5pt"
	            }],
	            "t": "tbl",
	            "trs": [{ // row 1
	                "t": "tr",
	                "tcs": [{
	                    "t": "tc",
	                    "tcPr": {
	                        "gridSpan": {
	                            "val": 1
	                        },
	                        "vMerge": {
	                            "val": "restart"
	                        }
	                    },
	                    "id": "id_0010101"
	                }, {
	                    "t": "tc",
	                    "tcPr": {
	                        "gridSpan": {
	                            "val": 2
	                        }
	                    },
	                    "id": "id_0010102"
	                }],
	                "id": "id_00101"
	            }, { // row2
	                "t": "tr",
	                "tcs": [{
	                    "tcPr": {
	                        "vMerge": {}
	                    },
	                    "t": "tc",
	                    "id": "id_0010201"
	                }, {
	                    "t": "tc",
	                    "id": "id_0010202"
	                }, {
	                    "t": "tc",
	                    "id": "id_0010203"
	                }],
	                "id": "id_00102"
	            }],
	            "id": "id_001"
	        }];
	        pe.lotusEditor.relations = new Relations({});
	        pe.lotusEditor.number = new Numbering({});
	        pe.lotusEditor.styles = new Styles({});
	        pe.lotusEditor.styles.createCSSStyle();
	        pe.lotusEditor.setting = new Settings({});
	        pe.lotusEditor.relations.loadContent();
	        pe.lotusEditor.document = new Document(jsonData, pe.lotusEditor.layoutEngine);
	    };
	    var loadTableView = function(paramodel) {
			var view = paramodel.preLayout("rootView");
			var space = new Space(624, 864);
			var textArea = new TextArea({}, space.clone(), null);
			spyOn(view, "calculateMarginTop").andCallFake(function() {
				return 0;
			});
			view.layout(textArea);
			view.render();
			return view;
		};
	
		beforeEach(function() {
			loadTestData();
		});
	
		it('cell border should be render well', function() {
			var table = pe.lotusEditor.document.byId("id_001");
			var tableView = loadTableView(table);
			var borders = query('.borderGroup>div',tableView.domNode);
			expect(borders.length).toBeGreaterThan(0);
		});
	
		it('cell border will be rerender after changeBorder', function() {
			var table = pe.lotusEditor.document.byId("id_001");
			var tableView = loadTableView(table);
			var cell = pe.lotusEditor.document.byId("id_0010102");
			cell.changeBorder({"bottom":{"style":"double","width":"1.5pt","color":"ff0000"}});
			var cellView = cell.getViews("rootView").getFirst();
			cellView.updateCellDOM();
			var bottomBorderDom = query(".bottomGroup",cellView.domNode)[0].children[0];
			//expect(dojoStyle.get(bottomBorderDom,"borderBottomStyle")).toEqual("double");
		});
	});

});