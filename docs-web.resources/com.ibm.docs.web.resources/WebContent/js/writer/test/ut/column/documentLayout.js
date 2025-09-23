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
    "writer/view/text/TextArea",
    "writer/util/ViewTools",
    "writer/ui/dialog/PageSetup",
    "writer/plugins/UndoManager",
     "writer/msg/msgCenter"
], function(content,settings,relations,lang,Command, Range, domConstruct, TableTools, Numbering, MeasureText, tools, Document, UpdateManager, Relations, Settings, Styles, Table, UndoManager,  Run, Space, TextArea,ViewTools,pageSetup,undoManager,msgCenter) {

    describe("writer.test.ut.column.documentLayout", function () {
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
        
        it("pages layout check", function() {    
            expect(documentView.pages.length()).toBeLessThan(7);
        });
         it("insertSection Update", function() {
             var view = documentView.container.getFirst();
             while(view){
                 if(view.sectId)
                     break;
                 view = documentView.container.next(view);
             }
             var sectId = view.sectId;
             documentView.insertSection(view, view.sectId);
             documentView.update();
             expect(documentView._updatePageNumber).toHaveBeenCalled();
             expect(documentView._alignPages).toHaveBeenCalled();
        
        });
        it("insertSection have prev Section", function() {
             var view = documentView.container.getFirst();
             while(view){
                 if(view.sectId)
                     break;
                 view = documentView.container.next(view);
             }
             var sectId = pe.lotusEditor.setting.getNextSection(view.sectId).getId();
             sectId = pe.lotusEditor.setting.getNextSection(sectId).getId();
             view = documentView.container.prev(documentView.container.getLast());
             documentView.insertSection(view, sectId);
             documentView.update();
             expect(documentView._updatePageNumber).toHaveBeenCalled();
             expect(documentView._alignPages).toHaveBeenCalled();
        
        });
        it("insertSection at split", function() {
             var view = documentView.container.getFirst();
             while(view){
                 if(view.sectId)
                     break;
                 view = documentView.container.next(view);
             }
             var sectId = view.sectId;
             var newView = view.split(0,80,ViewTools.getBody(view));
             documentView.container.insertAfter(newView,view);
             documentView.insertSection(view, sectId);
             documentView.update();
             expect(newView.sectId).toBe(sectId);
                         
        
        });
        it("insertSection at delete view", function() {
             var view = documentView.container.getFirst();
             while(view){
                 if(view.sectId)
                     break;
                 view = documentView.container.next(view);
             }
             var sectId = view.sectId;
             var newView = view.split(0,80,ViewTools.getBody(view));
             newView._deleted = true;
             documentView.container.insertAfter(newView,view);
             documentView.insertSection(view, sectId);
             documentView.update();
             expect(view.sectId).toBe(sectId);

        });
        it("deleteSection split View", function() {
             var view = documentView.container.getFirst();
             while(view){
                 if(view.sectId)
                     break;
                 view = documentView.container.next(view);
             }
             var newView = view.split(0,80,ViewTools.getBody(view));
             documentView.container.insertAfter(newView,view);
             var sectId = newView.sectId;
             documentView.deleteSection(view, sectId);
             documentView.update();
             expect(documentView._updatePageNumber).toHaveBeenCalled();
             expect(documentView._alignPages).toHaveBeenCalled();
             expect(newView.sectId).toBeUndefined();
        });
        it("deleteSection update", function() {
             var view = documentView.container.getFirst();
             while(view){
                 if(view.sectId)
                     break;
                 view = documentView.container.next(view);
             }
             
             var sectId =view.sectId;
             documentView.deleteSection(view, sectId);
             documentView.update();
             expect(documentView._updatePageNumber).toHaveBeenCalled();
             expect(documentView._alignPages).toHaveBeenCalled();
             expect(view.sectId).toBeUndefined();
        });
        it("updatSection ", function() {
             var view = documentView.container.getFirst();
             while(view){
                 if(view.sectId)
                     break;
                 view = documentView.container.next(view);
             }
             var section = pe.lotusEditor.setting.getSection(view.sectId);
             documentView.updateSection();
             expect(documentView._updatePageNumber).not.toHaveBeenCalled();
             expect(documentView._alignPages).not.toHaveBeenCalled();
             
             documentView.updateSection(section);
             expect(documentView._updatePageNumber).toHaveBeenCalled();
             expect(documentView._alignPages).toHaveBeenCalled();
             
             section = pe.lotusEditor.setting.getNextSection(view.sectId);
             documentView.updateSection(section);
             expect(documentView.render).toHaveBeenCalled();

        });
        it("updateMultipleSections ", function () {
            documentView.updateSections = [] ;
            var section = documentView.settings.getLastSection();
            documentView.updateSections.push(section.getId());
            documentView.updateMultipleSections();
            expect(documentView._updatePageNumber).toHaveBeenCalled();
            expect(documentView._alignPages).toHaveBeenCalled();

        });
         it("update ", function () {
            documentView.updateSections = [] ;
            spyOn(documentView,'_updateBody');
            spyOn(documentView , 'updateMixSection');
            var section = documentView.settings.getFirstSection();
            var nextSection = documentView.settings.getNextSection(section);
            nextSection.setType(null);
            var body  = documentView.pages.getFirst().getFirstBody();
            documentView.addChangedView(body);
            documentView.update();
            expect(documentView._updateBody).toHaveBeenCalled();
            nextSection.setType("continuous");
            body  = documentView.pages.getFirst().getFirstBody();
            documentView.addChangedView(body);
            documentView.update(); 
            expect(documentView.updateMixSection).toHaveBeenCalled();
        });
        
        it("needBalance ", function() {
            expect(documentView.needBalance(null,null,null)).toEqual(false);
            var section = documentView.settings.getLastSection();
            var oldw = section.pageSize.w;
            section.pageSize.w = 400;
            var view = documentView.container.getFirst();
            expect(documentView.needBalance(view,section,ViewTools.getBody(view))).toBe(false);
            spyOn(view, 'getReferredFootNote').andCallFake(function(){
                return {
                    length: function (){
                        return 1;
                    }
                };
            });
            
            section.pageSize.w = oldw;
            
            expect(documentView.needBalance(view,section,ViewTools.getBody(view))).toBe(false);
            view = documentView.container.getLast();
            spyOn(view, 'getReferredFootNote').andCallFake(function(){
                return {
                    length: function (){
                        return 0;
                    }
                };
            });
           expect(documentView.needBalance(view,section,ViewTools.getBody(view))).not.toBe(false);
           section.pageSize = null
           expect(documentView.needBalance(view,section,ViewTools.getBody(view))).toBeNull();
            
        });
        it("getLastBodyInSection ", function() {
            expect(documentView.getLastBodyInSection(null,null)).toBeNull();
            var section = {
                getId: function () {
                    return " 0000000";
                }
            };
            var body = documentView.pages.getFirst().getFirstBody();
            expect(documentView.getLastBodyInSection(section,body)).toBeNull();
            
        });
        it("calH ", function() {
            var body = documentView.pages.getFirst().getFirstBody();
            var brekRet = body.getFirstAppendView();
            expect(documentView.calH(brekRet,body)).toBeGreaterThan(brekRet.cn.h);
            brekRet.fn = {};
            expect(documentView.calH(brekRet,body)).toBeGreaterThan(brekRet.cn.h);
            
        });
        
       it("page ---- deleteEmptySection ", function() {
            var startPage = documentView.pages.getFirst();
            var section = documentView.settings.getFirstSection();
            var page = documentView.addPage(section,startPage);
            spyOn(page.container,'remove');
            page.deleteEmptySection(section);
           expect(page.container.remove).toHaveBeenCalled();
            
        });
        
       it("plugins ---- PageSetup ", function() {
            pe.lotusEditor.layoutEngine.rootView = documentView;
           pe.lotusEditor.getSelection = function() {
	            return {
	                store: function() {},
	                restore: function() {},
	                getRanges: function() {
	                    return [];
	                },
	                selectRangesBeforeUpdate: function() {},
	                restoreBeforeUpdate: function() {},
	                updateHeaderFooter: function() {},
	                updateSelection: function(){},
                    scrollIntoView:function(){}
	            };
	        };
           var undoManager = new UndoManager({
	            editor: pe.lotusEditor
	        });
   	        undoManager.init();
            var pageSetup = new writer.ui.dialog.PageSetup();
           spyOn(documentView,'updateSection');
           //section w
            pageSetup.cur_value[1] = 10;
            pageSetup.updateSection();
            expect(documentView.updateSection).toHaveBeenCalled();
            
        });
        
    });
});
