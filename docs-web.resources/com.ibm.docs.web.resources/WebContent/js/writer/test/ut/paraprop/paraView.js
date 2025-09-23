define([
    "writer/model/Paragraph",
    "writer/view/Run",
    "writer/common/MeasureText",
    "writer/common/tools",
    "writer/common/Space",
    "writer/view/text/TextArea"
], function(Paragraph, viewRun, MeasureText, tools, Space, TextArea) {

    describe("writer.test.ut.paraprop.paraView", function() {
        MeasureText.init();
        tools.getDPI();
        viewRun.prototype.getCSSStr = function() {
            return "font-family:Calibri;font-size:11pt;";
        };

        // var loadTestData = function() {
        // 	var jsonData = {
        // 		"body": [{
        // 			"t": "p",
        // 			"id": "id_001",
        // 			"c": "hello",
        // 			"fmt": [{
        // 				"rt": "rPr",
        // 				"s": "0",
        // 				"l": "5"
        // 			}]
        // 		}]
        // 	};

        // 	pe.lotusEditor.relations = new writer.model.Relations({});
        // 	pe.lotusEditor.number = new writer.model.Numbering({});
        // 	// pe.lotusEditor.styles = new writer.model.style.Styles({});
        // 	// pe.lotusEditor.styles.createCSSStyle();
        // 	pe.lotusEditor.setting = new writer.model.Settings({});
        // 	pe.lotusEditor.relations.loadContent();
        // 	pe.lotusEditor.document = new writer.model.Document(jsonData, pe.lotusEditor.layoutEngine);
        // 	return pe.lotusEditor.document;
        // };

        var loadParaFiveLine = function() {
            var json = {
                "t": "p",
                "id": "id_1344790691905903",
                "attr_pre": {
                    "paraId": "w14"
                },
                "paraId": "034A0CBD",
                "rsidP": "00C25C42",
                "rsidR": "003F1CB8",
                "rsidRDefault": "00407541",
                "pPr": {
                    "t": "pPr",
                    "keepLines": {
                        "val": "1"
                    },
                    "pagebreakBefore": {
                        "val": "1"
                    }
                },
                "fmt": [{
                    "t": "r",
                    "rt": "rPr",
                    "rsidRPr": "00453DFB",
                    "s": "0",
                    "l": "16"
                }, {
                    "t": "r",
                    "rt": "rPr",
                    "s": "16",
                    "l": "11"
                }, {
                    "t": "r",
                    "rt": "rPr",
                    "rsidRPr": "00453DFB",
                    "s": "27",
                    "l": "258"
                }, {
                    "t": "r",
                    "rt": "rPr",
                    "s": "285",
                    "l": "15"
                }, {
                    "t": "r",
                    "rt": "rPr",
                    "s": "300",
                    "l": "138"
                }],
                "c": "Each new version/subversion of this document will be identified in the following table by the Version identifier assigned to the revised document.  The table will also include the Change Request (CR) number assigned to each approved change that was incorporated in the revised document, once released ifier assigned to the revised document.  The table will also include ifier assigned to the revised document.  The table will also include"
            };

            var paraModel = new Paragraph(json, pe.lotusEditor.document, true);

            return paraModel;
        };

        var loadParaThreeLine = function() {
            var json = {
                "t": "p",
                "id": "id_3003192841508969",
                "attr_pre": {
                    "paraId": "w14"
                },
                "paraId": "55664298",
                "pPr": {
                    "t": "pPr",
                    "keepLines": {
                        "val": "1"
                    },
                    "pagebreakBefore": {
                        "val": "1"
                    }
                },
                "fmt": [{
                    "t": "r",
                    "rt": "rPr",
                    "s": "0",
                    "l": "245"
                }],
                "c": "Each new version/subversion of this document will be identified in the following table by the Version identifier assigned to the revised document.  The table will also include the Change Request (CR) number assigned to each approved change that "
            };
            var paraModel = new Paragraph(json, pe.lotusEditor.document, true);

            return paraModel;
        };

        var loadParaFourLine = function() {
            var json = {
                "t": "p",
                "id": "id_0038882866045557",
                "attr_pre": {
                    "paraId": "w14"
                },
                "paraId": "20AE7D11",
                "pPr": {
                    "t": "pPr",
                    "keepLines": {
                        "val": "1"
                    },
                    "pagebreakBefore": {
                        "val": "1"
                    }
                },
                "fmt": [{
                    "t": "r",
                    "rt": "rPr",
                    "s": "0",
                    "l": "330"
                }, {
                    "t": "r",
                    "rt": "rPr",
                    "s": "330",
                    "l": "1"
                }],
                "c": "Each new version/subversion of this document will be identified in the following table by the Version identifier assigned to the revised document.  The table will also include the Change Request (CR) number assigned to each approved change that was incorporated in the revised document, once released ifier assigned to the revised "
            };

            var paraModel = new Paragraph(json, pe.lotusEditor.document, true);

            return paraModel;
        };

        var loadView = function(paramodel) {
            var view = paramodel.preLayout("rootView");
            var space = new Space(624, 864);
            var textArea = new TextArea({}, space.clone(), null);
            view.layout(textArea);
            return view;
        };

        beforeEach(function() {
            //loadTestData();
            // loadParaFourLine();
            // loadParaThreeLine();
            // loadParaFiveLine();
            // loadView();
        });

        afterEach(function() {

        });

        it("layout correct", function() {
            var model = loadParaFiveLine();
            var paraView = loadView(model);

            var model2 = loadParaFourLine();
            var paraView2 = loadView(model2);

            var model3 = loadParaThreeLine();
            var paraView3 = loadView(model3);

            expect(paraView.lines.length()).toEqual(5);
            expect(paraView2.lines.length()).toEqual(4);
            expect(paraView3.lines.length()).toEqual(3);

        });

        it("four lines canSplit ---keeplines ", function() {
            var model = loadParaFourLine();
            var paraView = loadView(model);

            var prop = model.directProperty;
            spyOn(prop, 'getMessage').andCallFake(function() {
                if (this.changedRecord.length == 0)
                    return null;
                else
                    return true;
            });
            spyOn(prop, 'setKeepLines').andCallThrough();
            spyOn(model.parent, 'update').andCallFake(function() {
                console.log("update Parent");
            });
            expect(paraView.lines.length()).toEqual(4);
            expect(model.isKeepLines()).toBe(true);
            expect(paraView.canSplit()).toBe(false);
            model.setKeepLines(false);
            expect(model.isKeepLines()).toBe(false);
            expect(paraView.canSplit(50, 50)).toBe(true);
            var body = paraView.parent;
            expect(paraView.canSplit(50, 5, body)).toBe(true);
            body.getContainer().append({});
            expect(paraView.canSplit(50, 5, body)).toBe(false);
        });

        it("four lines canMerge---widowControl", function() {
            var model = loadParaFourLine();
            var paraView = loadView(model);
            var prop = model.directProperty;
            spyOn(prop, 'getMessage').andCallFake(function() {
                if (this.changedRecord.length == 0)
                    return null;
                else
                    return true;
            });
            spyOn(prop, 'setWidowControl').andCallThrough();
            spyOn(prop, 'setKeepLines').andCallThrough();
            spyOn(model.parent, 'update').andCallFake(function() {
                console.log("update Parent");
            });
            expect(paraView.lines.length()).toEqual(4);
            expect(model.isWidowControl()).toBe(true);
            expect(paraView.canMerge(123, 123)).toBe(true);
            model.setWidowControl(false);
            expect(model.isWidowControl()).toBe(false);
            expect(model.isKeepLines()).toBe(true);
            expect(paraView.canMerge(123, 123)).toBe(false);
            model.setKeepLines(false);
            expect(model.isKeepLines()).toBe(false);
            expect(paraView.canMerge(123, 123)).toBe(true);
        });

        it("three lines para Split--widowControl", function() {
            var model = loadParaThreeLine();
            var paraView = loadView(model);
            var newPara = paraView.split(624, 70);
            expect(model.isWidowControl()).toBe(true);
            expect(newPara).toEqual(paraView);
        });

        // it("Three lines para Split", function() {
        // 	var model = loadParaFiveLine();
        // 	var paraView = loadView(model);

        // });

        // it("Five lines para Split --with widow property", function() {
        // 	var model = loadParaFiveLine();
        // 	var paraView = loadView(model);

        // });

        // it("Five lines para Split", function() {
        // 	var model = loadParaFiveLine();
        // 	var paraView = loadView(model);

        // });



    });

});
