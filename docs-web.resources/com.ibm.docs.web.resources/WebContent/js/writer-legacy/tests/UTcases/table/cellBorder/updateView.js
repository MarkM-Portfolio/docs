dojo.provide("writer.tests.UTcases.table.cellBorder.updateView");

describe('writer.tests.UTcases.table.cellBorder.updateView', function() {
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
        pe.lotusEditor.relations = new writer.model.Relations({});
        pe.lotusEditor.number = new writer.model.Numbering({});
        pe.lotusEditor.styles = new writer.model.style.Styles({});
        pe.lotusEditor.styles.createCSSStyle();
        pe.lotusEditor.setting = new writer.model.Settings({});
        pe.lotusEditor.relations.loadContent();
        pe.lotusEditor.document = new writer.model.Document(jsonData, pe.lotusEditor.layoutEngine);
    };
    var loadTableView = function(paramodel) {
		var view = paramodel.preLayout("rootView");
		var space = new common.Space(624, 864);
		var textArea = new writer.view.text.TextArea({}, space.clone(), null);
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
		var borders = dojo.query('.borderGroup>div',tableView.domNode);
		expect(borders.length).toBeGreaterThan(0);
	});

	it('cell border will be rerender after changeBorder', function() {
		var table = pe.lotusEditor.document.byId("id_001");
		var tableView = loadTableView(table);
		var cell = pe.lotusEditor.document.byId("id_0010102");
		cell.changeBorder({"bottom":{"style":"double","width":"1.5pt","color":"ff0000"}});
		var cellView = cell.getViews("rootView").getFirst();
		cellView.updateCellDOM();
		var bottomBorderDom = dojo.query(".bottomGroup",cellView.domNode)[0].children[0];
		expect(dojo.getStyle(bottomBorderDom,"border-bottom-style")).toEqual("double");
	});
});