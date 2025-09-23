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
    "dojo/topic",
    "dojo/_base/array",
    "dojo/_base/lang",
    "writer/common/tools",
    "writer/constants",
    "writer/util/ViewTools",
    "writer/view/update/BlockContainerView"
], function(topic, array, lang, tools, constants, ViewTools, BlockContainerView) {

    var DocumentUpdate = function() {
        this.updateSections = this.updateSections || [];
    };
    DocumentUpdate.prototype = {
        insertSection: function (view, sectId, forceExe) {
           if (!forceExe) {
               var args = [view, sectId, true];
               this.preUpdate(this.insertSection, args);
               return;
           }
           //            view.sectId = sectId;
           var lastView = view;
           while (lastView) {
               var tempView = this.container.next(lastView);
               if (!tempView || tempView.model != view.model || tempView.isDeleted())
                   break;
               else
                   lastView = tempView;
           }
           lastView.sectId = sectId;
           if(this.updateSections.indexOf(sectId) < 0){
               this.updateSections.push(sectId);
           }
       },
       
       updateMultipleSections: function () {
                var setting = pe.lotusEditor.setting;
                var firstIndex = -1;
                for (var i = 0; i < this.updateSections.length; i++)
                {
                   // find the first update Section
                    var sectionId = this.updateSections[i];
                    var sectionIndex = setting.getSectionIndex(sectionId);
                    if (sectionIndex < firstIndex || firstIndex == -1)
                        firstIndex = sectionIndex;

                }
                this.updateSections = [];
           
                if (firstIndex == -1)
                    return;
                
                var section = setting.getSectionByIndex(firstIndex);
                if (!section) {
                    return;
                }
           
                var startPage, endPage, startBody, startBlock,startSection;
                startPage = this.pages.getFirst();
                var prevSection = setting.getPreSection(section);
                if(!prevSection){
                    startPage = this.pages.getFirst();
                }else{
                    startBody = startPage.getFirstBody();
                    var preBody;
                    while (startBody && startBody.getSection().id != section.id) {
                        if (startBody && prevSection && startBody.getSection().id == prevSection.getId())
                            preBody = startBody;
                        startBody = startBody.next(false, false);
                    }
                    startPage = preBody ? ViewTools.getPage(preBody) : this.pages.getFirst();
                }
                startBlock = startPage.getFirstBody().getFirstAppendView();
                var endSectionPara = startBlock.cn;
                // startBlock may hace different section with preSection,have tofind its own section
                while (endSectionPara) {
                    if (endSectionPara && endSectionPara.sectId)
                        break;
                    endSectionPara = this.container.next(endSectionPara);
                }
                var startSection = endSectionPara ? this.settings.getSection(endSectionPara.sectId) : this.settings.getLastSection();
                endPage = this.pages.getLast();
                var newPage = this.addPage(startSection, this.prePage(startPage));
                var newBody = newPage.getFirstBody();
                this.removePages(startPage, endPage, true);
                this.updateMixSection(newBody, startBlock.cn);
                var alinePagesStart = this.pages.getFirst();
                this._alignPages(alinePagesStart);
                this._updatePageNumber(alinePagesStart);
        },
        deleteSection: function (view, sectId, forceExe) {
            if (!forceExe) {
                var args = [view, sectId, true];
                this.preUpdate(this.deleteSection, args);
                return;
            }
           var lastView = view;
           while (lastView) {
               if(lastView.sectId)
                   delete lastView.sectId;
               var tempView = this.container.next(lastView);
               if (!tempView || tempView.model != view.model)
                   break;
               else
                   lastView = tempView;
           }
           var endSectionPara = lastView;
           var modelViews = view.model.getViews(view.getOwnerId());
           var firstViewOfModel = modelViews && modelViews.getFirst();
           if (firstViewOfModel && firstViewOfModel.sectId) {
               // markReset, sectId has been moved to new first view
               endSectionPara = firstViewOfModel;
           } else {
             while (endSectionPara) {
                 if (endSectionPara.sectId)
                     break;
                  endSectionPara = this.container.next(endSectionPara);
             }
           }
           
           var updateStartSection = endSectionPara ? this.settings.getSection(endSectionPara.sectId) : this.settings.getLastSection();
           if (updateStartSection && this.updateSections.indexOf(updateStartSection.id) < 0) 
               this.updateSections.push(updateStartSection.id);
        },
        updateSection: function (section, relayoutBlock, updateAll) {
            if (!section)
                return;
            // relayout the whole section 
            var startPage, endPage,startBody,startBlock;
            var setting = pe.lotusEditor.setting;
            var startSection = setting.getPreSection(section);
            var endOfStartSection = this.container.getFirst();
            if (!startSection){
                startSection = setting.getSection(section);
            }     	
            else{
                // find the last View of start section
                while(endOfStartSection){
                      if (!endOfStartSection.isDeleted() && endOfStartSection.sectId && endOfStartSection.sectId == startSection.id)
                          break;
                    // call updateSection function before insert or delete sectit to views
                      else if (!endOfStartSection.isDeleted() && endOfStartSection.model && endOfStartSection.model.directProperty && endOfStartSection.model.directProperty.getSectId()) {
                          var next = this.container.next(endOfStartSection);
                          if(next && next.model != endOfStartSection)
                              break;
                      }     
                    endOfStartSection = this.container.next(endOfStartSection);
                }   
            }
            if(!endOfStartSection){
               return;
            }
            startPage = ViewTools.getPage(endOfStartSection);
            if (!startPage)
            	startPage = this.pages.getFirst();
            startBody = startPage.getFirstBody();
            startBlock = startBody.getFirstAppendView();
            var startPara = startBlock.cn;
            //start para's section may not be the startSection
            while(startPara){
               if(startPara.sectId){
                   startSection = setting.getSection(startPara.sectId);
                   break;
               }
                else
                    startPara = this.container.next(startPara);   
            }
            endPage = this.pages.getLast();
            var newPage = this.addPage(startSection, this.prePage(startPage));
            var newBody = newPage.getFirstBody();
            this.removePages(startPage, endPage, true);
            this.updateMixSection(newBody, startBlock.cn);
            var preStartPage = this.prePage(newPage);
            var alinePagesStart = preStartPage ? preStartPage:this.pages.getFirst();
            this._alignPages(alinePagesStart);
            this._updatePageNumber(alinePagesStart);
            // render
            this.render(pe.lotusEditor.getScrollPosition());
        },
        partialLayout: function(startModel, endModel) {
            if (!startModel) {
                console.error("the start model can not be null");
                return;
            }
            var doc = this.model;
            startModel = doc.container.next(startModel);
            var startView = this.container.getLast();
            while (startModel != endModel) {
                var view = startModel.preLayout(this.getOwnerId());
                this.container.append(view);
                startModel = doc.container.next(startModel);
            }
            this.layout(startView, null, endModel == null);
            this._exePosUpdate();
        },
       updatePageSection: function (firstBody) {
           var preBody = firstBody.prevBody(false, true) || firstBody;
           var startView = firstBody.getFirstAppendView();
           if (!startView.cn) {
               var nextBody = firstBody.next(false, true);
               while (nextBody) {
                   var nextStartView = nextBody.getFirstAppendView();
                   if (nextStartView.fn) {
                       startView.fn.appendAll(nextStartView.fn);
                   }
                   if (nextStartView.cn) {
                       startView.cn = nextStartView.cn;
                       break;
                   } else {
                       nextBody = nextBody.next(false, true);
                   }
               }
           }

           var currSection = preBody.getSection();
           firstBody.releaseLayout();
           this._updateBody(startView, preBody);

           // update next sections,only odd/even change should update next section
           var setting = pe.lotusEditor.setting;
           if (setting.isDiffOddEvenPages()) {
               var nextSection = this.settings.getNextSection(currSection.getId());
               var ralayoutBlock = false;
               this.updateSection(nextSection, ralayoutBlock ,true);
           }
       },
        update: function() {
            try {
                this._exePreUpdate();
            } catch (e) {
                console.error("error occurred in DocumentUpdate._exePreUpdate():" + e);
            }
            if (this.updateSections && this.updateSections.length >0){
                this.updateMultipleSections();
            }
            if (this.changedView && this.changedView.length() > 0) {
                var continuousSec = false;
                this.changedView.forEach(function (body) {
                    var currentSection = body.getSection();
                    var document = ViewTools.getDocument(body);
                    var nextSection = document.settings.getNextSection(currentSection);
                    continuousSec = continuousSec ||(nextSection && nextSection.isContinuous()) ;
                });
                var firstBody = this.changedView.getFirst();
                while (firstBody) {
                    this.changedView.remove(firstBody);
                    if (!this.bodyExist(firstBody)) {
                        firstBody = this.changedView.getFirst();
                        continue;
                    }
                if(!continuousSec) 
                    this.updatePageSection(firstBody);
                else
                    this.updateContinuousSections(firstBody);
                    firstBody = this.changedView.getFirst();
                }      
            }
            this._exePosUpdate();
            this.updateNoteReferId();
          },
        // note, this update method only affect the section that the view be in.
        _updateBody: function(startView, startBody, relayoutBlock) {
            var footnote = startView.fn;
            var startBlock = startView.cn;
            while (startBlock || footnote) {
                if (startBlock && startBlock.isDeleted()) {
                    var t = this.container.next(startBlock);
                    this.container.remove(startBlock);
                    startBlock = t;
                    continue;
                }
                var canMergeBlock = startBody.mergeContentView(startBlock);
                if (canMergeBlock) {
                    canMergeBlock.merge(startBlock);
                    var nextBody = startBody.next(false, true);
                    if (nextBody) {
                        var container = nextBody.textArea.container;
                        if (container.getFirst() == startBlock) {
                            nextBody.releaseLayout();
                        }
                    }
                    this.container.remove(startBlock);
                    startBlock = canMergeBlock;
                }
                if (footnote && footnote.length() > 0) {
                    startBody.markDirtyDOM();
                    var firstNote = footnote.getFirst();
                    var canMergeFootnote = startBody.mergeFootnoteView(firstNote);
                    if (canMergeFootnote) {
                        canMergeFootnote.merge(firstNote);
                        var nextNote = footnote.next(firstNote);
                        footnote.insertBefore(canMergeFootnote, firstNote);
                        footnote.remove(firstNote);
                        firstNote = nextNote;
                        while (firstNote && firstNote.model == canMergeFootnote.model) {
                            nextNote = footnote.next(firstNote);
                            canMergeFootnote.merge(firstNote);
                            footnote.remove(firstNote);
                            firstNote = nextNote;
                        }
                    }

                }
                if (relayoutBlock) {
                    startBlock.releaseLayout && startBlock.releaseLayout();
                    footnote && footnote.releaseLayout && footnote.releaseLayout();
                }
                var breakView = startBody.append(startBlock, footnote);
                if (!breakView) {
                    // append view to the body continuely;
                    footnote = null;
                    startBlock = this.nextBlockView(startBlock, true);
                    startBody.markDirtyDOM();
                } else {
                    if (breakView.cn != startBlock)
                        startBody.markDirtyDOM();
                    var nextBody = startBody.next(false, true);
                    if (!nextBody) {
                        var prePage = startBody.getParent();
                        var page = this.addPage(startBody.getSection(), prePage);
                        nextBody = page.getFirstBody();
                        startBody = nextBody;
                    } else {
                        // the next body donot need to change.
                        if (!nextBody.toRelayout(breakView.cn, breakView.fn)) {
                            return;
                        }
                        nextBody.releaseLayout();
                        startBody = nextBody;
                        if (this.changedView && this.changedView.contains(startBody)) {
                            this.changedView.remove(startBody);
                        }
                    }
                    footnote = breakView.fn;
                    if (breakView.cn && !this.container.contains(breakView.cn)) {
                        this.container.insertAfter(breakView.cn, startBlock);
                    }
                    if (breakView.cn) {
                        startBlock = breakView.cn;
                    } else {
                        startBlock = this.nextBlockView(startBlock, true);
                    }

                }
            }
            var page = startBody.page;
            var lastPage = page;
            page = this.nextPage(page, false);
            while (page && page.getSection() == startBody.getSection()) {
                var nextPage = this.nextPage(page, false);
                this.removeEmptyPage(page);
                page = nextPage;
            }
            var firstBody = lastPage.getFirstBody();
            while (firstBody) {
                firstBody.releaseEndNoteLayout();
                firstBody = lastPage.getNextBody(firstBody);
            }
            var endnotePr = this.settings.getEndnotePr();
            var currentSect = lastPage.getSection();
            if (endnotePr && endnotePr.isEndSect()) {
                this._appendEndNotesInSect(currentSect);
            } else {
                if (this.relations.notesManager.endNoteChange || currentSect == this.settings.getLastSection()) {
                    var endnotes = this.relations.notesManager.getAllEndNoteView();
                    this._appendEndNotesInSect();
                    delete this.relations.notesManager.endNoteChange;
                }
            }
        },
        deleteParas: function (view, ignoreSectId) {
            var firstView = null ;
            while (view) {
                var next = this.container.next(view);
                if (view.isDeleted()){
                    this.container.remove(view);
                }else{
                    if(!firstView)
                        firstView = view ;
                }
                // for track change
              // NOTES: view.sectId == ignoreSectId && !firstView
              // enter in a cross column paragraph, 
              // new paragraph with sectId will insert after original para's first view.
              // that makes two paragraph view with same sectId in document's container,
              // all other views between these two should be deleted.
              // we should remove all deleted views otherwise it may impact next section balance
              if (view.sectId && !(view.sectId == ignoreSectId && !firstView) && !(next && next.sectId == view.sectId))
                    break;
                view = next;
            }
            return firstView ;
        },
        updateContinuousSections: function(firstBody){
            var startUpdate = this.getUpdateStart(firstBody);
            var para = startUpdate.startView;
            var body = startUpdate.startBody;
            var removeStart = startUpdate.removeStart;
            var updatePageStart = this.pages.prev(removeStart);
            para = this.updateMixSection(body,para,removeStart);
            var endPage = para ? ViewTools.getPage(para) : null;
            if(removeStart){
                
                if (endPage)
                    this.removePages(removeStart, endPage, false, true);
                else
                    this.removePages(removeStart, this.pages.getLast(), true, true);
            }
            this._alignPages(updatePageStart);
            this._updatePageNumber(this.pages.next(updatePageStart));
            
        },
        updateMixSection: function (firstBody, startView, removeStart) {
            var para = startView;
            var body = firstBody;
            var currentPage = ViewTools.getPage(body);
            var startRemove = removeStart;
            var currentSection = body.getSection();
            this.releaseBodies(body);
            // delete all deleted views and merge all views
            para = this.releaseParasInSection(para);
            var breakFn, _cache;
            var sectionRecord = [];
            while (para || breakFn) {
                if (para && para.isDeleted()) {
                    var t = this.container.next(para);
                    this.container.remove(para);
                    para = t;
                    continue;
                }
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
                    body = body.next(true, true);
                    if (!body) {
                        if (currentPage.isEmptySection(tempBody.getSection())) {
                            currentPage.deleteEmptySection(tempBody.getSection());
                        }
                        currentPage = this.addPage(currentSection, currentPage);
                        body = currentPage.getFirstBody();
                    }
                }

                if (!breakRet) {
                    if (this.isLastBlockInsect(para)) {
                        var tempPara = para ? this.container.next(para) : null;
                        var sectId = para && para.sectId && para.directProperty && para.directProperty.getSectId();
                         // no need to update Twice
                         while (this.changedView && this.changedView.length() != 0) {
                             var changedViewSection = this.changedView.getFirst().getSection();
                             if (changedViewSection == currentSection)
                                 this.changedView.remove(this.changedView.getFirst());
                             else break;
                         }
                        if (sectId && sectId != "" && tempPara) {
                            var nextSection = this.settings.getNextSection(currentSection);
                            var needBalance = this.needBalance(para, nextSection, body, _cache);
                            // if this para is the last para for the currentSection, it is the time to layout the endnote for the current section
                            if (nextSection) {
                                if (needBalance) {
                                    var result = this.continuousLayout(para, currentSection, body, currentPage);
                                    body = result.body;
                                    para = result.para;
                                    currentPage = ViewTools.getPage(body);
                                    var next = this.container.next(para);
                                    if (next) this.releaseParasInSection(next, false, currentSection.id);
                                } else {
                                    if (sectionRecord && sectionRecord.indexOf(currentSection) < 0)
                                        sectionRecord.push(currentSection);
                                    var nextPara = this.container.next(para);
                                    currentPage = this.addPage(nextSection, currentPage);
                                    body = currentPage.getFirstBody();
                                    var next = this.container.next(para);
                                    if (next) this.releaseParasInSection(next, false, currentSection.id);

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
            para = para ? this.container.next(para) : null;
            /*	this.appendEndNote();*/
            if (sectionRecord && sectionRecord.length > 0 && this._layoutEndnoteEachSect()) {
                for (var i = 0; i < sectionRecord.length; i++) {
                    this._appendEndNotesInSect(sectionRecord[i]);
                }
            }else{
            //layout at the end of the document
                 if (this.relations.notesManager.endNoteChange || currentSection == this.settings.getLastSection()) {
                    var endnotes = this.relations.notesManager.getAllEndNoteView();
                    this._appendEndNotesInSect();
                    delete this.relations.notesManager.endNoteChange;
                }
            }
            return para;
        },
        needToUpdate: function (para, newSection) {
            var body = ViewTools.getBody(para);
            if (body && body.getStartBlock() == para && body.getSection() == newSection) {
                while (body) {
                    body = body.prevBody(true, false);
                    if (!body)
                        return false;
                }
            }
            return true;
        },

        getUpdateStart: function (firstBody) {
            var curpage = ViewTools.getPage(firstBody);
            var prePage = this.pages.prev(curpage);
            var sectionStart = firstBody;
            var currentSection = firstBody.getSection();
            while (sectionStart && sectionStart.prevBody(false, true)) {
                sectionStart = sectionStart.prevBody(false, true);
            }
            var startPage = ViewTools.getPage(sectionStart);
            var startView, startBody;

            if (curpage == startPage) {
                startView = sectionStart.getStartBlock();
                var pageHead = sectionStart.prevBody(true, false);
                var offsetOfPage = curpage.getUsedHeightBeforeBody(pageHead);
                if (!pageHead && prePage && prePage.initHeight() - offsetofPage > 5) {
                    var offsetofPage = prePage.getUsedHeightBeforeBody();
                    var top = offsetofPage + prePage.getFirstBody().getTop();
                    var height = prePage.initHeight() - offsetofPage;
                    prePage.addBodies(currentSection, top, height);
                    while (sectionStart && sectionStart.prevBody(false, true)) {
                        sectionStart = sectionStart.preBody(false, true);
                    }
                }
                startBody = sectionStart;
            } else {
                if (prePage == startPage) {
                    startView = sectionStart.getStartBlock();
                    startBody = sectionStart;
                } else {
                    startBody = prePage.getFirstBody();
                    startView = startBody.getStartBlock();
                }
            }
            var currentPage = ViewTools.getPage(startBody);
            var removeStart = this.pages.next(currentPage);
            var startUpdate = {};
            var endbody = startBody;
            while (endbody && endbody.next(true, true)) {
                endbody = endbody.next(true, true);
            }
            while (endbody && endbody != currentPage.container.getLast()) {
                var dbody = currentPage.container.next(endbody);
                if (dbody && dbody.getSection() != currentSection) {
                    dbody.releaseDom();
                    currentPage.container.remove(dbody);
                }
            }
            var offsetPage = currentPage.getUsedHeightBeforeBody(null);
            var height = startBody.getHeight() + currentPage.initHeight() - offsetPage;
            if (currentPage.initHeight() - offsetPage != 0) {
                var reset = {};
                reset.page = currentPage;
                reset.body = startBody;
                this.resetBodiesHeight(reset, height);
            }

            startUpdate.startView = startView;
            startUpdate.startBody = startBody;
            startUpdate.removeStart = removeStart;
            return startUpdate;

        },
        preUpdate: function(callFunc, args) {
            this.preUpdateCall = this.preUpdateCall || [];
            this.preUpdateCall.push({
                call: callFunc,
                args: args
            });
        },
        _exePreUpdate: function() {
            if (this.preUpdateCall && this.preUpdateCall.length > 0) {
                for (var i = 0; i < this.preUpdateCall.length; i++) {
                    var callee = this.preUpdateCall[i];
                    callee.call.apply(this, callee.args);
                }
            }
            delete this.preUpdateCall;
        },
        _exePosUpdate: function() {
            delete this.changedView;
            this.updateSections = [];
            this.render(pe.lotusEditor.getScrollPosition());
        },
        removePages: function(start, end, includeEndPage, keepChildDom) {
            if (!start || (!end && includeEndPage)) {
                console.error("the start and the end can not be empty!");
            }
            var toDelPage = start;
            var toStopDel = includeEndPage ? this.nextPage(end) : end;
            while (toDelPage && toDelPage != toStopDel) {
                var np = this.pages.next(toDelPage);
                //remove this page
                this.pages.remove(toDelPage);
                toDelPage.destroy();
                if (toDelPage.domNode) {
                    if (toDelPage.domNode.parentNode == this.domNode)
                        this.domNode.removeChild(toDelPage.domNode);
                    if (!keepChildDom)
                        toDelPage.releaseDom();
                    else
                        toDelPage.domNode = null;
                }
                toDelPage = np;
            }

            this._updatePageNumber(toDelPage);
        },
        bodyExist: function(body) {
            var page = body.getParent();
            return page && this.pages.contains(page);
        },
        updateNoteReferId: function() {
            this.relations.notesManager.updateChangedNotes();
        }
    };
    tools.extend(DocumentUpdate.prototype, new BlockContainerView());
    return DocumentUpdate;
});
