define([
    "writer/track/trackChange",
    "writer/model/Document",
    "writer/model/Numbering",
    "writer/model/Relations",
    "writer/model/Settings",
    "writer/model/style/Styles",
    "writer/model/table/Row"
], function(trackChange, Document, Numbering, Relations, Settings, Styles, Row) {

    describe("writer.tests.UTcases.trackchange.paraMerge", function() {

        Document.prototype.update = function() {}
        pe.scene = {
            addResizeListener: function() {},
            isHTMLViewMode: function() {
                return false
            },
            getCurrUserId: function() {
                return "user1"
            },
            isIndicatorAuthor: function() {
                return true
            },
            getUsersColorStatus: function() {
                return true
            }
        }
        pe.scene.session = {
            createMessage: function() {
                return []
            },
            sendMessage: function() {}
        }

        trackChange.on = true;
        trackChange.show_del = false;

        it("check merge 3 paragraphs", function() {
            var jsonData = [{
                "t": "p",
                "id": "id_001",
                "c": "hello",
                "rPrCh": [{
                    t: "del",
                    u: "user1",
                    d: 123132182093211
                }],
                "fmt": [{
                    "rt": "rPr",
                    "s": "0",
                    "l": "1"
                }, {
                    "rt": "rPr",
                    "s": "1",
                    "l": "3",
                    "ch": [{
                        t: "del",
                        u: "user1",
                        d: 123132182093211
                    }]
                }, {
                    "rt": "rPr",
                    "s": "4",
                    "l": "1"
                }]
            }, {
                "t": "p",
                "id": "id_002",
                "c": "hello",
                "rPrCh": [{
                    t: "del",
                    u: "user1",
                    d: 123132182093211
                }],
                "fmt": [{
                    "rt": "rPr",
                    "s": "0",
                    "l": "5",
                    "ch": [{
                        t: "del",
                        u: "user1",
                        d: 123132182093211
                    }]
                }]
            }, {
                "t": "p",
                "id": "id_003",
                "c": "world",
                "fmt": [{
                    "rt": "rPr",
                    "s": "0",
                    "l": "1",
                    "ch": [{
                        t: "del",
                        u: "user1",
                        d: 123132182093211
                    }]
                }, {
                    "rt": "rPr",
                    "s": "1",
                    "l": "3",
                    "ch": [{
                        t: "del",
                        u: "user1",
                        d: 123132182093211
                    }]
                }, {
                    "rt": "rPr",
                    "s": "4",
                    "l": "1"
                }]
            }];

            pe.lotusEditor.document = new Document(jsonData,
                pe.lotusEditor.layoutEngine);

            var p1 = pe.lotusEditor.document.firstChild();
            var p2 = p1.next();
            var p3 = p2.next();
            var vt = p1.getVisibleText();
            expect(vt).toEqual("ho");
            var vt = p3.getVisibleText();
            expect(vt).toEqual("d");

            var idString = p1.id + "," + p2.id + "," + p3.id;
            var mp = p1.getVirtualViewModel();
            var id = mp.id;
            expect(mp.getVisibleText()).toEqual("hod");
            expect(id).toEqual(idString);

            expect(p1.willMergeWithPrevPara()).toBeFalsy();
            expect(p2.willMergeWithPrevPara()).toBeTruthy();
            expect(p3.willMergeWithPrevPara()).toBeTruthy();
        });

        it("check merge 2 paragraphs", function() {
            var jsonData = [{
                "t": "p",
                "id": "id_001",
                "c": "hello",
                "rPrCh": [{
                    t: "del",
                    u: "user1",
                    d: 123132182093211
                }],
                "fmt": [{
                    "rt": "rPr",
                    "s": "0",
                    "l": "1"
                }, {
                    "rt": "rPr",
                    "s": "1",
                    "l": "3",
                    "ch": [{
                        t: "del",
                        u: "user1",
                        d: 123132182093211
                    }]
                }, {
                    "rt": "rPr",
                    "s": "4",
                    "l": "1"
                }]
            }, {
                "t": "p",
                "id": "id_002",
                "c": "hello",
                "rPrCh": [{
                    t: "del",
                    u: "user1",
                    d: 123132182093211
                }],
                "fmt": [{
                    "rt": "rPr",
                    "s": "0",
                    "l": "5",
                    "ch": [{
                        t: "del",
                        u: "user1",
                        d: 123132182093211
                    }]
                }]
            }, {
                "t": "p",
                "id": "id_003",
                "c": "world",
                "fmt": [{
                    "rt": "rPr",
                    "s": "0",
                    "l": "1"
                }, {
                    "rt": "rPr",
                    "s": "1",
                    "l": "3",
                    "ch": [{
                        t: "del",
                        u: "user1",
                        d: 123132182093211
                    }]
                }, {
                    "rt": "rPr",
                    "s": "4",
                    "l": "1"
                }]
            }];

            pe.lotusEditor.document = new Document(jsonData,
                pe.lotusEditor.layoutEngine);

            var p1 = pe.lotusEditor.document.firstChild();
            var p2 = p1.next();
            var p3 = p2.next();
            var vt = p1.getVisibleText();
            expect(vt).toEqual("ho");
            var vt = p3.getVisibleText();
            expect(vt).toEqual("wd");

            var idString = p1.id + "," + p2.id;
            var mp = p1.getVirtualViewModel();
            var id = mp.id;
            expect(id).toEqual(idString);

            expect(mp.getVisibleText()).toEqual("ho");

            var mp = p3.getVirtualViewModel();
            expect(mp).toEqual(p3);

            expect(p1.willMergeWithPrevPara()).toBeFalsy();
            expect(p2.willMergeWithPrevPara()).toBeTruthy();
            expect(p3.willMergeWithPrevPara()).toBeFalsy();
        });

    });

});
