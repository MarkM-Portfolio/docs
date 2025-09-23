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
    "dojo/_base/event",
    "dojo/topic",
    "writer/controller/KeyImpl"
], function(declare, dojoEvent, topic, KeyImpl) {

    var KeyImplGecko = declare("writer.controller.KeyImplGecko", KeyImpl, {

        _onKeyPress: function(event) {
            this.inherited(arguments);

            if (event.charCode > 0 && (event.charCode > 127 || this._isNormalKey(event))) {
                var text = String.fromCharCode(event.charCode);
                this._insertText(text, false);
                dojoEvent.stop(event);
            }
        },

        _onCompositionStart: function(event) {
            this._imeLen = 0;
            this.inherited(arguments);
            this.showInputNode(true, this._getInput().length);
            this.justfocused = true;
        },

        _onCompositionEnd: function(event) {
            this.inherited(arguments);

            if (document.activeElement === this._inputFrame && !this.justfocused) {
                this._inputNode.blur();
                this._inputNode.focus();
                this.justfocused = true;
            }

            pe.lotusEditor.undoManager.imeCommit(true);
            this._insertText(event.data, true, false, true);
            this._delayClearInput();
            pe.lotusEditor.undoManager.imeCommit(false);
            this._imeRemainLen = this._getInput().length; 
            event.preventDefault(), event.stopPropagation();
        },

        _onPaste: function(event) {
 //       	var clipData = event.clipboardData;

//        	console.log("On paste!" + clipData.items );
 //       	console.log("On paste!" + clipData.types);
 //       	console.log("On paste!" + clipData.getData("text/rtf"));
        }        
    });

    return KeyImplGecko;
});
