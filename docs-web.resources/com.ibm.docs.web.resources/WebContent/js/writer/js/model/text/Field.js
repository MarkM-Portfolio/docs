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
    "dojo/date/locale",
    "dojo/_base/declare",
    "writer/constants",
    "writer/common/Container",
    "writer/model/text/InlineObject",
    "writer/model/Hints",
    "writer/model/text/PageNumberRun",
    "writer/msg/msgCenter",
    "writer/track/trackChange",
    "writer/global"
], function(dateLocale, declare, constants, Container, InlineObject, Hints, PageNumberRun, msgCenter, trackChange, g) {

    var Field = declare("writer.model.text.Field", InlineObject, {
        modelType: constants.MODELTYPE.FIELD,

        fromJson: function(json) {
            this.id = json.id;
            this.fld = json.fld;
            this.rt = json.rt;
            //simple field
            this.t = json.t;
            if (this.t == constants.RUNMODEL.SIMPLE_FIELD_Run)
                this.instr = json.instr;

            if (this.isSupported())
                this.instrText = this.getInstrText();

            this.start = json.s;
            this.length = parseInt(json.l) || 0;
            if (json.c == "#" && (!this.isPageNumber() || !this.paragraph.isInHeaderFooter())) {
                //reset content
                json.c = this.getTextContent();
                var start = this.start || json.fmt[0].s;
                var len = json.c.length;
                json.fmt = [{
                    "style": json.fmt[0].style,
                    "rt": "rPr",
                    "s": start,
                    "l": len,
                    "e_a": json.fmt[0].e_a
                }];
                var inTrack = trackChange.isOn() && g.modelTools.isTrackable(this);
                if (inTrack) {
                    json.fmt[0].ch = [trackChange.createChange("ins")];
                }

                json.l = len;
                this.length = len;
            }

            this.createHints(json.fmt);
            var firstHint = this.hints.getFirst();
            this.start = (firstHint && firstHint.start) || 0;

            //		if( !json.l ){
            //		    var length = 0;
            //		    this.hints.forEach(function(run){
            //		    	length += run.length;
            //		    });
            //		    this.length  = length;
            //		}
            //		else
            //			this.length = parseInt( json.l );
        },
        /**
         * check field which can be updated now
         * maybe more support in future
         * @returns boolean
         */
        isSupported: function() {
            var instr = [],
                t;

            if (this.t == constants.RUNMODEL.SIMPLE_FIELD_Run)
            //simple file use instrText directly
                t = this.instr;
            else if (this.fld) {
                for (var i = 0; i < this.fld.length; i++) {
                    if (this.fld[i].fldType == "instrText")
                        instr.push(this.fld[i].instrText);
                }
            }
            //only support simple field 
            if (instr.length == 1)
            //date time or page number 
                t = instr[0].t;

            return t && ((t.indexOf("PAGE") >= 0) || (t.indexOf("DATE") >= 0));
        },
        /**
         * is start field of toc
         * @returns
         */
        isTOCStart: function() {
            var instrText = this.getInstrText();
            return !!(instrText && instrText.t && instrText.t.indexOf("TOC") >= 0 && instrText.t.indexOf("Table") < 0);
        },

        isTOCEnd: function() {
            if (!this.fld || this.fld.length > 1)
                return false;
            for (var i = 0; i < this.fld.length; i++) {
                if (this.fld[0].fldType == "end")
                    return true;
            }
            return false;
        },
        /**
         * get instruction text 
         */
        getInstrText: function() {
            if (this.instr)
                return {
                    "t": this.instr
                };
            var fld = this.fld;
            if (fld) {
                for (var i = 0; i < fld.length; i++) {
                    if (fld[i].fldType == "instrText")
                        return fld[i].instrText;
                }
            }
        },
        /**
         * create child hints from json
         * @param jsonAttr
         * @returns
         */
        createHints: function(jsonAttr) {
            if ((this.isPageNumber() || this.isTotalPageNumber()) && this.paragraph.isInHeaderFooter()) {
                this.hints = new Container(this);
                var firstHint = jsonAttr && jsonAttr[0];
                var run;
                if (!firstHint) {
                    //create a dummy run
                    run = new PageNumberRun({
                        s: this.start,
                        l: this.length,
                        rt: "rPr"
                    }, this);

                } else {
                    if (this.length > 0)
                	{
	                	var txt = "";
	                	for(var i=0;i<this.length;i++)
	                		txt += "#";
	                	run = new PageNumberRun(firstHint, this, txt);
                	}
                }
                var inTrack = trackChange.isOn() && g.modelTools.isTrackable(this);
                if (inTrack && run) {
                    if (run.fmt)
                        run.fmt[0].ch = [trackChange.createChange("ins")];
                    else
                        run.ch = [trackChange.createChange("ins")];
                }
				if (run)
                	this.hints.append(run);
                return this.hints;
            } else {
                return Hints.prototype.createHints.apply(this, arguments);
            }
        },
        toJson: function(index, length) {
            var retVal = {};

            index = (index == null) ? this.start : index;
            length = (length == null) ? this.length : length;

            retVal.fmt = this.hintsToJson(index, length);
            retVal.id = this.id;
            if (this.isSupported() && this.instrText && this.fld) { //get fld's structure
                retVal.fld = g.modelTools.createFieldInstrTextJson(this.instrText);
            } else if (this.fld)
                retVal.fld = this.fld;
            //End
            this.instr && (retVal.instr = this.instr);
            this.rt && (retVal.rt = this.rt);
            this.t && (retVal.t = this.t);

            retVal.s = "" + index;
            retVal.l = "" + length;

            return retVal;
        },
        isTotalPageNumber: function() {
            return this.instrText && (this.instrText.t.indexOf("NUMPAGES") >= 0 || this.instrText.t.indexOf("SECTIONPAGES") >= 0);
        },

        isPageNumber: function() {
            return this.instrText && this.instrText.t.indexOf("PAGE") >= 0;
        },

        isDynaPageNumber: function() {
            return this.isPageNumber() && g.modelTools.isInHeaderFooter(this);
        },
        
        isPageRef: function() {
            return this.instrText && this.instrText.t.indexOf("PAGEREF") >= 0;
        },

        isDateTime: function() { //" DATE \\@ \"M/d/yyyy\" "
            //" DATE \\@ \"h:mm am/pm\" "
            return this.instrText && this.instrText.t.indexOf("DATE") >= 0;
        },
        getDateTimeFormat: function() {
            var text = this.instrText.t,
                i = text.indexOf('"'),
                e = text.lastIndexOf('"');
            return text.substring(i + 1, e);
        },

        getTextContent: function() {
            if (!this.instrText || !this.instrText.t)
                return "";

            var text = "";
            var paragraph, index, anchor;
            if (this.isPageNumber()) {
                if (this.isPageRef() && (anchor = this.parent.anchor || this.parent.name)) { //in toc ...
                    if (anchor) {
                        var bm = g.modelTools.getBookMark(anchor);

                        if (bm) {
                            paragraph = bm.parent;
                            index = 0;
                        } else
                            return;

                    } else {
                        return;
                    }
                } else if (this.isTotalPageNumber()) { //total page numbers 
                    var totalNumber = window.layoutEngine.rootView.pages.length();
                    return totalNumber + "";
                } else if (!this.isPageRef()) {
                    paragraph = this.parent;
                    index = this.start;
                }

                if (paragraph) {
                    try {
                        var viewPos = g.rangeTools.toViewPosition(paragraph, index);
                        if (viewPos && viewPos.obj && !g.modelTools.getParent(viewPos.obj.model, function(p){return p == paragraph;}))
                        {
                            viewPos = null;
                        }
                        var page;
                        if (!viewPos) {
                            var range = pe.lotusEditor.getSelection().getRanges()[0];
                            viewPos = range && range.getStartView();
                            page = !viewPos && range && range.rootView && range.rootView.page;
                        }

                        if (viewPos) {
                            page = g.viewTools.getPage(viewPos.obj);
                        }

                        if (page) {
                            var pageNumber = page.pageNumber;
                            text = pageNumber + "";
                        }
                    } catch (e) {
                        console.log("Text was not rendered: " + e.message);
                    }
                }

            } else if (this.isDateTime()) {
                var date = new Date();
                try {
                    //in dojo, day of week is "EEEE" while "dddd" in json ??
                    //		   time is "a" while "am/pm" in json 
                    var format = this.getDateTimeFormat().replace(/dddd/g, "EEEE").replace(/am\/pm/g, "a"),
                        options = {};
                    options.datePattern = format;
                    options.selector = "date";
                    text = dateLocale.format(date, options);
                    if (window.BidiUtils.isBidiOn()) {
                        var paraProperty = this.parent && this.parent.directProperty;
                        if (paraProperty && (paraProperty.getDirection() == "rtl")) {
                        	text = BidiUtils.RLE + text;
                        }
                        if (BidiUtils.isArabicLocale()) {
                        	text = text.replace(new RegExp(BidiUtils.RLM, "g"), "");
                        	text = text.replace(/(\d{1,2})([/])(\d{1,2})([/])(\d{4})/g, "$5$2$3$4$1" + BidiUtils.RLM);
                        	text = BidiUtils.convertArabicToHindi(text);
                        }

                    }
                } catch (e) {
                    text = dateLocale.format(date, {
                        selector: "date"
                    });
                    console.log(e);
                }
            }
            return text;
        },

        update: function(bUpdate, bSendMsg) {
            var oldText = this.getText();
            var text = this.getTextContent();
            if (text != oldText) {
                this.updateText(text, bSendMsg, bUpdate);
                this.paragraph.buildRuns();
                if (bUpdate) {
                    this.paragraph.markDirty();
                    this.paragraph.parent.update();
                }
            }
        },

        getText: function(start, len) {
            if (start == null)
                start = this.start;
            if (len == null)
                len = this.length;

            if (!this.paragraph) {
                return "";
            }

            if (this.paragraph.text) {
                return this.paragraph.text.substr(start, len);
            } else
                return "";
        },

        updateText: function(text, bSendMsg, bUpdate) {
            if (!text || text == this.getText())
                return;
            //create new field
            var newField = {};
            var hint = this.hints.getFirst().toJson();
            hint.l = text.length;

            newField.id = this.id;
            newField.instrText = this.instrText;
            newField.rt = constants.RUNMODEL.FIELD_Run;
            newField.c = text;
            newField.fmt = [hint];
            var paragraph = this.paragraph;
            var idx1 = this.start;
            var idx2 = this.start + this.length;
            var msgs = [];
            
            if (bSendMsg) {
                if (paragraph.isTrackBlockGroup) {
                    var redirects = paragraph.redirectIndex(idx1, idx2 - idx1);
                    array.forEach(redirects, function(redirect){
                        msgCenter.addDeleteMsg(redirect.obj, redirect.start, redirect.start + redirect.len, msgs);
                    });
                }else {
                    msgCenter.addDeleteMsg(paragraph, idx1, idx2, msgs);
                }
            }

            // check if to check comments on field
            var needCheckCmt = false;
            var child = this.firstChild();
            while (child) {
                if (child.clist && child.clist.length > 0) {
                    needCheckCmt = true;
                    break;
                }
                child = this.nextChild(child);
            }
            //update format of the text run 
            bUpdate && this.markDelete();
            this.createHints(newField.fmt);
            //this.text = text;
            bUpdate && this.markInsert();
            var oldLength = this.length;
            this.changeLength(text.length);
            if (bSendMsg && needCheckCmt) {
                var cmtMsgs = pe.lotusEditor.relations.commentService.checkCommentsDelete();
                if (cmtMsgs.length > 0)
                    msgs = msgs.concat(cmtMsgs);
            }
            this.paragraph._deleteText(this.start, oldLength);
            this.paragraph._insertText(text, this.start);

            if (bSendMsg) {
                var insertLen = text.length;
                var target = paragraph, targetIndex = idx1;
                if (paragraph.isTrackBlockGroup) {
                    var redirects = paragraph.redirectIndex(idx1);
                    if (redirects && redirects.length == 1) {
                        target = redirects[0].obj;
                        targetIndex = redirects[0].start; 
                    }
                }
                var actPair = msgCenter.createInsertTextAct(targetIndex, insertLen, target);
                var msg = msgCenter.createMsg(constants.MSGTYPE.Text, [actPair]);
                msg && msgs.push(msg);
                msgCenter.sendMessage(msgs);
            }
        }

    });

    return Field;
});
