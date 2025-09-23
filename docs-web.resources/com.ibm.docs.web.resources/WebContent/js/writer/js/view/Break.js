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
    "dojo/dom-construct",
    "writer/view/Run",
    "writer/global",
    "dojo/i18n!writer/nls/lang"
], function(declare, domConstruct, Run, g, i18nLang) {

    var Break = declare("writer.view.Break", Run, {
        PAGETYPE: {
            PAGE: "page",
            LINE: "textWrapping",
            COLUMN: "column"
        },
        w: 0,
        h: 0,
        type: null,
        constructor: function(model, ownerId, start, len) {
            this.type = model.br && model.br.type || this.PAGETYPE.LINE;
            this.init(start, len);
        },
        getViewType: function() {
            if (this.type == this.PAGETYPE.PAGE) {
                return "text.PageBreak";
            }
            return 'text.LineBreak';
        },
        getChildPosition: function(idx) {
            var pos = this.inherited(arguments);
            pos.x = this.getLeft() + (0 == idx ? 0 : this.getWidth());
            return pos;
        },
        layout: function(line) {
            //get height,width as simple run
            this.inherited(arguments);
            this.calcW(line);
        },
        calcW: function(line) {
        	if (!this.isVisibleInTrack())
        	{
        		this.h = 0;
        		this.w = 0;
        		return;
        	}
            if (this.type == this.PAGETYPE.PAGE) {
                var run = line.container.prev(this);
                var width = line.w + line.paddingLeft - line.offsetX;
                if (run) {
                    var x = run.left + run.getWidth();
                    width = line.w + line.paddingLeft - x;
                }
                if(line.parent && line.parent.directProperty && line.parent.directProperty.getSectId()){
                    this.w = Math.ceil(0.5 * width);
                }else
                    this.w = width;
                if (this.w < 0)
                    this.w = 0;
                if (this.w != this.renderW)
                    this.dirty = true;
            }
        },
        getBreakText: function()
        {
            if (this.type == this.PAGETYPE.PAGE) {
                return i18nLang.PAGE_BREAK_TEXT;
            }
            return i18nLang.LINE_BREAK_TEXT;
        },
        measureBreakText: function()
        {
            if (g[this.type + "BreakWidth"])
                return g[this.type + "BreakWidth"];
            var div = pe.lotusEditor.getEditorDIV();
            var textDom = domConstruct.create("div", {"class": 'breaktext', "innerHTML": this.getBreakText()}, div);
            g[this.type + "BreakWidth"] = textDom.offsetWidth;
            textDom.parentNode.removeChild(textDom);
            return g[this.type + "BreakWidth"];
        },
        canSplit: function() {
            return false;
        },
        canFit: function(w, h) {
            return true;
        },
        isSpace: function() {
            return true;
        },
        getText: function() {
            return "";
        },
        renderInside: function(dom)
        {
            var dot = domConstruct.create("div", {"class": 'breakdot'}, dom);
            var width = this.measureBreakText();
            if (this.w > width + 4)
                domConstruct.create("div", {"class": 'breaktext', "innerHTML": this.getBreakText()}, dom);
        },
        render: function() {
        	var visible = this.isVisibleInTrack();
            if (!this.domNode || this.dirty) {
                delete this.dirty;
                var w = this.w;
                this.renderW = w;
                if (this.type == this.PAGETYPE.PAGE) {
                    this.domNode = domConstruct.create("div", {
                        "class": this.type + 'break',
                        "style": "width:" + w + "px;"
                    });
                    if (visible)
                    	this.renderInside(this.domNode);
                } else {
                    this.domNode = domConstruct.create("div", {
                        "class": "carriageNode " + this.type + 'break'
                    });
                    if (visible)
                    {
                    	var enterCharNode = document.createTextNode("\u2193");
                    	this.domNode.appendChild(enterCharNode);
                    }
                }

            } else if (this.type == this.PAGETYPE.PAGE) {
                this.domNode.style.cssText = "width:" + this.w + "px;";
            }
            
            this.checkTrackClass(this.domNode);

            return this.domNode;
        },
        getElementPath: function(x, y, h, path, options) {
            var index = 0,
                fixedX = 0;
            if (this.type != this.PAGETYPE.LINE) {
                //#36296
                index = x < this.getWidth() * 0.5 ? 0 : 1;
                fixedX = this.getWidth();
            }

            var run = {
                "delX": fixedX - x,
                "delY": (h - this.h) - y,
                "index": index,
                "offsetX": fixedX,
                "lineH": h,
                "h": this.h
            };
            path.push(run);
        }
    });
    return Break;
});
