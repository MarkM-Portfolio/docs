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
    "dojo/_base/lang",
    "writer/common/tools",
    "writer/model/prop/Property",
    "writer/model/prop/TextProperty"
], function(array, lang, tools, Property, TextProperty) {

    var TableCommonProperty = function() {

    };

    TableCommonProperty.prototype = {
        initBorder: function(borders) {
            delete this.leftBorder;
            delete this.rightBorder;
            delete this.topBorder;
            delete this.bottomBorder;
            delete this.insideH;
            delete this.insideV;
            delete this._borderCache;
            delete this._mergedBorder;
            if (borders) {
                var left = borders.left;
                if (left && !this._isNullBorder(left.val)) {
                    this.leftBorder = {};
                    this.leftBorder.width = left.sz; // Math.round(writer.common.tools.toPxValue((left.sz/20)+"pt"));
                    this.leftBorder.style = left.val;
                    this.leftBorder.color = left.color;
                }
                var right = borders.right;
                if (right && !this._isNullBorder(right.val)) {
                    this.rightBorder = {};
                    this.rightBorder.width = right.sz; // Math.round(writer.common.tools.toPxValue((right.sz/20)+"pt"));
                    this.rightBorder.style = right.val;
                    this.rightBorder.color = right.color;
                }
                var top = borders.top;
                if (top && !this._isNullBorder(top.val)) {
                    this.topBorder = {};
                    this.topBorder.width = top.sz; // Math.round(writer.common.tools.toPxValue((top.sz/20)+"pt"));
                    this.topBorder.style = top.val;
                    this.topBorder.color = top.color;
                }
                var bottom = borders.bottom;
                if (bottom && !this._isNullBorder(bottom.val)) {
                    this.bottomBorder = {};
                    this.bottomBorder.width = bottom.sz; // Math.round(writer.common.tools.toPxValue((bottom.sz/20)+"pt"));
                    this.bottomBorder.style = bottom.val;
                    this.bottomBorder.color = bottom.color;
                }
                var insideH = borders.insideH;
                if (insideH && !this._isNullBorder(insideH.val)) {
                    this.insideH = {};
                    this.insideH.width = insideH.sz; // Math.round(writer.common.tools.toPxValue((insideH.sz/20)+"pt"));
                    this.insideH.style = insideH.val;
                    this.insideH.color = insideH.color;
                }
                var insideV = borders.insideV;
                if (insideV && !this._isNullBorder(insideV.val)) {
                    this.insideV = {};
                    this.insideV.width = insideV.sz; // Math.round(writer.common.tools.toPxValue((insideV.sz/20)+"pt"));
                    this.insideV.style = insideV.val;
                    this.insideV.color = insideV.color;
                }
                // Save properties we do not implement
                var implementeds = ['left', 'right', 'top', 'bottom', 'insideH', 'insideV'];
                var notImplement = lang.clone(borders);
                array.forEach(implementeds, function(implemented) {
                    delete notImplement[implemented];
                });
                this.borderNotImpl = notImplement;
            }
        },
        borderToJson: function() {
            var borders = ['left', 'right', 'top', 'bottom', 'insideH', 'insideV'];
            var json = lang.clone(this.borderNotImpl || {});
            for (var i = 0; i < borders.length; i++) {
                if (borders[i] == "insideH" || borders[i] == "insideV") {
                    var name = borders[i];
                } else {
                    var name = borders[i] + "Border";
                }
                var border = {};
                if (!this[name]) {
                    continue;
                }
                border.sz = this[name].width;
                border.color = this[name].color;
                border.val = this._adapterBorder2OOXML(this[name].style);
                json[borders[i]] = border;
            }
            if (tools.isEmpty(json)) {
                return null;
            }
            return json;
        },
        initCellSpacing: function(cellSpacing) {
            this.cellSpacing = Math.round(tools.toPxValue(cellSpacing.w,
                cellSpacing.type));
        },
        initConditionStyle: function(style) {
            this.conditionStyle = style;
        },
        setConditionStyleByValue: function(style) {
            this.conditionStyle = style;
        },
        createEmptyConditionStyle: function() {
            return {};
        },
        mergeConditionStyle: function(style1, style2) {
            var ret = [];
            if (style1 && style1.lastRowFirstColumn == 1 || style2 && style2.lastRowFirstColumn == 1) {
                ret.push("lastRowFirstColumn");
            }
            if (style1 && style1.lastRowLastColumn == 1 || style2 && style2.lastRowLastColumn == 1) {
                ret.push("lastRowLastColumn");
            }
            if (style1 && style1.firstRowFirstColumn == 1 || style2 && style2.firstRowFirstColumn == 1) {
                ret.push("firstRowFirstColumn");
            }
            if (style1 && style1.firstRowLastColumn == 1 || style2 && style2.firstRowLastColumn == 1) {
                ret.push("firstRowLastColumn");
            }

            if (style1 && style1.firstRow == 1 || style2 && style2.firstRow == 1) {
                ret.push("firstRow");
            }
            if (style1 && style1.lastRow == 1 || style2 && style2.lastRow == 1) {
                ret.push("lastRow");
            }

            if (style1 && style1.firstColumn == 1 || style2 && style2.firstColumn == 1) {
                ret.push("firstColumn");
            }
            if (style1 && style1.lastColumn == 1 || style2 && style2.lastColumn == 1) {
                ret.push("lastColumn");
            }


            if (style1 && style1.evenVBand == 1 || style2 && style2.evenVBand == 1) {
                ret.push("evenVBand");
            }
            if (style1 && style1.oddVBand == 1 || style2 && style2.oddVBand == 1) {
                ret.push("oddVBand");
            }
            if (style1 && style1.evenHBand == 1 || style2 && style2.evenHBand == 1) {
                ret.push("evenHBand");
            }
            if (style1 && style1.oddHBand == 1 || style2 && style2.oddHBand == 1) {
                ret.push("oddHBand");
            }
            return ret;
        },
        getBorder: function() {
            if (!this._borderCache) {
                this._borderCache = {};
                //			var gridBorder = (this.tableProperty&&dojo.clone(this.tableProperty.getGridBorder()))||{};
                this._borderCache.left = this.leftBorder;
                this._borderCache.right = this.rightBorder;
                this._borderCache.top = this.topBorder;
                this._borderCache.bottom = this.bottomBorder;
                this._borderCache.h = this.insideH;
                this._borderCache.v = this.insideV;
            }
            return this._borderCache;
        },
        setConditionStyle: function(style, noOverride) {
            if (!noOverride) {
                this.conditionStyle = this.createEmptyConditionStyle();
            }
            if (style && this.getTableProperty().checkStyle(style)) {
                this.conditionStyle = this.conditionStyle || this.createEmptyConditionStyle();
                this.conditionStyle[style] = "1";
            }
        },
        removeConditionStyle: function(style) {
            if (this.conditionStyle && style) {
                this.conditionStyle[style] = "0";
            }
        },
        initColor: function(shd) {
            if (shd.fill && shd.fill != "auto") {
                this.color = this.color || {};
                this.color["background-color"] = shd.fill;
            }
            if (shd.color && shd.color != "auto") {
                this.color = this.color || {};
                this.color["color"] = shd.color;
            }
        },
        setColor: function(color, value) {
            if (color == "background-color") {
                this.color = this.color || {};
                this.color["background-color"] = value;
            } else if (color == "color") {
                this.color = this.color || {};
                this.color["color"] = value;
            }

            if (!value) {
                delete this.color[color];
            }
        },
        colorToJson: function() {
            var json = {};
            var isEmpty = true;
            if (this.color && this.color['background-color']) {
                json.fill = this.color['background-color'];
                isEmpty = false;
            }
            if (this.color && this.color['color']) {
                json.color = this.color['color'];
                isEmpty = false;
            }
            if (!isEmpty) {
                if (!json.color) {
                    json.color = 'auto';
                }
                if (!json.fill) {
                    json.fill = 'auto';
                }
            }
            if (tools.isEmpty(json)) {
                return null;
            }
            return json;
        },
        getCellSpacing: function() {
            return this.cellSpacing;
        },
        getColor: function() {
            return this.color;
        },
        getTableProperty: function() {
            console.warn("this function need to be implemented!");
        },
        getConditionStyle: function() {
            if (this.conditionStyle) {
                return this.conditionStyle;
            }
            return {};
        },
        _isNullBorder: function(style) {
            if (!style) {
                return true;
            }
            // style = style.toLowerCase();
            // if(style=="nil"){
            // 	return true;
            // }
            return false;
        },
        _adapterBorder2OOXML: function(style) {
            style = style.toLowerCase();
            switch (style) {
                case "solid":
                    return "single";
                default:
                    return style;
            }
        },
        _objMerge: function(obj1, obj2) {
            var o = lang.clone(obj2);
            for (var i in o) {
                if (!obj1[i]) {
                    obj1[i] = o[i];
                }
            }
            return obj1;
        }
    };

    return TableCommonProperty;
});
