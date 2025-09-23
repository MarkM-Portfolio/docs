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
    "writer/common/Container",
    "writer/constants",
    "writer/global",
    "writer/msg/msgCenter",
    "dojo/_base/declare",
    "dojo/topic"
], function(Container, constants, g, msgCenter, declare, topic) {

    var BlockContainer = declare("writer.model.update.BlockContainer", null, {
    	constructor:  function() {}
    });

    BlockContainer.prototype = {
        container: null,
        initContent: function(content) {
            this.container = new Container(this);
            if (content) {
                for (var i = 0; i < content.length; i++) {
                    var m = this.createSubModel(content[i]);
                    if (!m) {
                        console.info("unspport object!");
                    } else {
                        if (m.isContainer){
                            this.container.appendAll(m);
                            m.forEach(function(model){
                                model.buildGroup && model.buildGroup();
                            });
                        }
                        else {
                            this.container.append(m);
                            if (m.buildGroup)
                                m.buildGroup();
                        }
                    }
                }
            }
        },
        /**
         * check if its content empty
         */
        isContentEmpty: function() {
            if (this.container.isEmpty())
                return true;

            if (this.container.length() == 1) {
                // check if the text of the only one paragraph is ""
                var p = this.container.getFirst();
                if (p && constants.MODELTYPE.PARAGRAPH == p.modelType) {
                    if (p.getLength() == 0)
                        return true;
                }
            }

            return false;
        },
        /**
         * Get the message target by id
         * @param id
         */
        byId: function(id) {
            if (!id || id == 'body')
                return this;

            var retModel = null;
            retModel = window._IDCache.getById(id);
            if (retModel) {
                return retModel;
            }
            //		retModel = this.container.getById(id);
            !retModel && this.container && this.container.forEach(function(child) {
                if (child.id == id) {
                    retModel = child;
                    return false;
                } else {
                    var ret = child.byId(id);
                    if (ret) {
                        retModel = ret;
                        return false;
                    }
                }
            });
            // only paragraph need cache
            if (retModel && retModel.modelType == constants.MODELTYPE.PARAGRAPH)
                window._IDCache.addCache(id, retModel);
            return retModel;
        },
        getByIndex: function(index, adapte) {
            if(adapte)
                return this.container.getByAdapteIndex(index);
            return this.container.getByIndex(index);
        },
        indexOf: function(sub, adapte) {
            if (adapte)
                return this.container.adapteIndexOf(sub);
            return this.container.indexOf(sub);
        },
        insertBefore: function(para, tar) {
            if (tar)
                this.container.insertBefore(para, tar);
            else
                this.container.append(para);
            para.parent = this;

            if (para.modelType == constants.MODELTYPE.PARAGRAPH)
            	para.markNextToBorderDirty && para.markNextToBorderDirty();

            if (!this.isLoading)
                para.markInsert && para.markInsert();
            else
                para.notifyInsertToModel && para.notifyInsertToModel();

            if(pe.lotusEditor.setting.isTrackChangeOn() && g.modelTools.isTrackable(para) )
            	para.triggerTrackInfoUpdate && para.triggerTrackInfoUpdate("insert");

            para.triggerNavigationUpdate && para.triggerNavigationUpdate("insert");
        },
        insertAfter: function(para, tar) {
            if (tar)
                this.container.insertAfter(para, tar);
            else
                this.container.append(para);
            para.parent = this;

            if (para.modelType == constants.MODELTYPE.PARAGRAPH)
                para.markNextToBorderDirty && para.markNextToBorderDirty();

            if (!this.isLoading)
                para.markInsert && para.markInsert();
            else
                para.notifyInsertToModel && para.notifyInsertToModel();

            if(pe.lotusEditor.setting.isTrackChangeOn() && g.modelTools.isTrackable(para) )
            	para.triggerTrackInfoUpdate && para.triggerTrackInfoUpdate("insert");

            para.triggerNavigationUpdate && para.triggerNavigationUpdate("insert");
        },
        remove: function(para) {
            if (this.container.contains(para)) {
                if (para.modelType == constants.MODELTYPE.PARAGRAPH) {
                    para.markNextToBorderDirty && para.markNextToBorderDirty();
                    g.modelTools.releaseParagraphCache(para);
                }
                var chObjs = [];
                this.container.remove(para);
                para.markDelete && para.markDelete();
                if (para.changedModels)
                    para.changedModels.removeAll();
                if(pe.lotusEditor.setting.isTrackChangeOn() && g.modelTools.isTrackable(para) && (g.modelTools.isTable(para) || g.modelTools.isRow(para) || g.modelTools.isCell(para)))
                	para.triggerTrackInfoUpdate("delete");
            }
        },
        update: function(forceExecu) {
            if (this.delayUpdate && !forceExecu) {
                this.suspendUpdate();
                return;
            }
            this.updateChangeModel();
            var rootViews = this.getAllViews();
            for (var ownerId in rootViews) {
                var views = rootViews[ownerId];
                var v = views.getFirst();
                while (v) {
                    try {
                        v.update && v.update();
                        v = views.next(v);
                    } catch (e) {
                        console.log('update error : ' + e);
                        v = views.next(v);
                    }
                }
            }

        },
        suspendUpdate: function() {
            var parent = this.parent || (this.getUpdateTrigger && this.getUpdateTrigger());
            if (parent && parent.addSuspendedChild) {
                parent.addSuspendedChild(this);
            } else {
                pe.lotusEditor.updateManager.addChangedBlock(this);
            }
        },
        addSuspendedChild: function(child) {
            if (!this.suspendedChild) {
                this.suspendedChild = new Container(this);
            }
            if (!this.suspendedChild.contains(child)) {
                this.suspendedChild.append(child);
                this.suspendUpdate();
            }
        },
        getSuspendedChildren: function() {
            return this.suspendedChild;
        },
        clearSuspendChildren: function() {
            this.suspendedChild.removeAll();
        },
        addChangeModel: function(model) {
            if (!this.changedModels) {
                this.changedModels = new Container(this);
            }
            if (!this.changedModels.contains(model)) {
                this.changedModels.append(model);
            }
        },
        updateChangeModel: function() {
            if (this.changedModels && !this.changedModels.isEmpty()) {
                if (this.changedModels.length() > 1) {
                    // TODO The sort function has big performance problem.
                    var temp = this.getContainer().sort(this.changedModels);
                    delete this.changedModels;
                    this.changedModels = temp;
                }
                this.changedModels.forEach(function(m) {
                    m.update(true);
                });
                this.changedModels.removeAll();
                return true;
            }
            return false;
        },
        clearChangeModel: function() {
            this.changedModels && this.changedModels.removeAll();
        },
        getContainer: function() {
            return this.container;
        },
        getStyleId: function() {
            return this.styleId;
        },
        getAllParaOrTable: function() {
            var paras = [];
            this.container.forEach(function(curObj) {
                if (g.modelTools.isParaOrTable(curObj)) {
                    paras.push(curObj);
                }

            });

            return paras;
        },
        /**
         * Get all paragraphs in this document/table/Row/Cell/TOC.
         * Will be used in find/replace or spell check.
         * @returns Array
         */
        getParagraphs: function() {
            var paras = [];
            this.container.forEach(function(curObj) {
                if (g.modelTools.isParagraph(curObj)) {
                    paras.push(curObj);
                    if (curObj.AnchorObjCount > 0) {
                        // TODO, Track Change need filter out track deleted anchor?
                        curObj.container.forEach(function(run) {
                            if (g.modelTools.isAnchor(run) && run.getParagraphs)
                                paras = paras.concat(run.getParagraphs());
                        });
                    }
                } else
                    paras = paras.concat(curObj.getParagraphs());
            });

            return paras;
        },

        appendParagraph: function(text){
            var selection = pe.lotusEditor.getSelection();
            if (!selection)
                return;
            var ranges = selection.getRanges();
            if (!ranges)
                return;

            var msgs = [], range = ranges[0];
            var para = g.modelFac.createModel(g.modelTools.getEmptyParagraphSource(), this);
            this.insertAfter(para);
            msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(para)]));
        	msgCenter.sendMessage(msgs);
        	range && range.moveToPosition(para, 0);
            if(text && text.length> 0)
            	pe.lotusEditor._shell.insertText(text);
        	return para;
        },

        insertParagraph: function(index, text){
            var selection = pe.lotusEditor.getSelection();
            if (!selection)
                return;
            var ranges = selection.getRanges();
            if (!ranges)
                return;

            var msgs = [], range = ranges[0];
            var para = g.modelFac.createModel(g.modelTools.getEmptyParagraphSource(), this);
            var refNode = this.getByIndex(index);
            this.insertBefore(para, refNode);
            msgs.push(msgCenter.createMsg(constants.MSGTYPE.Element, [msgCenter.createInsertElementAct(para)]));
        	msgCenter.sendMessage(msgs);
        	range && range.moveToPosition(para, 0);
            if(text && text.length> 0)
            	pe.lotusEditor._shell.insertText(text);

        	return para;
        },

        getParaByTextOffset: function(offset) {
            var ret = {};
            var counter = parseInt(offset);
            if(isNaN(counter) || counter < 0)
            	counter = 0;

            var childs = this.container.nodes;
            for(var i=0;i< childs.length;i++) {
            	var curObj = childs[i];
                if (g.modelTools.isParagraph(curObj)) {
                    var len = curObj.getLength();
                    if(len > counter){
                    	ret.para = curObj;
                    	ret.offset = counter;
                    	return ret;
                    }
                    else
                    	counter = counter - len;

	                    if (curObj.AnchorObjCount > 0) {
	                        // TODO, Track Change need filter out track deleted anchor?
	                        curObj.container.forEach(function(run) {
	                            if (g.modelTools.isAnchor(run) && run.getParagraphs){
	                            	var m = run.getParaByTextOffset(counter);
	                            	if(m.para)
	                            		return m;
	                            	else
	                            		counter = m.offset;
	                            }
	                        });
	                    }
                } else {
                	var m = curObj.getParaByTextOffset(counter);
                	if(m.para)
                		return m;
                	else
                		counter = m.offset;
                }
            }

            ret.offset = counter;
            return ret;
        }
    };
    window._IDCache = {
        _cache: {},
        _size: 0,
        addCache: function(id, element) {
            var e = {};
            e.e = element;
            this._cache[id] = e;
            this._size++;
        },
        cleanCache: function() {
            this._cache = {};
            this._size = 0;
        },
        removeId: function(id) {
            if (id)
                delete this._cache[id];
        },
        getById: function(id) {
            if (this._cache[id]) {
                return this._cache[id].e;
            }
        }
    };
    return BlockContainer;
});
