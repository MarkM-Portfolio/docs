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
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/topic",
    "writer/plugins/Plugin",
    "writer/common/RangeIterator",
    "writer/core/Range",
    "writer/constants",
    "writer/core/Event",
    "writer/msg/msgCenter",
    "writer/util/HelperTools",
    "writer/util/ModelTools",
    "writer/util/RangeTools"
], function(array, declare, lang, i18nmenubar, topic, Plugin, RangeIterator, Range, constants, Event, msgCenter, HelperTools, ModelTools, RangeTools) {

    var style = function(commandDef, removeStyleDef) {
        this._ = {
            definition: commandDef,
            removeStyle: removeStyleDef,
            applyRecords: [],
            applyParaRecords: []
        };
    };

    style.prototype = {
        _generateStyle: function(model) {
            var styles; //

            if (model.textProperty && model.textProperty.style)
            //do not collect merged styles
                styles = model.textProperty.style;
            else
                styles = model.getStyle();

            var retStyles = {};
            var styleDef = this._.definition;
            for (var key in styleDef) {
                retStyles[key] = styles[key] || "";
            }
            return retStyles;
        },

        _setModelStyle: function(m, remove) {
            if (!m) return;
            var rec;
            var styleDef = remove ? (this._.removeStyle || this._.definition) : this._.definition;

            if (m.modelType === constants.MODELTYPE.PARAGRAPH) {
                rec = this._.applyParaRecords[this._.applyParaRecords.length - 1];
                var prop = m.paraTextProperty;
                if (prop) {
                    rec.o.push({
                        s: prop.toJson()
                    });
                    prop.setStyle(styleDef, remove);
                    rec.n.push({
                        s: prop.toJson()
                    });
                }
            } else {
                if (m.hints) {
                    var hints = m.hints,
                        that = this;
                    hints.forEach(function(hint) {
                        if (hint.hints || !hint.isTrackDeleted())
                            that._setModelStyle(hint, remove);
                    });
                } else {
                    rec = this._.applyRecords[this._.applyRecords.length - 1];
                    
                    if (styleDef.u)
                    {
                    	if(ModelTools.isInToc(m))
                    		styleDef.u.val = "none";
                    	else
                    		rec.o = m.textProperty.getUnderline();
                    }
                    else if (styleDef.strike)
                        rec.o = m.textProperty.getStrike();
                    else if (styleDef.rFonts)
                        rec.o = m.textProperty.getJsonRFonts();
                    else
                        rec.o = this._generateStyle(m);

                    //for create message
                    m.setStyle(styleDef, remove);

                    if (styleDef.u)
                        rec.n = m.textProperty.getUnderline();
                    else if (styleDef.strike)
                        rec.n = m.textProperty.getStrike();
                    else if (styleDef.rFonts)
                        rec.n = m.textProperty.getJsonRFonts();
                    else
                        rec.n = this._generateStyle(m);
                }
            }
        },
        /* apply style to selection.
         * para:	The selected paragraph
         * start:	The start position of paragraph
         * end:		The end position of paragraph
         * bRemove: remove styles if true. add else.
         * isCollapsed: The set style range is collapsed. True will select split run in range. 
         * */
        _applyStyle: function(para, start, end, bRemove, isCollapsed) {
            var cont = para.container;
            if (end < start) { //reverse the first and the last.
                var tmp = start;
                start = end;
                end = start;
            }
            if (para.isTrackBlockGroup) {
                var redirects = para.redirectIndex(start, end - start);
                var me = this;
                array.forEach(redirects, function(redirect){
                    me._applyStyle(redirect.obj, redirect.start, redirect.start + redirect.len, bRemove, isCollapsed);
                });
            }
            var hasReset = false;
            //this._.applyRecords.push({idx:start,len:end-start,target:para,n:[],o:[]});
            // 1.1:select the whole paragraph.
            var isSelectEmpty = false;
            var modelTools = ModelTools;
            if (start == 0 && para.getLength() === end) {
                this._.applyParaRecords.push({
                    target: para,
                    n: [],
                    o: []
                });
                this._setModelStyle(para, bRemove);
                // Will change the list symbol text property
                if (para.isList()) {
                    hasReset = true;
                    para.markReset();
                    para.parent.update();
                }
            } else if (isCollapsed) {
                // Check if current select run is setting style run.
                // For case set style twice, like set italic + underline
                var sel = pe.lotusEditor.getSelection();
                var range = sel.getRanges()[0];
                var startModel = range.getStartModel();
                var run = startModel.obj;
                if (run.modelType == constants.MODELTYPE.PARAGRAPH)
                    run = run.byIndex(startModel.index) || run.hints.getLast();
                if (run.length == 0 && run.isTextRun && run.isTextRun() && !run.isStyleRun)
                    run.isStyleRun = true;

                if (run.length == 0 && run.isStyleRun) {
                    isSelectEmpty = true;
                    this._.applyRecords.push({
                        idx: run.start,
                        len: run.length,
                        target: para,
                        n: [],
                        o: []
                    });
                    this._setModelStyle(run, bRemove);

                    if (!modelTools.isEmptyParagraph(para))
                        this._recordStyleRun(run);
                }
            }

            if (!isSelectEmpty) {
                var runs;
                if (modelTools.isEmptyParagraph(para))
                    runs = para.hints;
                else
                    runs = para.splitRuns(start, end - start);
                if (runs.length() == 0 && para.isEmpty()) {
                    runs = para.hints;
                }
                var that = this;
                runs.forEach(function(run) {
                	//TODO:disable text property changing of page number
                	if(!ModelTools.isInPageNumber(run) && (!run.isTrackDeleted()))
                	{
	                    that._.applyRecords.push({
	                        idx: run.start,
	                        len: run.length,
	                        target: para,
	                        n: [],
	                        o: []
	                    });
	                    that._setModelStyle(run, bRemove);
	                    if (isCollapsed) {
	                        if (!modelTools.isEmptyParagraph(para))
	                            that._recordStyleRun(run);
	                    }
                	}
                });
            }
            if (!hasReset) {
                para.markDirty();
                if (isCollapsed) { // fix 40897
                    para.parent && para.parent.update(true);
                }
            }
        },

        /**
         * The function will select the run to ensure the command status updated.
         * Then attach selection change event, when the selection changed to other object and the style run is empty, will remove the run.
         * @param run The run which will be set style.
         */
        _recordStyleRun: function(run) {
            // 1. Select the run to update command status
            var pos = {
                "obj": run,
                "index": 0
            };
            setTimeout(function() {
                var sel = pe.lotusEditor.getSelection();
                var curRange = sel.getRanges()[0];
                var newRange = new Range(pos, pos, curRange.rootView);
                sel.selectRanges([newRange]);
            }, 10);

            // 2. Listen the selection change event. To prepare remove the empty run if no input
            run.isStyleRun = true; // Set a flag to this run.

            var selectionChangeFunc = function() {
                var sel = pe.lotusEditor.getSelection();
                var range = sel.getRanges()[0];
                var startModel = range.getStartModel();
                var selRun = startModel.obj;
                if (run.length != 0 || selRun != run) {
                    delete run.isStyleRun;
                    if (run._handle) {
                        run._handle.remove();
                        delete run._handle;
                    }

                    // Remove empty run but not for empty paragraph
                    if (run.length == 0 && selRun != run) {
                        var parent = run.parent;
                        var hintsContainer = parent && parent.hints;
                        if (hintsContainer) {
                            run.markDelete();
                            hintsContainer.remove(run);
                            if (hintsContainer.length() == 0)
                                parent.fillHintIfEmpty();
                            parent.buildRuns();

                            // Defect 49271
                            parent.markDirty && parent.markDirty();
                            parent.parent && parent.parent.update(true);
                        }
                    }

                    pe.lotusEditor.indicatorManager.drawUserSelections();
                }
            };
            if (!run._handle)
                run._handle = topic.subscribe(constants.EVENT.SELECTION_CHANGE, selectionChangeFunc);
        },

        _getRun: function(para, index) {
            var t = para.container.getFirst();
            while (t) {
                if (t.start <= index && t.start + t.length > index || (t.start + t.length == index && !t.next())) {
                    return t;
                }
                t = t.next();
            }
        },
        _applyInlineStyle: function(ranges, bRemove) {
            var range, it, para, msgs = [];
            var updateRoot = null;

            for (var i = 0; i < ranges.length; i++) {
                range = ranges[i];
                var startPos, endPos;
                var paras = [];
                // fix 36286: change font properties doesn't work when a textbox is selected
                var range = RangeTools.getStyleOperationRange(ranges[i]);
                startPos = range.getStartParaPos().index, endPos = range.getEndParaPos().index;
                it = new RangeIterator(range);
                para = null;
                // TODO Select paragraphs in nested table
                while (para = it.nextParagraph()) {
                    if (para.modelType == constants.MODELTYPE.PARAGRAPH)
                        paras.push(para);
                }
                if (paras.length == 0)
                    continue;

                this._.applyRecords = [];
                this._.applyParaRecords = [];
                // Set the first paragraph
                var firstPara = paras[0];
                if (paras.length == 1) {
                    var isCollapsed = (ranges.length == 1 && range.isCollapsed());
                    // Collapsed case will select range to the new created run
                    this._applyStyle(firstPara, startPos, endPos, bRemove, isCollapsed);
                } else {
                    this._applyStyle(firstPara, startPos, firstPara.getLength(), bRemove);

                    // Set the last paragraph
                    var lastPara = paras[paras.length - 1];
                    this._applyStyle(lastPara, 0, endPos, bRemove);

                    // Set other paragraphs
                    for (var j = 1; j < paras.length - 1; j++) {
                        para = paras[j];
                        this._applyStyle(para, 0, para.getLength(), bRemove);
                    }
                }

                if (range.isCollapsed() && firstPara.getLength() != 0) //in a run and it's not empty.so needn't send msg
                    continue;

                /* DONE:send message.
                 * msg to apply rPr in paragraph.
                 * */
                var mc;
                if (pe.lotusEditor._shell.getEditMode() == constants.EDITMODE.EDITOR_MODE)
                    mc = constants.MSGCATEGORY.Content;
                else
                    mc = constants.MSGCATEGORY.Relation;
                var pacts = array.map(
                    array.filter(this._.applyParaRecords, function(i) {
                        return !(i.target && i.target.isTrackBlockGroup);
                    }),
                    function(item) {
                        var len = item.n.length; // Only record the last new and the first old.
                        item.n[len - 1].type = "pt"; // pt is Paragraph text type
                        item.o[0].type = "pt";
                        return msgCenter.createSetAttributeAct(item.target, item.n[len - 1], item.o[0]);
                    });
                var pmsg = pacts.length > 0 ? msgCenter.createMsg(constants.MSGTYPE.Attribute, pacts, mc, false) : null;
                pmsg && msgs.push(pmsg);

                if (!range.isCollapsed() || firstPara.text.length == 0) {
                    var tacts = array.map(
                        array.filter(this._.applyRecords, function(i) {
                            return i.p == undefined && !(i.target && i.target.isTrackBlockGroup);
                        }),
                        function(item) {
                            return msgCenter.createSetTextAttribute(item.idx, item.len, item.target, item.n, item.o);
                        });
                    var tmsg = tacts.length > 0 ? msgCenter.createMsg(constants.MSGTYPE.TextAttribute, tacts, mc, false) : null;
                    tmsg && msgs.push(tmsg);
                }

                //update parent cell if exists
                var parentCell = ModelTools.getAncestor(firstPara, constants.MODELTYPE.CELL);
                parentCell && parentCell.update();

                updateRoot = updateRoot || ModelTools.getDocument(firstPara); //first.obj.paragraph.parent;
            }

            updateRoot && updateRoot.update();
            msgCenter.sendMessage(msgs);
            return;
        },

        applyStyle: function(data, bRemove) {
            // Get all ranges from the selection.
            var selection = pe.lotusEditor.getSelection();
            var ranges = selection.getRanges();
            if (data) {
                for (var key in this._.definition) {
                    this._.definition[key] = data;
                    if (key.indexOf("color") > -1) bRemove = false;
                }
            }
            selection.store();
            this._applyInlineStyle(ranges, bRemove);
            selection.restoreBeforeUpdate(true);
        }
    };



    return style;
});
