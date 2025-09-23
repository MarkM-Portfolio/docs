define([
    "writer/util/ModelTools",
    "writer/model/abstractNum",
    "writer/model/Document",
    "writer/model/Numbering",
    "writer/model/Paragraph",
    "writer/model/Relations",
    "writer/model/Settings",
    "writer/model/style/Styles"
], function(ModelTools, abstractNum, Document, Numbering, Paragraph, Relations, Settings, Styles) {

    describe("writer.test.ut.list.setStartNumber", function() {

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


        it("Set list start number for first level list item", function() {

            var paraData = {
                "t": "p",
                "id": "id_001",
                "c": "hello",
                "fmt": [{
                    "rt": "rPr",
                    "s": "0",
                    "l": "5"
                }]
            };
            var paraObj = new Paragraph(paraData, {}, true);
            var oldTxt = paraObj.text;
            paraObj.insertText("123", 0);
            var newTxt = paraObj.text;
            expect("123" + oldTxt).toEqual(newTxt);
        });

    });


});
