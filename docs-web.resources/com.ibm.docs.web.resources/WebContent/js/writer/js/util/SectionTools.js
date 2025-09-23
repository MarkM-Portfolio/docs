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
    "writer/constants",
    "writer/msg/msgCenter",
    "writer/msg/msgHelper",
    "writer/util/ViewTools",
    "writer/model/HFType"
], function(constants, msgCenter, msgHelper, ViewTools, HFType) {

    var SectionTools = {

        updateHFSelection: function(isHeader, pageNumber) {
            var selection = pe.lotusEditor.getSelection();
            var scrollTop = pe.lotusEditor.getScrollPosition();
            selection.addHeaderFooterSelection(scrollTop, isHeader, pageNumber);
        },

        /**
         * get current section in the location of view.
         * @param item: arbitrary view
         */
        getCurrentSection: function (item) {
            var body = ViewTools.getBody(item);

            if (!body)
                return null;

            var section = body.getSection();
            return section;
        },

        /**
         * get current section id in the location of view.
         * @param item: arbitrary view
         */
        getCurrentSecId: function(item) {
            var section = this.getCurrentSection(item);
            return section ? section.getId() : "";
        },

        /**
         * insert section in setting model, and send message
         * @param sect:		section content.
         * @param idx:		index to insert.
         * @param msgs:		message to send.
         */
        insertSection: function(sect, idx, msgs) {
            var setting = pe.lotusEditor.setting;
            setting.insertSection(sect, idx);
            if (msgs) {
                var msg = msgCenter.createMsg(constants.MSGTYPE.Section, [msgCenter.createInsertSectionAct(sect, idx)], constants.MSGCATEGORY.Setting);
                msgs.push(msg);
            }
        },

        /**
         * delete section in setting model, and send message, by secId
         * @param block:	view that contains section property.
         * @param msgs:		message to send.
         */
        deleteSection: function(block, msgs) {
            var directProperty = block.getDirectProperty && block.getDirectProperty();
            if (directProperty && directProperty.getSectId()) {
                var ret = pe.lotusEditor.setting.deleteSection(directProperty.getSectId())
                ret && msgs.push(msgCenter.createMsg(constants.MSGTYPE.Section, [msgCenter.createDeleteSectionAct(ret.sect, ret.idx)], constants.MSGCATEGORY.Setting));
            }
        },

        /**
         * generate new section id
         */
        getNewSectionId: function() {
            var id = "id_0000" + msgHelper.getUUID();
            return id;
        },

        /**
         * get previous section that header/footer linked to
         * return section means linked to itself
         */
        getHFSectionLinkedTo: function(section, type) {
            var setting = pe.lotusEditor.setting;

            if (section.getHeaderFooterByType(type))
                return section;

            var idx = setting.getSectionIndex(section.getId());
            var preSection = null;
            for (i = idx; i >= 0; --i) {
                preSection = setting.getSectionByIndex(i);
                if (!preSection)
                    return section;

                if (preSection.getHeaderFooterByType(type))
                    return preSection;
            }

            return section;
        },

        /**
         * is different first page in this header/footer
         */
        isHFDiffFirstPage: function(targetView) {
            var page = ViewTools.getPage(targetView);
            var currentSec = page && page.section;
            if (!currentSec)
                return false;

            return currentSec.firstDifferent ? true : false;
        },

        /**
         * is different odd/even pages in this header/footer
         */
        isHFDiffOddEvenPages: function() {
            var setting = pe.lotusEditor.setting;
            return setting.isDiffOddEvenPages();
        },

        /**
         * is linked to previous
         */
        isHFLinkedToPrevious: function(targetView) {
            var page = ViewTools.getPage(targetView);
            var currentSec = page && page.section;
            if (!currentSec)
                return false;

            var linkedSec = currentSec;
            if (page.isDiffFirstPage) {
                if (targetView.isHeader)
                    linkedSec = this.getHFSectionLinkedTo(currentSec, HFType.FIRST_HEADER);
                else
                    linkedSec = this.getHFSectionLinkedTo(currentSec, HFType.FIRST_FOOTER);
            } else if (page.isEvenPage) {
                if (targetView.isHeader)
                    linkedSec = this.getHFSectionLinkedTo(currentSec, HFType.EVEN_HEADER);
                else
                    linkedSec = this.getHFSectionLinkedTo(currentSec, HFType.EVEN_FOOTER);
            } else {
                if (targetView.isHeader)
                    linkedSec = this.getHFSectionLinkedTo(currentSec, HFType.DEFAULT_HEADER);
                else
                    linkedSec = this.getHFSectionLinkedTo(currentSec, HFType.DEFAULT_FOOTER);
            }

            return (linkedSec != currentSec);
        },

        /**
         * set different first page in current header/footer
         * @param targetView: current target header/footer view
         */
        setHFDifferentFirstPage: function(targetView) {
            var msgList = [];

            var setting = pe.lotusEditor.setting;
            var page = ViewTools.getPage(targetView);
            var currentSec = page && page.section;
            if (!currentSec) {
                console.error("cannot find current section!");
                return;
            }

            var oldSecJson = currentSec.toJson();

            if (!this.isHFDiffFirstPage(targetView)) {
                // create new first page header and footer
                if (!currentSec.firstHeader) {
                    var fhId = pe.lotusEditor.relations.createHeaderFooter(msgList, true);
                    currentSec.firstHeader = fhId;
                    //fhView = page.insertHeaderFooter(msgList, fhId, true);
                }

                if (!currentSec.firstFooter) {
                    var ffId = pe.lotusEditor.relations.createHeaderFooter(msgList, false);
                    currentSec.firstFooter = ffId;
                    //ffView = page.insertHeaderFooter(msgList, ffId, true);
                }

                // set first page mark in section
                currentSec.firstDifferent = {};
                var actPair = msgCenter.createReplaceKeyAct(currentSec.getId(), oldSecJson, currentSec.toJson(), constants.KEYPATH.Section);
                var msg = msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [actPair], constants.MSGCATEGORY.Setting);
                // Send the message first to do OT 
                //			msgList.unshift(msg);	// Can't update in another client.
                msgList.push(msg);
            } else {
                // remove firstPage tag from this section
                currentSec.firstDifferent = null;
                var actPair = msgCenter.createReplaceKeyAct(currentSec.getId(), oldSecJson, currentSec.toJson(), constants.KEYPATH.Section);
                var msg = msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [actPair], constants.MSGCATEGORY.Setting);
                msgList.push(msg);
            }

            // send message
            if (msgList.length > 0)
                msgCenter.sendMessage(msgList);

            // update
            this.updateHFSelection(targetView.isHeader, page.pageNumber);
            pe.lotusEditor.layoutEngine.rootView.updateSection(currentSec, false,true);
        },

        /**
         * set different odd & even pages in current header/footer
         * @param targetView: current target header/footer view
         */
        setHFOddEvenPages: function(targetView, bSendMsg) {
            /* 	
            	1) default -> diffOddEven:	iterate every section, if the section contains dh or
            								df, we must ensure to add eh and ef.
            	2) diffOddEven -> default:	just remove eh and ef.
            */
            var msgList = [];

            var setting = pe.lotusEditor.setting;
            if (this.isHFDiffOddEvenPages()) {
                setting.setDiffOddEvenPages(false);

                if (bSendMsg) {
                    var msg = msgCenter.createMsg(constants.MSGTYPE.Setting, [msgCenter.createRemoveEvenOddAct()], constants.MSGCATEGORY.Setting);
                    msgList.push(msg);
                }
            } else {
                // save settings
                setting.setDiffOddEvenPages(true);
                if (bSendMsg) {
                    var msg = msgCenter.createMsg(constants.MSGTYPE.Setting, [msgCenter.createAddEvenOddAct()], constants.MSGCATEGORY.Setting);
                    msgList.push(msg);
                }

                // check every section, if has dh, df, then create eh, ef
                for (var i = 0; i < setting.getSectionLength(); ++i) {
                    var sec = setting.getSectionByIndex(i);
                    var oldSecJson = sec.toJson();

                    // add even header
                    if (sec.defaultHeader && !sec.evenHeader) {
                        var ehId = pe.lotusEditor.relations.createHeaderFooter(msgList, true);
                        sec.evenHeader = ehId;
                    }

                    // add even footer
                    if (sec.defaultFooter && !sec.evenFooter) {
                        var efId = pe.lotusEditor.relations.createHeaderFooter(msgList, false);
                        sec.evenHeader = efId;
                    }

                    // save section
                    if (bSendMsg) {
                        var actPair = msgCenter.createReplaceKeyAct(sec.getId(), oldSecJson, sec.toJson(), constants.KEYPATH.Section);
                        var msg = msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [actPair], constants.MSGCATEGORY.Setting);
                        //					msgList.unshift(msg);
                        msgList.push(msg);
                    }
                }
            }

            // send message
            if (msgList.length > 0)
                msgCenter.sendMessage(msgList);

            // update
            if (bSendMsg) {
                var page = ViewTools.getPage(targetView);
                var pageNumber = page ? page.pageNumber : null;
                this.updateHFSelection(targetView.isHeader, pageNumber);
            }
            var changedSec = setting.getSectionByIndex(0);
            pe.lotusEditor.layoutEngine.rootView.updateSection(changedSec, false,true);
        },

        /**
         * set link to previous in current header/footer
         * @param targetView: current target header/footer view
         */
        setHFLinkToPrevious: function(targetView) {
            /* 
            	link -> unlink:	create relative header/footer in this section
            	unlink -> link: remove relative header/footer in this section
            */
            var page = ViewTools.getPage(targetView);
            var currentSec = page && page.section;
            if (!currentSec)
                return false;

            var msgList = [];

            var setting = pe.lotusEditor.setting;
            var hfType;

            var oldSecJson = currentSec.toJson();

            if (page.isDiffFirstPage) {
                if (targetView.isHeader)
                    hfType = HFType.FIRST_HEADER;
                else
                    hfType = HFType.FIRST_FOOTER;
            } else if (page.isEvenPage) {
                if (targetView.isHeader)
                    hfType = HFType.EVEN_HEADER;
                else
                    hfType = HFType.EVEN_FOOTER;
            } else {
                if (targetView.isHeader)
                    hfType = HFType.DEFAULT_HEADER;
                else
                    hfType = HFType.DEFAULT_FOOTER;
            }

            var headerfooter = currentSec.getHeaderFooterByType(hfType);

            if (!headerfooter) {
                // unlink to previous
                var hfId = pe.lotusEditor.relations.createHeaderFooter(msgList, targetView.isHeader);
                currentSec.setHeaderFooterByType(hfType, hfId);
            } else {
                // link to previous
                currentSec.setHeaderFooterByType(hfType, null);
            }

            // save section
            var actPair = msgCenter.createReplaceKeyAct(currentSec.getId(), oldSecJson, currentSec.toJson(), constants.KEYPATH.Section);
            var msg = msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [actPair], constants.MSGCATEGORY.Setting);
            //		msgList.unshift(msg);
            msgList.push(msg);

            // send message
            if (msgList.length > 0)
                msgCenter.sendMessage(msgList);

            // update
            this.updateHFSelection(targetView.isHeader, page.pageNumber);
            pe.lotusEditor.layoutEngine.rootView.updateSection(currentSec, false, true);
        },

        insertHeaderFooter: function(page, isHeader) {
            var setting = pe.lotusEditor.setting;

            var shell = pe.lotusEditor._shell;
            var headerfooter = isHeader ? page.getHeader() : page.getFooter();
            if (headerfooter) {
                console.log("header/footer is already there");
                shell.moveToHeaderFooter(headerfooter);
            } else {
                //create a new header/footer in relations
                var msgList = [];
                var pageIndex = pe.lotusEditor.layoutEngine.rootView.pages.indexOf(page);
                var headerFooterID = pe.lotusEditor.relations.createHeaderFooter(msgList, isHeader);
                //insert header/footer to the pages and update layout
                page.insertHeaderFooter(msgList, headerFooterID, isHeader);
                //render all headers/footers in these pages
                pe.lotusEditor.layoutEngine.rootView.update();

                // update next sections
                var index = setting.getSectionIndex(page.getSection().getId());
                if (index >= 0) {
                    var changedSec = setting.getSectionByIndex(index + 1);
                    if (!changedSec)
                    	changedSec = setting.getFirstSection();
                    if (changedSec)
                        pe.lotusEditor.layoutEngine.rootView.updateSection(changedSec, false, true);
                }
                
                var page = pe.lotusEditor.layoutEngine.rootView.pages.getByIndex(pageIndex);
                if (page)
                {
                    headerfooter = isHeader ? page.getHeader() : page.getFooter();
                }
                if (headerfooter) {
                    shell.moveToHeaderFooter(headerfooter, true);
                }
                if (msgList.length > 0) {
                    msgCenter.sendMessage(msgList);
                }

            }
        },

        /*
         * delete a header/footer frome section
         */
        deleteHeaderFooter: function(section, hfToDelete, isHeader) {
            var msgList = [];

            // clear header/footer in section
            var t = HFType.INVALID;
            var linkedSection = section;
            for (var i = HFType.BEGIN; i < HFType.END; ++i) {
                var linkedSection = this.getHFSectionLinkedTo(section, i);
                var hf = linkedSection.getHeaderFooterByType(i);
                if (hf == hfToDelete) {
                    t = i;
                    break;
                }
            }

            var oldSecJson = linkedSection.toJson();

            if (HFType.isValid(t))
                linkedSection.setHeaderFooterByType(t, null);

            if (!pe.lotusEditor.undoManager.inUndoRedo()) {
                var actPair = msgCenter.createReplaceKeyAct(linkedSection.getId(), oldSecJson, linkedSection.toJson(), constants.KEYPATH.Section);
                var msg = msgCenter.createMsg(constants.MSGTYPE.KeyMessage, [actPair], constants.MSGCATEGORY.Setting);
                msgList.push(msg);
            }

            // delete header/footer from relation
            pe.lotusEditor.relations.removeHeaderFooter(msgList, hfToDelete, isHeader);

            // send message
            if (msgList.length > 0 && !pe.lotusEditor.undoManager.inUndoRedo())
                msgCenter.sendMessage(msgList);

            // update
            var setting = pe.lotusEditor.setting;
            var index = setting.getSectionIndex(linkedSection.getId());
            if (index >= 0) {
                    var changedSec = setting.getSectionByIndex(index);
                    pe.lotusEditor.layoutEngine.rootView.updateSection(changedSec,false, true);
                //pe.lotusEditor.layoutEngine.rootView.updateSection(linkedSection);
                //pe.lotusEditor.layoutEngine.rootView.updateSection(section);
            } else {
                // something error!
                console.log("something error while delete header/footer");
                pe.lotusEditor.reset();
            }
        }
    };

    return SectionTools;

});
