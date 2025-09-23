/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

define([
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/has",
    "dojo/on",
    "dojo/topic",
    "dojo/keys",
    "concord/util/browser",
    "writer/constants",
    "writer/core/Range",
    "writer/util/RangeTools",
    "writer/util/ViewTools",
    "writer/common/tools",
    "writer/track/trackChange"
], function(declare, dojoEvent, lang, aspect, domAttr, domStyle, has, on, topic, keys, browser, constants, Range, RangeTools, ViewTools, tools, trackChange) {

    var KeyImpl = declare("writer.controller.KeyImpl", null, {
        _editWin: null,
        _shell: null,
        _inputFrame: null,
        _inputNode: null,
        _editorFrame: null,
        _keyDownHandled: false,
        _bLog: false,
        _imeLen: 0,
        _imeRemainLen: 0,

        constructor: function(editWin, shell, inputFrame, editorFrame) {
            this._editWin = editWin;
            this._shell = shell;
            this._inputFrame = inputFrame;
            this._inputNode = inputFrame.contentWindow.document.body;
            this._isInputShown = false;
            this._editorFrame = editorFrame;
            this._mainNode = browser.getEditAreaDocument();
            this._connects = [];
            this._keyDownHandled = false;
        },

        register: function() {
            this._connects.push(on(this._inputNode, "keydown", lang.hitch(this, "_onKeyDown")));
            this._connects.push(on(this._inputNode, "keypress", lang.hitch(this, "_onKeyPress")));
            this._connects.push(on(this._inputNode, "keyup", lang.hitch(this, "_onKeyUp")));
            this._connects.push(on(this._inputNode, "textInput", lang.hitch(this, "_onTextInput")));
            this._connects.push(on(browser.getEditAreaWindow(), "scroll", lang.hitch(this, "_onScroll")));
            
            
 //           if(has("chrome") || has("mozilla"))
            	this._connects.push(on(this._inputNode, "paste", lang.hitch(this, "_onPaste")));

            // AMD FIXME BOB edge
            if (has("webkit") && !has("edge")) {
                this._connects.push(on(this._inputNode, "beforecopy", lang.hitch(this, "_onBeforeCopy")));
                this._connects.push(on(this._inputNode, "beforecut", lang.hitch(this, "_onBeforeCut")));
            }
            if (has("ie") || has("trident")) {
                // IE9 started to support addEventListener, and composition events can only been hooked by addEventListener
                this._inputNode.addEventListener("compositionstart", lang.hitch(this, "_onCompositionStart"), false);
                this._inputNode.addEventListener("compositionupdate", lang.hitch(this, "_onCompositionUpdate"), false);
                this._inputNode.addEventListener("compositionend", lang.hitch(this, "_onCompositionEnd"), false);
            } else {
                this._connects.push(on(this._inputNode, "compositionstart", lang.hitch(this, "_onCompositionStart")));
                this._connects.push(on(this._inputNode, "compositionupdate", lang.hitch(this, "_onCompositionUpdate")));
                this._connects.push(on(this._inputNode, "compositionend", lang.hitch(this, "_onCompositionEnd")));

                this._connects.push(on(this._inputNode, "focus", lang.hitch(this, "_onFocus")));
                this._connects.push(on(this._inputNode, "blur", lang.hitch(this, "_onBlur")));
            }
        },
        /**
         * onbeforecopy event
         * @param event
         */
        _onBeforeCopy: function(event) {
            //      console.log("before copy");
            pe.lotusEditor.execCommand("copy");
            return false;
        },
        /**
         * onbeforecut event
         * @param event
         */
        _onBeforeCut: function(event) {
            // console.log("before cut",event.target);
            pe.lotusEditor.execCommand("cut");
            return false;
        },

        destroy: function() {
            //      console.log("destory ...");
            for (var i = 0; i < this._connects.length; i++) {
                this._connects[i].remove();
            }
            this._connects = [];
        },

        _getInput: function() {
            return this._inputNode.textContent || this._inputNode.innerText || '';
        },

        _clearInput: function() {
            if (this._bLog)
                console.log("Clear input text: " + this._getInput());
        	
            if (!(has("safari") && (navigator.platform == "Win32" || navigator.platform == "Windows")))
            {
                this._imeRemainLen = 0;
                this._inputNode.textContent = this._inputNode.innerText = '';
            }
            if (this._clearInputTimer)
            {
                clearTimeout(this._clearInputTimer);
                delete this._clearInputTimer;
            }
            if (this._imePara && this._imePara.container)
            {
                this._imePara.container.forEach(function(r){
                    if (r.textProperty && r.textProperty.style && r.textProperty.style.ime)
                    {
                        delete r.textProperty.style.ime;
                        r.markDirty();
                    }
                });
            	this._imePara.markDirty();
            	this._imePara.parent.update(true);
            }
            this._imePara = null;
        },
        
        _insertUpdateText: function(text, imeUpdate, forTemp)
        {
            var style = {};
            if (this._emptyRunProps) {
                style = lang.clone(this._emptyRunProps);
            } else
                style = lang.clone(this.textStyle) || style;

            if (imeUpdate || forTemp) {

                style.ime = true;
            }
            
            var obj = {};
            obj.c = text;
            obj.fmt = [{
                l: text.length,
                rt: "rPr",
                style: style
            }];
            if (trackChange.isOn()) {
                obj.fmt[0].ch = [trackChange.createChange("ins")];
            }

            var para = this._shell.insertText(obj);
            if (forTemp)
                this._imePara = para; 
        },

        _insertText: function(text, dontClear, imeUpdate, imeTempEnd) {
            //console.log("_insertText:["+text+"] dontClear="+dontClear+" imeUpdate="+imeUpdate + " end=" + imeTempEnd);
            if (this._shell.getEditor().isReadOnly()) {
                return;
            }
            if (text && text.length > 0) {
                var udm = pe.lotusEditor.undoManager;
                var isIMEInput = udm.isIMEInput();
                
                if (imeTempEnd)
                {
                    this._insertUpdateText(text, true, true);
                }
                else if (!imeUpdate && !isIMEInput) {
                    this._shell.insertText(text, true);
                } else {
                    if (!this._emptyRunProps && isIMEInput && !has("webkit")) {
                        this._shell.insertText(text, true);
                    } else {
                       this._insertUpdateText(text, imeUpdate);
                    }
                }
            }
            if (!dontClear)
                this._clearInput();
        },

        /**
         * Transform the event to Editor inside event, which was not related with Browser. 
         * @param {Native Key Event}keyEvent
         * @returns Internal event
         */
        _getKeyCombination: function(keyEvent) {
            var keyCombination = keyEvent.keyCode;
            if (keyEvent.ctrlKey || keyEvent.metaKey)
                keyCombination += constants.KEYS.CTRL;

            if (keyEvent.shiftKey)
                keyCombination += constants.KEYS.SHIFT;

            if (keyEvent.altKey)
                keyCombination += constants.KEYS.ALT;

            return keyCombination;
        },

        /**
         * Return true if the key event has no CTRL/ALT key, otherwise return false.
         */
        _isNormalKey: function(keyEvent) {
            if (keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.altKey)
                return false;
            return true;
        },

        _onKeyDown: function(event) {
            //      console.log("_onKeyDown ");
            if (this._bLog)
                console.log(event.type + ": " + event.keyCode + ": " + event.charCode);
        	
            if (pe.lotusEditor.popupPanel)
                pe.lotusEditor.popupPanel.close && pe.lotusEditor.popupPanel.close();

            if (this._imeLen > 0) {
                return true;
            }
            var keyCombination = this._getKeyCombination(event);

            this._keyDownHandled = false;
            if (this._shell.getEditor()) {
                var commandName = this._shell.getEditor().getKeyStroke(keyCombination);
                if (commandName) {
                    var data = null;
                    if ("focus2Menubar" == commandName)
                        data = event;
                    this._keyDownHandled = this._shell.getEditor().execCommand(commandName, data);
                }
            }

            if (!this._keyDownHandled) {
                var editorShell = this._shell;
                switch (keyCombination) {
                    case (keys.ENTER + constants.KEYS.SHIFT):
                        // why can't this be treated as one kind of command as well, just like backspace
                        this._keyDownHandled = editorShell.insertText("\r");
                        break;
                    case constants.KEYS.CTRL:
                        break;
                    default:
                        break;
                }
                if (this._shell.getEditor().Paintingformat) {
                    delete this._shell.getEditor().Paintingformat;
                    topic.publish(constants.EVENT.SELECTION_CHANGE);
                }
            }

            if (this._keyDownHandled) {
                this._keyDownHandled = false;
                this._clearInput();
        		dojoEvent.stop(event);                
                return true;
            }
             return false;
        },

        _onKeyPress: function(event) {
            if (this._bLog)
                console.log(event.type + ": " + event.keyCode + ": " + event.charCode);
        },

        _onKeyUp: function(event) {
            if (this._bLog)
                console.log(event.type + ": " + event.keyCode + ": " + event.charCode);
        },

        _onTextInput: function(event) {
            if (this._bLog)
                console.log(event.type + ": " + event.data);
        },
        _onScroll: function(event) {
            if (!this._isInputShown || !this._inputFramepos)
                return;
            var scrollLeft = this._mainNode.documentElement.scrollLeft || this._mainNode.body.scrollLeft;
            var scrollTop = this._mainNode.documentElement.scrollTop || this._mainNode.body.scrollTop;
            var needRefresh = false, changeDelta = 1;
            var deltaH = scrollLeft - this._inputFramepos.scrollH;
            if (Math.abs(scrollLeft - this._inputFramepos.scrollH) > changeDelta) {
                this._inputFramepos.left = this._inputFramepos.left - deltaH;
                this._inputFramepos.scrollH = scrollLeft;
                needRefresh = true;
            }
            var deltaV = scrollTop - this._inputFramepos.scrollV
            if (Math.abs(deltaV) > changeDelta) {
                this._inputFramepos.top = this._inputFramepos.top - deltaV;
                this._inputFramepos.scrollV = scrollTop;
                needRefresh = true;
            }
            if (needRefresh) {
                domStyle.set(this._inputFrame, {
                    "position": "absolute",
                    "left": this._inputFramepos.left + "px",
                    "top": this._inputFramepos.top + "px"
                });
            }
        },
        refreshStartPos: function() {
            if (!this.reassign) {
                var selection = this._shell.getSelection();
                var range = selection.getRanges()[0];
                this._startParaPos = range.getStartParaPos();
                this._startParaPos.index = this.startIndex;
                if (this._startParaPos && this._startParaPos.obj && this._startParaPos.obj.getFullIndex)
                    this._startParaPos.index = this._startParaPos.obj.getFullIndex(this.startIndex);
                this.reassign = true;
            }
        },

        _recordStart: function() {
            // record where the paragraph position is
            var selection = this._shell.getSelection();
            var cursor = selection.getCursor();
            var cursorCtx = cursor.getContext();
            this._targetPara = cursorCtx._run.model.paragraph;
            var range = selection.getRanges()[0];
            this._startParaPos = range.getStartParaPos();
            this.startIndex = this._startParaPos.index;
            if (this._startParaPos && this._startParaPos.obj && this._startParaPos.obj.getVisibleIndex)
                this.startIndex = this._startParaPos.obj.getVisibleIndex(this._startParaPos.index);
            this.reassign = false;
            this._imeLen = 0;
            this._rootView = range.rootView;
            this.align = range.getEndParaPos().obj.directProperty.getAlign();

            // record current undo stack
            pe.lotusEditor.undoManager.imeBegin();
            
            if (this._clearInputTimer)
            {
                clearTimeout(this._clearInputTimer);
                delete this._clearInputTimer;
            }
        },
        
        _delayClearInput: function()
        {
            if (this._clearInputTimer)
            {
                clearTimeout(this._clearInputTimer);
            }
            this._clearInputTimer = setTimeout(lang.hitch(this, this._clearInput), 10);
        },

        _onCompositionStart: function(event) {
            if (this._bLog)
                console.log(event.type + ": " + event.data + ", focus window title:" + document.activeElement.title);

            var selection = this._shell.getSelection();
            var ranges = selection.getRanges();
            if (ranges && (ranges.length > 1 || (ranges.length == 1 && !ranges[0].isCollapsed()))) {
                // when there is selection, delete it before IME composition input to
                // put it in undo queue, so user can undo it
                pe.lotusEditor.execCommand("delete");
            }

            this._recordStart();
            this.leaveHandler = topic.subscribe(constants.EVENT.BEFORELEAVE, lang.hitch(this, this.removeUnconfirmContent));
            this.updateHandler = topic.subscribe(constants.EVENT.ENDUPDATEDOCMODEL, lang.hitch(this, this.updateInputNodePos));
        },

        _onCompositionUpdate: function(event) {
            if (this._bLog)
                console.log(event.type + ": " + event.data + ", focus window title:" + document.activeElement.title);

            var selection = this._shell.getSelection();
            if (event.data && event.data.length > 0) {
                if (this._imeLen > 0) {
                    // delete previously inserted
                    this.refreshStartPos();
                    var start = this._startParaPos;
                    var end = {};
                    end.obj = start.obj;
                    end.index = start.index + this._imeLen;
                    // selection.select(start, end);
                    selection.selectRangesBeforeUpdate([new Range(start, end, this._rootView)]);
                    this._shell.deleteText(true);
                }

                if (has("ff") && this._usePadding) {
                    domStyle.set(this._inputNode, "textIndent", this._inputIndent + "px");
                    domStyle.set(this._inputNode, "paddingLeft", "0px");
                    this._usePadding = false;
                }

                // Defect 48544, it will break input procedure. 
                //          if (dojo.isIE)
                //          {
                //              // in IE, for IME like Microsoft Pinyin, when you input a punctuation (e.g: ,) after chinese words,
                //              // the previous words will be inserted then start a new word spelling, however there are no other
                //              // event to tell you the truth, so have to compare what is in the input frame, and what's in the
                //              // event data, to distinguish
                //              var input = this._getInput();
                //              var i = input.lastIndexOf(event.data);
                //              if (i > 0)
                //              {
                //                  // recover to previous undo state before commit in IME
                //                  pe.lotusEditor.undoManager.imeEnd();
                //
                //                  var t = input.substr(0, i);
                //                  pe.lotusEditor.undoManager.imeCommit(true);
                //                  this._insertText(t, false);
                //                  pe.lotusEditor.undoManager.imeCommit(false);
                //                  this._recordStart();
                //                  this.showInputNode(false);
                //                  this.showInputNode(true);
                //              }
                //          }

                // insert updated
                this._insertText(event.data, true, true);
                this._imeLen = event.data.length;
            }
        },
        updateInputNodePos: function() {
            // update the input node position to fix 40903: character in IME editor shadowed when input in new pasted textbox in the new document
            if (this.align != "left") {
                this.refreshStartPos();
                var para = this._startParaPos.obj;
                var runModel = para.byIndex(this._startParaPos.index, true, true);
                if (!runModel) return;
                var scrollLeft = this._mainNode.documentElement.scrollLeft || this._mainNode.body.scrollLeft;
                var scrollTop = this._mainNode.documentElement.scrollTop || this._mainNode.body.scrollTop;
                var viewPosition = RangeTools.toViewPosition(runModel, this._startParaPos.index - runModel.start, this._rootView);
                var runPos = viewPosition.obj.getChildPosition(viewPosition.index, false, false, true);
                var pos = pe.lotusEditor.getShell().logicalToClient(runPos);
                this._inputFramepos = this._inputFramepos || {};
                this._inputFramepos.scrollH = scrollLeft;
                this._inputFramepos.left = pos.x - scrollLeft;
                this._inputFramepos.scrollV = scrollTop;
                this._inputFramepos.top = pos.y - scrollTop + this._editorFrame.offsetTop + 1;
                domStyle.set(this._inputFrame, {
                    "position": "absolute",
                    "left": this._inputFramepos.left + "px",
                    "top": this._inputFramepos.top + "px"
                });
                domStyle.set(this._inputNode, "textIndent", "0px");
                domStyle.set(this._inputNode, "paddingLeft", "0px");
            }
        },

        removeUnconfirmContent: function() {
            if (this._imeLen > 0) {
                // delete previously inserted
                this.refreshStartPos();
                var start = this._startParaPos;
                var end = {};
                end.obj = start.obj;
                end.index = start.index + this._imeLen;
                // selection.select(start, end);
                var selection = this._shell.getSelection();
                var range = new Range(start, end, this._rootView);
                selection.selectRangesBeforeUpdate([range]);
                this._shell.deleteText(true);
                this._imeLen = 0;
            }
        },
        
        _isIE: function() {
    		var ua = window.navigator.userAgent; //Check the userAgent property of the window.navigator object
    		var msie = ua.indexOf('MSIE '); // IE 10 or older
    		var trident = ua.indexOf('Trident/'); //IE 11
    		return (msie > 0 || trident > 0);
    	},

        _onCompositionEnd: function(event) {
            if (this._bLog)
                console.log(event.type + ": " + event.data + ", imelen:" + this._imeLen);
            var selection = this._shell.getSelection();
            if (this._imeLen > 0) {
                // delete previously inserted
                this.refreshStartPos();
                var start = this._startParaPos;
                var end = {};
                end.obj = start.obj;
                end.index = start.index + this._imeLen;
                // selection.select(start, end);
                selection.selectRangesBeforeUpdate([new Range(start, end, this._rootView)]);
                this._shell.deleteText(true);
                this._imeLen = 0;

            }

            // recover to previous undo state before commit in IME
            pe.lotusEditor.undoManager.imeEnd();
            if (this.updateHandler) {
                this.updateHandler.remove();
                this.updateHandler = null;
            }
            if (this.leaveHandler) {
                this.leaveHandler.remove();
                this.leaveHandler = null;
            }

            this.showInputNode(false);
            
            // Due to some bug in IE, when an composite text is entered for the second time or more the _onCompositionUpdate event 
            // is not fired due to which the current selection and the cursor is lost.
            // If we refocus on the editor again then we get back the cursor and the next selection for composite text works fine.
            // This block of code does the refocusing part after every selection.
            // Fix for issue Docs-9
            if (this._isIE()) {
            	window.document.body.blur();
            	setTimeout(function() {
            		window.document.body.focus();
            		var el = event.target;
            		if (el.focus) {
            			el.focus();
            		}
            	}, 10);
            }
        },

        getElementPos: function(node) {
            var x = 0;
            y = 0;
            var tmpNode = node;
            while (tmpNode) {
                x += tmpNode.offsetLeft;
                y += tmpNode.offsetTop;
                tmpNode = tmpNode.offsetParent;
            }
            return {
                x: x,
                y: y
            };
        },

        /**
         * Update the input Node position.
         * 
         */
        showInputNode: function(bShow, useOld) {
            var selection = this._shell.getSelection();
            var cursor = selection._cursor;

            if (this._isInputShown == bShow) {
                return;
            }
            
            this._isInputShown = bShow;

            if (bShow) {
                this._defaultStyle = this._defaultStyle || domAttr.get(this._inputFrame, "style");
                this._inShow = true;
                var scrollLeft = this._mainNode.documentElement.scrollLeft || this._mainNode.body.scrollLeft;
                var scrollTop = this._mainNode.documentElement.scrollTop || this._mainNode.body.scrollTop;
                var cursorX = Number(cursor.getX().replace('px', '')) - scrollLeft + this._editorFrame.offsetLeft;
                var cursorY = Number(cursor.getY().replace('px', '')) - scrollTop + this._editorFrame.offsetTop;

                var range = selection.getRanges()[0];
                var view = range.getStartView(); // Input quickly, the model changed but no view.
                if (!view || useOld)
                {
                    if (this._oldStyle)
                        domAttr.set(this._inputFrame, "style", this._oldStyle);

                    selection.blur();
                    cursor.lock();
                    return;
                }
                var vtools = ViewTools;
                var container = view && vtools.getCell(view.obj);
                var isCell = false;
                if (!container) {
                    container = vtools.getBody(view.obj);
                } else {
                    isCell = true;
                }
                if (!container) {
                    container = vtools.getHeader(view.obj);
                    if (!container) {
                        container = vtools.getFooter(view.obj);
                    }
                }

                // record the text properties if current position is an empty text run
                this._emptyRunProps = null;
                var start = range.getStartParaPos();
                var para = start.obj;
                var ret = para.getInsertionTarget(start.index);
                if (ret.target && !ret.target.length && ret.target.isTextRun && ret.target.isTextRun()) { // start to input in a empty run, then it may be deleted after calling shell.deleteText
                    // need to keep the text property styles, then set those styles back after calling shell.deleteText
                    this._emptyRunProps = ret.target.textProperty.toJson() || {};
                }

                if (!ret.follow) {
                    var cursorCtx = cursor.getContext();
                    this.textStyle = cursorCtx._run.getComputedStyle();
                } else {
                    this.textStyle = ret.follow.getComputedStyle();
                }

                this._inputNode.setAttribute("style", "margin:0px; background-color:transparent; word-wrap:break-word; overflow:auto;");
                this._inputNode.setAttribute("scroll", "no");
                for (var key in this.textStyle) {
                    if (key == "background-color")
                        continue;
                    this._inputNode.style[tools.cssStyleToDomStyle(key)] = this.textStyle[key];
                }

                //reset position
                var paddingLeft = 0;
                if (isCell) {
                    paddingLeft = container.getPaddingLeft();
                }
                var containerPos = this.getElementPos(container.domNode);
                var editorPos = this.getElementPos(this._editorFrame);
                var left = containerPos.x + editorPos.x + 1 + paddingLeft - scrollLeft;
                var top = cursorY + 1;
                this._inputFramepos = {left: left, top: top, scrollH: scrollLeft, scrollV: scrollTop};
                domStyle.set(this._inputFrame, {
                    "position": "absolute",
                    "left": left + "px",
                    "top": top + "px",
                    "width": container.getWidth() + "px",
                    "height": "400px"
                });
                var textIndent = cursorX - left + 1;
                this._inputIndent = textIndent;
                domStyle.set(this._inputNode, "textIndent", "0px");
                domStyle.set(this._inputNode, "paddingLeft", "0px");
                if (has("ff")) {
                    this._usePadding = true;
                    domStyle.set(this._inputNode, "paddingLeft", textIndent + "px");
                } else {
                    this._usePadding = false;
                    domStyle.set(this._inputNode, "textIndent", textIndent + "px");
                }
                if (this._bLog)
                    console.log("INPUT FRAME: left=" + left + " top=" + top + " textIndent=" + textIndent);
                selection.blur();
                cursor.lock();
            } else if (this._inShow) {
                this._inShow = false;
                this._oldStyle = domAttr.get(this._inputFrame, "style");
                domAttr.set(this._inputFrame, "style", this._defaultStyle);
                cursor.unlock();
                selection.focus();
            }
        },
        _onFocus: function(event) {
            this.justfocused = true;
        },
        _onBlur: function(event) {
            this.justfocused = false;
        },
        _onPaste: function(event) {
			if (this._bLog)
				console.log("On paste!");
//        	var clipData = window.clipboardData;

//        	console.log("On paste!" + clipData.items );
//        	console.log("On paste!" + clipData.types);
//        	console.log("On paste!" + clipData.getData("text/rtf"));
        	
        }
    });
    return KeyImpl;
});
