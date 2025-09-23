define([
    "dojo/_base/xhr",
    "writer/model/Document",
    "writer/model/Numbering",
    "writer/model/Paragraph",
    "writer/model/Relations",
    "writer/model/Settings",
    "writer/model/style/Styles",
    "writer/util/RangeTools",
    "writer/view/AnchorView/AnchorTextBox",
    "writer/view/AnchorView/FLTextBox",
    "writer/view/AnchorView/TBTextBox",
    "writer/view/BookMark"
], function(xhr, Document, Numbering, Paragraph, Relations, Settings, Styles, RangeTools, AnchorTextBox, FLTextBox, TBTextBox, BookMark) {

    describe("writer.test.ut.watermark.textbox", function() {

        var getTestData = function(url) {
            var ret = null;
            xhr.get({
            	url: url,
            	sync: true,
            	handleAs: "json",
            	load: function(resp){
            		ret = resp
            	}
            })
            return ret;
        };

        var loadTestData = function() {
            return loadTestDocument('textSample');
        };

        var assembleContent = function(folder) {
            var prepath = "watermark/" + folder + "/";
            var content, styles, numbering, settings, relations;
            content = getTestData(prepath + "content.json");
            styles = getTestData(prepath + "styles.json");
            numbering = getTestData(prepath + "numbering.json");
            settings = getTestData(prepath + "settings.json");
            relations = getTestData(prepath + "relations.json");

            var jsonCnt = {};
            jsonCnt.content = content.body;
            jsonCnt.style = styles;
            jsonCnt.setting = settings;
            jsonCnt.numbering = numbering;
            jsonCnt.relations = relations;

            return jsonCnt;
        };

        var loadTestDocument = function(folder) {
            var jsonCnt = assembleContent(folder);

            pe.lotusEditor.relations = new Relations(jsonCnt.relations);
            pe.lotusEditor.number = new Numbering(jsonCnt.numbering);
            pe.lotusEditor.styles = new Styles(jsonCnt.style);
            pe.lotusEditor.styles.createCSSStyle();
            pe.lotusEditor.setting = new Settings(jsonCnt.setting);
            pe.lotusEditor.relations.loadContent();
            pe.lotusEditor.document = new Document(jsonCnt.content, pe.lotusEditor.layoutEngine);


            return pe.lotusEditor.document;
        };

        var loadView = function(paramodel) {

            var view = paramodel.preLayout("rootView");
            var space = new common.Space(624, 864);
            var textArea = new writer.view.text.TextArea({}, space.clone(), null);
            view.layout(textArea);
            return view;
        };

        it("Check text box watermark rotation", function() {

            var doc = loadTestData();

            var relHdrDoc = pe.lotusEditor.relations.byId("rId7");
            var firstPara = relHdrDoc.container.getFirst();
            var firstR = firstPara.firstChild();
            var txbxObj = firstR.next();

            expect(txbxObj.isWaterMarker).toEqual(true);
            expect(18900000).toEqual(txbxObj.rot);
        });

        it("Check text box watermark position", function() {

            var doc = loadTestData();

            var relHdrDoc = pe.lotusEditor.relations.byId("rId7");
            var firstPara = relHdrDoc.container.getFirst();
            var firstR = firstPara.firstChild();
            var txbxObj = firstR.next();

            pe.scene.setEditorLeft(220);
            var docView = doc.preLayout("rootView");
            docView.addPage(pe.lotusEditor.setting.getFirstSection(), null);

            var txtArea = docView.getFristConteArea();

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
            var paraObj = new Paragraph(paraData, doc, true);
            var newPV = paraObj.preLayout("rootView");
            newPV.layout(txtArea);

            var newLine = newPV.lines.getFirst();
            var anchorTxtV = new AnchorTextBox(txbxObj, "_testAnchorTextBox", 0, 1);
            newLine._appendView(anchorTxtV);

            var pos = {
                "obj": newLine,
                "index": 0
            };
            var retPos = RangeTools.getDocumentPosition(pos, true);
            expect(retPos.x > 0).toEqual(true);
            expect(retPos.y > 0).toEqual(true);
        });
    });


});
