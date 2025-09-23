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
    "dojo/dom-class",
    "dojo/dom-style",
    "dijit/_Templated",
    "dijit/_Widget",
    "dijit/form/DropDownButton",
    "writer/ui/widget/ColorPalette"
], function(declare, domClass, domStyle, _Templated, _Widget, DropDownButton, ColorPalette) {

    var CellBorderColor = declare("writer.ui.widget.CellBorderColor", DropDownButton, {

        baseClass: "dijitDropDownButton cellBorderColor",
        defaultColor: "#000000",
        _color: "#000000",

        postCreate: function() {
            this.inherited(arguments);
            var node = this.containerNode;
            var that = this;
            node.style.background = this.defaultColor;
            this._color = this.defaultColor;
            this.dropDown = new ColorPalette({
                id: "D_m_CellBorderColor",
                colorType: "CellBorderColor",
                onOpen: function(val) {
                    var colorPallete = this;
                    if ("autoColor" == that._color || that._color == "auto") {
                        colorPallete.setFocus(colorPallete.autoNode);
                    } else {
                        var color = that._color.toUpperCase();
                        colorPallete._currentColor = color;
                        var index = colorPallete.colorMap[that._color.toUpperCase()];
                        if (index !== undefined) {
                            colorPallete.setFocus(colorPallete._cells[index].node);
                        } else {
                            colorPallete.setFocus(colorPallete._cells[0].node);
                        }
                    }
                },
                onChange: function(val) {
                    if (val == 'autoColor') {
                        if (this._selectedCell >= 0) {
                            domClass.remove(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
                            this._selectedCell = -1;
                        }
                        node.style.background = that.defaultColor;
                        that._color = that.defaultColor;
                    } else {
                        this._antoColorNode && domStyle.set(this._antoColorNode, 'border', '');
                        node.style.background = val;
                        that._color = val;
                    }

                    that.onChange && that.onChange(that._color);
                    node.focus();
                }
            });
        },
        _getValueAttr: function() {
            return this._color.slice(1);
        }
    });
    return CellBorderColor;
});
