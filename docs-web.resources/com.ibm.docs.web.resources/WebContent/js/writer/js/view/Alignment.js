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
    "dojo/dom-style",
    "writer/view/Run"
], function(declare, domConstruct, domStyle, Run) {

    var Alignment = declare("writer.view.Alignment", Run, {
        constructor: function(model, ownerId, start, len) {
            this.model = model;
            this.ownerId = ownerId;
            this.init(start, len);
            this.len = 1;
        },

        realWidth: 0, // the real width before set justify alignment

        getLastBreakPoint: function() {
            return 1;
        },
        getViewType: function() {
            return 'text.Alignment';
        },
        canSplit: function(w, h, forceFit) {
            return false;
        },
        canFit: function(w, h) {
            return true;
        },
        isSpace: function(text, index) {
            return true;
        },
        getElementPath: function(x, y, h, path, options) {
            var index;
            var fixedX;
            if (x > this.w / 2) {
                index = 1;
                fixedX = this.w;
            } else {
                index = 0;
                fixedX = 0;
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
        },
        getChildPosition: function(idx) {
            var x = this.getLeft();
            var y = this.getTop();
            var isItalic = this.getComputedStyle()["font-style"] == "italic";
            if (idx == 0) {
                return {
                    'x': x,
                    'y': y,
                    "italic": isItalic
                };
            } else {
                return {
                    'x': x + this.w,
                    'y': y,
                    "italic": isItalic
                };
            }
        },
        layout: function(line) {
            //layout using parent's layout
            this.inherited(arguments);

            // save orgin width
            this.realWidth = this.w;
        },
        restoreWidth: function() {
            this.w = this.realWidth;
        },
        getBoxWidth: function() {
            return this.w;
        },
        _createRunDOM: function() {
            return domConstruct.create("span", {
                "class": "Run" + this.getCSSStyle(),
                "style": (this.getStyleStr() + "width:" + this.w + "px;display:inline-block;")
            });
        },
        _updateDOMWidth: function() {
            if (this.domNode)
                domStyle.set(this.domNode, {
                    "width": this.w + "px"
                });
        }
    });
    return Alignment;
});
