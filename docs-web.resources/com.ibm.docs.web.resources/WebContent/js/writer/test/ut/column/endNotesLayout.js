define([
    "./json/content_2",
    "./json/settings_2",
    "./json/relations_2",
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
    "writer/view/text/TextArea",
    "writer/util/ViewTools"
], function(content,settings,relations,lang,Command, Range, domConstruct, TableTools, Numbering, MeasureText, tools, Document, UpdateManager, Relations, Settings, Styles, Table, UndoManager,  Run, Space, TextArea,ViewTools) {

    describe("writer.test.ut.column.endNotesLayout", function () {
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
                
        it("continuousLayout ", function() {
            var currentSection = documentView.settings.getFirstSection();
            currentSection.pageSize.h = 300;
            var currentPage = documentView.addPage(currentSection,documentView.pages.getLast());
            var para = documentView. getEndParaOfSection(currentSection);
            var body = currentPage.getFirstBody();
//            spyOn(documentView,'addPage');
            documentView.continuousLayout(para,currentSection,body,currentPage);
            expect(documentView.pages.length()).toBe(3);
//            currentPage = documentView.pages.getLast();
//            body = currentPage.container.getLast();
//            documentView.continuousLayout(para,currentSection,body,currentPage);
        });
        it("getEndNotesNeedToBalance ", function() {
            var notesMgr = documentView.relations.notesManager;
            var endnotes = notesMgr.endnotes;
            var para = endnotes[0];
            var currentSection = documentView.settings.getFirstSection();
            expect(documentView.getEndNotesNeedToBalance(para,currentSection)).not.toBe(null);
            
        });
        it("calculateRegionHeight ", function() {
            var currentSection = documentView.settings.getFirstSection();
            var para = documentView. getEndParaOfSection(currentSection);
            var start = documentView.getRelayoutStart(para,currentSection);
            var h = documentView.calculateRegionHeight(start,para,currentSection,0)
            expect(documentView.calculateRegionHeight(start,para,currentSection,500)).toBeGreaterThan(h);
            expect(documentView.calculateRegionHeight(start,para,currentSection,500,1.2)).toBeGreaterThan(h);
        });
        
       
        
    });
});
