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
define(["dojo/on", "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/topic",
    "dojo/dom-class",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/keys",
    "dojo/dom-geometry",
    "dojo/request/registry",
    "dojo/request/script",
    "writer/constants",
    "writer/plugins/Plugin",
    "writer/msg/msgHelper",
    "writer/global"
], function(on, lang, declare, topic, domClass, domAttr, domConstruct, keys, domGeom, request, script, constants, Plugin, msgHelper, global) {
    var Mentions = declare("writer.plugins.Mentions", Plugin, {
        PREFIX: "mention",
        startPos: null,
        hintObj: null,
        style: null,
        commands: ["up", "down", "pageup", "pagedown", "enter"],
        isActivate: false,
        handlers: {},
        connects: [],
        init: function() {
        	/*
        	 * Jump over a mention when moving cursor via the left/right arrow key
        	 * 
        	 */
            topic.subscribe(constants.EVENT.LOAD_READY, lang.hitch(this, function() {
                var inputFrame = this.editor._shell._editWindow._iFrame;
                on(inputFrame.contentWindow.document.body, "keydown", lang.hitch(this, function(event) {
                    var key = event.keyCode;
                    switch (key) {
                        case keys.LEFT_ARROW:
                            this._moveCursor(true);
                            break;
                        case keys.RIGHT_ARROW:
                            this._moveCursor(false);
                            break;
                    }
                }));
            }));

            /*
             *   Modify the selection when a mention is partially selected  
             * 
             */
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, function() {
                var selection = this.editor.getSelection();
                var ranges = selection.getRanges();
                var range = ranges[0];
                if (range.isCollapsed())
                    return;
                var start = range.getStartParaPos();
                var end = range.getEndParaPos();
                var startHint = start.obj.byIndex(start.index);
                var endHint = end.obj.byIndex(end.index);
                var update = false;
                if (this._isMentions(startHint)) {
                    if (start.index > startHint.start) {
                        start.index = startHint.start + startHint.length;
                        update = true;
                    }
                }
                if (this._isMentions(endHint)) {
                    var endIndex = endHint.start + endHint.length;
                    if (end.index < endIndex) {
                        end.index = endHint.start;
                        update = true;
                    }
                }
                if (update) {
                    selection.select(start, end);
                }
            }));
            
            
            /*
             *   Call handler.customizeView to decorate the domNode of a mention
             * 
             */
            topic.subscribe(constants.EVENT.MENTIONSDOMCREATED, lang.hitch(this, function(domNode, arg) {
                var src = arg.linkObj.src.split(':'); //mention{activatorKeyComb}:{uid}
                var keyComb = src[0].substr(this.PREFIX.length);
                if (this.handlers[keyComb]) {
                    handler = this.handlers[keyComb];
                    var src = src[1];
                    var displayText = domNode.innerHTML;
                    var info = {
                        src: src,
                        displayText: displayText
                    };
                    handler.customizeView && handler.customizeView(domNode, info);
                }
            }));
        },


        /**
         * Register a handler to the Mentions plugin. Each registered handler has an activator key, and
         * will become active as the key is pressed
         * 
         * @param {Object}
         *           handler to register
         */
        registerHandler: function(handler) {
            if (handler && handler.activatorKey) {
                var keyComb = this._getKeyCombination(handler.activatorKey);
                if (this.editor.getKeyStroke(keyComb)) {
                    console.info("conflick activator keys");
                    return;
                }
                var activatorChar = handler.activatorChar;
                this.handlers[keyComb] = handler;
                var mPlugin = this;
                var mentions = {
                    exec: function() {
                    	var editor = pe.lotusEditor;
                        if (mPlugin.isActivate) {
                            if (activatorChar) {
                            	editor._shell.insertText(activatorChar);
                            }
                            return;
                        }
                        var isMentions = false;
                        var selection = editor.getSelection();
                        var ranges = selection.getRanges();
                        var range = ranges[0];
                        var startPos = range.getStartParaPos();
                        var startObj = startPos.obj;
                        if (startObj) {
                            if (startPos.index == 0) {
                                isMentions = true;
                            } else {
                                var preChar = startObj.text.charAt(startPos.index - 1);
                                if (preChar.match(/\s|\u00a0|\u200b/i))
                                    isMentions = true;
                            }
                        }
                        if (isMentions) {
                            var followRun = startObj.getInsertionTarget(startPos.index).follow;
                            if (followRun && followRun.textProperty) {
                                mPlugin.style = followRun.textProperty.toJson();
                            }
                            var style = {
                                color: "#0000ff"
                            };
                            if (mPlugin.style) {
                                style = lang.mixin({}, mPlugin.style, style);
                            }
                            activatorChar = activatorChar ? activatorChar : "\u200b";
                            var obj = {
                                "fmt": [{
                                    "style": style,
                                    "rt": "rPr",
                                    "s": startPos.index,
                                    "l": 1
                                }],
                                "s": startPos.index,
                                "c": activatorChar,
                                "l": 1
                            };
                            editor._shell.insertText(obj);

                            mPlugin.startPos = startPos;
                            mPlugin.hintObj = startObj.byIndex(startPos.index);
                            for (var i = 0; i < mPlugin.commands.length; i++) {
                            	editor.getCommand(mPlugin.commands[i]).disable();
                            }
                            mPlugin.isActivate = true;
                            var inputFrame = editor._shell._editWindow._iFrame;
                            mPlugin.connects.push(on(inputFrame.contentWindow.document.body, "keydown", function(event) {
                            	handler.handleKeyDown && handler.handleKeyDown(event);
                            }));
                            mPlugin.connects.push(on(inputFrame.contentWindow.document.body, "keyup", function(event) {
                            	handler.handleKeyDown && handler.handleKeyUp(event);
                            }));
                        } else {
                            if (activatorChar) {
                            	editor._shell.insertText(activatorChar);
                            }
                        }
                        return true;
                    }
                };
                this.editor.addCommand("mentions" + keyComb, mentions, keyComb);
                this.editor.reset();
            }
        },

        /**
         * Callback for completion. Insert a mention link.
         * @param {Object}
         * 			mention {
         *              activatorKey: handler.activatorKey, 
         *              activatorChar: handler.activatorChar, 
         *              src: mentionedItem.uid, 
         *              displayText: mentionedItem.displayText
         *           }
         */
        complete: function(mention) {
            this._removeTempInput();
            var keyComb = this._getKeyCombination(mention.activatorKey);
            var activatorChar = mention.activatorChar ? mention.activatorChar : "";
            var linkPlugin = this.editor.getPlugin("Link");
            linkPlugin.insertLinkImpl(this.PREFIX + keyComb + ":" + mention.src, null, activatorChar + mention.displayText, null);
            var selection = this.editor.getSelection();
            var range = selection.getRanges()[0];
            range.collapse();
        },

        /**
         * Callback for cancel. Insert typed text.
         * @param String
         * 			text The typed text
         */
        cancel: function(text) {
            this._removeTempInput();
            if (this.style) {
                var obj = {
                    "fmt": [{
                        "style": this.style,
                        "rt": "rPr",
                        "s": this.startPos.index,
                        "l": arg.length
                    }],
                    "s": this.startPos.index,
                    "c": text,
                    "l": arg.length
                };
                this.editor._shell.insertText(obj);
            } else {
                this.editor._shell.insertText(text);
            }
        },

        /**
         * Get the content from a mention 
         * 
         */
        getText: function() {
            var runModel = this.hintObj ? this.hintObj.paragraph.byIndex(this.hintObj.start + 1) : null;
            if (runModel)
                return runModel.getText();
            else
                return "";
        },

        /**
         * Get the position of a mention
         * 
         */
        getPosition: function() {
        	if (this.hintObj) {
        		var pos = domGeom.position(global.rangeTools.toViewPosition(this.hintObj.paragraph, this.hintObj.start + 1).obj.domNode);
        		var editWin =  this.editor.domDocument.defaultView; 
        		//add offset of #editorFrame
        		pos.x += editWin.frameElement.offsetLeft; 
            	pos.y += editWin.frameElement.offsetTop;
            	// add offset if docs editor is embedded
            	if (editWin != window.top) {
            		var framePos = domGeom.position(editWin.parent.frameElement);
            		pos.x += framePos.x; 
                	pos.y += framePos.y;
            	}
            	return pos;
        	} 
        	return null;
        },

        /**
         * Remove the input before complete/cancel a mention
         * 
         */
        _removeTempInput: function() {
            this.isActivate = false;
            for (var i = 0; i < this.connects.length; i++) {
                this.connects[i].remove();
            }
            for (var i = 0; i < this.commands.length; i++) {
                this.editor.getCommand(this.commands[i]).enable();
            }
            var selection = this.editor.getSelection();
            var range = selection.getRanges()[0];
            var hint = this.hintObj.paragraph.byIndex(this.hintObj.start + 1);
            if (hint) {
                range.setStart(hint.paragraph, hint.start - 1);
                range.setEnd(hint.paragraph, hint.start + hint.length);
                selection.selectRangesBeforeUpdate([range]);
            } else {
                var pos = range.getStartParaPos();
                range.setStart(pos.obj, pos.index - 1);
            }
            this.editor.getShell().deleteText();
        },

        /**
         * Jump over a mention when moving the cursor
         * @param boolean
         * 			isRtl True when moving the cursor from right to left
         */
        _moveCursor: function(isRtl) {
            var selection = this.editor.getSelection();
            var ranges = selection.getRanges();
            var range = ranges[0];
            var pos = range.getStartParaPos();
            var hint = pos.obj.byIndex(pos.index + (isRtl ? -1 : 0));
            if (this._isMentions(hint)) {
                if (isRtl) {
                    range.setStart(pos.obj, hint.start + 1);
                } else {
                    range.setEnd(pos.obj, hint.start + hint.length - 1);
                }
                range.collapse(isRtl);
                selection.selectRangesBeforeUpdate([range]);
            }
        },

        /**
         * Detect if the hint is a mention
         * @param Object
         * 			hint The text object
         */
        _isMentions: function(hint) {
            if (hint && hint.modelType && hint.modelType == constants.MODELTYPE.LINK &&
                hint.src.indexOf(this.PREFIX) == 0) {
                return true;
            }
            return false;
        },

        /**
         * Get key combination from a key stroke string
         * @param String
         * 			keyStr The string to represent key stroke, e.g. 'SHIFT+2' 
         * 
         */
        _getKeyCombination: function(keyStr) {
            if (!keyStr || keyStr.length < 1)
                return;
            var keyArray = keyStr.split("+");
            var len = keyArray.length;
            var keyCombination = 0;
            for (var i = 0; i < len; i++) {
                var key = keyArray[i].trim().toUpperCase();
                switch (key) {
                    case "CTRL":
                        keyCombination += constants.KEYS.CTRL;
                        break;
                    case "ALT":
                        keyCombination += constants.KEYS.ALT;
                        break;
                    case "SHIFT":
                        keyCombination += constants.KEYS.SHIFT;
                        break;
                    default:
                        if (keys[key]) {
                            keyCombination += keys[key];
                        } else if (key.length == 1) {
                            keyCombination += key.charCodeAt(0);
                        }
                        break;
                }
            }
            return keyCombination;
        }
    });
    return Mentions;
});