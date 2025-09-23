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
    "writer/common/tools",
    "writer/constants",
    "writer/model/list",
    "writer/model/prop/Property",
    "writer/model/prop/TabProperty",
    "writer/msg/msgCenter",
    "writer/util/ModelTools"
], function(declare, lang, tools, constants, listModule, Property, TabProperty, msgCenter, ModelTools) {

    var ParagraphProperty = declare("writer.model.prop.ParagraphProperty", null, {
    	constructor: function(json, paragraph, isListPpr) {
        //  this.source = json;
	        this.paragraph = paragraph; // Only when this is paragraph's direct property, the paragraph is not null. 
	        this.isListPpr = isListPpr;

	        this.listParaProperty = null;
	        this.styleParaProperty = null;
	        this.docDefaultProperty = null; // Document default property, Only the property is not null when it is directly property.

	        this.fromJson(json);
    	}
    });

    ParagraphProperty.prototype = {
        beforeAutoSpace: "14",
        afterAutoSpace: "14",
        type: Property.PARAGRAPH_PROPERTY,
        _defaultVal: "none",
        applyDirectStyle: function(para, force) {
            var msgs = [];
            var directProperty = this;
            var targetDirectProperty = para.directProperty;
            //styleId
            msgs = msgs.concat(targetDirectProperty.addStyle(directProperty.styleId));
            //other properties
            targetDirectProperty.clearMsg();
            //numbering
            //list
            var numId = directProperty.getNumId();
            var level = directProperty.getNumLevel();
            var oldNumId = targetDirectProperty.getNumId(),
                isList = para.isList();
            if (numId != oldNumId ||
                level != targetDirectProperty.getNumLevel()) {
                msgs = msgs.concat(para.setList(numId, level));
                targetDirectProperty.clearSpecialIndent();
                isList = true;
            }
            //properties ...
            var properties = ["Tabs", "Border", "BackgroundColor", "Align", "Direction", "IndentLeft", "IndentRight", "SpecialIndent",
                "SpaceBefore", "SpaceAfter", "LineSpaceType", "LineSpaceValue", "OutlineLvl", "WidowControl", "KeepLines", "PageBreakBefore"
            ];

            function toPtValue(value) {
                return (value != "none") ? value + "pt" : value;
            }
            for (var i = 0; i < properties.length; i++) {
                if ((properties[i] == "IndentLeft" && directProperty.indentLeft)) {
                    targetDirectProperty.setIndentLeft(toPtValue(directProperty.indentLeft));
                    continue;
                } else if (isList && (properties[i] == "IndentLeft")) {
                    continue;
                }

                switch (properties[i]) {
                    case "SpaceAfter":
                        if (targetDirectProperty.spaceAfter != directProperty.spaceAfter)
                            targetDirectProperty.setSpaceAfter(toPtValue(directProperty.spaceAfter));
                        break;
                    case "SpaceBefore":
                        if (targetDirectProperty.spaceBefore != directProperty.spaceBefore)
                            targetDirectProperty.setSpaceBefore(toPtValue(directProperty.spaceBefore));
                        break;
                    case "SpecialIndent":
                        if (targetDirectProperty.specialIndent != directProperty.specialIndent || targetDirectProperty.specialIndentValue != directProperty.specialIndentValue) {
                            targetDirectProperty.setIndentSpecialTypeValue(directProperty.specialIndent, toPtValue(directProperty.specialIndentValue));
                        }
                        break;
                    case "IndentRight":
                        if (targetDirectProperty.indentRight != directProperty.indentRight) {
                            targetDirectProperty.setIndentRight(toPtValue(directProperty.indentRight));
                        }
                        break;
                    case "Direction":
                        var direction = directProperty.getDirection(),
                            align = directProperty.getAlign();
                        if (direction == 'rtl') {
                            if (align == 'left')
                                targetDirectProperty.setAlign('right');
                            else if (align == 'right')
                                targetDirectProperty.setAlign('left');
                        }
                        targetDirectProperty.setDirection(direction);
                        break;
                    default:
                        targetDirectProperty["set" + properties[i]](directProperty["get" + properties[i]](), force);
                }
            }
            var tmp = targetDirectProperty.getMessage();
            tmp && (msgs = msgs.concat(tmp));

            return msgs;
        },

        removeDirectStyle: function() {
            var msgs = [];
            var targetDirectProperty = this;
            //styleId
            var para = this.paragraph;
            var msg = targetDirectProperty.clearSpecialIndent();
            msg && (msgs = msgs.concat(msg));

            var msg = targetDirectProperty.removeStyle();
            msg && (msgs = msgs.concat(msg));
            if (para.isList())
                msgs = msgs.concat(para.setList(-1));
            var _defaultVal = "none";
            var properties = {
                "Tabs": _defaultVal,
                "Border": null,
                "BackgroundColor": null,
                "Align": _defaultVal,
                "IndentLeft": _defaultVal,
                "IndentRight": _defaultVal,
                "SpaceBefore": _defaultVal,
                "SpaceAfter": _defaultVal,
                "LineSpaceType": _defaultVal,
                "LineSpaceValue": 0,
                "OutlineLvl": _defaultVal,
                "WidowControl": _defaultVal,
                "PageBreakBefore": _defaultVal,
                "KeepLines": _defaultVal
            };

            for (var key in properties) {
                targetDirectProperty["set" + key](properties[key]);
            }
            var tmp = targetDirectProperty.getMessage();
            tmp && (msgs = msgs.concat(tmp));

            return msgs;
        },
        fromJson: function(json) {
            this.changedRecord = [];
            this.indentLeft = this._defaultVal;
            this.indentRight = this._defaultVal;
            this.specialIndent = this._defaultVal;
            this.specialIndentValue = this._defaultVal;
            this.spaceBefore = this._defaultVal;
            this.contextualSpacing = this._defaultVal;
            this.spaceAfter = this._defaultVal;
            this.lineSpace = this._defaultVal;
            this.numId = this._defaultVal;
            this.iLvl = this._defaultVal;
            this.align = this._defaultVal;
            this.border = null;
            this.backgroundColor = null;
            this.styleId = this._defaultVal;
            this.tabs = this._defaultVal;
            this.sectId = "";
            this.outlineLvl = this._defaultVal;
            this.keepLines = this._defaultVal;
            this.pageBreakBefore = this._defaultVal;
            this.widowControl = this._defaultVal;
            this.direction = this._defaultVal;

            if (json) {
                this.styleId = json.styleId;
                this.keepNext = json.keepNext;

                if (json.pageBreakBefore) {
                    this.pageBreakBefore = true;
                    var pbbVal = json.pageBreakBefore.val;
                    if (pbbVal && pbbVal == "0")
                        this.pageBreakBefore = false;
                }

                // compatibility.
                if (json.isPb === true || json.isPb === false)
                    this.pageBreakBefore = json.isPb || this.pageBreakBefore;

                //keep lines togeter
                if (json.keepLines) {
                    this.keepLines = true;
                    var pbbVal = json.keepLines.val;
                    if (pbbVal && pbbVal == "0")
                        this.keepLines = false;
                }

                if (json.widowControl) {
                    this.widowControl = true;
                    var wcVal = json.widowControl.val;
                    if (wcVal && wcVal == "0")
                        this.widowControl = false;
                }

                if (json.pBdr)
                    this.border = json.pBdr;
                if (json.shd)
                    this.backgroundColor = json.shd;

                this.align = json.align || this._defaultVal;
                if (this.align == "both") {
                    this.align = "justified";
                } else if (this.align == "center") {
                    this.align = "centered";
                }
                this.direction = json.direction || this._defaultVal;
                if (json.indent) {
                    // #defect 33661 Avoid the indent value is 0 and be override by default value.
                    var indValue = json.indent.left && tools.toPtValue(json.indent.left);
                    this.indentLeft = indValue == 0 ? indValue : (indValue || this.indentLeft);
                    var indvalueRight = json.indent.right && tools.toPtValue(json.indent.right);
                    this.indentRight = indvalueRight == 0 ? indvalueRight : (indvalueRight || this.indentRight);

                    if (json.indent.hanging) {
                        this.specialIndent = 'hanging';
                        this.specialIndentValue = tools.toPtValue(json.indent.hanging);
                    } else if (json.indent.firstLine) {
                        this.specialIndent = 'firstLine';
                        this.specialIndentValue = tools.toPtValue(json.indent.firstLine);
                    }
                }
                if (json.tabs) {
                    this.tabs = new TabProperty(json.tabs);
                }

                this.sectId = json.secId || "";
                if (json.outlineLvl != undefined)
                    this.outlineLvl = parseInt(json.outlineLvl.val);
                else if (this.styleId == "TOCHeading")
                    this.outlineLvl = -1;

                if (json.contextualSpacing) {
                    this.contextualSpacing = true;
                }

                var ifAutoSpaceingSet = function(val) {
                    return "1" == val || "true" == val || "on" == val;
                };

                if (json.space) {
                    if (ifAutoSpaceingSet(json.space.beforeAutospacing)) {
                        this.spaceBefore = this.beforeAutoSpace;
                    } else {
                        this.spaceBefore = json.space.before && tools.toPtValue(json.space.before);
                        (this.spaceBefore == null || isNaN(this.spaceBefore)) && (this.spaceBefore = this._defaultVal);
                    }
                    if (ifAutoSpaceingSet(json.space.afterAutospacing)) {
                        this.spaceAfter = this.afterAutoSpace;
                    } else {
                        this.spaceAfter = json.space.after && tools.toPtValue(json.space.after);
                        (this.spaceAfter == null || isNaN(this.spaceAfter)) && (this.spaceAfter = this._defaultVal);
                    }
                    this.lineSpace = json.space.lineRule;
                    if (json.space.lineRule == "auto") {
                        this.lineSpace = "relative";
                    } else if (json.space.lineRule == "exact") {
                        this.lineSpace = "absolute";
                    } else if (json.space.lineRule == "atLeast") {
                        this.lineSpace = "atLeast";
                    } else {
                        this.lineSpace = null;
                    }
                    if (this.lineSpace) {
                        this.lineSpaceValue = json.space.line;
                    }
                }
                //          if(json.numPr && !json.numPr.numId)
                //              eval("debugger");
                if (!json.numPr && (this.styleId == "TOCHeading")) {
                    //fill default numPr for toc heading
                    json.numPr = {
                        "numId": {
                            "val": -1
                        },
                        "ilvl": {
                            "val": 0
                        }
                    };
                }


                if (json.numPr) {
                    if (json.numPr.ilvl)
                        this.iLvl = parseInt(json.numPr.ilvl.val) || 0;
                    else if (json.numPr.numId && json.numPr.numId.val) // Avoid empty numPr(Error, this will stop the parent style)
                        this.iLvl = 0;
                }
                if (json.numPr && json.numPr.numId && json.numPr.numId.val) {
                    this.numId = json.numPr.numId.val;
                    if (this.numId != -1 && this.numId != this._defaultVal && this.iLvl != null && this.iLvl != this._defaultVal)
                        this.listParaProperty = pe.lotusEditor.number.getListPr(this.numId, this.iLvl);
                }
            }
            if (this.paragraph) {
                var refStyle = null;
                if (this.styleId && this._defaultVal != this.styleId){
                    refStyle = pe.lotusEditor.getRefStyle(this.styleId);
                    var bInsHS = refStyle && refStyle.isBuiltInHStyle();
                    if(bInsHS && bInsHS.length == 2)
                    	this.setOutlineLvl(bInsHS[1]);           
                } else // use the default paragraph property
                    refStyle = pe.lotusEditor.getDefaultParagraphStyle();
                if (refStyle == "empty")
                    refStyle = null;
                this.styleParaProperty = refStyle && refStyle.getParagraphProperty();
                refStyle = pe.lotusEditor.getRefStyle(constants.STYLE.DEFAULT);
                if (refStyle && refStyle != "empty") {
                    this.docDefaultProperty = refStyle.getParagraphProperty();
                }
           }
        },
        // When the style changed, maybe the paragraph change to list or remove from list.
        // Like set list to heading or remove list from heading.
        styleChanged: function() {
            if (this.styleId && this._defaultVal != this.styleId) {
                if (!this._isValidNumId(this.numId))
                    this._removeFromList();

                var refStyle = pe.lotusEditor.getRefStyle(this.styleId);
                if (refStyle && refStyle != "empty") {
                    this.styleParaProperty = refStyle.getParagraphProperty();
                    if (!this._isValidNumId(this.numId))
                        this._addToList();
                }
            } else {
                var refStyle = pe.lotusEditor.getDefaultParagraphStyle();
                if (refStyle && refStyle != "empty"){
                    this.styleParaProperty = refStyle.getParagraphProperty();
                    this.docDefaultProperty = this.styleParaProperty;
                }
/*  defect 55722
                refStyle =  pe.lotusEditor.getRefStyle(constants.STYLE.DEFAULT);
                if (refStyle && refStyle != "empty") 
                    this.docDefaultProperty = refStyle.getParagraphProperty();
*/
            }
        },
        getDefaultVal: function() {
            return this._defaultVal;
        },
        _genIndent: function() {
            var ret = null;
            if (this.indentLeft != this._defaultVal || this.indentRight != this._defaultVal || this.specialIndent != this._defaultVal) {
                ret = {};
                if (this.indentLeft != this._defaultVal)
                    ret["left"] = this.indentLeft + "pt";

                if (this.indentRight != this._defaultVal)
                    ret["right"] = this.indentRight + "pt";

                if (this.specialIndent == 'hanging')
                    ret["hanging"] = this.specialIndentValue + "pt";
                else if (this.specialIndent == 'firstLine')
                    ret["firstLine"] = this.specialIndentValue + "pt";
            }
            return ret;
        },

        _genSpace: function() {
            var ret = null;
            if (this.spaceBefore != this._defaultVal || this.spaceAfter != this._defaultVal || this.lineSpace != this._defaultVal) {
                ret = {};

                if (this.spaceBefore == this.beforeAutoSpace)
                    ret.beforeAutospacing = 1;
                else if (!isNaN(this.spaceBefore))
                    ret.before = this.spaceBefore + "pt";

                if (this.spaceAfter == this.afterAutoSpace)
                    ret.afterAutospacing = 1;
                else if (!isNaN(this.spaceAfter))
                    ret.after = this.spaceAfter + "pt";

                if (this.lineSpace == "relative")
                    ret.lineRule = "auto";
                else if (this.lineSpace == "absolute")
                    ret.lineRule = "exact";
                else if (this.lineSpace == "atLeast")
                    ret.lineRule = "atLeast";

                ret.line = this.lineSpaceValue;
            }

            return ret;
        },

        toJson: function() {
            var json = {};

            var indent = this._genIndent();
            if (indent != null)
                json["indent"] = indent;

            if (this.contextualSpacing && this.contextualSpacing != this._defaultVal) {
                json["contextualSpacing"] = {};
            }
            var space = this._genSpace();
            if (space != null)
                json["space"] = space;

            if (this.iLvl != null && this.iLvl != this._defaultVal) {
                json["numPr"] = {};
                json["numPr"].ilvl = {};
                json["numPr"].ilvl.val = "" + this.iLvl;
            }
            if (this.numId != this._defaultVal) // && this.numId != -1)
            {
                json["numPr"] = json["numPr"] || {};
                json["numPr"].numId = {};
                json["numPr"].numId.val = this.numId;
            }

            if (this.align == "justified")
                json["align"] = "both";
            else if (this.align == "centered")
                json["align"] = "center";
            else if (this.align != this._defaultVal)
                json["align"] = this.align;

            if (this.direction != this._defaultVal)
                json["direction"] = this.direction;

            if (this.border && this.border != this._defaultVal)
                json.pBdr = lang.clone(this.border);

            if (this.backgroundColor && this.backgroundColor != this._defaultVal)
                json.shd = this.backgroundColor;

            if (this.styleId && this.styleId != this._defaultVal)
                json.styleId = this.styleId;

            if (this.outlineLvl != undefined && this.outlineLvl != this._defaultVal) {
                json.outlineLvl = {};
                json.outlineLvl["val"] = this.outlineLvl;
            }

            if (this.keepNext != undefined)
                json.keepNext = this.keepNext;

            if (this.sectId && this.sectId != this._defaultVal && this.sectId != "")
                json.secId = this.sectId;

            if (this.tabs && this.tabs != this._defaultVal)
                json.tabs = this.tabs.toJson();

            if (this.pageBreakBefore != this._defaultVal)
                json["pageBreakBefore"] = {
                    "val": this.pageBreakBefore ? "1" : "0"
                };

            if (this.keepLines != this._defaultVal)
                json["keepLines"] = {
                    "val": this.keepLines ? "1" : "0"
                };

            if (this.widowControl != this._defaultVal)
                json["widowControl"] = {
                    "val": this.widowControl ? "1" : "0"
                };

            if (tools.isEmpty(json)) {
                return null;
            }
            return json;
        },
        clone: function() {
            return new ParagraphProperty(this.toJson());
        },
        /**
         * Merge two TabProperty and return a TabProperty
         */
        _mergeTabs: function(tabs1, tabs2) {
            if (this._defaultVal == tabs1 || !tabs1 || tabs1.getTabsJson().length == 0)
                return tabs2;
            else if (this._defaultVal == tabs2 || !tabs2 || tabs2.getTabsJson().length == 0)
                return tabs1;

            var newTabsJson = [];
            var tabs1Json = tabs1.getTabsJson(),
                tabs2Json = tabs2.getTabsJson();
            var pos1, pos2;
            var i = 0,
                j = 0;

            var unitRex = (/^([\+|-]?[\d|\.]*e?[\+|-]?\d+)(pc|px|pt|em|cm|in|mm|emu)$/i),
                cTools = tools;
            for (; i < tabs1Json.length && j < tabs2Json.length;) {
                if (unitRex.test(tabs1Json[i].pos))
                    pos1 = cTools.toPxValue(tabs1Json[i].pos);
                else
                    pos1 = cTools.toPxValue(parseFloat(tabs1Json[i].pos) + 'pt');

                if (unitRex.test(tabs2Json[j].pos))
                    pos2 = cTools.toPxValue(tabs2Json[j].pos);
                else
                    pos2 = cTools.toPxValue(parseFloat(tabs2Json[j].pos) + 'pt');

                if (pos1 <= pos2) {
                    newTabsJson.push(tabs1Json[i]);
                    i++;
                    if (pos1 == pos2)
                        j++;
                } else {
                    newTabsJson.push(tabs2Json[j]);
                    j++;
                }
            }

            for (; i < tabs1Json.length; i++)
                newTabsJson.push(tabs1Json[i]);

            for (; j < tabs2Json.length; j++)
                newTabsJson.push(tabs2Json[j]);

            return new TabProperty(newTabsJson);
        },
        /**
         * Merge current property to destParaProperty
         * @param destParaProperty
         * @returns {writer.model.prop.ParagraphProperty}
         */
        merge: function(destParaProperty) {
            var destProperty = destParaProperty.clone();

            if (this.indentLeft != this._defaultVal && (destProperty.indentLeft == undefined || destProperty.indentLeft == this._defaultVal))
                destProperty.indentLeft = this.indentLeft;

            if (this.indentRight != this._defaultVal && (destProperty.indentRight == undefined || destProperty.indentRight == this._defaultVal))
                destProperty.indentRight = this.indentRight;

            if (this.specialIndent != this._defaultVal && (destProperty.specialIndent == undefined || destProperty.specialIndent == this._defaultVal))
                destProperty.specialIndent = this.specialIndent;

            if (this.specialIndentValue != this._defaultVal && (destProperty.specialIndentValue == undefined || destProperty.specialIndentValue == this._defaultVal))
                destProperty.specialIndentValue = this.specialIndentValue;

            if (this.spaceBefore != this._defaultVal && (destProperty.spaceBefore == undefined || destProperty.spaceBefore == this._defaultVal))
                destProperty.spaceBefore = this.spaceBefore;

            if (this.spaceAfter != this._defaultVal && (destProperty.spaceAfter == undefined || destProperty.spaceAfter == this._defaultVal))
                destProperty.spaceAfter = this.spaceAfter;

            if (this.lineSpace != this._defaultVal && (destProperty.lineSpace == undefined || destProperty.lineSpace == this._defaultVal))
                destProperty.lineSpace = this.lineSpace;

            if (this.numId != this._defaultVal && (destProperty.numId == undefined || destProperty.numId == this._defaultVal))
                destProperty.numId = this.numId;

            if (this.iLvl != this._defaultVal && (destProperty.iLvl == undefined || destProperty.iLvl == this._defaultVal))
                destProperty.iLvl = this.iLvl;

            if (this.align != this._defaultVal && (destProperty.align == undefined || destProperty.align == this._defaultVal))
                destProperty.align = this.align;

            if (this.direction != this._defaultVal && (destProperty.direction == undefined || destProperty.direction == this._defaultVal))
                destProperty.direction = this.direction;

            if (this.keepNext != this._defaultVal && (destProperty.keepNext == undefined || destProperty.keepNext == this._defaultVal))
                destProperty.keepNext = this.keepNext;

            if (this.outlineLvl != this._defaultVal && (destProperty.outlineLvl == undefined || destProperty.outlineLvl == this._defaultVal))
                destProperty.outlineLvl = this.outlineLvl;

            if (this.pageBreakBefore != this._defaultVal && (destProperty.pageBreakBefore == undefined || destProperty.pageBreakBefore == this._defaultVal))
                destProperty.pageBreakBefore = this.pageBreakBefore;

            if (this.keepLines != this._defaultVal && (destProperty.keepLines == undefined || destProperty.keepLines == this._defaultVal))
                destProperty.keepLines = this.keepLines;

            if (this.widowControl != this._defaultVal && (destProperty.widowControl == undefined || destProperty.widowControl == this._defaultVal))
                destProperty.widowControl = this.widowControl;

            // Merge Tabs
            if (this.tabs != this._defaultVal) {
                if (destProperty.tabs == undefined || destProperty.tabs == this._defaultVal)
                    destProperty.tabs = new TabProperty(this.tabs.toJson());
                else
                    destProperty.tabs = this._mergeTabs(destProperty.tabs, this.tabs);
            }

            destProperty.sectId = destProperty.sectId || this.sectId;

            destProperty.border = destProperty.border || (this.border ? lang.clone(this.border) : null);
            destProperty.backgroundColor = destProperty.backgroundColor || this.backgroundColor;

            return destProperty;
            //      
            //      var srcJson = this.toJson();
            //      var destJson = destParaProperty.toJson();
            //      for(var item in srcJson)
            //      {
            //          if(destJson[item] == undefined)
            //              destJson[item] = srcJson[item];
            //          else if(item == "numPr")
            //          {
            //              
            //          }   
            //      }   
            //      
            //      return new writer.model.prop.ParagraphProperty(destJson);
        },

        _isValidNumId: function(id) {
            if (!id || id == this._defaultVal || id == -1)
                return false;

            if (!pe.lotusEditor.number.getSameListNumId(id))
                return false;

            return true;
        },

        _addToList: function() {
            // TODO change to PARAGRAPH list to this.
            if (!this.paragraph)
                return;

            var numId = this.getNumId();
            var numLevel = this.getNumLevel();
            if (numId && numId != -1 && numId != this._defaultVal && pe.lotusEditor.number.isValidNumId(numId) && numLevel != null && numLevel != this._defaultVal) {
                var lists = pe.lotusEditor.lists;
                var curList = lists[numId];
                if (!curList) {
                    var otherNumIds = pe.lotusEditor.number.getSameListNumId(numId);
                    if (otherNumIds && otherNumIds.length > 1) // length > 1 means except this numId itself
                    {
                        var otherNumId = null;
                        for (var i = 0; i < otherNumIds.length; i++) {
                            if (lists[otherNumIds[i]]) {
                                // Replace the numId with previous numId to create a continuous list
                                if (this.numId == numId) // Defect 41237, only when the numId was set to paragraph itself can replace it.
                                    this.numId = otherNumIds[i];
                                curList = lists[otherNumIds[i]];
                            }
                        }
                    }

                    if (!curList)
                        curList = lists[numId] = new listModule(numId);
                }
                this.paragraph.list = curList;
                // Footnote, endnote has no this function.
                if (this.paragraph.doc.addPendingUpdateList)
                    this.paragraph.doc.addPendingUpdateList(numId, curList);

                // TODO update it for whole list when continue.
                if (this.paragraph.doc.isLoading) {
                    curList.appendParaInLoading(this.paragraph);
                } else {
                    curList.addPara(this.paragraph);
                    if (ModelTools.isNotes(this.paragraph.doc))
                        curList.updateListValueNow(true);
                    else
                        curList.updateListValue();
                }
            }
        },
        /**
         * Call this function when the paragraph insert to model
         * Ensure this property is paragraph directly property
         */
        insertToModel: function() {
            // Add reference to style when insert paragraph into model
            if (this.styleId && this.styleId != this._defaultVal) {
                var refStyle = pe.lotusEditor.getRefStyle(this.styleId);
                refStyle && refStyle.addReferer(this.paragraph);
            }

            this._addToList();
        },

        _removeFromList: function() {
            if (!this.paragraph)
                return;

            var list = this.paragraph.list;
            if (list) {
                list.removePara(this.paragraph, 1);
                list.updateListValue();
            }
            this.listParaProperty = null;
            if (this.paragraph) {
                this.paragraph.list = null;
                delete this.paragraph.listSymbols;
                delete this.paragraph.listRuns;
            }
        },
        /**
         * Call this function when the paragraph remove from model
         * Ensure this property is paragraph directly property
         */
        removeFromModel: function() {
            // Remove the reference to style when paragraph removed from paragraph
            if (this.styleId && this.styleId != this._defaultVal) {
                var refStyle = pe.lotusEditor.getRefStyle(this.styleId);
                refStyle && refStyle.removeReferer(this.paragraph);
            }

            this._removeFromList();
        },
        /**
         * performance reason, change function to inline
         * @param prop
         * @returns {Boolean}
         */
        _isValidProperty: function(prop) {
            return (prop != null && prop != "empty");
        },

        _getValue: function(key, ignoreList) {
            var ret = null;

            // if this paragraph contains section break, then the numId should not work
            if ("numId" == key || "iLvl" == key) {
                var pContent = this.paragraph && this.paragraph.getVisibleText();
                var hasOnlyPB = this.paragraph && this.paragraph.ifOnlyContianPageBreak();
                if (this.sectId && ("" == pContent || hasOnlyPB)) {
                    return "none";
                }
            }

            var emptyVal = "empty";

            //      if(this.paragraph) // Directly property, get it first
            {
                // 1. Get from self
                ret = this[key];

                // The paragraph is not a list, it will override the style's list setting.
                // Like the paragraph numId is 0/-1, the style is heading with numId is 1.
                if (this.paragraph && this.numId != this._defaultVal && !pe.lotusEditor.number.getSameListNumId(this.numId))
                    ignoreList = true;

                var firstProp = ignoreList ? null : this.listParaProperty,
                    secondProp = this.styleParaProperty;
                if (!ignoreList && !this._isValidNumId(this.numId)) {
                    var tmp = firstProp;
                    firstProp = secondProp;
                    secondProp = tmp;
                }

                // 2. Get from list property
                if (firstProp && firstProp != emptyVal && ret != 0 && (!ret || ret == this._defaultVal))
                    ret = firstProp._getValue(key, ignoreList);

                // 3. Get from style
                if (secondProp && secondProp != emptyVal && ret != 0 && (!ret || ret == this._defaultVal))
                    ret = secondProp._getValue(key, ignoreList);
            }
            //      else
            //      {
            //          // 1. Get from list property
            //          if(this.listParaProperty && this.listParaProperty != emptyVal && ret != 0 && (!ret || ret == this._defaultVal) )
            //              ret = this.listParaProperty._getValue(key);
            //          
            //          // 2. Get from self
            //          ret = this[key];
            //          
            //          // 3. Get from style
            //          if(this.styleParaProperty && this.styleParaProperty != emptyVal && ret != 0 && (!ret || ret == this._defaultVal) )
            //              ret = this.styleParaProperty._getValue(key);
            //      }

            // Get from Document default style

            if (ret != 0 && (!ret || ret == this._defaultVal) && this.paragraph && this.paragraph.parent && this.paragraph.parent.getProperty) {
                var property = this.paragraph.parent.getProperty();
                var _paraProperty = property && property.getParagraphProperty();
                ret = _paraProperty && _paraProperty._getValue(key);
            }
            if (this.docDefaultProperty && this.docDefaultProperty != emptyVal && ret != 0 && (!ret || ret == this._defaultVal))
                ret = this.docDefaultProperty._getValue(key);


            if (ret == this._defaultVal)
                ret = null;

            return ret;

        },

        getKeepNext: function() {
            //return this.keepNext || 0;
            return this._getValue("keepNext") || 0;
        },
        getBackgroundColor: function() {
            return this._getValue("backgroundColor");
        },

        setBackgroundColor: function(color) {
            if (color != this.backgroundColor) {
                this.changedRecord.push({
                    'type': 'backgroundColor',
                    'oldValue': this.backgroundColor,
                    'newValue': color
                });
                this.backgroundColor = color;
            }
        },
        getBorder: function() {
            return this._getValue("border");
        },
        setBorder: function(border) {
            if (border != this.border) {
                this.changedRecord.push({
                    'type': 'border',
                    'oldValue': this.border,
                    'newValue': border
                });
                this.border = border;
            }
        },
        isJustified: function() {
            var alignment = this.getAlign();
            if (alignment == "justified") {
                return true;
            }
            return false;
        },
        getAlign: function() {
            var align = this._getValue("align") || "left";
            if (this._getValue("direction") == "rtl") {
                if (align == "right")
                    align = "left";
                else if (align == "left")
                    align = "right";
            }
            return align;
        },
        setAlign: function(align, force) {
            if (!align && force)
                align = "none";
            if ((align == "none" || align == "left" || align == "right" || align == "centered" || align == "justified") && align != this.align) {
                this.changedRecord.push({
                    'type': 'align',
                    'oldValue': this.align,
                    'newValue': align
                });
                this.align = align;
            }

        },
        getDirection: function(isRawProperty) {
            var direction = this._getValue("direction");
            if (!direction)
                direction = pe.lotusEditor.setting.getDefaultDirection();

            if (!isRawProperty) {
                if (direction == "rl-tb")
                    direction = "rtl";
                else if (direction == "lr-tb")
                    direction = "ltr";
            } else if (!direction)
                direction = "ltr";

            return direction;
        },
        setDirection: function(direction) {
            if ((direction == "none" || direction == "ltr" || direction == "rtl" || direction == "lr-tb" || direction == "rl-tb") && direction != this.direction) {
                this.changedRecord.push({
                    'type': 'direction',
                    'oldValue': this.direction,
                    'newValue': direction
                });
                this.direction = direction;
            }
        },
        getIndentLeft: function() {
            var indLeft = this._getValue("indentLeft") || 0;

            //      if("hanging" == this.getIndentSpecialType())
            //      {
            //          var specialIndentVal = this.getIndentSpecialValue();
            //          if(specialIndentVal != this._defaultVal)
            //              indLeft -= specialIndentVal;
            //      }

            return indLeft;
        },
        /**
         * The function return the real value of indent left for this paragraph.
         */
        getRealIndentLeft: function() {
            return this.indentLeft;
        },
        _addUnit: function(val) {
            if (val != this._defaultVal)
                val += "pt";
            return val;
        },
        setIndentLeft: function(indent, isFromMsg) {
            if (indent != this._defaultVal)
                indent = tools.toPtValue(indent);

            if (this.indentLeft != indent) {
                // isFromMsg was used for defect 46219 

                // Defect 36894.
                // If the new indent value is same with list will remove it.
                var tmp = this.indentLeft;
                this.indentLeft = this._defaultVal; // Set it to none to recalculate it.
                if (!isFromMsg && indent == this.getIndentLeft()) {
                    indent = this._defaultVal;
                    this.indentLeft = tmp;
                }

                this.changedRecord.push({
                    'type': 'indent.left',
                    'oldValue': this._addUnit(tmp),
                    'newValue': this._addUnit(indent)
                });
                this.indentLeft = indent;
            }
        },
        getIndentRight: function() {
            return this._getValue("indentRight") || 0;
        },
        setIndentRight: function(indent) {
            if (indent != this._defaultVal)
                indent = tools.toPtValue(indent);
            if (this.indentRight != indent) {
                this.changedRecord.push({
                    'type': 'indentRight.right',
                    'oldValue': this._addUnit(this.indentRight),
                    'newValue': this._addUnit(indent)
                });
                this.indentRight = indent;
            }
        },
        getIndentSpecialType: function() {
            return this._getValue("specialIndent") || this._defaultVal;
        },
        /**
         * The function only set this object's special indent type and value.
         */
        clearSpecialIndent: function() {
            if (this._defaultVal != this.specialIndent) {
                this.changedRecord.push({
                    'type': 'indent.specialkey',
                    'oldValue': this.specialIndent,
                    'newValue': this._defaultVal
                });
                this.specialIndent = this._defaultVal;
            }

            if (this._defaultVal != this.specialIndentValue) {
                this.changedRecord.push({
                    'type': 'indent.specialvalue',
                    'oldValue': this._addUnit(this.specialIndentValue),
                    'newValue': this._defaultVal
                });
                this.specialIndentValue = this._defaultVal;
            }
        },
        /**
         * When type and value is none, the different bewteen setIndentSpecialTypeValue() with clearSpecialIndent is
         *   this function will override it.
         * @param type
         * @param value
         */
        setIndentSpecialTypeValue: function(type, value) {
            if (value != this._defaultVal)
                value = tools.toPtValue(value);

            if (type == this._defaultVal && value == this._defaultVal && this.specialIndent != this.getIndentSpecialType()) {
                // When the paragraph has a style with special indent.
                // Will set the paragraph's special indent value with 0 to override style value.
                var specialVal = this.getIndentSpecialValue(); // Defect 39435
                if (value != specialVal && specialVal != 0)
                    value = 0;
                //          type = "firstLine";
            }

            if ((type != "" || type != "") && type != this.specialIndent) {
                this.changedRecord.push({
                    'type': 'indent.specialkey',
                    'oldValue': this.specialIndent,
                    'newValue': type
                });
                this.specialIndent = type;
            }

            if (value != this.specialIndentValue) {
                this.changedRecord.push({
                    'type': 'indent.specialvalue',
                    'oldValue': this._addUnit(this.specialIndentValue),
                    'newValue': this._addUnit(value)
                });
                this.specialIndentValue = value;
            }
        },
        getIndentSpecialValue: function() {
            return this._getValue("specialIndentValue") || 0;
        },
        //  setIndentSpecialValue:function(value){
        //      if(value != this._defaultVal)
        //          value = writer.common.tools.toPtValue(value);
        //      if(value!=this.specialIndentValue){
        //          this.changedRecord.push({'type':'indent.specialvalue','oldValue':this._addUnit(this.specialIndentValue),'newValue':this._addUnit(value)});
        //          this.specialIndentValue = value;
        //      }
        //  },
        getSpaceBefore: function() {
            return this._getValue("spaceBefore") || 0;
        },
        setSpaceBefore: function(before) {
            if (before != this._defaultVal)
                before = tools.toPtValue(before);
            if (this.spaceBefore != before) {
                this.changedRecord.push({
                    'type': 'space.before',
                    'oldValue': this._addUnit(this.spaceBefore),
                    'newValue': this._addUnit(before)
                });
                this.spaceBefore = before;
            }
        },

        isContextualSpacing: function() {
            return this._getValue("contextualSpacing");
        },

        getSpaceAfter: function() {
            return this._getValue("spaceAfter") || 0;
        },
        setSpaceAfter: function(after) {
            if (after != this._defaultVal)
                after = tools.toPtValue(after);
            if (this.spaceAfter != after) {
                this.changedRecord.push({
                    'type': 'space.after',
                    'oldValue': this._addUnit(this.spaceAfter),
                    'newValue': this._addUnit(after)
                });
                this.spaceAfter = after;
            }
        },
        getLineSpaceType: function() {
            return this._getValue("lineSpace") || this._defaultVal;
        },
        setLineSpaceType: function(type) {
            if ((type == "relative" || type == "absolute" || type == "atLeast" || type == "none") && type != this.lineSpace) {
/* defect 55722        
            	if(!this.lineSpace && type == "none")
            	{
            		this.lineSpace = "none";
            		return;
            	}
*/
                this.changedRecord.push({
                    'type': 'linespacing.lineRule',
                    'oldValue': this.lineSpace,
                    'newValue': type
                });
                this.lineSpace = type;
            }
        },
        getLineSpaceValue: function() {
            return this._getValue("lineSpaceValue") || 0;
        },
        setLineSpaceValue: function(value) {
            if (this.lineSpaceValue != value) {
/*  defect 55722
            	if(this.lineSpaceValue == null && this.lineSpace == "none")
            	{
            		this.lineSpaceValue = 0;
            		return;
            	}
*/                this.changedRecord.push({
                    'type': 'linespacing.line',
                    'oldValue': this.lineSpaceValue,
                    'newValue': value
                });
                this.lineSpaceValue = value;
            }
        },
        getNumId: function() {
            return this._getValue("numId");
        },
        setNumId: function(nId) {
            if (nId != this.numId) {
                this.changedRecord.push({
                    'type': 'numPr.numId',
                    'oldValue': this.numId,
                    'newValue': nId
                });
                this.numId = nId;
            }
        },
        getNumLevel: function() {
            var ret = this._getValue("iLvl");
            if (ret == null)
                ret = -1;
            return ret;
        },
        setNumLevel: function(lvl) {
            if (lvl != this.iLvl) {
                this.changedRecord.push({
                    'type': 'numPr.ilvl',
                    'oldValue': this.iLvl,
                    'newValue': lvl
                });
                this.iLvl = lvl;

                if (this.numId != -1 && this.numId != this._defaultVal)
                    this.listParaProperty = pe.lotusEditor.number.getListPr(this.numId, this.iLvl);
                else
                    this.listParaProperty = null;
            }
        },
        getTabs: function() {
            //      return this._getValue("tabs") || this._defaultVal;

            var emptyVal = "empty";
            var key = "tabs";

            var selfTabs = this[key];

            var listTabs = null;
            if (this.listParaProperty && this.listParaProperty != emptyVal)
                listTabs = this.listParaProperty.getTabs();

            var styleTabs = null;
            if (this.styleParaProperty && this.styleParaProperty != emptyVal)
                styleTabs = this.styleParaProperty.getTabs();

            var docTabs = null;
            if (this.paragraph && this.docDefaultProperty && this.docDefaultProperty != emptyVal)
                docTabs = this.docDefaultProperty.getTabs();

            var retTabs = null;
            retTabs = this._mergeTabs(selfTabs, listTabs);
            retTabs = this._mergeTabs(retTabs, styleTabs);
            retTabs = this._mergeTabs(retTabs, docTabs);
            retTabs = retTabs || this._defaultVal;

            return retTabs;
        },
        setTabs: function(newTabs) {
            if (newTabs != this.tabs) {
                this.tabs = newTabs;
                this.changedRecord.push({
                    'type': 'tabs',
                    'oldValue': this.tabs.tabs,
                    'newValue': newTabs.tabs
                });
            }
        },
        getSectId: function() {
            return this._getValue("sectId");
        },
        setSectId: function(newSectId) {
            if (this.sectId != newSectId) {
                this.changedRecord.push({
                    'type': 'secId',
                    'oldValue': this.sectId,
                    'newValue': newSectId
                });
                this.sectId = newSectId;
            }
        },
        getOutlineLvl: function() {
            return this._getValue("outlineLvl");
        },
        setOutlineLvl: function(newLvl) {
            this.outlineLvl = newLvl;
        },
        clearMsg: function() {
            this.changedRecord = [];
        },
        getMessage: function() {
            if (this.changedRecord.length == 0)
                return null;

            var msgActionTypes = {},
                msgActionIndex = [];
            var oPpr, nPpr;
            for (var i = 0; i < this.changedRecord.length; i++) {
                var record = this.changedRecord[i];
                var types = record['type'].split('.');
                var type = types[0];
                if (!msgActionTypes[type]) {
                    msgActionTypes[type] = {};
                    msgActionTypes[type]["oPpr"] = {};
                    msgActionTypes[type]["nPpr"] = {};
                    msgActionIndex.push(type);
                }
                oPpr = msgActionTypes[type]["oPpr"];
                nPpr = msgActionTypes[type]["nPpr"];

                var oldValue = record['oldValue'];
                var newValue = record['newValue'];
                if (!oPpr[type]) {
                    oPpr['type'] = type, nPpr['type'] = type;
                    if (!this.isListPpr)
                        oPpr['subType'] = 'para', nPpr['subType'] = 'para';
                    else {
                        oPpr['subType'] = 'list', nPpr['subType'] = 'list';

                    }
                }
                var key = types[1] || type;
                oPpr[key] = oldValue;
                nPpr[key] = newValue;
            }

            var acts = [];
            for (var i = 0; i < msgActionIndex.length; i++) {
                var type = msgActionIndex[i];
                oPpr = msgActionTypes[type]["oPpr"];
                nPpr = msgActionTypes[type]["nPpr"];
                acts.push(msgCenter.createSetAttributeAct(this.paragraph, nPpr, oPpr));
            }

            var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, acts);
            this.clearMsg();
            return msg;
        },

        /**
         * Return message ARRAY
         * @param styleId
         */
        addStyle: function(styleId) {
            var msgs = [];
            if (styleId != this.styleId) {
                var oPpr = {
                    'type': 'style',
                    'styleId': this.styleId
                };
                var nPpr = {
                    'type': 'style',
                    'styleId': styleId
                };

                this.removeStyle();

                // The special case that remove list will remove this style. It will not clean all runs' style.
                // It's different with set style to paragraph.
                if ("ListParagraph" != styleId)
                    msgs = this.clearStyle(); //not clean the paragraph run style for heading
                this.styleId = styleId;
                var refStyle = pe.lotusEditor.getRefStyle(styleId);
                if (refStyle) {
                    refStyle.addReferer(this.paragraph);
                    this.styleParaProperty = refStyle.getParagraphProperty();
                    if (!this._isValidNumId(this.numId))
                        this._addToList();
                }

                var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this.paragraph, nPpr, oPpr)]);
                msgs.push(msg);
            }
            return msgs;
        },
        /**
         * This function is to clear style for set heading style, in this case, the run style which is the same with paragraph style will be delete
         */
        clearStyle: function() {
            var msgs = [],
                tacts = [],
                mc;
            if (pe.lotusEditor._shell.getEditMode() == constants.EDITMODE.EDITOR_MODE)
                mc = constants.MSGCATEGORY.Content;
            else
                mc = constants.MSGCATEGORY.Relation;
            var para = this.paragraph;
            var runs = this.paragraph.container;
            runs && runs.forEach(function(run) {
                var oRunProp = {},
                    nRunProp = {};
                if (run.textProperty && !run.isTrackDeleted()) {
                    var runStyle = run.textProperty.toJson();
                    var runPre = run.textProperty.preserve;
                    if (runPre) {
                    	if(!runStyle)
                    		runStyle = {};
                    	runStyle["preserve"] = runPre;
                     }

                    if (!runStyle)
                        return;
                    oRunProp = lang.clone(runStyle);
                    for (var i in oRunProp) {
                   		nRunProp[i] = "";
                    }
                    nRunProp.t = "rPr";
                    run.textProperty.clearInlineStyle();
                    tacts.push(msgCenter.createSetTextAttribute(run.start, run.length, para, nRunProp, oRunProp));
                }
            });
            var tmsg = tacts.length > 0 ? msgCenter.createMsg(constants.MSGTYPE.TextAttribute, tacts, mc, false) : null;
            tmsg && msgs.push(tmsg);
            if (this.paragraph.paraTextProperty) {
                var oPTextProp = this.paragraph.paraTextProperty.toJson() || {};
                var o = {
                    s: oPTextProp,
                    type: 'pt'
                };
                this.paragraph.paraTextProperty.clear();
                var n = {
                    s: {},
                    type: 'pt'
                };
                var pacts = [msgCenter.createSetAttributeAct(this.paragraph, n, o)];
                var pmsg = msgCenter.createMsg(constants.MSGTYPE.Attribute, pacts, mc, false);
                pmsg && msgs.push(pmsg);
                this.paragraph._cacheListSymbolProperty = null;
            }
            return msgs;
        },
        /**
         * Return message Array
         */
        removeStyle: function() {
            if (this.styleId && this.styleId != this._defaultVal) {
                var refStyle = pe.lotusEditor.getRefStyle(this.styleId);
                refStyle && refStyle.removeReferer(this.paragraph);
                this.styleParaProperty = null;

                var oPpr = {
                    'type': 'style',
                    'styleId': this.styleId
                };
                var nPpr = {
                    'type': 'style',
                    'styleId': null
                };

                delete this.styleId;
                if (!this._isValidNumId(this.numId))
                    this._removeFromList();

                var msg = msgCenter.createMsg(constants.MSGTYPE.Attribute, [msgCenter.createSetAttributeAct(this.paragraph, nPpr, oPpr)]);
                return [msg];
            }
            return null;
        },

        /**
         * Remove list
         * @param isClean If it is true will remove the numPr value otherwise set it to a -1 as a invalid value. 
         * @returns
         */
        removeList: function(isClean) {
            if ((this.numId == -1 && !isClean) || (this.numId == this._defaultVal && isClean))
                return;

            var newId, newLvl;
            if (this.numId != this._defaultVal) {
                // This list is direct property
                //          this.numId = this._defaultVal;
                //          delete this.iLvl;
                newId = -1;
                newLvl = 0;
            } else {
                // The list was inherited from style
                // Set the numId to 0 to override it.
                newId = -1;
                newLvl = 0;
            }
            if (isClean) {
                newId = this._defaultVal;
                newLvl = this._defaultVal;
            }

            if (this._isValidNumId(this.getNumId()))
                this._removeFromList();

            this.setNumId(newId);
            this.setNumLevel(newLvl);

            if (isClean) {
                var newNumId = this.getNumId();
                if (!this._isValidNumId(this.newNumId))
                    this._addToList();
            }

            // Defect 37961, some docx file include this style in default list.
            if (this.styleId == "ListParagraph") {
                this.changedRecord.push({
                    'type': 'style.styleId',
                    'oldValue': this.styleId,
                    'newValue': null
                });
                this.removeStyle();
            }
            // TODO remove style Id when the styleId start with "List", like "ListParagraph".
            // At the same time set list should follow the same rule. Set style Id with previous style.

            return this.getMessage();
        },

        /**
         * 
         * @param numId
         * @param level
         * @param isCleanDefaultStyle is true will clean the default list class "ListParagraph"
         *                           Even if it's change list.
         * @returns
         */
        setList: function(numId, level, isCleanDefaultStyle) {
            this._removeFromList();

            this.setNumId(numId);

            // Defect 37961, some docx file include this style in default list.
            if (this.styleId == "ListParagraph" && (isCleanDefaultStyle || !this._isValidNumId(numId))) {
                this.changedRecord.push({
                    'type': 'style.styleId',
                    'oldValue': this.styleId,
                    'newValue': null
                });
                this.removeStyle();
            }
            if (isCleanDefaultStyle) {
                this.setIndentLeft("none");
                //          this.setIndentSpecialTypeValue("none", "none");
                // Defect 41884. Force remove special indent and value
                var type = "none",
                    value = "none";
                if (type != this.specialIndent) {
                    this.changedRecord.push({
                        'type': 'indent.specialkey',
                        'oldValue': this.specialIndent,
                        'newValue': type
                    });
                    this.specialIndent = type;
                }

                if (value != this.specialIndentValue) {
                    this.changedRecord.push({
                        'type': 'indent.specialvalue',
                        'oldValue': this._addUnit(this.specialIndentValue),
                        'newValue': this._addUnit(value)
                    });
                    this.specialIndentValue = value;
                }
            }

            // Remove number then undo, the message didn't change the level.
            // so the level will be undefined.
            if (level != undefined)
                this.setNumLevel(level);
            else
                level = this.getNumLevel();

            this._addToList();
            this.listParaProperty = this._isValidNumId(numId) ? pe.lotusEditor.number.getListPr(numId, level) : null;

            return this.getMessage();
        },

        getPageBreakBefore: function() {
            return this.isPageBreakBefore();
        },

        isPageBreakBefore: function() {
            return this._getValue('pageBreakBefore');
        },

        setPageBreakBefore: function(value, force) {
            if (value === null && force)
                value = this._defaultVal;
            if ((value == true || value == false || value == this._defaultVal) && this.pageBreakBefore != value) {
                var oldValue = this.pageBreakBefore;
                if (value == false) {
                    this.pageBreakBefore = this._defaultVal;
                    if (this.isPageBreakBefore()) {
                        this.pageBreakBefore = false;
                    }
                } else {
                    this.pageBreakBefore = value;
                }

                this.changedRecord.push({
                    'type': 'pageBreakBefore',
                    'oldValue': oldValue,
                    'newValue': this.pageBreakBefore
                });
            }
        },
        getKeepLines: function() {
            return this.isKeepLines();
        },
        isKeepLines: function() {
            return this._getValue('keepLines'); // true, false, null
        },

        setKeepLines: function(value, force) {
            if (value === null && force)
                value = this._defaultVal;
            if ((value == true || value == false || value == this._defaultVal) && this.keepLines != value) {
                this.changedRecord.push({
                    'type': 'keepLines',
                    'oldValue': this.keepLines,
                    'newValue': value
                });
                this.keepLines = value;
            }
        },

        getWidowControl: function() {
            return this._getValue('widowControl');
        },

        isWidowControl: function() {
            var wc = this._getValue('widowControl');
            if (wc === false)
                return false;
            return true;
        },

        setWidowControl: function(value, force) {
            if (value === null && force)
                value = this._defaultVal;
            if ((value == true || value == false || value == this._defaultVal) && this.widowControl != value) {
                this.changedRecord.push({
                    'type': 'widowControl',
                    'oldValue': this.widowControl,
                    'newValue': value
                });
                this.widowControl = value;
            }
        }
    };

    return ParagraphProperty;
});
