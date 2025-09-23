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
    "dojo/on",
    "dojo/topic",
    "concord/util/browser",   
    "writer/common/RangeIterator",
    "writer/constants",
    "writer/msg/msgCenter",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "writer/util/RangeTools"
], function(declare, lang, on, topic, browser, RangeIterator, constants, msgCenter, Plugin, ModelTools, RangeTools) {

    var FormatPainter = declare("writer.plugins.FormatPainter", Plugin, { 
    	applyDirectStyle: function(directProperty, para){
    		return directProperty.applyDirectStyle(para);
    	},
    	
    	removeDirectStyle: function(para){
    		var targetDirectProperty = para.directProperty;
    		return targetDirectProperty.removeDirectStyle();
    	},
        /**
         * set text style for paragraph's textProperty
         * @param para
         * @param textProperty
         * @returns
         */
        applyParaTextStyle: function(para, textProperty) {
            var newStyle = textProperty.style;
            var prop = para.paraTextProperty;
            var oldStyles = this._getStyle(prop, newStyle);

            var curStyle = prop.style;
            prop.setStyle(newStyle);

            for (var key in curStyle) {
                //remove 
                if (!newStyle[key]) {
                    var styleDef = {};
                    styleDef[key] = curStyle[key];
                    prop.setStyle(styleDef, true);
                }
            }
            var newStyles = this._getStyle(prop, oldStyles);
            var n = {
                "s": newStyles,
                "type": "pt"
            };
            var o = {
                "s": oldStyles,
                "type": "pt"
            };
            return msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(para, n, o)]);
        },

        /**
         * apply text styles for a span of text
         * @param para
         * @param start
         * @param len
         * @param textProperty
         */
        applyTextStyles: function(para, start, len, textProperty, bMergeBaseStyle, bClearParaTextStyle) {
            var msgs = [],
                that = this,
                bList = para.isList(),
                editor = this.editor;

            function makeJsonStyle(styles) {
                if (styles["text-decoration"] != null) {
                    var tmp = styles["text-decoration"];
                    if (tmp.indexOf("underline") != -1) {
                        styles.u = {
                            "val": "single"
                        };
                    } else
                        styles.u = "";
                    if (tmp.indexOf("line-through") != -1) {
                        styles.strike = "1";
                    } else
                        styles.strike = "";
                    delete styles["text-decoration"];
                }

                var kf = "font-family";
                if (styles[kf] != null && !styles.rFonts) {
                    styles.rFonts = {
                        "ascii": styles[kf],
                        "hAnsi": styles[kf],
                        "eastAsia": styles[kf]
                    };
                    delete styles[kf];
                }
            }

            function setHintsStyle(hints, msgs) {
                var acts = [];
                var newStyle = textProperty.style;
                var _setHintStyle = function(hint) {
                    if (hint.hints) {
                        hint.hints.forEach(_setHintStyle);
                        return;
                    }
                    if (hint.isTrackDeleted())
                        return;
                    var hintProperty;
                    if (bMergeBaseStyle) {
                        hintProperty = hint.getMergedTextProperty();
                    }
                    if (hintProperty == "empty" || !bMergeBaseStyle)
                        hintProperty = hint.textProperty;

                    var oldStyles = that._getStyle(hintProperty, newStyle, hint);
                    hint.setStyle(textProperty.style);
                    var curStyle = hint.getStyle();
                    for (var key in oldStyles) {
                        //remove 
                        if (!newStyle[key]) {
                            var styleDef = {},
                                bRemove = false;
                            styleDef[key] = oldStyles[key];
                            switch (key) {
                                case "color":
                                    styleDef[key] = "black";
                                    break;
                                case "font-style":
                                case "font-weight":
                                    styleDef[key] = (bMergeBaseStyle) ? "normal" : "";
                                    break;
                                case "text-decoration":
                                	hint.textProperty._decoration = {};
                                default:
                                    bRemove = true;
                                    break;
                            }
                            hint.setStyle(styleDef, bRemove);
                        }
                    }
                    var newStyles = that._getStyle(hint, oldStyles);
                    makeJsonStyle(oldStyles);
                    makeJsonStyle(newStyles);
                    acts.push(msgCenter.createSetTextAttribute(hint.start, hint.length, para, newStyles, oldStyles));
                };
                hints.forEach(_setHintStyle);
                if (acts.length) {
                    msgs.push(msgCenter.createMsg(constants.MSGTYPE.TextAttribute, acts));
                }
            }
            if (start == 0 && len == para.getLength()) {
                //select whole paragraph
                //clear styles
                setHintsStyle(para.hints, msgs);

                //set paragraph text styles
                if (bClearParaTextStyle || (editor.Paintingformat && !editor.Paintingformat.isTargetCollapsed))
                    msgs.push(this.applyParaTextStyle(para, textProperty));
            } else {
                setHintsStyle(para.splitRuns(start, len), msgs);
            }
            para.styleChanged();
            return msgs;
        },
        /**
         * get current style of model
         * for key in refStyles
         * if style[key] does not exist
         * style[key] = ""
         * @param model
         * @param refStyles
         * @returns retStyles
         */
        _getStyle: function(model, refStyles, hint) {
            var styles = {};
            if (model.textProperty && model.textProperty.style)
            //do not collect merged styles
                styles = model.textProperty.style;
            else if(hint && ModelTools.isInToc(hint))
            {
            	styles = model.getStyle("TOC");
            }
        	else
        		styles = model.getStyle();

            var retStyles = {};

            for (var key in styles) {
                retStyles[key] = styles[key];
            }

            for (var key in refStyles) {
                retStyles[key] = styles[key] || "";
            }

            return retStyles;
        },

        clearFormat: function(para, start, length) {
            return this.applyTextStyles(para, start, length, {
                "style": {}
            },false , true);
        },


        applyToTextRange: function(range, bOnlyText) {
            var startPos, endPos, range, it, para, paras, msgs = [],
                editor = this.editor;
            var sourcePara = editor.Paintingformat.sourcePara;
            var textProperty = editor.Paintingformat.textStyles || sourcePara.paraTextProperty;
            var directProperty = sourcePara.directProperty;

            var sourceRun = editor.Paintingformat.sourceRun;
            var that = this;

            startPos = range.getStartParaPos().index;
            endPos = range.getEndParaPos().index;
            it = new RangeIterator(range);
            paras = [];
            while (para = it.nextParagraph()) {
                if (para.modelType == constants.MODELTYPE.PARAGRAPH)
                    paras.push(para);
            }
            if (paras.length == 0)
                return [];

            function applyMergedTextStyle(para, index, len, bMergeBaseStyle) {
                var properties = textProperty;
                var styleId = sourceRun && sourceRun.getStyleId();
                var bMerged = bMergeBaseStyle && (styleId || (para != sourcePara && para.getStyleId() != sourcePara.getStyleId() && sourceRun));
                if (bMerged) {
                    properties = sourceRun.getMergedTextProperty();
                }
                msgs = msgs.concat(that.applyTextStyles(para, index, len, properties, bMerged));
            }

            var firstPara = paras[0];
            if (paras.length == 1) {
                var bMergeBaseStyle = !bOnlyText;
                if (startPos == 0 && endPos == firstPara.getLength() && directProperty && !bOnlyText) {
                    bMergeBaseStyle = false;
                    msgs = msgs.concat(this.applyDirectStyle(directProperty, firstPara));
                }
                applyMergedTextStyle(firstPara, startPos, endPos - startPos, bMergeBaseStyle);
            } else {
                //Set first paragraph
                msgs = msgs.concat(this.applyDirectStyle(directProperty, firstPara));
                msgs = msgs.concat(this.applyTextStyles(firstPara, startPos, firstPara.getLength(), textProperty));
                // Set paragraphs in the middle
                for (var j = 1; j < paras.length - 1; j++) {
                    msgs = msgs.concat(this.applyDirectStyle(directProperty, paras[j]));
                    msgs = msgs.concat(this.applyTextStyles(paras[j], 0, paras[j].getLength(), textProperty));
                }
                // Set the last paragraph
                msgs = msgs.concat(this.applyDirectStyle(directProperty, paras[paras.length - 1]));
                msgs = msgs.concat(this.applyTextStyles(paras[paras.length - 1], 0, endPos, textProperty));
            }
            return msgs;
        },
        /**
         * enable command
         * @param enable
         */
        enableComment: function(enable) {
            var cmdNames = ["selectComment", "updateComment"],
                commentCmd;
            for (var i = 0; i < cmdNames.length; i++) {
                commentCmd = this.editor.getCommand(cmdNames[i]);
                if (commentCmd) {
                    commentCmd.setState(enable ? constants.CMDSTATE.TRISTATE_ON : constants.CMDSTATE.TRISTATE_DISABLED);
                }
            }

        },
        /**
         * init function
         */
        init: function() {
            var editor = this.editor;
            var shell = editor.getShell();
            var plugin = this;
            plugin.formatData = {};
            //paint format command
            //apply formats to the selection content
            var paintFormatCmd = {
                exec: function(options) {
                    if (!editor.Paintingformat) {
                        return;
                    }
                    var selection = editor.getSelection();
                    var ranges = selection.getRanges();
                    try {
                        var paraPos = ranges[0].getStartParaPos();
                        var para = paraPos.obj,
                            sourcePara;
                        var msgs = [];
                        if (ranges.length == 1 && ranges[0].isCollapsed()) {

                            if (sourcePara = editor.Paintingformat.sourcePara) {
                                if (editor.Paintingformat.fromParagraph) {
                                    var directProperty = sourcePara.directProperty,
                                        paraTextProperty = sourcePara.paraTextProperty;

                                    if (directProperty && sourcePara != para) {
                                        msgs = msgs.concat(plugin.applyDirectStyle(directProperty, para));
                                        //msgs = msgs.concat( plugin.applyTextStyles( para, 0, para.getLength(),paraTextProperty, true ));
                                        if (msgs.length) {
                                            para.styleChanged();
                                        }
                                    }
                                }
                                //apply style for word
                                var wordRange = selection.getWordRange();
                                if (wordRange) {
                                    var startPos = wordRange.getStartParaPos();
                                    var endPos = wordRange.getEndParaPos();
                                    var para = startPos.obj;
                                    var startIndex = startPos.index;
                                    var endIndex = endPos.index;
                                    var text = para.text.substring(startIndex, endIndex);
                                    var text2 = lang.trim(text);
                                    if (text2 != text) {
                                        wordRange.setEnd(para, startIndex + text2.length);
                                    }
                                    editor.Paintingformat.isTargetCollapsed = 1;
                                    msgs = msgs.concat(plugin.applyToTextRange(wordRange, editor.Paintingformat.fromParagraph));
                                }
                            }
                        } else if (editor.Paintingformat) {
                            editor.Paintingformat.isTargetCollapsed = 0;
                            for (var i = 0; i < ranges.length; i++) {
                                range = RangeTools.getStyleOperationRange(ranges[i]);
                                msgs = msgs.concat(plugin.applyToTextRange(range));
                            }
                        }
                        if (msgs.length) {
                            para.parent.update();
                            msgCenter.sendMessage(msgs);
                        }
                    } catch (e) {
                        console.error(e.message || e);
                    }
                    var toggled = options && options.toggled;
                    if (!toggled)
                        editor.Paintingformat = null;
                }
            };
            //get format command
            //get format from selection
            var getFormatCmd = {
                exec: function() {
                    var format = editor.Paintingformat = {};
                    var selection = editor.getSelection();
                    var ranges = selection.getRanges();
                    //get formats
                    if (ranges.length >= 1) {
                        //
                        var paraPos = ranges[0].getStartParaPos();
                        var para = paraPos.obj;
                        var index = paraPos.index;
                        format.sourcePara = para;

                        var ret = para.getInsertionTarget(index);
                        var target = ret.target;
                        if (target && target.byIndex && target.hints) {
                            //search in inlineboject
                            //field, hyperlink
                            target = target.byIndex(index, true, true);
                        }
                        if (target) {
                            if (target.start + target.length == index && target.next()) {
                                target = target.next();
                            }
                            if (target && target.isTextRun && target.isTextRun()) {
                                format.textStyles = target.textProperty;
                                format.sourceRun = target;
                            }
                        }
                        format.fromParagraph = !!(ranges.length == 1 && ranges[0].isCollapsed());
                        if (!format.fromParagraph && ranges.length) {
                            var endPos = ranges[ranges.length - 1].getEndParaPos();
                            if (endPos.obj != para || (index == 0 && endPos.index == para.getLength()))
                                format.fromParagraph = true;
                        }

                    }
                }
            };
            //toggle getFormat and paintFormat commands from toolbar.
            var formatPainterCmd = {
                exec: function(options) {
                    var mainNode = browser.getEditAreaDocument().body;
                    var toggled = options && options.toggled;

                    function dupFormat(event) {
                        if (!toggled) {
                            mainNode.style.cursor = "auto";
                            plugin.clickConnect && plugin.clickConnect.remove();
                            plugin.mouseupConnect && plugin.mouseupConnect.remove();
                        }
                        if (!toggled && !event)
                            delete editor.Paintingformat;
                        else {
                            editor.execCommand("paintFormat", options);
                        }
                        plugin.enableComment(true);
                    }
                    if (!editor.Paintingformat) {
                        //change UI state
                        mainNode.style.cursor = "url('" + window.contextPath + window.staticRootPath + "/images/painter32.cur'),auto";
                        editor.execCommand("getFormat", options);
                        //	plugin.clickConnect = dojo.connect( mainNode, "onclick", null, dupFormat );
                        plugin.mouseupConnect = on(mainNode, "mouseup", dupFormat);
                        plugin.enableComment(false);
                    } else {
                        dupFormat();
                    }
                    setTimeout(function() {
                        plugin.selectionChangeHandler();
                    }, 0);
                }
            };

            var clearFormatCmd = {
                exec: function() {
                    var selection = editor.getSelection();
                    var ranges = selection.getRanges();

                    if (ranges.length == 1 && ranges[0].isCollapsed()) {
                        var paraPos = ranges[0].getStartParaPos();
                        var para = paraPos.obj,
                            paraStyles;
                        var msgs = plugin.clearFormat(para, 0, para.getLength());
                        msgs = msgs.concat(plugin.removeDirectStyle(para));
                        if (msgs.length) {
                            para.parent.update();
                            msgCenter.sendMessage(msgs);
                        }
                    } else {
                        var startPos, endPos, range, it, para, paras, msgs = [];
                        for (var i = 0; i < ranges.length; i++) {
                            range = RangeTools.getStyleOperationRange(ranges[i]);
                            startPos = range.getStartParaPos().index;
                            endPos = range.getEndParaPos().index;
                            it = new RangeIterator(range);
                            paras = [];
                            while (para = it.nextParagraph()) {
                                if (para.modelType == constants.MODELTYPE.PARAGRAPH)
                                    paras.push(para);
                            }
                            if (paras.length == 0)
                                continue;

                            var firstPara = paras[0];
                            if (paras.length == 1) {
                                msgs = msgs.concat(plugin.clearFormat(firstPara, startPos, endPos - startPos));
                                if (startPos == 0 && endPos == firstPara.getLength())
                                    msgs = msgs.concat(plugin.removeDirectStyle(firstPara));
                            } else {
                                msgs = msgs.concat(plugin.clearFormat(firstPara, startPos, firstPara.getLength()));
                                msgs = msgs.concat(plugin.removeDirectStyle(firstPara));
                                for (var j = 1; j < paras.length - 1; j++) {
                                    msgs = msgs.concat(plugin.clearFormat(paras[j], 0, paras[j].getLength()));
                                    msgs = msgs.concat(plugin.removeDirectStyle(paras[j]));
                                }
                                msgs = msgs.concat(plugin.clearFormat(paras[paras.length - 1], 0, endPos));
                                msgs = msgs.concat(plugin.removeDirectStyle(paras[paras.length - 1]));
                            }
                        }
                        if (msgs.length) {
                            paras[0].parent.update();
                            msgCenter.sendMessage(msgs);
                        }
                    }
                }
            };
            //get format
            editor.addCommand("formatPainter", formatPainterCmd);
            editor.addCommand("getFormat", getFormatCmd /*, 67 + writer.constants.KEYS.CTRL + writer.constants.KEYS.SHIFT*/ );
            //paint format
            editor.addCommand("paintFormat", paintFormatCmd /*, 86 + writer.constants.KEYS.CTRL + writer.constants.KEYS.SHIFT */ );
            //clear format 
            editor.addCommand("clearFormat", clearFormatCmd);

            topic.subscribe(constants.EVENT.BEFORE_EXECCOMMAND, lang.hitch(this, this._onBeforeExecCommand));
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, this.selectionChangeHandler));
            topic.subscribe(constants.EVENT.EDITAREACHANGED, lang.hitch(this, function() {
                if (pe.lotusEditor && pe.lotusEditor.Paintingformat)
                    delete pe.lotusEditor.Paintingformat;
            }));
        },
        /**
         * selectChange handler
         */
        selectionChangeHandler: function() {
            var editor = pe.lotusEditor;
            var command = editor.getCommand("formatPainter");
            if (!editor.Paintingformat) {
                this.clickConnect && this.clickConnect.remove();
                this.mouseupConnect && this.mouseupConnect.remove();
                var mainNode = browser.getEditAreaDocument().body;
                mainNode.style.cursor = "auto";
                command.setState(constants.CMDSTATE.TRISTATE_OFF);
                this.enableComment(true);
            } else {
                command.setState(constants.CMDSTATE.TRISTATE_ON);
                this.enableComment(false);
            }
        },
        /**
         * cancel painting state
         */
        cancel: function() {
            if (this.editor.Paintingformat) {
                delete this.editor.Paintingformat;
                this.selectionChangeHandler();
                this.enableComment(true);
                return true;
            }
            return false;
        },
        /**
         * before command
         * @param cmdName
         */
        _onBeforeExecCommand: function(cmdName) {
            var editor = this.editor;

            if (editor.Paintingformat && cmdName != "formatPainter" && cmdName != "getFormat" && cmdName != "paintFormat" && cmdName != "turnOnUserIndicator") {
                this.cancel();
            }
        }
    });
    return FormatPainter;
});
