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
    "dojo/topic",
    "dojo/dom",
    "dojo/dom-geometry",
    "concord/util/events",
    "writer/util/ModelTools",
    "writer/core/Range",
], function(lang, topic, dom, domGeometry, events, ModelTools, Range) {

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
    /*
     * This class is intend to manage comments
     * It responses for comments load/save
     * and add/modify/delete 
     */
    var RTECommentService = lang.mixin(lang.getObject("writer.model.comments.RTECommentService", true), {
        instantiated: null,
        init: function() {
            var clz = {
                // class definition starts
                constructor: function() {
                    this.laststate = {
                            len: 0,
                            startview: null,
                            endview: null,
                            scrbasept: null,
                            enablechksel: false,
                            sticky: false
                        };
                	this.select_comment_id = [];
                    topic.subscribe(events.comments_queryposition, lang.hitch(this, this._getPosition));
                },

                createComments: function(commentsJson) {},
                
                insertComment: function(commentId, commentContent) {},
                insertCmtTextRun: function(textrun) {},

                deleteComment: function(comment_id, coedit) {},
                updatedComment: function(cmtid, idx, key, val) {},
                checkCommentsDelete: function() {return [];},
                trySetComment: function(obj, json, create) {},
                trySetCommentOnInsertHint: function(hint, pre_run, next_run) {},                
                handleCommentByView: function(runview) {},
                
                getXCommentItem: function(cmtid) {return null;},                
                addComment2ParaModel: function(para, c_id, start, end, runid) {},
                
                isCommentContinued: function(obj, index) {return true},
                
                getCSSString: function(cl, isimg) { return "";},
                isImageRange: function(range) {
                    if (range.getStartModel().obj == range.getEndModel().obj) {
                        return ModelTools.isImage(range.getStartModel().obj);
                    }
                    return false;
                },
                isTextBoxRange: function(range) {
                    if (range.getStartModel().obj == range.getEndModel().obj) {
                        return ModelTools.isTextBox(range.getStartModel().obj);
                    }
                    return false;
                },
                _getAddCommentRange: function(noselection) {
                    var selection = pe.lotusEditor.getSelection();
                    var ranges = selection.getRanges();
                    if (ranges.length == 1) {
                        //select the tx, return directly 
                        if (this.isTextBoxRange(ranges[0]))
                            return ranges;
                        if (ranges[0].isCollapsed()) {
                            var modelpos = ranges[0].getStartModel();
                            var wordse = ModelTools.getCurrentWordRange(modelpos);
                            var wordrange = new Range(wordse.start, wordse.end, ranges[0].getRootView());
                            if (!wordrange.isCollapsed()) { // start and end have a same obj, must not an empty range
                                if (!noselection) {
                                    selection.selectRanges([wordrange]);
                                    ranges = selection.getRanges();
                                } else {
                                    ranges = [];
                                    ranges.push(wordrange);
                                }
                            } else
                                return null; // The range is empty run.
                        }
                    }
                    return ranges;
                },
                _getPosition: function(pos) {

                    var selection = pe.lotusEditor.getSelection();
                    var selranges = selection.getRanges();

                    if (pos.eventName == "checkforshowcomments") {
                        pos.filled = true;
                        pos.ret = true;
                        if (selranges.length > 0) {
                            var model = selranges[0].getStartModel().obj;
                            if (ModelTools.isInNotes(model) || ModelTools.isInHeaderFooter(model))
                                pos.ret = false;
                        }
                        return;
                    }

                    var doc_height = document.body.clientHeight;
                    var view_height = dom.byId('editorFrame').offsetHeight;
                    var headerheight = doc_height - view_height;

                    var firstvw = null;
                    if (this.select_comment_id.length == 0) {
                        // assume the ranges is valid and checked by checkAddComment() 
                        var ranges = this._getAddCommentRange(true); // don't change selection
                        if (ranges && ranges.length >= 1) {
                            if (selranges[0].isCollapsed()) {
                                var cursorinfo = pe.lotusEditor.getSelection().getInputPos().getCursorInfo();
                                var curpos = pe.lotusEditor._shell.clientToLogical(cursorinfo.position);
                                pos.filled = true;
                                pos.x = curpos.x;
                                pos.y = curpos.y;
                                pos.w = 10;
                                pos.h = cursorinfo.length + 3;
                            } else { // for simplicity, just check the first view
                                var range = ranges[0];
                                var view = range.getStartView();
                                if (view) {
                                    if (!firstvw) firstvw = view.obj;
                                    var spos = selection._getViewPos(view), // logical pos
                                        epos = selection._getViewPos(range.getEndView());
                                    pos.filled = true;
                                    pos.x = spos.x,
                                        pos.y = spos.y,
                                        pos.w = epos.x - spos.x; // also overwrite collapsed case
                                    if (view.obj.getHeight)
                                        pos.h = view.obj.getHeight();
                                    else {
                                        pos.h = 17;
                                        if (view.obj.domNode) {
                                            var domrect = domGeometry.position(view.obj.domNode);
                                            pos.h = domrect.h;
                                        }
                                    }
                                    if (this.isImageRange(range)) {
                                        if (ViewTools.isAnchor(view.obj)) {
                                            pos.w = view.obj.getWholeWidth();
                                            pos.h = view.obj.getWholeHeight();
                                        } else
                                            pos.y = pos.y - pos.h + spos.h; // top left
                                    }
                                    pos.h += 2;
                                }
                            }
                        }
                        if (!pos.filled) { // try the cursor position
                            var cursor = pe.lotusEditor.getSelection().getCursor();
                            pos.filled = true;
                            pos.x = Number(cursor.getX().replace('px', '')) - pe.lotusEditor._shell.baseLeft;
                            pos.y = Number(cursor.getY().replace('px', '')) - pe.lotusEditor._shell.baseTop;
                            pos.w = 10;
                            pos.h = 17;
                        }
                    } else {
                        // @todo(zhangjf), use the right comment for pos from the array
                        var cmtid_ = this.select_comment_id[0];
                        var comment = this.comments[cmtid_];

                        if (!comment || !comment.runs || comment.runs.length == 0) {
                            // for dangling comments
                            var pt = pe.lotusEditor._shell.screenToClient({
                                x: 0,
                                y: 10
                            });
                            pt = pe.lotusEditor._shell.clientToLogical(pt);
                            pos.x = 0;
                            pos.y = pt.y;
                            pos.w = 10;
                            pos.h = 10;
                            pos.filled = true;
                            //return;
                        } else {
                            //var firstview = null;
                            pos.filled = true;
                            var runbt = 0;
                            for (var n = 0; n < comment.runs.length; n++) {
                                var run = comment.runs[n];
                                if (run.deleted === true) continue;
                                var allViews = run.getAllViews();
                                for (var ownerId in allViews) {
                                    var viewers = allViews[ownerId];
                                    var view = viewers.getFirst();
                                    //if (view && !firstview) firstview = view;
                                    while (view) {
                                        if (!view.getParent()) {
                                            view = viewers.next(view);
                                            continue;
                                        }
                                        var l = view.getLeft(),
                                            t = view.getTop(),
                                            w = view.getWidth(),
                                            h = view.getHeight(),
                                            r = l + w,
                                            b = t + h;

                                        var line = ViewTools.getLine(view);
                                        if (line && line.isBidiLine() && view._logicalIndexToOffset) {
                                            l = view._logicalIndexToOffset(0, line);
                                        }
                                        var scale = pe.lotusEditor.getScale();
                                        if (ViewTools.isImage(view) && ViewTools.isAnchor(view)) {
                                            w = view.getWholeWidth() * scale;
                                            h = view.getWholeHeight() * scale;
                                            r = l + w;
                                            b = t + h;
                                        } else if (scale != 1 && ViewTools.isImage(view)) {
                                            w = w * scale; // recale the width and height in zoom mode
                                            h = h * scale;
                                            r = l + w;
                                            b = t + h;
                                        }
                                        if (b <= runbt || !pos.x) { // the most top-left one by checking bottom
                                            runbt = b;
                                            firstvw = view;
                                            if (!pos.x) {
                                                pos.x = l;
                                                pos.w = r - l;
                                                pos.y = t;
                                                pos.h = b - t;
                                            } else {
                                                var hdiff = pos.y - t;
                                                /*if (t < pos.y)*/
                                                pos.y = t;
                                                pos.h += hdiff;
                                                if (l < pos.x) {
                                                    pos.x = l;
                                                    if ((b >= (pos.y + pos.h)) && (b < (pos.y + pos.h + 200)) && /* only when horiztol position overlapped*/
                                                        ((r >= pos.x - 80 && r <= pos.x + pos.w + 80) || (l >= pos.x - 80 && l <= pos.x + pos.w + 80) || (l >= pos.x - 80 && r <= pos.x + pos.w + 80)))
                                                        pos.h = b - pos.y;
                                                    if (r > (pos.x + pos.w)) pos.w = r - pos.x;
                                                }
                                            }
                                        } else {
                                            if ((b >= (pos.y + pos.h)) && (b < (pos.y + pos.h + 200)) && /* only when horiztol position overlapped*/
                                                ((r >= pos.x - 80 && r <= pos.x + pos.w + 80) || (l >= pos.x - 80 && l <= pos.x + pos.w + 80) || (l >= pos.x - 80 && r <= pos.x + pos.w + 80)))
                                                pos.h = b - pos.y;
                                            if (r > (pos.x + pos.w)) pos.w = r - pos.x;
                                        }
                                        view = viewers.next(view);
                                    }
                                }
                            }
                        }
                    }
                    var rpt = pe.lotusEditor._shell.logicalToScreen(pos);
                    pos.x = rpt.x;
                    pos.y = rpt.y;
                    pos.y += headerheight;

                    // check image view for some special handle
                    if (pos.y < 0 && firstvw && ViewTools.isImage(firstvw)) {
                        var first_vw_h = firstvw.getHeight();
                        if (ViewTools.isAnchor(firstvw))
                            first_vw_h = firstvw.getWholeHeight();
                        var img_bottom = pos.y + first_vw_h;
                        if (img_bottom > headerheight) { // when the image bottom is visible
                            pos.y = headerheight + 1; // temporarily adjust height
                            pos.h = img_bottom - headerheight;
                        }
                    } else {
                        // check visiblity
                        var rect_b = pos.y + pos.h;
                        if (rect_b < (headerheight + 1) || pos.y > (doc_height - 5)) {
                            pos.x = -200;
                            pos.y = -200; // make the comment box invisible
                        } else if (pos.y < 0) {
                            pos.y = headerheight + 1;
                            pos.h = rect_b - headerheight;
                        }
                    }

                    //console.log("--("+pos.x+")("+pos.y+")("+pos.w+")("+pos.h+")--");

                    // finally remember current selection and base point for selection change or 
                    // scroll/resize event check
                    this.laststate.enablechksel = true;
                    var lefttop = {
                        x: 0,
                        y: 0
                    };
                    lefttop = pe.lotusEditor._shell.logicalToScreen(lefttop);
                    this.laststate.scrbasept = {
                        x: lefttop.x,
                        y: lefttop.y
                    };
                    this.laststate.len = 0;
                    this.laststate.startview = null;
                    this.laststate.endview = null;
                    var cur_ranges = selection.getRanges();
                    // only remember current first range for selection change check
                    var rlen = cur_ranges.length;
                    if (rlen > 0) {
                        this.laststate.len = rlen;
                        this.laststate.startview = cur_ranges[0].getStartView();
                        this.laststate.endview = cur_ranges[0].getEndView();
                    }

                    return;
                }
            };
            clz.constructor();
            return clz;
            // class definition ends
        },
        getInstance: function() {
            if (!this.instantiated) {
            	this.instantiated = this.init();
            }
            return this.instantiated;
        }
    });
    return RTECommentService;
});
