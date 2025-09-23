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
    "writer/common/tools",
    "writer/model/prop/Property",
    "writer/model/prop/TableProperty",
    "writer/model/prop/TableCommonProperty"
], function(lang, tools, Property, TableProperty, TableCommonProperty) {

    var CellProperty = function(json, cell) {
        this.cell = cell;
        this.colSpan = 1;
        this.tableProperty = null;
        if (!json) {
            return;
        }
        //	this.json = json;
        json.tcBorders && this.initBorder(json.tcBorders);
        json.cnfStyle && this.initConditionStyle(json.cnfStyle);
        json.shd && this.initColor(json.shd);
        if (this.cell) {
            this.tableProperty = this.cell.table.tableProperty;
        }
        if (json.vMerge) {
            if (!json.vMerge.val) {
                this.megered = true;
            } else {
                this.megeredStart = true;
            }
        }
        if (json.gridSpan) {
            this.colSpan = parseInt(json.gridSpan.val);
        }
        if (json.vAlign) {
            this.align = json.vAlign.val;
        }
    };

    CellProperty.prototype = {
        type: Property.CELL_PROPERTY,
        toJson: function() {
            var json = {};
            var borders = this.borderToJson();
            if (borders) {
                json.tcBorders = borders;
            }
            if (this.conditionStyle && !tools.isEmpty(this.conditionStyle)) {
                json.cnfStyle = lang.clone(this.conditionStyle);
            }
            color = this.colorToJson(json);
            if (color) {
                json.shd = color;
            }
            if (this.colSpan > 1) {
                json.gridSpan = {};
                json.gridSpan.val = this.colSpan;
            }
            if (this.megered || this.megeredStart) {
                json.vMerge = {};
                this.megeredStart && (json.vMerge.val = "restart");
            }
            if (this.align) {
                json.vAlign = {};
                json.vAlign.val = this.align;
            }
            if (tools.isEmpty(json)) {
                return null;
            }
            return json;
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
        setBorder: function(newBorder) {
            this.leftBorder = newBorder.left;
            this.rightBorder = newBorder.right;
            this.topBorder = newBorder.top;
            this.bottomBorder = newBorder.bottom;
            this.insideH = newBorder.h;
            this.insideV = newBorder.v;
            delete this._borderCache;
        },
        getCellSpacing: function() {
            if (this.cellSpacing > 0) {
                return this.cellSpacing;
            }
            return 0;
        },
        getColor: function() {
            return this.color;
        },
        //	getGridBorder:function(){
        //		return {};
        //	},
        getTableProperty: function() {
            return this.tableProperty;
        },
        isMerged: function() {
            return this.megered;
        },
        isMergedStart: function() {
            return this.megeredStart;
        },
        getColSpan: function() {
            return this.colSpan;
        },
        setColSpan: function(colSpan) {
            this.colSpan = colSpan;
        },
        isAlignCenter: function() {
            this.align == "bottom";
        },
        isAlignBottom: function() {
            this.align == "center";
        },
        setAlignment: function(a) {
            this.align = a;
        },
        getAlignment: function() {
            var align = this.align;
            if (!align && this.tableProperty && this.tableProperty.tableStyle) {
                var _cellProperty = this.tableProperty.tableStyle.getCellProperty();
                align = _cellProperty && _cellProperty.getAlignment();
            }
            return align;
        },
        getParagraphProperty: function() {
            if (this.tableProperty && this.tableProperty.tableStyle) {
                return this.tableProperty.tableStyle._paraProperty;
            }
        }
    };
    tools.extend(CellProperty.prototype, new TableCommonProperty());
    return CellProperty;
});
