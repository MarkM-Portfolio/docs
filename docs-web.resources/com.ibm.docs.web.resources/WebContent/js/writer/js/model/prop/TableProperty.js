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
    "writer/model/prop/TextProperty",
    "writer/model/prop/TableCommonProperty"
], function(array, lang, tools, Property, TextProperty, TableCommonProperty) {

    var TableProperty = function(json, table) {
        this.table = table;
        //	this.json = json;
        json.tblCellSpacing && this.initCellSpacing(json.tblCellSpacing);
        json.tblBorders && this.initBorder(json.tblBorders);
        json.shd && this.initColor(json.shd);
        json.tblLook && this.initConditionStyle(json.tblLook);
        this.tableStyle = null;
        if (json.align) {
            this.align = json.align;
        }
        //tmp code, the doc conversion has different value for alignment.
        if (json.jc) {
            this.align = json.jc.val;
        }

        if (json.bidiVisual) {
            if (!json.bidiVisual.val || json.bidiVisual.val == "1" || json.bidiVisual.val == "on" || json.bidiVisual.val == "true")
            	this.direction = "rtl";
            else if (json.bidiVisual.val == "0" || json.bidiVisual.val == "off" || json.bidiVisual.val == "false")
            	this.direction = "ltr";
            else
            	this.direction = json.bidiVisual.val;
        }
        if (json.tblInd) {
            this.ind = Math.round(tools.toPxValue(json.tblInd.w, json.tblInd.type));
        }
    };

    TableProperty.prototype = {
        type: Property.TABLE_PROPERTY,
        toJson: function() {
            var json = {};
            var borders = this.borderToJson();
            if (borders) {
                json.tblBorders = borders;
            }
            if (this.cellSpacing) {
                json.tblCellSpacing = {};
                json.tblCellSpacing.w = tools.PxToDXA(this.cellSpacing);
                json.tblCellSpacing.type = "dxa";
            }
            if (this.conditionStyle && !tools.isEmpty(this.conditionStyle)) {
                json.tblLook = lang.clone(this.conditionStyle);
            }
            var color = this.colorToJson(json);
            if (color) {
                json.shd = color;
            }
            if (this.align) {
                json.align = this.align;
            }
            var direction = this.getDirection(true);
            if (direction)
                json.bidiVisual = {
                    val: direction
                };

            if (this.ind) {
                json.tblInd = {};
                json.tblInd.w = tools.PxToDXA(this.ind);
                json.tblInd.type = "dxa";
            }
            if (tools.isEmpty(json)) {
                return null;
            }

            return json;
        },
        //	getBorder : function(conStyle) {
        //		var _borderCache = {};
        //		_borderCache.left = this.leftBorder;
        //		_borderCache.right = this.rightBorder;
        //		_borderCache.top = this.topBorder;
        //		_borderCache.bottom = this.bottomBorder;
        //		if (this.tableStyle) {
        //			this._objMerge(_borderCache, this.tableStyle.getBorder(conStyle));
        //		}
        //		return _borderCache;
        //	},
        //	getGridBorder : function(conStyle) {
        //
        //		var _gridBorder = {};
        //		_gridBorder.h = this.insideH;
        //		_gridBorder.v = this.insideV;
        //		if (this.tableStyle) {
        //			this._objMerge(_gridBorder, this.tableStyle.getGridBorder(conStyle));
        //		}
        //		return _gridBorder;
        //	},
        getCellSpacing: function(conStyle) {
            if (this.cellSpacing > 0) {
                return this.cellSpacing;
            }
            if (!this.tableStyle) {
                return 0;
            } else {
                return this.tableStyle.getCellSpacing(conStyle);
            }
            return 0;
        },
        getAlignment: function() {
            var align = this.align;
            if (!align && this.tableStyle) {
                var _tableProperty = this.tableStyle.getTableProperty();
                align = _tableProperty && _tableProperty.getAlignment();
            }
            return align;
        },
        getIndent: function() {
            var ind = this.ind;
            if (!ind && this.tableStyle) {
                var _tableProperty = this.tableStyle.getTableProperty();
                ind = _tableProperty && _tableProperty.getIndent();
            }
            return ind;
        },
        getDirection: function(isRawProperty) {
            var direction = this.direction;
            if (!direction && this.tableStyle) {
                var tableProperty = this.tableStyle.getTableProperty();
                direction = tableProperty && tableProperty.getDirection(isRawProperty);
            }
            if (!direction)
                direction = pe.lotusEditor.setting.getDefaultDirection();

            if (!isRawProperty && direction == "rl-tb")
                direction = "rtl";

            return direction;
        },
        getColor: function(conStyle) {
            var _colorCache = {};
            this._objMerge(_colorCache, this.color);
            if (this.tableStyle) {
                this._objMerge(_colorCache, this.tableStyle.getColor(conStyle));
            }
            return _colorCache;
        },
        getMergedTextProperty: function(conStyle) {
            if (this.tableStyle && conStyle && conStyle.length > 0) {
                var s = this.tableStyle.getConditionStyle(conStyle[0]);
                var textProperty = s && s.getMergedTextProperty();
                if (textProperty && textProperty != "empty") {
                    textProperty = textProperty.clone();
                } else {
                    textProperty = new TextProperty();
                }
                var color = s && s.getCellProperty() && s.getCellProperty().getColor();
                color && textProperty._mergeStyle(color, textProperty.style, textProperty);
                for (var i = 1; i < conStyle.length; i++) {
                    var s = this.tableStyle.getConditionStyle(conStyle[i]);
                    var t = s && s.getMergedTextProperty();
                    if (t && t != "empty") {
                        textProperty = textProperty.merge(t, true);
                    }
                    var color = s.getCellProperty() && s.getCellProperty().getColor();
                    color && textProperty._mergeStyle(color, textProperty.style, textProperty);
                }
                return textProperty;
            } else if (this.tableStyle) {
                return this.tableStyle.getMergedTextProperty();
            }
            return "empty";
        },
        // Performance reason, change function call to inline.
        _isValid: function(prop) {
            if (prop && prop != 'empty')
                return true;
            return false;
        },
        getParagraphProperty: function(conStyle) {

        },
        getCSSStyle: function(conStyle) {
            if (this.tableStyle && conStyle) {
                var str = " ";
                for (var i = 0; i < conStyle.length; i++) {
                    var style = this.tableStyle.getConditionStyle(conStyle[i]);
                    if (style && style.refId) {
                        str += style.refId + " ";
                    }
                }
                return str;
            } else if (this.tableStyle) {
                return this.tableStyle.refId || " ";
            }
            return "";
        },
        getTableProperty: function() {
            return null;
        },
        checkStyle: function(style) {
            if (this.tableStyle) {
                var ret = this.tableStyle.getConditionStyle(style);
                if (ret) {
                    return true;
                }
            }
            return false;
        },

        /* this function has three different return value.
         *  0: the tableStyle is the same, the refer element do not need to change anything;
         *  1: the tableStyle is not the same, while text property is the same, it doesnot need to relayout for the refer;
         *  2: the tableStyle is not the same, and the text property is not the same, the refer need to relayout.
         */
        compareConditionStyle: function(oldStyle, newStyle) {
            if (this.tableStyle) {
                var oldTbStyle = this.tableStyle.getConditionStyle(oldStyle);
                var newTbStyle = this.tableStyle.getConditionStyle(newStyle);
                if (oldTbStyle == newTbStyle) {
                    return 0;
                }
                if (!oldTbStyle || !newTbStyle) {
                    var style = oldTbStyle || newTbStyle;
                    if (!style) {
                        console.error("something error!");
                        return 0;
                    }
                    var textProp = style.checkStyle();
                    if (textProp.t["font-size"] || textProp.t["font-style"] || textProp.t["font-weight"] || textProp.t["font-family"] || textProp.p) {
                        return 2;
                    }
                    return 1;
                } else {
                    var oldTextProp = oldTbStyle.checkStyle();
                    var newTextProp = newTbStyle.checkStyle();
                    if (oldTextProp.t["font-size"] != newTextProp.t["font-size"] || oldTextProp.t["font-style"] != newTextProp.t["font-style"] || oldTextProp.t["font-weight"] != newTextProp.t["font-weight"] || oldTextProp.t["font-family"] != newTextProp.t["font-family"]) {
                        return 2;
                    }
                    if (oldTextProp.p || newTextProp.p) {
                        return 2;
                    }
                    return 1;
                }
            }
            return 0;
        }
    };

    tools.extend(TableProperty.prototype,
        new TableCommonProperty());
    return TableProperty;
});
