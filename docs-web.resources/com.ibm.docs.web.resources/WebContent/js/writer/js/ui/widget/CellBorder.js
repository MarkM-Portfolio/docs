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
    "dojo/_base/declare",
    "dojo/i18n!writer/ui/widget/nls/CellBorder",
    "dojo/text!writer/templates/CellBorder.html",
    "dojo/topic",
    "dijit/_Templated",
    "dijit/_Widget",
    "concord/util/BidiUtils",
    "writer/ui/widget/CellBorderColor",
    "writer/ui/widget/CellBorderRange",
    "writer/ui/widget/CellBorderType",
    "writer/ui/widget/CellBorderWidth"
], function(keys, declare, i18nCellBorder, template, topic, _Templated, _Widget, BidiUtils, CellBorderColor, CellBorderRange, CellBorderType, CellBorderWidth) {

    var CellBorder = declare('writer.ui.widget.CellBorder', [_Widget, _Templated], {

        widgetsInTemplate: true,
        templateString: template,
        _currentFocus: null,

        postMixInProperties: function() {
            this.inherited(arguments);
            this.nls = i18nCellBorder;
        },
        onOpen: function() {
            pe.cellBorderSet = false;
            this.rangePanel.onOpen();
            this._currentFocus = this.rangePanel;
        },
        postCreate: function() {
            this.inherited(arguments);
            this.connect(this.rangePanel, "onChange", this.changeBorder);
            this.connect(this.widthPicker, "onChange", this.changeBorder);
            this.connect(this.typePicker, "onChange", this.changeBorder);
            this.connect(this.colorBtn, "onChange", this.changeBorder);
            this.connect(this, "onKeyDown", this._onKeyDown);
            this.domNode.tabIndex = "-1";
        },

        focus: function() {
            if (!this._currentFocus)
                this._currentFocus = this.rangePanel;
            this._currentFocus.focus();
        },

        onClose: function() {
            pe.cellBorderPanelOpen = false;
            if (pe.cellBorderSet) {
                // focus to editor.
                setTimeout(function() {
                    pe.lotusEditor.focus();
                }, 100);
            }
            pe.cellBorderSet = false;
        },

        changeBorder: function() {
            var rangeType = this.rangePanel.get("value");
            var style = this.typePicker.get("value");
            this.widthPicker.setLimited(style == "double");
            if (!this.rangePanel.isSelected())
                return;
            var width = this.widthPicker.get("value");
            var color = this.colorBtn.get("value");
            var border = {
                width: width + "pt",
                style: style,
                color: color
            };
            setTimeout(function() {
                pe.cellBorderPanelOpen = true;
                pe.cellBorderSet = true;
                pe.lotusEditor.execCommand("setCellBorder", [border, rangeType]);
            }, 0);
        },

        _onKeyDown: function(evt) {
            if (evt.charCode == keys.TAB || evt.keyCode == keys.TAB) {
                evt.shiftKey ? this._movePre() : this._moveNext();
                evt.preventDefault(), evt.stopPropagation();
            }
            if (evt.chatCode == keys.ENTER || evt.keyCode == keys.ENTER) {
                evt.preventDefault(), evt.stopPropagation();
            }
        },

        _movePre: function() {
            if (this._currentFocus == this.rangePanel) {
                this._currentFocus = this.colorBtn;
            } else if (this._currentFocus == this.widthPicker) {
                this._currentFocus = this.rangePanel;
            } else if (this._currentFocus == this.typePicker) {
                this._currentFocus = this.widthPicker;
            } else if (this._currentFocus == this.colorBtn) {
                this._currentFocus = this.typePicker;
            }
            this.focus();
        },

        _moveNext: function() {
            if (this._currentFocus == this.rangePanel) {
                this._currentFocus = this.widthPicker;
            } else if (this._currentFocus == this.widthPicker) {
                this._currentFocus = this.typePicker;
            } else if (this._currentFocus == this.typePicker) {
                this._currentFocus = this.colorBtn;
            } else if (this._currentFocus == this.colorBtn) {
                this._currentFocus = this.rangePanel;
            }
            this.focus();
        }
    });

    return CellBorder;
});
