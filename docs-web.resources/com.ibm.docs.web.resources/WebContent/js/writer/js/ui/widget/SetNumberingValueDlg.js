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
    "dojo/i18n!writer/ui/widget/nls/SetNumberingValueDlg",
    "dijit/Dialog",
    "dijit/Tooltip",
    "dijit/form/NumberSpinner",
    "concord/widgets/concordDialog",
    "dijit/_base/wai"
], function(declare, domConstruct, domStyle, i18nSetNumberingValueDlg, Dialog, Tooltip, NumberSpinner, concordDialog, wai) {

    var SetNumberingValueDlg = declare("writer.ui.widget.SetNumberingValueDlg", concordDialog, {

        dialogId: null,
        _initVal: 1,
        _minVal: 1,
        _maxVal: 10000,
        _listContext: null,

        constructor: function(object, title, oklabel, visible, params, formParams) {
            this.setInitParamter(params.para, params.callback);

            this.inherited(arguments);
        },

        setDialogID: function() {
            this.dialogId = "C_d_SetNumberingValueDialog";
        },

        setInitParamter: function(para, callback) {
            this.para = para;
            this.list = para.list;
            var listType = this.list.getListType(para.getListLevel());
            if (listType == 0)
                this._minVal = 0;
            else if (listType == 1)
                this._maxVal = 780; //(26*30)

            this._listContext = this.list.getListContext(para);
            this._initVal = this._listContext && this._listContext.value;
            this.callback = callback;
        },

        createContent: function(contentDiv) {
            this.nls = i18nSetNumberingValueDlg;

            // Title
            //		var info =  dojo.create('span', { innerHTML: this.nls.newList } ,contentDiv);

            // Container table 
            var inputContainerTable = domConstruct.create('table', {}, contentDiv);
            var inputContainerTableBody = domConstruct.create('tbody', {}, inputContainerTable);
            wai.setWaiRole(inputContainerTable, 'presentation');

            // Set numbering value row
            var setValueRow = domConstruct.create('tr', {
                style: 'height: 25px;'
            }, inputContainerTableBody);
            var td = domConstruct.create('td', {
                style: "white-space:nowrap"
            }, setValueRow);
            var labelId = "concord_numbering_value";
            var label = domConstruct.create('label', {
                innerHTML: this.nls.newValue,
                'for': labelId
            }, td);
            var numberingValContainer = domConstruct.create('div', {
                style: "width:50px; margin: 5px;"
            }, domConstruct.create('td', {}, setValueRow));
            this.numberingInput = new NumberSpinner({
                value: this._initVal,
                smallDelta: 1,
                id: labelId,
                constraints: {
                    min: this._minVal,
                    max: this._maxVal,
                    places: 0
                },
                style: "width:50px; margin: 5px;"
            }, numberingValContainer);
            domStyle.set(this.numberingInput.upArrowNode, "display", "block");
            domStyle.set(this.numberingInput.downArrowNode, "display", "block");

            // Attach key event for numberingInput
            var that = this;
            this.numberingInput.watch("value", function(name, oldValue, value) {
                that.updatePreview(value);
            });

            // Override the validate function
            this.numberingInput.validate = function( /*Boolean*/ isFocused) {
                var isValid = this.isValid(isFocused);
                if (!isValid)
                    this.setValue(that._minVal);

                that.updatePreview(this.getValue());
            };

            // Preview row
            var previewRow = domConstruct.create('tr', {
                style: 'height: 25px;'
            }, inputContainerTableBody);
            var td = domConstruct.create('td', {
                style: "white-space:nowrap"
            }, previewRow);
            labelId = "concord_numbering_preview";
            var label = domConstruct.create('label', {
                innerHTML: this.nls.preview,
                'for': labelId
            }, td);

            var previewContainer = domConstruct.create('div', {
                style: "margin: 5px;"
            }, domConstruct.create('td', {}, previewRow));
            this.previewNode = domConstruct.create('div', {
                id: labelId
            }, previewContainer);
        },

        updatePreview: function(value) {
            var preview = value;
            if (this._listContext) {
                var lvl = this._listContext.level;
                var listValues = this._listContext.values;
                listValues[lvl] = value;
                preview = this.list.getListSymbolPreview(this._listContext, value);
            }
            // nan,undefined,null,""
            this.previewNode.innerHTML = preview;
        },

        onOk: function(editor) {
            var newVal = this.numberingInput.getValue();
            if (newVal != this._initVa && !isNaN(newVal)) {
                var newVals = [newVal];

                if (this._listContext && this._listContext.level > 0) {
                    newVals = this._listContext.values.splice(0, this._listContext.level);
                    newVals.push(newVal);
                }

                this.callback(newVals);
            }

            return true;
        }
    });

    return SetNumberingValueDlg;
});
