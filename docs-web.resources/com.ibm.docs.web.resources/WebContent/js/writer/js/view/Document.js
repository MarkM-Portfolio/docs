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
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/has",
    "dojo/topic",
    "writer/util/ViewTools",
    "writer/util/ModelTools",
    "writer/util/SectionTools",
    "concord/util/acf",
    "concord/util/browser",
    "concord/util/BidiUtils",
    "writer/common/Container",
    "writer/common/tools",
    "writer/constants",
    "writer/model/Document",
    "writer/model/Model",
    "writer/view/AbstractView",
    "writer/view/Page",
    "writer/view/update/BlockContainerView",
    "writer/view/update/DocumentUpdate",
    "dojo/i18n!writer/nls/lang"
], function(lang, domClass, domConstruct, has, topic, ViewTools,ModelTools, SectionTools, acf, browser, BidiUtils, Container, tools, constants, Document, Model, AbstractView, Page, BlockContainerView, DocumentUpdate, i18nlang) {

    var DocumentView = function(model) {
        this.model = model;
        this.layoutEngine = model.layoutEngine;
        this.domNode = null;
        this.pages = new Container(this);
        this.renderedPages = [];
        // this used to put some pages that need update dom.
        // will be empty after this.render()
        this._pageUpdateFrom = null;
        this.settings = pe.lotusEditor.setting;
        this.relations = pe.lotusEditor.relations;
        this.init();
    };
    DocumentView.prototype = {
        ownerId: "rootView",
        needReleaseDom: false,
        model: null,
        layoutEngine: null,
        domNode: null,
        pages: null,
        _topMargin: 20,
        //define the document's left position
        docLeft: null, //300,
        //define the document's center position, if the page's width is 768px, then the page's left is : 384 - 768/2 = 0
        docCenter: 384,
        //partial render, the number of pages to be shown one time
        NUM_PRE_PAGES: 3,
        NUM_NEXT_PAGES: 4,
        height: 0,
        settings: null,
        relations: null,
        init: function() {
    		if (pe.scene.isNote())
    		{
    			this.docCenter = 0;
    			this._topMargin = 0;
    		} else {
    			this.docCenter = pe.lotusEditor.placeholder.w / 2 ;
    		}

            if (browser.isMobile())
                this.needReleaseDom = true;
            else if (has("ie") == 9) {
                this.needReleaseDom = true;
            } else if ((has("ie") || has("trident"))) {
                this.needReleaseDom = true;
                this.NUM_PRE_PAGES = 2 * this.NUM_PRE_PAGES;
                this.NUM_NEXT_PAGES = 2 * this.NUM_NEXT_PAGES;
            }

            var that = this;
            this._handler = topic.subscribe(constants.EVENT.LOAD_READY, function() {
                that._loadFinished = true;
                that._loadedPageCount = that.pages.length();
                topic.publish(constants.EVENT.PAGE_NUMBER_CHANGED);
                if (that._handler != null) {
                    that._handler.remove();
                    that._handler = null;
                }
            });

            if (this.relations) {
                var fnote = this.relations._relations["footnotes"];
                if (fnote) {
                    this.model.fnote = fnote;
                    this.footNote = new Container(this);
                }
            }
            this.container = new Container(this);
            var contents = this.model.container;
            var c = contents.getFirst();
            while (c) {
                var next = contents.next(c);
                var m = c.preLayout(this.getOwnerId());
                this.container.append(m);
                c = next;
            }
            //transfer in to px
            if (this.sects) {
                for (var i = 0; i < this.sects.length; i++) {
                    //TODO:
                }
            }

            this.docLeft = pe.scene.getEditorLeft();
            if (this.model.modelType == constants.MODELTYPE.DOCUMENT) {
                pe.scene.addResizeListener(lang.hitch(this, this.onEditorResized));
                var that = this;
                var handler = topic.subscribe(constants.EVENT.LOAD_READY, function() {
                    that._loadReady = true;
                    handler.remove();
                });
            }
            if (!this._layoutEndnoteEachSect()) {
                topic.subscribe(constants.EVENT.LOAD_READY, lang.hitch(this, this._appendEndNotesInSect));
            }
        },
        onEditorResized: function(left) {
            this.docLeft = left;
            var page = this.pages.getFirst();
            while (page) {
                page.updateLeftAttr(this);
                page = this.pages.next(page);
            }
            //		this.render(pe.lotusEditor._shell._mainNode.scrollTop);
            this.render(pe.lotusEditor.getScrollPosition());
            if(pe.scene.isShowNaviPanel && pe.scene.isShowNaviPanel())
            	pe.lotusEditor.getSelection()._checkCursor();
        },
        getViewType: function() {
            return 'text.Document';
        },
        /**
         * Get the page number when the document has no change.
         * Return -1 means the document has not load finished.
         * @returns {Boolean}
         */
        getOriginalPageCount: function() {
            if (this._loadedPageCount)
                return this._loadedPageCount;
            else
                return -1;
        },
        getPageCount: function() {
            return this.pages.length();
        },
        getPages: function() {
            return this.pages;
        },
        /**
         * Page number start from 1.
         * @param pageNumber
         */
        getPage: function(pageNumber) {
            return this.pages.getByIndex(pageNumber - 1);
        },
        getContainer: function() {
            return this.pages;
        },
        getBlockViews: function() {
            return this.container;
        },
        getParent: function() {},

        getContentLeft: function() {
            return 0;
        },
        getContentTop: function() {
            return this._topMargin;
        },

        getChildPosition: function(idx) {
            var page = this.pages.getByIndex(idx);
            if (!page) {
                page = this.container.getLast();
                return page.getChildPosition();
            } else {
                return page.getChildPosition(0);
            }
        },
        getScrollPage: function(startPosition) {
            if (!startPosition) {
                startPosition = 0;
            }

            var page = this.pages.select(function(page) {
                if (page.getBottom() > startPosition) {
                    return true;
                }
            });

            return page;
        },
        getRenderContext: function(startPosition, isAll) {
        	var ret = {};
        	if(isAll) {
        		ret.preNum = ret.startPosition = 0;
        		ret.prePage = ret.page = this.pages.getFirst();
        		ret.nextNum = ret.lcnt = this.pages.length();
        	} else {
                if (!startPosition)
                	startPosition = 0;
                else
                	startPosition = startPosition / pe.lotusEditor.getScale();
                ret.startPosition = startPosition;

                /*
                 * partial render: find previous pages
                 */
                var scale = pe.lotusEditor.getScale();
                var preNum = this.NUM_PRE_PAGES,
                    nextNum = this.NUM_NEXT_PAGES;

                if (scale <= 0.5) {
                    preNum *= 2;
                    nextNum *= 2;
                } else if (scale <= 0.75) {
                    preNum = Math.ceil(preNum / 0.75);
                    nextNum = Math.ceil(nextNum / 0.75);
                }
                ret.preNum = preNum;
                ret.nextNum = nextNum;

                var page = this.pages.select(function(page) {
                    if (page.getBottom() > startPosition) {
                        pe.lotusEditor.currFocusePage = page;
                        return true;
                    }
                });
                if (!page) {
                    // if not page, it should be the current pages smaller than previous pages, 
                    // for sample before change style, the document includes 2 pages, when change font size smaller, the document may includes one page
                    page = this.pages.getLast();
                }

                var prePage = page;
                var preCount = 0;
                while (prePage && preCount < preNum) {
                    var prePage = this.pages.prev(prePage);
                    if (prePage) {
                        ++preCount;
                        page = prePage;
                    }
                }

                ret.lcnt = nextNum + preCount;
                ret.prePage = prePage;
                ret.page = page;
        	}
        	return ret;
        },
        render: function(startPosition, isAll, autoRelease) { // the parameter 'autoRelease' is to set this.renderedPages, to prepare data for release dom.
            if (!this.domNode) {
                this.domNode = this.createDomNode();
                var plNode = this.layoutEngine.editor.placeholder.rootNode;
                var refNode = plNode && plNode.nextSibling;
                var parentNode = this.layoutEngine.editor.getEditorDIV();
                if(refNode)
                	parentNode.insertBefore(this.domNode, refNode);
                else
                	parentNode.appendChild(this.domNode);
            } else {
                //update the editor area's height
                var trans = (this._loadReady && !pe.lotusEditor.inZoom) ? "transition: all 0.3s ease 0s;" : "";
                this.domNode.style.cssText = "position: absolute; left: " + this.docLeft + "px; height:" + this.height + "px;" + this.getStyleStr() + trans;
            }

            var rContext = this.getRenderContext(startPosition, isAll);
            var page = rContext.page, 
                prePage = rContext.prePage,
                lcnt = rContext.lcnt;

            // Render Page frame.
            while (prePage) {
                var pageNode = prePage.renderFrame();
                if (pageNode && (!pageNode.parentNode || pageNode.parentNode != this.domNode))
                    this.domNode.appendChild(pageNode);

                prePage = this.pages.prev(prePage);
            }

            /*
             * find render needed all previous & next pages
             */
            var count = 0;
            var needRenderPages = [];
            while (page && count++ < lcnt) {
                needRenderPages.push(page);
                page = this.pages.next(page);
            }

            // Render Page frame.
            while (page) {
                var pageNode = page.renderFrame();
                if (pageNode && (!pageNode.parentNode || pageNode.parentNode != this.domNode))
                    this.domNode.appendChild(pageNode);
                page = this.pages.next(page);
            }
            // in mobile and after printing, release rendered page
            if (this.renderedPages && this.renderedPages.length > 0 && ((this.renderedPages.length + needRenderPages.length) > lcnt)) {
                var ifCon = function(item, con) {
                    for (var j = 0; j < con.length; ++j) {
                        if (con[j] == item)
                            return true;
                    }

                    return false;
                };
                for (var i = 0; i < this.renderedPages.length; ++i) {
                    var rPage = this.renderedPages[i];
                    // defect 45832, here we have to check if the rPage has been removed.
                    // if the rPage has been removed, its children node may be reused by new pages, so
                    // here we should not release the deleted page's dom.
                    if (!ifCon(rPage, needRenderPages) && !rPage.isDeleted()) {
                        var pNode = rPage.getDomNode();
                        if (pNode && pNode.parentNode == this.domNode)
                            this.domNode.removeChild(pNode);

                        rPage.releaseDom();
                    }
                }
            }

            if (this.renderedPages && this.renderedPages.length > 0)
                this.renderedPages = [];

            // partial render
            for (var i = 0; i < needRenderPages.length; ++i) {
                var nrPage = needRenderPages[i];
                var pageDomNode = nrPage.getDomNode();
                var isPageFrame = (pageDomNode && !pageDomNode.firstChild);
                var pageNode = nrPage.render();
                if (!pageNode.parentNode || pageNode.parentNode != this.domNode) {
                    this.domNode.appendChild(pageNode);
                    topic.publish(constants.EVENT.PAGECREATED, nrPage);
                } else if (isPageFrame)
                    topic.publish(constants.EVENT.PAGECREATED, nrPage);
            }
            if (this.needReleaseDom || autoRelease)
                this.renderedPages = needRenderPages;

            // update dom if the page from here has been rendered.
            if (this._pageUpdateFrom && !this._pageUpdateFrom.isDeleted()) {
                var updatePage = this._pageUpdateFrom;
                while (updatePage) {
                    if (updatePage.domNode) {
                        if (updatePage.domNode.firstChild)
                            updatePage.render();
                        else
                            updatePage.renderFrame();
                    }
                    updatePage = this.pages.next(updatePage);
                }
            }
            this._pageUpdateFrom = null;
    		if (pe.scene.isNote())
    			this.domNode.style.height = "auto";
            return this.domNode;
        },
        createDomNode: function() {
            var div = domConstruct.create("div", {
                "class": "document editingBody" + this.getCSSStyle(),
                "style": "position: absolute; left: " + this.docLeft + "px; height:" + this.height + "px;" + this.getStyleStr()
            });
    		if (pe.scene.isNote())
    			div.style.height = "auto";
    		return div;
        },
        getStyle: function() {
            return this.model.getStyle();
        },
        getCSSStyle: function() {
            return this.model.getCSSStyle();
        },
        getStyleStr: function() {
            var style = this.getStyle();
            var str = "";
            for (var n in style) {
                str += n + ":" + style[n] + ";";
            }
            str = acf.escapeXml(str, true);
            return str;
        },
        removeEmptyPage: function(page) {
            if (!page) {
                console.log("ERROR: argument page can not bu null");
                return;
            }
            var next = this.pages.next(page);
            this.pages.remove(page);
            page.destroy();
            if (page.domNode && page.domNode.parentNode == this.domNode) {
                this.domNode.removeChild(page.domNode);
                page.domNode = null;
                /*
                try{
                	setTimeout(function(){
                		dojo.destroy(page.domNode );
                	}, 100);	
                }catch(e){
                	console.error(e);
                }*/
            }

            if (next) {
                this._alignPages(next);
            }
            this._updatePageNumber(next);
            this.height = this.pages.getLast().getBottom();
        },

        /**
         * 
         * @param section optional, if null, use the same section as previuos page
         * @param previousPage, optional, if null, add the first page
         * @returns {___page0}
         */
        addPage: function(section, previousPage) {
            if (!section) {
                if (previousPage) {
                    console.log("WARNING: section argument is not used, so use the same section with previous page");
                    section = previousPage.section;
                } else {
                    console.log("WARNING: section argument is not used, so use the first section");
                    section = this.settings.getFirstSection();
                }
            }
    		if (pe.scene.isNote())
    		{
    			pe.scene.noteSection = section;
    			pe.scene.checkNoteSection(section);
    		}

            if (!section) {
                console.log("ERROR: no section, don't know how to create page");
            }
            var page = new Page(this, section, previousPage);
            page.addBodies(section);
            //		page.parent= this;
            if (previousPage) {
                this.pages.insertAfter(page, previousPage);
            } else {
                //create the first page
                var first = this.pages.getFirst();
                if (first) {
                    this.pages.insertBefore(page, first);
                } else {
                    this.pages.append(page);
                }

            }
            this._alignPages(page);
            this._updatePageNumber(this.pages.next(page));

            // the old pages after the new page, must be imediatly updated the old dom
            // to avoid old page will overlap with new rendered pages.
            if (!this._pageUpdateFrom)
                this._pageUpdateFrom = this.pages.next(page);

            this.height = this.pages.getLast().getBottom();
            return page;
        },
        // update the page number from startPage, if startPage == null, nothing to do.
        _updatePageNumber: function(startPage) {
            if (!this._loadFinished)
                return;

            if (!this.pages) {
                console.log("ERROR: no page is found!");
                return;
            }

            var current = startPage;
            while (current) {
                current.updatePageNumber();
                current = this.pages.next(current);
            }

            topic.publish(constants.EVENT.PAGE_NUMBER_CHANGED);
        },
        _alignPages: function(startPage) {
            if (!this.pages) {
                console.log("ERROR: no page is found!");
                return;
            }
            var previous, current;
            if (!startPage) {
                //startpage is not used, so I align all pages;
                previous = this.pages.getFirst();
                previous.top = 0;
            } else {
                previous = this.pages.prev(startPage);
            }
            if (!previous) {
                previous = startPage;
            }
            while (true) {
                current = this.pages.next(previous);
                if (!current) {
                    break;
                }
                current.top = previous.getBottom() + this._topMargin;
                previous = current;
            }
            this.height = this.pages.getLast().getBottom();
        },
        _layoutEndnoteEachSect: function() {
            var endnotePr = this.settings.getEndnotePr();
            if (endnotePr && endnotePr.isEndSect() && this.settings.getSectionLength() > 1) {
                return true;
            } else {
                return false;
            }
        },
        /**
         * 
         * @param prevPara, the paragraph before the starting paragraph to be layed out, if null, layout from the first paragraph
         * @param nextPara, the paragraph after the ending paragraph to be layed out, if null, layout till the last paragraph
         */
        layout: function(prevPara, nextPara, isLastBlock) {
            var currentSection, para, prevPage;
            var currentPage, body;
            var sectionRecord = [];
            if (prevPara) {
                prevPage = ViewTools.getPage(prevPara);
                para = this.container.next(prevPara);
                if (prevPara.directProperty && prevPara.directProperty.getSectId()) {
                    currentSection = this.settings.getNextSection(prevPara.directProperty.getSectId());
                } else {
                    body = ViewTools.getBody(prevPara);
                    var toMarkDirty = body;
                    currentPage = body && body.getParent();
                    while (toMarkDirty) {
                        toMarkDirty.markDirtyDOM();
                        toMarkDirty = currentPage.getNextBody(toMarkDirty)
                    }
                    currentSection = body && body.section;
                }
            } else {
                prevPage = null;
                currentSection = this.settings.getFirstSection();
                para = this.container.getFirst();
            }
            if (!body) {
                currentPage = this.addPage(currentSection, prevPage);
                body = currentPage.getFirstBody();
            }

            var breakFn = null,
                noBidiWarning = true;
            var _cache = {};
            while (para && para != nextPara) {
                if (!window.BidiUtils.isBidiOn() && noBidiWarning &&
                    para.directProperty && para.directProperty.getDirection() == "rtl")
                    noBidiWarning = false;

                // need to release the para's layout result
                var breakRet = body.append(para, breakFn, _cache);
                if (breakRet) {
                    if (breakRet.cn) {
                        if (breakRet.cn != para) {
                            this.container.insertAfter(breakRet.cn, para);
                        } else {
                            para = this.container.prev(para);
                        }
                    }
                    breakFn = breakRet.fn;
                    var tempBody = body;
                    body = body.next(true,true);
                    if(!body){
                    	// when the body is not big enough(height) for content ,there might be empty section
                        if (currentPage.isEmptySection(tempBody.getSection())) {
                            currentPage.deleteEmptySection(tempBody.getSection());
                        }
                        currentPage = this.addPage(currentSection, currentPage);
                        body = currentPage.getFirstBody();                            
                     }
                    
                }
                if (!breakRet) {
                    if ((this.isLastBlockInsect(para) || isLastBlock)) {
                        var sectId = para && para.directProperty && para.directProperty.getSectId();
                        var tempPara = para ? this.container.next(para) : null;
                        if (sectId && sectId != "" && tempPara && nextPara != tempPara) {
                            var nextSection = this.settings.getNextSection(currentSection);
                            //start a new section
                            if (nextSection) {
                                if (this.needBalance(para, nextSection, body, _cache)) {
                                    // next section is continuous, and current section has no footnote, need re-layout to be balance.
                                    var result = this.continuousLayout(para, currentSection, body, currentPage);
                                    body = result.body;
                                    para = result.para;
                                    currentPage = ViewTools.getPage(body);
                                } else {
                                    //deal with it as next Page type Section
                                    currentPage = this.addPage(nextSection, currentPage);
                                    body = currentPage.getFirstBody();
                                    // if this para is the last para for the currentSection, it is the time to layout the endnote for the current section
                                    if (sectionRecord && sectionRecord.indexOf(currentSection) < 0)
                                        sectionRecord.push(currentSection);
                                }
                                currentSection = nextSection;
                            }
                        } else {
                            if (sectionRecord && sectionRecord.indexOf(currentSection) < 0)
                                sectionRecord.push(currentSection);
                        }
                    }
                }
                para = para ? this.container.next(para) : null;

            }
            if (!noBidiWarning && !pe.scene.isHTMLViewMode())
                pe.scene.showTextMessage(i18nlang.BIDI_CONTENT_EDITING, 8000);

            while (breakFn) {
                var breakRet = body.append(null, breakFn);
                if (breakRet) {
                    breakFn = breakRet.fn;
                    body = body.next(false);
                    if (!body) {
                        currentPage = this.addPage(currentSection, currentPage);
                        body = currentPage.getFirstBody();
                    }
                } else {
                    breakFn = null;
                }
            }
           /*	this.appendEndNote();*/
            if (sectionRecord && sectionRecord.length > 0 && this._layoutEndnoteEachSect()) {
                for (var i = 0; i < sectionRecord.length; i++) {
                    this._appendEndNotesInSect(sectionRecord[i]);
                }

            }
            if (nextPara) {
                this._alignPages(currentPage);
            }

            this.height = this.pages.getLast().getBottom();
        },
        // check if the section(para in) need to be re-layouted to be balance.
        // three conditions, no footnote ,nextSection is continue type and nextSection's Pagesize.w is equal to current page.
        needBalance: function (para, nextSection, body, _cache) {
            if (!nextSection || !nextSection.isContinuous())
                return false;
            //if para has footNote ,no need to balance
            var refFootnote = para.getReferredFootNote(_cache);
            var hasNoFootNote = !refFootnote || refFootnote.length() === 0;
            // if current page has footNotes no need to balance
            // check every body, make sure each body have no footnote.
            var prevBody = body;
            var isEmptyFootNote = true;
            while (prevBody && isEmptyFootNote) {
                isEmptyFootNote = isEmptyFootNote && prevBody.getFootNoteArea().isEmpty();
                prevBody = prevBody.prevBody(true, true);
            }
            var page = ViewTools.getPage(para);
            var isSamePageWidth = page && page._pageSize && nextSection && nextSection.pageSize ;
            if(isSamePageWidth){
               if(Math.abs(page._pageSize.w - nextSection.pageSize.w) > 3)
                   isSamePageWidth = false;
            }
            var needBalance = hasNoFootNote && isEmptyFootNote && isSamePageWidth;
            return needBalance;
        },
        continuousLayout: function (para, currentSection, body, currentPage) {
        // after layout the content of  current section, there might be endnoted need to layout out
            var endNotes = this.relations.notesManager.getEndNoteViewInSect(currentSection);
            if (!endNotes || endNotes.length() == 0 || !this._layoutEndnoteEachSect()) {
                body = this.testLayout(para, currentSection);
            } else {
                while (endNotes && endNotes.length() != 0) {
                    endNotes = body.appendEndNote(endNotes);
                    if (endNotes && endNotes.length() != 0) {
                        body = body.next(false, true);
                        if (!body) {
                            currentPage = this.addPage(currentSection, currentPage);
                            body = currentPage.getFirstBody();
                        }
                    } else {
                        var currentEN = body.getEndNoteArea().getLast();
                        // we balance after endnotes has been layouted 
                        body = this.testLayout(currentEN, currentSection);
                    }
                }
            }
            var nextSection = this.settings.getNextSection(currentSection);
            var offsetOfPage = currentPage.getUsedHeightBeforeBody(null);
            //left height in current page > 5 create new bodies. 10 is magic number.
            if (currentPage.initHeight() - offsetOfPage > 5) {
                var top = body.getHeight() + body.getTop();
                var height = ViewTools.getPage(body).initHeight() - offsetOfPage;
                currentPage.addBodies(nextSection, top, height);
                body = this.getLastBodyInSection(currentSection, body);
                body = currentPage.container.next(body);
            } else {
                currentPage = this.addPage(nextSection, currentPage);
                body = currentPage.getFirstBody();
            }
            //return end of current section and body will be layouted on
            return {
                body: body,
                para: this.getEndParaOfSection(currentSection)
            };
        },
        getEndParaOfSection: function (currentSection, sContainer) {
        	if(!sContainer)
        		sContainer = this.container;
            var lastPara = sContainer.getFirst();
            while (lastPara) {
                var end = lastPara.sectId;
                if (end && currentSection.id == end)
                    break;

                if(lastPara.isBlockContainer && lastPara.container) {
            		end = this.getEndParaOfSection(currentSection, lastPara.container);
            		if(end)
            			break;
            	}

             	lastPara = sContainer.next(lastPara);
            }
            return lastPara;
        },
        getLastBodyInSection: function (section, body, samepage) {
            if (!section) {
                console.error("please send section ");
                return null;
            }
            var isSamePage = samepage ? true : false;
            if (!body) {
                var page = this.pages.getFirst();
                body = page.getFirstBody();
                while (body) {
                    if (body.getSection().getId() == section.getId())
                        break;
                    body = body.next(false, false);
                }
            }
            if(body && body.getSection().getId() == section.getId()){
                 var nextbody = body.next(isSamePage, true);
                while (nextbody) {
                    nextbody = body.next(isSamePage, true);
                    if (nextbody) body = nextbody;
                }
                return body;
            }
            return null;
        },
        getEndNotesNeedToBalance: function (para, sect) {
            var notesMgr = this.relations.notesManager;
            var endnotes = notesMgr.endnotes;
            if (!endnotes || endnotes.length == 0) {
                return null;
            }
            var c = new Container(notesMgr);
            for (var i = 0; i < endnotes.length; i++) {
                var en = endnotes[i];
                var firstView = en.getFirstView();
                var refer = firstView.getReferer();
                var body = refer && ViewTools.getBody(refer);
                if (body && body.getSection() == sect) {
                    if (para.model == en)
                        c.append(en.getMergedView(para));
                    else
                        c.append(en.getMergedView());
                }
            }
            return c;
        },
        calH: function (brekRet, lastBody) {
            var h = 0;
            var cnh;
            if (brekRet.fn) {
                console.error("there should be no footnotes in balanced paras");
            }
            var current = brekRet.cn;
            h = brekRet.cn ? brekRet.cn.h : 0;
            while (current && !this.isLastBlockInsect(current)) {
                current = this.container.next(current);
                if (current) {
                    current.layout(lastBody.textArea);
                    h += current.h;
                    current.releaseLayout();
                }
            }
            return h;
        },
        testLayout: function (para, currentSection) {
           // get start para, body, page that need to relayout
           var start = this.getRelayoutStart(para, currentSection);
           var body = start.body;

           // getUsedHeight(body) means the page used height above the body.
           var maxH = start.page.initHeight() - start.page.getUsedHeightBeforeBody(start.body);
           // * 1.1, speed up the test process.
           var minH = this.calculateRegionHeight(start, para, currentSection, 0, 1.1);
           if (minH >= maxH || maxH - minH < 5) {
               // because of multiplier
               return ViewTools.getBody(para);
           }
           var h = minH;
           if(!currentSection.getColsNum() || parseInt(currentSection.getColsNum()) == 1){
                this.resetBodiesHeight(start, h);
                return body;
           }
           var count = 0;
           var compute = true;
           var current;
           // only count twice
           while (count < 2 && compute) {
               var endNotes = ModelTools.isEndNotes(start.para.model) ? this.getEndNotesNeedToBalance(start.para, currentSection) : this.relations.notesManager.getEndNoteViewInSect(currentSection);
               this.resetBodiesHeight(start, h);
               this.releaseBodies(start.body);
               this.releaseParasInSection(start.para,true);
               current = ModelTools.isEndNotes(start.para.model) ? endNotes : start.para;
               body = start.body;
               while (current) {
                   var brekRet;
                   if (this.container.contains(current))
                       // if current is para
                       brekRet = body.append(current);
                   else {
                       // current is endnotes
                       endNotes = body.appendEndNote(current);

                       if (endNotes && endNotes.length != 0)
                           brekRet = true;
                       else
                           brekRet = false;
                   }
                   if (brekRet) {
                       if (brekRet.cn) {
                           if (brekRet.cn != current) {
                               this.container.insertAfter(brekRet.cn, current);
                           } else {
                               current = this.container.prev(current);
                           }
                       }
                       var nextBody = body.next(true, true);
                       if (!nextBody) {
                           if (count >= 2)
                               h = maxH;
                           else {
                               h = h + this.calH(brekRet, body);
                               if (h>maxH) h = maxH;
                               count++;
                           }
                           break;
                       } else
                           body = nextBody;
                   } else {
                       var sectId = current && current.directProperty && current.directProperty.getSectId();
                       if (this.container.contains(current)) {
                           if (sectId && sectId != "") {
                               //after layout content para we need to layout endnotes
                               if (!endNotes || endNotes.length() == 0 || !this._layoutEndnoteEachSect()) {
                                   compute = false;
                                   maxH = h;
                                   count++;
                                   break;
                               } else {
                                   current = endNotes;
                               }
                           }
                       } else if (!this.container.contains(current) && (!endNotes || endNotes.length() == 0)) {
                           compute = false;
                           maxH = h;
                           count++;
                           break;
                       }
                   }
                   if(!current&& brekRet){
                       current = this.container.getFirst();
                   }
                   else if ( this.container.contains(current)){
                       current = this.container.next(current);
                   }
                   else
                       current = endNotes;
               }
           }

           return body;

       },
        getRelayoutStart: function (para, section) {
                //find the start that need to balance
                var result = {};
                var first;
                result.page = ViewTools.getPage(para);
                first = ViewTools.getBody(para);
                var secId = section.getId();
                while (first) {
                    var prev = result.page.getContainer().prev(first);
                    if (!prev || prev.getSection().getId() != secId)
                        break;
                    else first = prev;
                }
                result.body = first;
                result.para = first.getStartBlock() || (first && first.getEndNoteArea() && first.getEndNoteArea().getContainer() && first.getEndNoteArea().getContainer().getFirst());
                return result;
            },
        resetBodiesHeight: function (start, h) {
            var page = start.page;
            var cBody = start.body;
            var top = cBody.getTop();
            var height = h;
            while (cBody) {
                cBody.setHeight(h);
                var next = page.container.next(cBody);
                if (next && next.section == cBody.section)
                    cBody = next;
                else
                    break;
            }
        },
        releaseBodies: function (body) {
            while (body) {
                body.releaseLayout();
                body = body.next(true, true);
            }
        },
        releaseParasInSection: function (start,relayout, ignoreSectId) {
            start = this.deleteParas(start, ignoreSectId);
            var current = start;
            if (start && this.container.contains(start)) {
                // merge all contentView with same model
                while (current && !this.isLastBlockInsect(current)) {
                    var next = this.container.next(current);
                    var currentIsReset = false;
                    if (!current.hasLayouted() && current.isDirtyDOM()) {
                        current.layout(current.parent);
                        currentIsReset = true;
                    }
                    if (next && current.model != next.model)
                        current = next;
                    else {
                        if (next) {
                            var currentBody = current.parent;
                            var nextBody = next.parent;
                            if (!currentIsReset && !next.isDeleted()) {
                                current.merge(next);
                                if (next.sectId) {
                                    current.sectId = next.sectId;
                                }
                            }
                            this.container.remove(next);
                        } else
                            break;
                    }
                }
                if(relayout){
                     //release contentViews
                    current = start;
                    while (current) {
                        if (current.releaseAll)
                            current.releaseAll();
                        else
                            current.releaseLayout && current.releaseLayout();
                        // current.releaseBodySpace && current.releaseBodySpace();
                        if (this.isLastBlockInsect(current))
                            break;
                        current = this.container.next(current);
                    }
                }
                return start;
            }
        },
        calculateContentArea: function (start, para, currentSection) {
            var startBody = start.body;
            var page = start.page;
            //end body should be the last body with content 
            var contentArea = 0;
            while (startBody) {
                contentArea += startBody.textArea.getOffsetY() * startBody.getWidth();
                contentArea += startBody.getEndNoteArea().getOffsetY() * startBody.getWidth();
                startBody = startBody.next(true,true);
            }
            return contentArea;
        },
        
        calculateRegionHeight: function (start, para, currentSection, deltArea, multiplier) {
            var contentArea = this.calculateContentArea(start, para, currentSection) * (multiplier || 1);
            var width = currentSection.getWidth();
            if (deltArea) {
                contentArea += deltArea;
            }
            var h = Math.ceil(contentArea / width);
            return h;
        },
        appendEndNote: function() {
            var endnotePr = this.settings.getEndnotePr();
            if (endnotePr && endnotePr.isEndSect() && this.settings.getSectionLength() > 1) {
                var firstSection = this.settings.getFirstSection();
                while (firstSection) {
                    this._appendEndNotesInSect(firstSection);
                    firstSection = this.settings.getNextSection(firstSection);
                }
            } else {
                this._appendEndNotesInSect();
            }
        },
        _appendEndNotesInSect: function(currentSection, endnotes) {
            if (!currentSection) {
                currentSection = this.settings.getLastSection();
                endnotes = this.relations.notesManager.getAllEndNoteView();
            }
            var lastBody = currentSection && this.getLastBodyInSection(currentSection);
            var page = ViewTools.getPage(lastBody);
            if (!lastBody) {
                return;
            }
            if (!endnotes) {
                endnotes = this.relations.notesManager.getEndNoteViewInSect(currentSection);
            }
            if (endnotes) {
//                lastBody = page.getLastBody();
                var preBody = lastBody;
                while (preBody && preBody.isEmpty()) {
                    lastBody = preBody;
                    preBody = lastBody.prevBody(false,true);
                }
                if(preBody && preBody != lastBody){
                    lastBody = preBody;
                    lastBody.releaseEndNoteLayout();   
                }
                endnotes = lastBody.appendEndNote(endnotes);
                if (lastBody.domNode && !lastBody.isDirtyDOM()) {
                    lastBody.updateDOM4Endnote();
                }
                while (endnotes) {
                    var nextBody = lastBody.next(false,true);
                    if (!nextBody) {
                        page = this.addPage(currentSection, page);
                        nextBody = lastBody.next(false, true);
                    }
                    if (!nextBody) {
                        console.error("next body should be exist!");
                        return
                    }
                    lastBody = nextBody;
                    lastBody.releaseEndNoteLayout();
                    endnotes = lastBody.appendEndNote(endnotes);
                    if (lastBody.domNode && !lastBody.isDirtyDOM()) {
                        lastBody.updateDOM4Endnote();
                    }
                }
            }
        },
        listener: function(message, param) {
            if (message == "append") {
                var models = param.models;
                this.append(models);
            }
        },

        markHeaderFooterEditing: function(isEditing) {
            if (!this.domNode) {
                return;
            }
            var removedClass = isEditing ? "editingBody" : "editingHF";
            var addedClass = isEditing ? "editingHF" : "editingBody";

            domClass.remove(this.domNode, removedClass);
            domClass.add(this.domNode, addedClass);
        },

        /**
         * 
         * @param x
         * @param y
         * @returns header,footer or body
         */
        getEditorArea: function(x, y) {
            var pages = this.pages;
            var firstPage = pages.getFirst();
            var h = firstPage.getHeight() + this._topMargin;
            //not each page is the same
            while (firstPage) {
                if (firstPage.getBottom() > y) {
                    break;
                }
                firstPage = pages.next(firstPage);
            }
            if (firstPage) {
                return firstPage.getEditorArea(x, y - firstPage.top);
            } else {
                return null;
            }
        },
        isPointInHeaderFooter: function(x, y) {
            var pages = this.pages;
            var firstPage = pages.getFirst();
            var h = firstPage.getHeight() + this._topMargin;
            //not each page is the same
            while (firstPage) {
                if (firstPage.getBottom() > y) {
                    break;
                }
                firstPage = pages.next(firstPage);
            }
            if (firstPage) {
                return firstPage.isPointInHeaderFooter(x, y - firstPage.top);
            } else {
                return null;
            }
        },
        getElementPath: function(x, y, options) {
            var pages = this.pages;
            var firstPage = pages.getFirst();
            var h = firstPage.getHeight() + this._topMargin;
            //not each page is the same
            while (firstPage) {
                if (firstPage.getBottom() > y) {
                    break;
                }
                firstPage = pages.next(firstPage);
            }

            if (!firstPage) {
                // get last page
                firstPage = pages.getLast();
            }

            if (firstPage) {
                var ret = [];
                ret.push(this);
                ret.push(firstPage);
                firstPage.getElementPath(x - firstPage.left, y - firstPage.top, ret, options);
                return ret;
            } else {
                return [];
            }
        },
        getHeight: function() {
            var lastPage = this.pages.getLast();
            if (lastPage) {
                return lastPage.getTop() + lastPage.getHeight() - this._topMargin;
            }

            return 0;
        },
        itemByPoint: function(x, y) {
            return layoutEngine.shell.itemByPoint(x, y);
        },
        changePageSetup: function(page, del, from) {
            var that = this;
            page.container.forEach(function(body) {
                that.addChangedView(body);
                if (from == "fromHeader") {
                    body.updateBodySpace(del.height, -del.height, 0);
                } else {
                    body.updateBodySpace(0, -del.height, 0);
                }
            });
        },
        _getRelativeBody: function(view) {
            return view.getParent();
        },
        getFristConteArea: function() {
            return this.pages.getFirst().getFirstBody().textArea;
        },
        getLastConteArea: function() {
            return this.pages.getLast().getLastBody().textArea;
        },
        notifyUpdate: function(args, type) {
            if (!args instanceof Array) {
                console.error("the arg must be array");
            }
            if (type) {
                switch (type) {
                    case "update":
                        this.addChangedView(args[1]);
                        break;
                    case "changePageSetup":
                        this.changePageSetup(args[0], args[1], args[2]);
                        break;
                    case "append":
                        this.getLastConteArea().notifyUpdate(args, type);
                        break;
                    default:
                        console.info("can not handle the update type: " + type);
                }

            } else {
                this.addChangedView(args[0]);
            }

        },
        preBody: function(body, theSameSec) {
            var page = body.getParent();
            var prevBody = page.getContainer().prev(body);
            if (!prevBody) {
                var prevPage = this.getContainer().prev(page);
                if (!prevPage) {
                    return null;
                }
                if (theSameSec && prevPage.section != page.section) {
                    page = null;
                } else {
                    page = prevPage;
                }
                if (page) {
                    prevBody = page.getContainer().getLast();
                }
            }
            return prevBody;
        },
        //nolonger use because, page section does not equal to body Section now ,because we add cotinuous section 55285
        nextBody: function(body, theSameSec) {
            var page = body.getParent();
            var nextBody = page.getContainer().next(body);
            if (!nextBody) {
                var nextPage = this.getContainer().next(page);
                if (!nextPage) {
                    return null;
                }
                if (theSameSec && nextPage.section != page.section) {
                    page = null;
                } else {
                    page = nextPage;
                }
                if (page) {
                    nextBody = page.getContainer().getFirst();
                }
            }
            return nextBody;
        },
        nextBlockView: function(blockView, theSameSec) {
            if (!blockView) {
                return null;
            }
            if (theSameSec) {
                var secId = blockView.directProperty && blockView.directProperty.getSectId();
                if (secId) {
                    // only the last view of model with section property will split the page.
                    var nBlockView = this.container.next(blockView);
                    if (!nBlockView || nBlockView.model != blockView.model)
                        return null;
                    else
                        return nBlockView;
                }
                //			if(blockView.endsWithPageBreak&& blockView.endsWithPageBreak()){
                //				return null;
                //			}
            }
            return this.container.next(blockView);
        },
        isLastBlockInsect: function(block) {
            if (this.nextBlockView(block, true)) {
                return false;
            }
            var secId = block.directProperty && block.directProperty.getSectId();
            // last para in section
            return secId || true;
        },
        nextPage: function(currentPage, theSameSec) {
            var page = this.pages.next(currentPage);
            if (theSameSec && page && page.section != currentPage.section) {
                return null;
            }
            return page;
        },
        prePage: function(currentPage, theSameSec) {
            var page = this.pages.prev(currentPage);
            if (theSameSec && page && page.section != currentPage.section) {
                return null;
            }
            return page;
        },
        getLastPageInSect: function(sect) {
            var pangeInSect = null;
            var firstPage = this.pages.getFirst();
            while (firstPage) {
                if (firstPage.section == sect) {
                    pangeInSect = firstPage;
                }
                var nextPage = this.pages.next(firstPage);
                if ((!nextPage || nextPage.section != sect) && pangeInSect) {
                    return pangeInSect;
                }
                firstPage = nextPage;
            }
        },
        hasLayouted: function() {
            return true;
        }
    };
    Model.prototype.viewConstructors[Document.prototype.modelType] = DocumentView;
    tools.extend(DocumentView.prototype, new AbstractView());
    tools.extend(DocumentView.prototype, new DocumentUpdate());
    return DocumentView;
});
