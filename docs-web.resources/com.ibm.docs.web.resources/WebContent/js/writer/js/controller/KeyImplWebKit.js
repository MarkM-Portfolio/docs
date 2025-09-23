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
    "writer/controller/KeyImpl"
], function(declare, has, topic, KeyImpl) {

    var KeyImplWebKit = declare("writer.controller.KeyImplWebKit", KeyImpl, {

        _onTextInput: function(event) {
            this._bLog && console.log("_onTextInput:" + event.data + ", focus window title:" + document.activeElement.title);
            this.inherited(arguments);
            if (!pe.lotusEditor.isPasting) {
                // in case compositionEnd is not triggerred
                if (this._imeLen > 0)
                    this._onCompositionEnd(event);

                this._insertText(event.data, false);
                pe.lotusEditor.undoManager.imeCommit(false);
                event.preventDefault(), event.stopPropagation();
            }

            if (has("safari") < 6) {
                this._editorFrame.focus();
                this._inputFrame.focus();
                this._inputNode.focus();
            }
            
            if (has("edge"))
            {
                this._editorFrame.focus();
                this._inputFrame.focus();
                this._inputNode.focus();
                
                var doc = this._inputNode.ownerDocument,
                        win = doc.parentWindow || doc.defaultView;
                var native_range = doc.createRange();
                native_range.selectNodeContents(this._inputNode);
                var sel = win.getSelection();
                sel.removeAllRanges();
                sel.addRange(native_range);
            }
        },

        _onCompositionStart: function(event) {
            this._imeLen = 0;
            this.inherited(arguments);
            this.showInputNode(true);
        },

        _onCompositionEnd: function(event) {
            this.inherited(arguments);
            // if there are input in the event, the following textInput will contain input content from IME		
            if (event.data && event.data.length > 0) {
                pe.lotusEditor.undoManager.imeCommit(true);
            } else {
                pe.lotusEditor.undoManager.imeCommit(false);
            }
        },

        _onPaste: function(event) {
        	this._bLog && console.log("webkit onPaste!" );        	
            var clipboardData = event.clipboardData;
            if(clipboardData && clipboardData.items) {
            	var cItems = clipboardData.items;
            	var self = this;
            	for(var i=0;i<cItems.length;i++) {
            		if(cItems[i].type.indexOf("image") !== -1) {
            			var blob = cItems[i].getAsFile();
            			var imgNode = new Image();
            			this._inputNode.appendChild(imgNode);
            			imgNode.setAttribute("onloading", true);
            			var reader = new FileReader();
            			reader.onload = function(e){
            				var state = e.target.readyState;
            				if(state == FileReader.DONE){
            					var inputN = pe.lotusEditor._shell._editWindow._inputNode;
            					inputN.innerHTML = "";
            					var imgNode = new Image();
                				imgNode.src = e.target.result;
                				self._bLog && console.log("loaded image: " + imgNode.src.substr(0, 40));
                				inputN.appendChild(imgNode);
            				}
            			};
            			reader.readAsDataURL(blob);
            		}
            	}
            }
        }
    });

    return KeyImplWebKit;
});
