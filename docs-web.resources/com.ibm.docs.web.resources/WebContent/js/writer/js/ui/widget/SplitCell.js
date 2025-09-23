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
    "dojo/dom-style",
    "dojo/i18n!concord/widgets/nls/SplitCellDlg",
    "dojo/_base/declare",
    "dojo/aspect",
    "dojo/_base/lang",
    "dojo/has",
    "dojo/dom-construct",
    "dojo/string",
    "dijit/Dialog",
    "dijit/Tooltip",
    "dijit/form/NumberSpinner",
    "concord/widgets/concordDialog",
    "dijit/_base/wai"
], function(domStyle, i18nSplitCellDlg, declare, aspect, lang, has, domConstruct, string, Dialog, Tooltip, NumberSpinner, concordDialog, wai) {

    var SplitCell = declare("writer.ui.widget.SplitCell", concordDialog, {

        _focueCell: null,
        onShow: function() {
            this.inherited(arguments);
            this._value = this.getValidValue();
            this.initErrorMessage();
            this.initConstraints();
            this._rowValueChange();
            this._colValueChange();
        },
        onHide: function() {
            this.inherited(arguments);
            this._focueCell = null;
        },
        onOk: function(editor) {
            if (this.rowNumberInput.isValid() && this.colNumberInput.isValid()) {
                editor.execCommand("splitCell", {
                    r: this.rowNumberInput.getValue(),
                    c: this.colNumberInput.getValue()
                });
                return true;
            } else {
                return false;
            }

        },
        onCancel: function(editor) {
            console.info("cancel");
            return true;
        },
        reset: function() {
            console.info("reset");
        },
        setDialogID: function() {
            this.dialogId = "concord_table_splitCell";
            this.toSplitRowNumId = 'concord_table_splitRowNum';
            this.toSplitColNumId = 'concord_table_splitColNum';
        },
        createContent: function(contentDiv) {
            this.nls = i18nSplitCellDlg;
            var inputContainerTable = domConstruct.create('table', {}, contentDiv);
            var inputContainerTableBody = domConstruct.create('tbody', {}, inputContainerTable);
            wai.setWaiRole(inputContainerTable, 'presentation');
            var splitColNumRow = domConstruct.create('tr', {
                style: 'height: 25px;'
            }, inputContainerTableBody);
            var td = domConstruct.create('td', {
                style: "white-space:nowrap"
            }, splitColNumRow);
            var label = domConstruct.create('label', {
                'for': this.toSplitColNumId
            }, td);
            if (has("ie") && has("ie") < 9) {
                label.innerText = this.nls.splitColNum;
            } else {
                label.textContent = this.nls.splitColNum;
            }
            //		  var html = '<td style="white-space:nowrap;"><label for="'+this.toSplitColNumId+'">'+this.nls.splitColNum+'</label></td>';
            //		  splitColNumRow.innerHTML = html;
            var colNumInputContainer = domConstruct.create('div', {
                style: "width:60px; margin: 5px;"
            }, domConstruct.create('td', {}, splitColNumRow));
            this.colNumberInput = new NumberSpinner({
                value: 1,
                smallDelta: 1,
                constraints: {
                    min: 1,
                    max: 5,
                    places: 0
                }, //{ min:1, max:10, places:0 },
                id: this.toSplitColNumId,
                style: "width:60px"
            }, colNumInputContainer);
            domStyle.set(this.colNumberInput.upArrowNode, "display", "block");
            domStyle.set(this.colNumberInput.downArrowNode, "display", "block");
            var rowNumTR = domConstruct.create('tr', {
                style: 'height: 25px;'
            }, inputContainerTableBody);
            var td = domConstruct.create('td', {
                style: "white-space:nowrap"
            }, rowNumTR);
            var label = domConstruct.create('label', {
                'for': this.toSplitRowNumId
            }, td);
            if (has("ie") && has("ie") < 9) {
                label.innerText = this.nls.splitRowNum;
            } else {
                label.textContent = this.nls.splitRowNum;
            }
            //		  rowNumTR.innerHTML =  '<td style="white-space:nowrap;"><label for="'+this.toSplitRowNumId+'">'+this.nls.splitRowNum+'</label></td>';
            var rowNumInputContainer = domConstruct.create('div', {
                style: "width:60px; margin: 5px;"
            }, domConstruct.create('td', {}, rowNumTR));
            this.rowNumberInput = new NumberSpinner({
                value: 1,
                smallDelta: 1,
                constraints: {
                    min: 1,
                    max: 5,
                    places: 0
                },
                id: this.toSplitRowNumId,
                style: "width:60px"
            }, rowNumInputContainer);
            domStyle.set(this.rowNumberInput.upArrowNode, "display", "block");
            domStyle.set(this.rowNumberInput.downArrowNode, "display", "block");
            this.rowNumberInput.adjust = this._adjust;
            this.rowNumberInput.rangeCheck = this.rangeCheck;
            this.rowNumberInput._isDefinitelyOutOfRange = this._isDefinitelyOutOfRange;
            this.colNumberInput.adjust = this._adjust;
            this.colNumberInput.rangeCheck = this.rangeCheck;
            this.colNumberInput._isDefinitelyOutOfRange = this._isDefinitelyOutOfRange;
            //		  window._numInput = this.rowNumberInput;

        },
        setFocuCell: function(cell) {
            this._focueCell = cell;
        },
        getValidValue: function() {
            var value = {};
            value.r = [];
            value.c = [];
            var cellRowSpan = this._focueCell.getRowSpan();
            var cellColSpan = this._focueCell.getColSpan();
            if (cellRowSpan > 1) {
                for (var i = 1; i <= cellRowSpan; i++) {
                    if (cellRowSpan % i == 0) {
                        value.r.push(i);
                    }
                }
            } else {
                for (var i = 1; i <= 5; i++) {
                    value.r.push(i);
                }
            }
            if (cellColSpan > 1) {
                for (var i = 1; i <= cellColSpan; i++) {
                    if (cellColSpan % i == 0) {
                        value.c.push(i);
                    }
                }
            } else {
                for (var i = 1; i <= 5; i++) {
                    value.c.push(i);
                }
            }
            return value;
        },
        initErrorMessage: function() {
            var rowValue = this._value.r;
            var rowStr = string.substitute(this.nls.inputError, {
                0: rowValue.join(",")
            });
            this.rowNumberInput.invalidMessage = rowStr;
            this.rowNumberInput.rangeMessage = rowStr;
            this.rowNumberInput.promptMessage = rowStr;
            var colValue = this._value.c;
            var colStr = string.substitute(this.nls.inputError, {
                0: colValue.join(",")
            });
            this.colNumberInput.invalidMessage = colStr;
            this.colNumberInput.rangeMessage = colStr;
            this.colNumberInput.promptMessage = rowStr;
        },
        initConstraints: function() {
            var rowValue = this._value.r;
            this.rowNumberInput.constraints = {
                min: rowValue[0],
                max: rowValue[rowValue.length - 1],
                places: 0
            };
            this.rowNumberInput._validValue = rowValue;
            this.rowNumberInput.setValue(rowValue[0]);
            var colValue = this._value.c;
            this.colNumberInput.constraints = {
                min: colValue[0],
                max: colValue[colValue.length - 1],
                places: 0
            };
            this.colNumberInput._validValue = colValue;
            this.colNumberInput.setValue(colValue[0]);
        },
        _valueChangeLock: false,
        _rowValueChange: function() {
            var that = this;
            var defaultRowValue = this._value.r[0];
            aspect.after(this.rowNumberInput, "_setValueAttr", lang.hitch(this.rowNumberInput, function() {
                valueChange(this.getValue());
            }), true);
            this.rowNumberInput.textbox.oninput = function() {
                if (that.rowNumberInput.isValid()) {
                    valueChange(that.rowNumberInput.getValue());
                } else {
                    console.info("inValid value");
                }

            };
            var valueChange = function(value) {
                if (that._valueChangeLock) {
                    return;
                } else {
                    that._valueChangeLock = true;
                }
                var cellRowSpan = that._focueCell.getRowSpan();
                var cellColSpan = that._focueCell.getColSpan();
                if ((cellColSpan == 1 || cellRowSpan == 1) && value != defaultRowValue) {
                    that.colNumberInput.setValue(1);
                }
                that._valueChangeLock = false;
            };
        },
        _colValueChange: function() {
            var that = this;
            var defaultColValue = this._value.c[0];
            aspect.after(this.colNumberInput, "_setValueAttr", lang.hitch(this.colNumberInput, function() {
                valueChange(this.getValue());
            }), true);
            this.colNumberInput.textbox.oninput = function() {
                if (that.colNumberInput.isValid()) {
                    valueChange(that.colNumberInput.getValue());
                } else {
                    console.info("inValid value");
                }

            };
            var valueChange = function(value) {
                if (that._valueChangeLock) {
                    return;
                } else {
                    that._valueChangeLock = true;
                }
                var cellRowSpan = that._focueCell.getRowSpan();
                var cellColSpan = that._focueCell.getColSpan();
                if ((cellRowSpan == 1 || cellColSpan == 1) && value != defaultColValue) {
                    that.rowNumberInput.setValue(1);
                }
                that._valueChangeLock = false;
            };
        },
        _adjust: function(value, step) {
            var index = this._validValue.indexOf(value) + step;
            if (index >= this._validValue.length) {
                return this._validValue[this._validValue.length - 1];
            }
            if (index <= 0) {
                return this._validValue[0];
            }
            return this._validValue[index];
        },
        rangeCheck: function(value) {
            if (this._validValue.indexOf(value) < 0) {
                return false;
            }
            return true;
        },
        _isDefinitelyOutOfRange: function(value) {
            var val = this.get('value');
            if (this._validValue.indexOf(value) < 0) {
                return true;
            }
            return false;
        }
    });
    return SplitCell;
});
