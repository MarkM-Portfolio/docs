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
    "dojo/has",
    "dojo/topic",
    "writer/controller/KeyImpl",
    "writer/common/tools"
], function(declare, has, topic, KeyImpl, tools) {

    var KeyImplTrident = declare("writer.controller.KeyImplTrident", KeyImpl, {

        _onKeyPress: function(event) {
            this.inherited(arguments);

            if (event.charCode > 0 && (event.charCode > 127 || this._isNormalKey(event))) {
                var text = String.fromCharCode(event.charCode);
                this._insertText(text, false);
                event.preventDefault(), event.stopPropagation();
            }
        },

        _onKeyDown: function(event) {
            var handled = this.inherited(arguments);

            if (handled) return;
            var notShowInputNode = false;
            if (tools.isWin8() && ((has("ie") && has("ie") >= 10) || has("trident") || has("edge")) && event.shiftKey)
                notShowInputNode = true;
            if (event.keyCode == 229 && !notShowInputNode)
                this.showInputNode(true);
        },

        _onCompositionStart: function(event) {
            this._imeLen = 0;
            this.inherited(arguments);
            this.showInputNode(true, this._imeRemainLen);
        },

        _onCompositionEnd: function(event) {
            this.inherited(arguments);
            pe.lotusEditor.undoManager.imeCommit(true);
            var input = event.data;
            var locale = event.locale;
            var isKorea = (locale && locale.toLowerCase().indexOf("ko") == 0);
            if (isKorea) {
                if (has("ie") >= 10 || has("trident") || has("edge")) {
                	var startIdx = this._imeRemainLen - 1 - this._imeLen;
                	var inputTxt = this._getInput();
                	if(inputTxt.length > startIdx && startIdx >= 0) {
                		input = inputTxt.substr(startIdx, input.length);
                	}
                }
            } else {
                if (has("ie") >= 10 || has("trident") || has("edge"))
                    input = this._getInput();
            }

            if (isKorea)
            {
                this._insertText(input, true, false, true);
                this._delayClearInput();
                this._imeRemainLen = this._getInput().length;
            }
            else
            {
                this._insertText(input, false);
            }
           
            pe.lotusEditor.undoManager.imeCommit(false);
            event.preventDefault(), event.stopPropagation();
            
            if (has("edge")) {
                this._editorFrame.focus();
                this._inputFrame.focus();
                this._inputNode.focus();
            }
        }
    });

    return KeyImplTrident;
});
