define([
    "./json/content_1",
    "./json/settings_1",
    "./json/relations_1",
    "dojo/_base/lang",
    "writer/core/Command",
    "writer/core/Range",
    "dojo/dom-construct",
    "writer/util/TableTools",
    "writer/model/Numbering",
    "writer/common/MeasureText",
    "writer/common/tools",
    "writer/model/Document",
    "writer/controller/UpdateManager",
    "writer/model/Relations",
    "writer/model/Settings",
    "writer/model/style/Styles",
    "writer/plugins/Table",
    "writer/plugins/UndoManager",
    "writer/view/Run",
    "writer/common/Space",
    "writer/view/text/TextArea"
], function(content,settings,relations,lang,Command, Range, domConstruct, TableTools, Numbering, MeasureText, tools, Document, UpdateManager, Relations, Settings, Styles, Table, UndoManager,  Run, Space, TextArea) {

    describe("writer.test.ut.column.sectionBreak", function () {
        MeasureText.init();
        var documentModel,documentView;
         tools.getDPI = function(){
             tools.DPI.x = 96;
             tools.DPI.y = 96;
         };
        var createModel = function () {
            var documentData = lang.clone(content);
            var settingData = lang.clone(settings);
            pe.lotusEditor.relations = new Relations(lang.clone(relations));
            pe.lotusEditor.number = new Numbering({});
            pe.lotusEditor.setting = new Settings(settingData);
            pe.lotusEditor.relations.loadContent();
            pe.lotusEditor.document = new Document(documentData, pe.lotusEditor.layoutEngine);
            return pe.lotusEditor.document;
        };
        
        beforeEach(function () {
            tools.getDPI();
            documentModel = createModel();
            documentView = documentModel.preLayout("rootView");
            documentView.layout(null, null, true);
            pe.lotusEditor.getScrollPosition  = function(){
                return 0;
            }
            spyOn(documentView, '_updatePageNumber');
            spyOn(documentView, '_alignPages');
            spyOn(documentView, 'render').andCallFake(function() {
              console.log("render");
            });

        }); 
        
        it("layout correct", function() {
            expect(documentView.model).toEqual(documentModel);
        });
        
       
        
    });
});
