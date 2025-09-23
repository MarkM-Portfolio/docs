define([
    "writer/track/trackChange",
    "writer/model/Document",
    "writer/model/Numbering",
    "writer/model/Relations",
    "writer/model/Settings",
    "writer/model/style/Styles",
    "writer/model/table/Row"
], function(trackChange, Document, Numbering, Relations, Settings, Styles, Row) {

    describe("writer.tests.UTcases.trackchange.paraSimpleBasic", function() {

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

        trackChange.on = true;
        trackChange.show_del = false;

        var loadTestData = function() {

            var jsonData = [{
                "t": "p",
                "id": "id_001",
                "c": "hello",
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

            pe.lotusEditor.relations = new Relations({});
            pe.lotusEditor.number = new Numbering({});
            pe.lotusEditor.styles = new Styles({});
            pe.lotusEditor.styles.createCSSStyle();
            pe.lotusEditor.setting = new Settings({});
            pe.lotusEditor.relations.loadContent();
            pe.lotusEditor.document = new Document(jsonData,
                pe.lotusEditor.layoutEngine);

            return pe.lotusEditor.document;
        };

        beforeEach(function() {
            loadTestData();
        });

        afterEach(function() {

        });

        it("VisibileText", function() {
            var p = pe.lotusEditor.document.firstChild();
            var vt = p.getVisibleText();
            var t = p.text;
            expect(t).toEqual("hello");
            expect(vt).toEqual("ho");
        });

        it("Index Transformation - getVisibleIndex", function() {
            var p = pe.lotusEditor.document.firstChild();
            var vi = p.getVisibleIndex(0);
            expect(vi).toEqual(0);
            var vi = p.getVisibleIndex(1);
            console.info(vi)
            expect(vi).toEqual(1);
            var vi = p.getVisibleIndex(2);
            console.info(vi)
            expect(vi).toEqual(1);
            var vi = p.getVisibleIndex(3);
            console.info(vi)
            expect(vi).toEqual(1);
            var vi = p.getVisibleIndex(4);
            console.info(vi)
            expect(vi).toEqual(1);
        });

        it("Index Transformation - getFullIndex", function() {
            var p = pe.lotusEditor.document.firstChild();
            var vi = p.getFullIndex(0);
            expect(vi).toEqual(0);
            var vi = p.getFullIndex(1);
            console.info(vi)
            expect(vi).toEqual(4);
            var vi = p.getFullIndex(2);
            console.info(vi)
            expect(vi).toEqual(4);
            var vi = p.getFullIndex(3);
            console.info(vi)
            expect(vi).toEqual(4);
            var vi = p.getFullIndex(4);
            console.info(vi)
            expect(vi).toEqual(4);
        });

    });

});
