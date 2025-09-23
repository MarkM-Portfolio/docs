define([
    "writer/api",
    "writer/model/Document",
    "writer/model/Numbering",
    "writer/model/Relations",
    "writer/model/Settings",
    "writer/model/style/Styles"
], function (api, Document, Numbering, Relations, Settings, Styles) {

    describe("writer.test.ut.api", function () {

        var jsonData = [{ "t": "p", "id": "id_001", "c": "hello. China.", "fmt": [{ "rt": "rPr", "s": "0", "l": "13" }] }, { "t": "p", "id": "id_002", "c": "I love you. What about you?", "fmt": [{ "rt": "rPr", "s": "0", "l": "27" }] }];
        pe.lotusEditor.relations = new Relations({});
        pe.lotusEditor.number = new Numbering({});
        pe.lotusEditor.styles = new Styles({});
        pe.lotusEditor.styles.createCSSStyle();
        pe.lotusEditor.setting = new Settings({});
        pe.lotusEditor.relations.loadContent();
        pe.lotusEditor.document = new Document(jsonData, pe.lotusEditor.layoutEngine);
        var shell = {
            insertText: function () { }
        }
        pe.lotusEditor.getShell = function () {
            return shell;
        }

        it("_assembleMsg", function () {
            var msg = api._assembleMsg("1", "what", "success", "detail");
            var json = JSON.parse(msg);
            expect(json.eventId).toEqual("1");
            expect(json.eventType).toEqual("what");
            expect(json.status).toEqual("success");
            expect(json.detail).toEqual("detail");
            expect(json.generated).toBeGreaterThan(1000);
        });

        it("notify", function (done) {
            api.registerWindow(window);
            window.addEventListener("message", receiveMessage, false);
            window.returnValue = {};
            function receiveMessage(event) {
                var origin = event.origin || event.originalEvent.origin;
                var data = event.data;
                window.returnValue.event = event;
            }

            runs(function () {
                api.notify("what", "detail");
            });

            waitsFor(function () {
                return window.returnValue.event;
            }, "receiveMessage should be called", 750);

            runs(function () {
                var json = JSON.parse(window.returnValue.event.data);
                expect(json.eventType).toEqual("what");
            });
        });

        it("_getSentences", function () {
            var str = "sdasdsad. 1231231. 123123."
            var sentences = api._getSentences(str);
            expect(sentences.length).toEqual(3);

            var str2 = "sdasdsad. 我是中文3.14159。 1231231. 123123."
            var sentences2 = api._getSentences(str2);
            expect(sentences2.length).toEqual(4);
            
            var str3 = "sdasdsad;我是中文3.14159; I love you ! What about you? I love you so much. haha"
            var sentences3 = api._getSentences(str3);
            expect(sentences3.length).toEqual(6);
            
            var str4 = "凯利在空间站生活了很长一段时间，它的身体发生了什么改变？关于这点科学家希望知道得更多。";
            var sentences4 = api._getSentences(str4);
            expect(sentences4.length).toEqual(2);
        });

        it("getSelectedTextInScope", function () {

            var result = api.getSelectedTextInScope("object");
            expect(result.status).toEqual("error");

            pe.lotusEditor.getSelection = function () {
                return {
                    getRanges: function () {
                        var range = {
                            getStartParaPos: function () {
                                return {
                                    obj: pe.lotusEditor.document.container.getFirst(),
                                    index: 0
                                }
                            }
                        }
                        return [range];
                    }
                };
            };

            result = api.getSelectedTextInScope("paragraph");
            expect(result.status).toEqual("success");
            expect(result.detail).toEqual("hello. China.");

            result = api.getSelectedTextInScope("sentence");
            expect(result.status).toEqual("success");
            expect(result.detail).toEqual("hello.");

        });

        it("selectTextInScope", function () {

            var result = api.selectTextInScope("object");
            expect(result.status).toEqual("error");

            result = api.selectTextInScope("paragraph", "next");
            expect(result.status).toEqual("error");

            var resultObj = {};
            var firstPara = pe.lotusEditor.document.container.getFirst();
            var secondPara = pe.lotusEditor.document.container.next(firstPara);
            pe.lotusEditor.getSelection = function () {
                return {
                    getRanges: function () {
                        var range = {
                            getStartParaPos: function () {
                                return {
                                    obj: firstPara,
                                    index: 0
                                }
                            }
                        }
                        return [range];
                    },
                    selectRanges: function (ranges) {
                        resultObj.selectedRanges = ranges;
                    },
                    scrollIntoView: function () { }
                };
            };

            result = api.selectTextInScope("paragraph");
            expect(result.status).toEqual("success");
            expect(resultObj.selectedRanges[0].startModel.obj).toEqual(firstPara);
            expect(resultObj.selectedRanges[0].startModel.index).toEqual(0);
            expect(resultObj.selectedRanges[0].endModel.obj).toEqual(firstPara);
            expect(resultObj.selectedRanges[0].endModel.index).toEqual(13);

            result = api.selectTextInScope("sentence");
            expect(result.status).toEqual("success");

            expect(resultObj.selectedRanges[0].startModel.obj.parent).toEqual(firstPara);
            expect(resultObj.selectedRanges[0].startModel.index).toEqual(0);
            expect(resultObj.selectedRanges[0].endModel.obj.parent).toEqual(firstPara);
            expect(resultObj.selectedRanges[0].endModel.index).toEqual(6);

            result = api.selectTextInScope("sentence", "nextSibling");
            expect(result.status).toEqual("success");

            expect(resultObj.selectedRanges[0].startModel.obj.parent).toEqual(firstPara);
            expect(resultObj.selectedRanges[0].startModel.index).toEqual(6);
            expect(resultObj.selectedRanges[0].endModel.obj.parent).toEqual(firstPara);
            expect(resultObj.selectedRanges[0].endModel.index).toEqual(13);


            result = api.selectTextInScope("paragraph", "nextSibling");
            expect(result.status).toEqual("success");
            expect(resultObj.selectedRanges[0].startModel.obj).toEqual(secondPara);
            expect(resultObj.selectedRanges[0].startModel.index).toEqual(0);
            expect(resultObj.selectedRanges[0].endModel.obj).toEqual(secondPara);
            expect(resultObj.selectedRanges[0].endModel.index).toEqual(27);

        });

        it("setTextInScope", function () {

            var result = api.setTextInScope("aa", "object");
            expect(result.status).toEqual("error");

            var resultObj = {};
            var firstPara = pe.lotusEditor.document.container.getFirst();
            var secondPara = pe.lotusEditor.document.container.next(firstPara);
            pe.lotusEditor.getSelection = function () {
                return {
                    getRanges: function () {
                        var range = {
                            getStartParaPos: function () {
                                return {
                                    obj: firstPara,
                                    index: 0
                                }
                            }
                        }
                        return [range];
                    },
                    selectRanges: function (ranges) {
                        resultObj.selectedRanges = ranges;
                    },
                    scrollIntoView: function () { }
                };
            };

            spyOn(shell, "insertText");

            result = api.setTextInScope("nihao", "sentence");
            expect(result.status).toEqual("success");
            expect(shell.insertText).toHaveBeenCalledWith("nihao");

            result = api.setTextInScope("fengzi", "paragraph");
            expect(result.status).toEqual("success");
            expect(shell.insertText).toHaveBeenCalledWith("fengzi");
        });

    });

});
