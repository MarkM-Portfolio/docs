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
    "dojo/dom-construct",
    "dojo/has",
    "dojo/query",
    "dojo/topic",
    "writer/constants",
    "writer/common/Container",
    "writer/common/tools",
    "writer/model/Model",
    "writer/model/table/Table",
    "writer/util/ModelTools",
    "writer/util/TableTools",
    "writer/util/ViewTools",
    "writer/view/AbstractView"
], function(array, domConstruct, has, query, topic, constants, Container, tools, Model, Table, ModelTools, TableTools, ViewTools, AbstractView) {


    var TableBase = function() {

    };

    TableBase.prototype = {
        isTrackDeleted: function() {
            var changes = this.model.ch;
            var hasDelChange = false;
            if (changes && changes.length) {
                var len = changes.length;
                var lastChange = changes[len - 1];
                if (lastChange.t == "del") {
                    // draw strickthrough in the text.
                    return lastChange.u;
                }
            }
            return hasDelChange;
        },
        initEdgeWidth: function() {
            this._edgeWidth = this._initEdgeWidth();
            var border = this.model.getBorder();
            if (border.left) {
                borderWidth = tools.toPxValue(border.left.width) / 2;
                if (has("webkit") && borderWidth < 1.0 && borderWidth != 0) {
                    borderWidth = 1.0;
                }
                borderWidth = Math.ceil(borderWidth);
                if (this._adapterBorderStyle(border.left.style) === "double")
                    borderWidth = borderWidth * 3;
                this._edgeWidth.left.border = borderWidth;
            }
            if (border.right) {
                borderWidth = tools.toPxValue(border.right.width) / 2;
                if (has("webkit") && borderWidth < 1.0 && borderWidth != 0) {
                    borderWidth = 1.0;
                }
                borderWidth = Math.ceil(borderWidth);
                if (this._adapterBorderStyle(border.right.style) === "double")
                    borderWidth = borderWidth * 3;
                this._edgeWidth.right.border = borderWidth;
            }
            if (border.top) {
                borderWidth = tools.toPxValue(border.top.width) / 2;
                if (has("webkit") && borderWidth < 1.0 && borderWidth != 0) {
                    borderWidth = 1.0;
                }
                borderWidth = Math.ceil(borderWidth);
                if (this._adapterBorderStyle(border.top.style) === "double")
                    borderWidth = borderWidth * 3;
                this._edgeWidth.top.border = borderWidth;
            }
            if (border.bottom) {
                borderWidth = tools.toPxValue(border.bottom.width) / 2;
                if (has("webkit") && borderWidth < 1.0 && borderWidth != 0) {
                    borderWidth = 1.0;
                }
                borderWidth = Math.ceil(borderWidth);
                if (this._adapterBorderStyle(border.bottom.style) === "double")
                    borderWidth = borderWidth * 3;
                this._edgeWidth.bottom.border = borderWidth;
            }
        },
        _borderSet: {
            "none": true,
            "dotted": true,
            "dashed": true,
            "solid": true,
            "double": true,
            "groove": true,
            "ridge": true,
            "inset": true,
            "outset": true
        },
        _adapterBorderStyle: function(style) {
            style = style.toLowerCase();
            var ret = tools.borderMap[style];
            if (this._borderSet[ret]) {
                return ret;
            } else {
                return "solid";
            }
        },
        _adapterBorderColor: function(color) {
            if (!color) {
                return "";
            }
            color = color.toLowerCase();
            switch (color) {
                case "auto":
                    return "000000";
                default:
                    return color;
            }
        },
        getLeftEdge: function() {
            var edge = this.getEdgeWdith();
            return edge.left.border + edge.left.padding;
        },
        getRightEdge: function() {
            var edge = this.getEdgeWdith();
            return edge.right.border + edge.right.padding;
        },
        getTopEdge: function() {
            var edge = this.getEdgeWdith();
            return edge.top.border + edge.top.padding;
        },
        getBottomEdge: function() {
            var edge = this.getEdgeWdith();
            return edge.bottom.border + edge.bottom.padding;
        },
        getLeftBorderWidth: function() {
            return this.getEdgeWdith().left.border;
        },
        getRightBorderWidth: function() {
            return this.getEdgeWdith().right.border;
        },
        getTopBorderWidth: function() {
            return this.getEdgeWdith().top.border;
        },
        getBottomBorderWidth: function() {
            return this.getEdgeWdith().bottom.border;
        },
        getBorderStyleStr: function() {
            var border = this.model.getBorder();
            var edge = this.getEdgeWdith();
            var str = "";
            if (edge.left.border > 0 || edge.left.padding > 0) {
                str += "padding-left:" + (edge.left.border + edge.left.padding) + "px;";
            }
            if (edge.right.border > 0 || edge.right.padding > 0) {
                str += "padding-right:" + (edge.right.border + edge.right.padding) + "px;";
            }
            if (edge.top.border > 0 || edge.top.padding > 0) {
                str += "padding-top:" + (edge.top.border + edge.top.padding) + "px;";
            }
            if (edge.bottom.border > 0 || edge.bottom.padding > 0) {
                str += "padding-bottom:" + (edge.bottom.border + edge.bottom.padding) + "px;";
            }
            return str;
        },
        getEdgeWdith: function() {
            if (!this._edgeWidth) {
                this.initEdgeWidth();
            }
            return this._edgeWidth;
        }

    };

    return TableBase;
});
