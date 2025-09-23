/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
define([
	"dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/has",
    "dojo/i18n!writer/nls/lang",
    "dojo/topic",
    "writer/constants",
    "writer/model/update/BlockContainer",
    "writer/model/Model",
    "writer/common/tools",
    "writer/common/Container",
    "writer/model/update/Block_Container",
    "writer/template", 
    "writer/util/ModelTools"
], function(declare, lang, has, i18nlang, topic, constants, BlockContainer, Model, tools, Container, Block_Container, WriterTemplate, ModelTools) {
    var Document = declare("writer.model.Document", null, {
        constructor: function(content, layoutEngine) {
            //	this.source = content;  
            if (window._IDCache && window._IDCache.cleanCache)
                window._IDCache.cleanCache();

            this.layoutEngine = layoutEngine;
            this.id = "body";
            this._listsPendingUpdate = {};
            this.container = new Container(this);

            // Do partial loading for document, not for header/footer and footnote
            // TODO FIXME BOB
            if (has("mobile")) {
                this.FIRSTPART = 50;
                this.LOADNUM = 300; // 50 paragraphs
            } else {
                // First time load count
                this.FIRSTPART = 100;
                this.LOADNUM = 500;
            }
            this._src = null;
            this.nls = i18nlang;

            this.fromJson(content);
        }
    });

    Document.prototype = {
        modelType: constants.MODELTYPE.DOCUMENT,
        isEnablePartial: function() {
//             Can add configure for this.
//             Only partial load the document content.
//            		return false;
            if (this.modelType == constants.MODELTYPE.DOCUMENT)
                return true;
        },

        _partialLoad: function() {
            if (this._firstLoadHandler) {
                this._firstLoadHandler.remove();
                this._firstLoadHandler = null;
            }

            //		console.info("Current time for Partial loading: " + ((new Date()) - this._startTime) + ". Remaining paragraph count is: " + (this._src && this._src.length));
            //		console.profile("Partial loading");
            this.isLoading = true;
            if (this._src) {
                //			var loadCnt = this._src.length;
                var loadCnt = this.LOADNUM;
                // Desktop will load remained content.
                // Mobile load configured paragraphs.
                //			if(loadCnt > this.LOADNUM)
                //			{
                //				loadCnt = this.LOADNUM;
                //				setTimeout(dojo.hitch(this, this._partialLoad),10);
                //			}

                var c, m;
                var start = this.container.getLast();
                for (var i = 0; i < loadCnt && this._src.length > 0; i++) {
                    c = this._src.shift();
                    m = this.createSubModel(c);
                    if (!m) {
                        console.info("unspport object!");
                    } else {
                        this.loadModel(m);
                        if (m && m.buildGroup){
                            m.buildGroup();
                        }
                        if (ModelTools.isTable(m)) {
                            i = i + m.rows.length() * 4;
                        }
                    }
                }
                var end = null;
            }

            if (pe.lotusEditor.inPartialLoading) {
                delete this.isLoading;
                this._updateList();
                topic.publish(constants.EVENT.PREMEASURE);
                if (ModelTools.isTrackBlockGroup(start.parent)) {
                    start = start.parent;
                }
                this.partialLayout(start, end);
            }

            if (!this._src || this._src.length == 0) {
                // Not in partial loading will publish writer.constants.EVENT.LOAD_READY event in layout engine.
                //			if(pe.lotusEditor.inPartialLoading)
                {
                    //var str = this.nls.LOAD_FINISHED;
                    setTimeout(function() {
                    	pe.scene.hideErrorMessage();
                        //pe.scene.showInfoMessage(str, 3000);
                        topic.publish(constants.EVENT.LOAD_READY);
                        pe.lotusEditor.updateManager.update(true);
                    }, 0);

                    var curTime = new Date();
                    //				console.info("Total time for Partial loading: " + (curTime - this._startTime));
                }
                delete this.isLoading;
                delete this._startTime;
                delete pe.lotusEditor.inPartialLoading;
                delete this._src;
            } else {
                setTimeout(lang.hitch(this, this._partialLoad), 10);
            }

            //		console.profileEnd();
        },

        fromJson: function(content) {
            this.isLoading = true;
            if (content) {
                var cntJsonSize = JSON.stringify(content).getBytesLength();
                if (this.isEnablePartial()) {
                    var loadCnt = this.FIRSTPART;
                    //				pe.scene.showWarningMessage(this.nls.LOADING);
                    // TODO Disable Command in partial loading
                    // Block Apply message
                    pe.lotusEditor.inPartialLoading = true;
                    this._src = content;
                }
                if (this.modelType == constants.MODELTYPE.DOCUMENT) {
                    //				console.info("Document paragraph count is:" + content.length);
                    this._startTime = new Date();
                    this._firstLoadHandler = topic.subscribe(constants.EVENT.FIRSTTIME_RENDERED, lang.hitch(this, this._partialLoad));
                }

                var c, m;
                for (var i = 0; i < loadCnt && content.length > 0; i++) {
                    c = content.shift();
                    m = this.createSubModel(c);
                    if (!m) {
                        console.info("unspport object!");
                    } else {
                        this.loadModel(m);
                        if (m && m.buildGroup){
                            m.buildGroup();
                        }
                        if (ModelTools.isTable(m) && this.isEnablePartial()) {
                            i = i + m.rows.length() * 4;
                        }
                    }
                }
                if (content.length == 0)
                    pe.lotusEditor.inPartialLoading = false;
            }
            delete this.isLoading;
            this._updateList();
        },
        append: function(jsonArray) {
            this.broadcast("append", {
                "models": jsonArray
            });
        },
        changeStyle: function(styleId, style) {

        },
        /**
         * Default document style
         * @returns
         */
        getDefaultStyle: function() {
            return pe.lotusEditor.getRefStyle(constants.STYLE.DEFAULT);
        },
        addPendingUpdateList: function(numId, list) {
            if (this.modelType != constants.MODELTYPE.DOCUMENT || pe.lotusEditor.inPartialLoading || this.isLoading)
                this._listsPendingUpdate[numId] = list;
        },
        _updateList: function() {
            for (var it in this._listsPendingUpdate) {
                var list = this._listsPendingUpdate[it];
                list.updateListValueNow();
            }
            this._listsPendingUpdate = {};
        },
        loadModel: function(model) {
            if (model.isContainer) {
                this.container.appendAll(model);
                model.forEach(function(m) {
                    m.notifyInsertToModel();
                });
            } else {
                this.container.append(model);
                model.notifyInsertToModel();
            }
        },
        partialLayout: function(start, end) {
            var rootView = layoutEngine.rootView;
            rootView.partialLayout(start, end);
        },
        delayUpdate: true,
        /*
         * forceExecu if the value is true the document view will be updated
         * 
         * 
         */
        update: function(forceExecu) {
            if (this.delayUpdate && !forceExecu) {
                this.suspendUpdate();
                return;
            }
            //		dojo.publish(writer.constants.EVENT.BEGINUPDATEDOCMODEL);
            var updateModel = this.updateChangeModel();
            if (updateModel && this.changeNotes) {
                var firstNote = this.changeNotes.getFirst();
                while (firstNote) {
                    firstNote.toBeUpdate();
                    firstNote = this.changeNotes.next(firstNote);
                }
                this.changeNotes.removeAll();
            }
            //		dojo.publish(writer.constants.EVENT.ENDUPDATEDOCMODEL);
            if (this.changeNotes && !updateModel) {
                var executeUpdate = function(model) {
                    var suspendChildren = model.getSuspendedChildren();
                    suspendChildren && suspendChildren.forEach(function(subModel) {
                        executeUpdate(subModel);
                    });
                    model.update(forceExecu);
                    suspendChildren && model.clearSuspendChildren();
                };
                var firstNote = this.changeNotes.getFirst();
                while (firstNote) {
                    executeUpdate(firstNote);
                    firstNote = this.changeNotes.next(firstNote);
                }
                this.changeNotes.removeAll();
            }
            if (layoutEngine.rootView)
                layoutEngine.rootView.update();
        },
        addSuspendedChild: function(child) {
            if (child.modelType == constants.MODELTYPE.FOOTNOTE || child.modelType == constants.MODELTYPE.ENDNOTE) {
                this.changeNotes = this.changeNotes || new Container(this);
                if (!this.changeNotes.contains(child)) {
                    this.changeNotes.append(child);
                }
                this.suspendUpdate();
                return;
            }
            if (!this.suspendedChild) {
                this.suspendedChild = new Container(this);
            }
            if (!this.suspendedChild.contains(child)) {
                this.suspendedChild.append(child);
                this.suspendUpdate();
            }
        },
        getCurrentSection: function(para) {
            var setting = pe.lotusEditor.setting;
            if(!this.container.contains(para))
                return null;
             while(para){
                var sect = para && para.directProperty && para.directProperty.getSectId();
                if(sect){
                    return sect;
                }
                para = this.container.next(para);
            }
            return setting.getSection("default").getId();
        },
        getNextSec: function(sectId) {
            if (!sectId)
                return null;
            sectId = sectId.id || sectId;
            if (!sectId)
                return null;
            var setting = pe.lotusEditor.setting;
            var defaultId = setting.getSection("default").getId();
            if (sectId == defaultId)
                return null;
            var para = this.container.getFirst();
            var findNext = false; 
            while(para){
                var sect = para && para.directProperty && para.directProperty.getSectId();
                if (sect && findNext){
                    return sect;
                }
                if(sect && sect == sectId)
                    findNext = true; 
                para = this.container.next(para);
            } 
            return defaultId;
        },
        getPrevSec: function(sectId){
            if (!sectId)
                return null;
            sectId = sectId.id || sectId;
            if (!sectId)
                return null;

            var para = this.container.getLast();
            var findPrev = false; 
            while(para){
                var sect = para && para.directProperty && para.directProperty.getSectId();
                if (sect && findPrev){
                   return sect;
                }
                if (sect && sect == sectId)
                    findPrev = true; 
                para = this.container.prev(para);
            }
            return null;
        },
        hasDiffSizePages: function() {
        	return pe.lotusEditor.setting.hasDiffSizeSects();
        },
        convertToMD: function() {
        	var result = {};
        	var mdStr = "", images = [];
        	for(var i=0;i<this.container.length();i++) {
        		var item = this.container.getByIndex(i);
        		if(item && item.toMarkdown) {
        			var imd = item.toMarkdown();
        			mdStr += imd.text;
        			imd.images && (images = images.concat(imd.images));
        		}
        	}
        	result.text = mdStr;
        	result.images = images;
			return result;
        },
        
        toJson: function() {
           	var result = {};
           	var bv = [];

        	for(var i=0;i<this.container.length();i++) {
        		var m = this.container.getByIndex(i);
        		if(m && m.toJson){
        			var mj = (ModelTools.isParagraph(m) ? m.toJson(null, null, true) : m.toJson());
        			bv.push(mj);
        		}
        	}
        	result.body = bv;
			return result;        	
        },

        toHtml: function() {
        	var htmlStr = "";
        	for(var i=0;i<this.container.length();i++) {
        		var item = this.container.getByIndex(i);
        		if(item && item.toHtml) {
        			htmlStr += item.toHtml();
        		}
        	}
			return htmlStr;
        },

        getData: function(type){
        	var data = "";
        	if(type == "json"){
     		   var docJson = {};
    		   docJson.content = this.toJson();
    		   docJson.styles = WriterTemplate.getTemplateJson("styles");
    		   docJson.settings = WriterTemplate.getTemplateJson("settings");
    		   docJson.numbering = WriterTemplate.getTemplateJson("numbering");
    		   docJson.relations = WriterTemplate.getTemplateJson("relations");
    		   data = JSON.stringify(docJson);
        	} else if (type == "html") {
        		data = this.toHtml();
//        		var content = this.toJson();
//				var toHtmlFilter = new JsonToHtml();
//				data = toHtmlFilter.toHtml(content.body);
//    		    var mainNode = pe.lotusEditor.getEditorDIV();
//   		    data = "<html>" + mainNode.outerHTML + "</html>";
        	} else if (type == "md") {
        		var markdownData = this.convertToMD();
        		data = markdowndData.text;
        	}
        	
        	return data;
        }
    };
    tools.extend(Document.prototype, new BlockContainer());
    tools.extend(Document.prototype, new Block_Container());
    tools.extend(Document.prototype, new Model());
    return Document;
});
