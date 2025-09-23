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
    "dojo/keys",
    "dojo/dom-class",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/i18n!writer/ui/widget/nls/CellBorder",
    "dojo/topic",
    "dijit/_Templated",
    "dijit/_Widget",
    "dijit/form/ToggleButton",
    "writer/ui/toolbar/Toolbar",
    "writer/util/CellBorderTools"
], function(keys, domClass, declare, domConstruct, lang, i18nCellBorder, topic, _Templated, _Widget, ToggleButton, Toolbar, CellBorderTools) {

    var CellBorderRange = declare('writer.ui.widget.CellBorderRange', [_Widget, _Templated], {

        templateString: "<div class='cellBorderRange docPalette' role='grid'><div dojoAttachPoint='line1' role='row'></div><div dojoAttachPoint='line2' role='row'></div></div>",
        _curIndex: 0,
        _curSelect: -1,
        constructor: function() {
            this.inherited(arguments);
            var constant = CellBorderTools.Constant.RANGE;
            this.types = [constant.CLEAR, constant.ALL, constant.INNER, constant.HORIZONTAL, constant.VERTICAL,
                constant.OUTER, constant.LEFT, constant.TOP, constant.RIGHT, constant.BOTTOM
            ];
        },

        onOpen: function() {
            this._curIndex = 0;
            if (this._curSelect > -1) {
                var curContainer = this._curSelect < 5 ? this.line1 : this.line2;
                domClass.remove(curContainer.childNodes[this._curSelect % 5], "selected");
            }
            this._curSelect = -1;
        },

        isSelected: function() {
            return this._curSelect > -1;
        },

        postCreate: function() {
            this.inherited(arguments);
            var titles = this.getTitles();
            for (var i = 0; i < 10; i++) {
                var container = i < 5 ? this.line1 : this.line2;
                var a = domConstruct.create("a", {
                    className: "dijitPaletteCell borderRangerCell",
                    tabIndex: "-1",
                    title: titles[i],
                    role: "gridCell"
                }, container);
                domConstruct.create("span", {
                    className: "dijitPaletteSpan " + this.types[i] + "Border",
                    tabIndex: "-1"
                }, a);
                this.connect(a, "onclick", lang.hitch(this, this._onClick, i));
            }
            var container = this._curIndex < 5 ? this.line1 : this.line2;
            var curNode = container.childNodes[this._curIndex % 5];
            curNode.childNodes[0].focus();
            this.connect(this, "onKeyDown", this._onKeyDown);
        },

        _onClick: function(index, evt) {
            evt.preventDefault(), evt.stopPropagation();
            this.selectNode(index);
        },

        _getValueAttr: function() {
            return this.types[this._curIndex];
        },

        _onKeyDown: function(evt) {
            if (evt.charCode == keys.LEFT_ARROW || evt.keyCode == keys.LEFT_ARROW) {
                evt.shiftKey ? this._moveNextNode() : this._movePreNode();
                return evt.preventDefault(), evt.stopPropagation();
            }
            if (evt.charCode == keys.RIGHT_ARROW || evt.keyCode == keys.RIGHT_ARROW) {
                evt.shiftKey ? this._movePreNode() : this._moveNextNode();
                return evt.preventDefault(), evt.stopPropagation();
            }
            if (evt.charCode == keys.UP_ARROW || evt.keyCode == keys.UP_ARROW) {
                evt.shiftKey ? this._moveDownNode() : this._moveUpNode();
                return evt.preventDefault(), evt.stopPropagation();
            }
            if (evt.charCode == keys.DOWN_ARROW || evt.keyCode == keys.DOWN_ARROW) {
                evt.shiftKey ? this._moveUpNode() : this._moveDownNode();
                return evt.preventDefault(), evt.stopPropagation();
            }
            if (evt.charCode == keys.ENTER || evt.keyCode == keys.ENTER ||
                evt.charCode == keys.SPACE || evt.keyCode == keys.SPACE) {
                this.selectNode(this._curIndex);
                return evt.preventDefault(), evt.stopPropagation();
            }
        },

        _moveNextNode: function() {
            this._moveFocus((this._curIndex + 1) % 10);
        },

        _movePreNode: function() {
            this._moveFocus((this._curIndex + 9) % 10);
        },

        _moveUpNode: function() {
            this._moveFocus((this._curIndex + 5) % 10);
        },

        _moveDownNode: function() {
            this._moveFocus((this._curIndex + 5) % 10);
        },

        _moveFocus: function(index) {
            var container = index < 5 ? this.line1 : this.line2;
            var newNode = container.childNodes[index % 5];
            newNode.childNodes[0].focus();
            this._curIndex = index;
        },

        selectNode: function(index) {
            if (this._curSelect > -1) {
                var curContainer = this._curSelect < 5 ? this.line1 : this.line2;
                domClass.remove(curContainer.childNodes[this._curSelect % 5], "selected");
            }
            var container = index < 5 ? this.line1 : this.line2;
            var newNode = container.childNodes[index % 5];
            domClass.add(newNode, "selected");
            this._curSelect = index;
            newNode.childNodes[0].focus();
            this._curIndex = index;
            this.onChange && this.onChange(this.types[this._curIndex]);
        },

        focus: function() {
            var container = this._curIndex < 5 ? this.line1 : this.line2;
            container.childNodes[this._curIndex % 5].childNodes[0].focus();
        },

        getTitles: function() {
            var nls = i18nCellBorder;
            return [
                nls.clearBorders,
                nls.allBorders,
                nls.innerBorders,
                nls.horizontalBorders,
                nls.verticalBorders,
                nls.outerBorders,
                nls.leftBorder,
                nls.topBorder,
                nls.rightBorder,
                nls.bottomBorder
            ];
        }
    });

    return CellBorderRange;
});
