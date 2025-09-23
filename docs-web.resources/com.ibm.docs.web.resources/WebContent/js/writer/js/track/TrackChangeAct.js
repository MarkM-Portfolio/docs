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
    "dojo/_base/array",
    "dojo/topic",
    "dojo/aspect",
    "writer/constants",
    "dojo/i18n!writer/nls/track",
    "dojo/date/locale",
    "dojo/string",
    "writer/global"
], function(declare, lang, array, topic, aspect, constants, nls, dateLocale, string, g) {

    var TrackChangeAct = declare("writer.track.TrackChangeAct", null, {

        statics: {
            id: 1
        },
        u: null,
        mc: "",
        start: 0,
        end: 0,
        buildTime: 0,

        EDIT_TYPE_INS_TEXT: "ins_txt",
        EDIT_TYPE_DEL_TEXT: "del_txt",
        EDIT_TYPE_CREATE_PARA: "crt_para",
        EDIT_TYPE_MERGE_PARA: "mge_para",
        EDIT_TYPE_CREATE_TABLE: "crt_tbl",
        EDIT_TYPE_DELETE_TABLE: "del_tbl",
        EDIT_TYPE_DEL_BIG_TEXT: "del_big_txt",

        constructor: function(u, mc) {
            this.id = this.statics.id++;
            this.u = u;
            this.mc = mc;
            this.modelChPairs = []; // models contains a map {m: the Model, chs: theChs}
            this.types = [];
            this.buildTime = new Date();
        },
        
        // if the models is the same models (it may have internal text changed)
        // We do not bother delete the act and re-append a new one
        // Just use the old act with models 
        replace: function(act)
        {
            // console.warn(this.id + " replaced with new act " + act.id);
            this.start = act.start;
            this.end = act.end;
            // this.id = act.id;
            this.deleted = false;
            
            // TODO, to check if below is needed.
            array.forEach(this.modelChPairs, function(pair, index){
            	pair.ch = act.modelChPairs[index].ch;
            });
        },
        
        dirty: false,
        deleted: false,
        
        getOnlyContinueDeleteModels: function()
        {
            var continueDeletion = [];
            var broken = false;
            var hasDelete = false;
            var noContinue = false;
            var me = this;
            array.forEach(this.modelChPairs, function(pair){
                if (noContinue)
                    return;
                var ch = pair.ch;
                var delCh = array.filter(ch, function(c){
                    return c.t == "del" && c.d >= me.start && c.d <= me.end;
                });
                if (delCh && delCh[0])
                {
                    hasDelete = true;
                    if (broken)
                    {
                        continueDeletion = [];
                        noContinue = true;
                    }
                    else
                        continueDeletion.push(pair);
                }
                else if (hasDelete)
                {
                    broken = true;
                }
            });
            return continueDeletion;
        },
        
        markDirty: function()
        {
        	this.dirty = true;
            delete this.seen;
            delete this._cachedHtml;
            delete this._cachedText;
        	topic.publish("/track/act/updated", this, this.dirty, this.deleted);
        },
        
        markDeleted: function()
        {
        	this.deleted = true;
        	topic.publish("/track/act/updated", this, this.dirty, this.deleted);
        },

        addType: function(insOrDel) {
            if (this.types.length == 2)
                return;
            if (this.types.length == 0)
                this.types.push(insOrDel);
            if (this.types.length == 1 && this.types[0] == "del" && insOrDel == "ins")
                this.types.push(insOrDel);
            if (this.types.length == 1 && this.types[0] == "ins" && insOrDel == "del")
                this.types.push(insOrDel);
        },

        mixTypes: function() {
            return this.types.length == 2;
        },

        onlyIns: function() {
            return this.types.length == 1 && this.types[0] == "ins";
        },

        onlyDel: function() {
            return this.types.length == 1 && this.types[0] == "del";
        },

        toHTML: function(t) {
            t = t.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/\"/gm, "&quot;").replace(/ /g, "&nbsp;");
            return t;
        },
        
        formatTime: function()
        {
            var current = new Date();
            var myTime = new Date(this.end);
            if (myTime.getDate() == current.getDate() && myTime.getMonth() == current.getMonth() &&
                myTime.getFullYear() == current.getFullYear()) {
                var time = dateLocale.format(myTime, {
                    selector: "time",
                    formatLength: "short"
                });

                return nls.today + " " + time;
            }
            else {
                return dateLocale.format(myTime, {
                    selector: "date",
                    formatLength: "short"
                });
            }
        },

        getTypeTimesHtmlView: function() {
            var editType = "";
            if (this.isTableAct())
                editType = this.onlyIns() ? nls.panel_action_insert_table : nls.panel_action_delete_table;
            else if (this.isImageAct())
                editType = this.onlyIns() ? nls.panel_action_insert_image : nls.panel_action_delete_image;
            else if (this.isBigRangeAct())
            	editType = nls.panel_action_delete;
            else if (this.isTextBoxAct() || this.isCanvasAct())
                editType = this.onlyIns() ? nls.panel_action_insert_object : nls.panel_action_delete_object;
            else
                editType = this.mixTypes() ? nls.panel_action_edit : (this.onlyIns() ? nls.panel_action_add : nls.panel_action_delete);

            var time = BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(this.formatTime() + "") : this.formatTime();
            return editType + "&nbsp;<span class='time'>" + time + "</span>";
        },
        
        getTypeTimesText: function() {
            var editType = "";
            if (this.isTableAct())
                editType = this.onlyIns() ? nls.panel_action_insert_table : nls.panel_action_delete_table;
            else if (this.isImageAct())
                editType = this.onlyIns() ? nls.panel_action_insert_image : nls.panel_action_delete_image;
            else if (this.isBigRangeAct())
            	editType = nls.panel_action_delete;
            else if (this.isTextBoxAct() || this.isCanvasAct())
                editType = this.onlyIns() ? nls.panel_action_insert_object : nls.panel_action_delete_object;
            else
                editType = this.mixTypes() ? nls.panel_action_edit : (this.onlyIns() ? nls.panel_action_add : nls.panel_action_delete);
            return editType + " " + this.formatTime();
        },

        isTextBoxAct: function()
        {
            if (this.modelChPairs && this.modelChPairs.length == 1) {
                var actModel = this.modelChPairs[0].model;
                if (actModel.modelType && g.modelTools.isTextBox(actModel))
                    return true;
            }
            return false;
        },
        
        isCanvasAct: function()
        {
        	if (this.modelChPairs && this.modelChPairs.length == 1) {
             	var actModel = this.modelChPairs[0].model;
                if (actModel.modelType && g.modelTools.isCanvas(actModel))
                    return true;
            }
            return false;
        },
        
        isBookMarkAct: function()
        {
        	if (this.modelChPairs && this.modelChPairs.length == 1) {
             	var actModel = this.modelChPairs[0].model;
                if (actModel.modelType && actModel.modelType == constants.MODELTYPE.BOOKMARK)
                    return true;
            }
            return false;   
        },

        isTableAct: function() {
        	if (this.modelChPairs && this.modelChPairs.length == 1) {
             	var actModel = this.modelChPairs[0].model;
                if (actModel.modelType && actModel.modelType == constants.MODELTYPE.TABLE)
                    return true;
                if (actModel.modelType && actModel.modelType == constants.MODELTYPE.TRACKDELETEDREF
                    && actModel.obj && actModel.obj.modelType && actModel.obj.modelType == constants.MODELTYPE.TABLE)
                    return true;
            }
            return false;
        },
        
        isImageAct: function()
        {
        	if (this.modelChPairs && this.modelChPairs.length == 1) {
             	var actModel = this.modelChPairs[0].model;
                if (actModel.modelType && g.modelTools.isImage(actModel))
                    return true;
            }
            return false;
        },

        isBigRangeAct: function()
        {
        	if (this.modelChPairs && this.modelChPairs.length == 1) {
             	var actModel = this.modelChPairs[0].model;
                if (actModel.modelType && actModel.modelType == constants.MODELTYPE.TRACKOVERREF)
                    return true;
            }
            return false;   
        },

        getActionMovesHtmlView: function(full, filterModels) {
            
            if (!full && !filterModels)
            {
                if (this._cachedHtml)
                {
                    return this._cachedHtml;
                }
            }
            
            var moves = this.getActionMoves(filterModels);
            var html = "<div class='action_" + this.u + "'>";
            var finalClasses = "";
            var finalText = "";
            var me = this;
            var maxText = full ? Number.MAX_VALUE : 100;
            var maxParas = Number.MAX_VALUE;
            var accumulatedTexts = 0;
            var accumulatedParas = 0;
            var preCell = null;
            var showAll = full;

            array.some(moves, function(move, index) {
                var classes = "";
                array.forEach(move.types, function(t) {
                    if (classes)
                        classes += " ";
                    classes += t;
                });
                var isPara = classes.indexOf(me.EDIT_TYPE_CREATE_PARA) >= 0 || classes.indexOf(me.EDIT_TYPE_MERGE_PARA) >= 0;
                var isTable = classes.indexOf(me.EDIT_TYPE_CREATE_TABLE) >= 0 || classes.indexOf(me.EDIT_TYPE_DELETE_TABLE) >= 0;
                var isBigTxt = classes.indexOf(me.EDIT_TYPE_DEL_BIG_TEXT) >= 0;

                if (isPara)
                    accumulatedParas++;
                else
                    accumulatedTexts += move.text.length;

                if(move.cellId){
                	if(preCell !=  move.cellId && ((html.indexOf("</span>", html.length - 7) !==-1) || 
                			(finalText.length>0 && (finalText.indexOf("\u21B2", finalText.length - 1) == -1))))
                		finalText+="\u21B2";

                	preCell = move.cellId;
                } else if(preCell)
                	preCell = null;

                var sameClass = finalClasses == classes && !isPara && !isTable;
                if (sameClass) {
                    finalText += move.text;
                } else if (index > 0) {
                    html += "<span class='" + finalClasses + "'>" + me.toHTML(finalText) + "</span>";
                }
                if (!sameClass) {
                    finalClasses = classes;
                    if(isBigTxt && showAll) {
                    	finalText = move.allText;
                    	accumulatedTexts += move.allText.length;
                    } else {
                    	finalText = move.text;
                    }
                }

                var toBreak = accumulatedTexts > maxText || accumulatedParas > maxParas;
                if (toBreak && isPara) {
                    // index must > 0
                    html += "<span class='textOverflowed'>...</span>";
                    return true;
                }
                if (toBreak && !isPara) {
                    // index >= 0;
                    var overflowCount = maxText - accumulatedTexts;
                    finalText = finalText.substring(0, finalText.length - overflowCount);
                    html += "<span class='" + finalClasses + "'>" + me.toHTML(finalText) + "</span>";
                    html += "<span class='textOverflowed'>...</span>";
                    return true;
                }

                if (index == moves.length - 1)
                    html += "<span class='" + finalClasses + "'>" + me.toHTML(finalText) + "</span>";
                if(isBigTxt && !showAll)
                	html += "<span class='userName del_large_text'>(" +  nls.panel_action_del_big_content+ ")</span>";
            });

            html += "</div>";
            
            if (!full && !filterModels)
            {
                this._cachedHtml = html;
            }
            
            return html;
        },
        
        getActionMovesText: function(full, filterModels) {
            var moves = this.getActionMoves(filterModels);
            var text = "";
            
            if (!full && !filterModels)
            {
                if (this._cachedText)
                {
                    return this._cachedText;
                }
            }

            array.forEach(moves, function(move, index) {
            	text += move.text;
            });
            
            if (!full && !filterModels)
            {
                this._cachedText = text;
            }

            return text;
        },

        getActionMoves: function(filterModels) {
            var user = this.u;
            var pairs = this.modelChPairs;

            var moves = [];
            var me = this;

            array.forEach(pairs, function(p) {
            	var m = p.model;
            	var ch = p.ch;
                if (filterModels && array.indexOf(filterModels, m) < 0)
                    return;

                var move = {
                    types: [],
                    text: ""
                };

                if(g.modelTools.inTable(m)){
                	var cell = g.modelTools.getCell(m);
                	move.cellId = cell.id;
                }

                if (m.modelType == constants.MODELTYPE.PARAGRAPH || m.modelType == constants.MODELTYPE.TRACKDELETEDOBJS) {
                    move.isPara = true;
                    move.text = "\u21B2";
                    if (ch.length > 1) {
                        move.types.push(me.EDIT_TYPE_CREATE_PARA);
                        move.types.push(me.EDIT_TYPE_MERGE_PARA);
                    } else {
                        var type = ch[0].t;
                        move.types.push(type == "ins" ? me.EDIT_TYPE_CREATE_PARA : me.EDIT_TYPE_MERGE_PARA);
                    }
                } else if (m.modelType == constants.MODELTYPE.TRACKOVERREF) {
                	move.text = move.allText = m.relText + "...";
                    move.types.push(me.EDIT_TYPE_DEL_BIG_TEXT);
                } else if (m.modelType == constants.MODELTYPE.TABLE) {
                    move.isTable = true;
                    if (ch.length > 1) {
                        move.types.push(me.EDIT_TYPE_CREATE_TABLE);
                        move.types.push(me.EDIT_TYPE_DELETE_TABLE);
                    } else {
                        var type = ch[0].t;
                        move.types.push(type == "ins" ? me.EDIT_TYPE_CREATE_TABLE : me.EDIT_TYPE_DELETE_TABLE);
                    }
                } else {
                    var text = m.paragraph ? m.paragraph.text.substring(m.start, m.start + m.length) : "";
                    if (BidiUtils.isBidiOn() && m.paragraph && text) {
                        text = BidiUtils.addEmbeddingUCCwithDir(text, m.paragraph.directProperty.getDirection());
                    }
                    if (ch.length > 1) {
                        move.types.push(me.EDIT_TYPE_INS_TEXT);
                        move.types.push(me.EDIT_TYPE_DEL_TEXT);
                    } else if (ch.length == 1){
                        var type = ch[0] && ch[0].t;
                        move.types.push(type == "ins" ? me.EDIT_TYPE_INS_TEXT : me.EDIT_TYPE_DEL_TEXT);
                    }
                    move.text = text;
                    if (g.modelTools.isPageBreak(m))
                        move.text = nls.panel_action_page_break;
                    else if (text == "\r")
                        move.text = "\u2193";
                    else if (text == "\t")
                    	move.text = " \u21E5 ";//u21B9
                }

                moves.push(move);
            });

            return moves;
        }
    });
    return TrackChangeAct;
});
