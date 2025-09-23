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
    "dojo/query",
    "dojo/mouse",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/aspect",
    "dojo/dom",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/has",
    "dojo/on",
    "dojo/topic",
    "concord/util/acf",
    "concord/util/browser",
    "writer/constants",
    "writer/controller/KeyHandler",
    "writer/core/Event",
    "writer/ui/widget/CoEditIndicator",
    "writer/util/ModelTools",
    "writer/common/tools",
    "writer/util/SectionTools",
    "writer/global",
    "dijit/_base/wai",
    "dojo/i18n!writer/nls/lang"
], function(query, mouse, array, declare, lang, windowModule, aspect, dom, domAttr, domClass, domConstruct, has, on, topic, acf, browser, constants, KeyHandler, Event, CoEditIndicator, ModelTools, tools, SectionTools, g, wai, lang18n) {

    /**
     * This object will capture all Key, Mouse, Focus, Context menu and Window resize events.
     * Then dispatch these events to Shell and Command.
     */
    var EditWindow = declare("writer.controller.EditWindow", null, {
        _shell: null,
        _inputNode: null,
        _iFrame: null,

        _editorFrame: null, // Just use to calculate the editor frame's offset.

        _mainNode: null,
        _connects: null,
        _hasFocus: false,
        _keyDownHandled: false, // If the key Down event has been handled, the NEXT key press event should not be handled.

        _keyHandler: null,

        _mobileDoubleTapTime: null,
        _mobileLongTap: null,
        _mobileClientX: null,
        _mobileClientY: null,

        constructor: function(createParam) {
            this._shell = createParam.shell;

            this._editorFrame = dom.byId("editorFrame");
            this._mainNode = browser.getEditAreaDocument().body;
            
            if (pe.scene.isNote())
    			domClass.add(this._mainNode, "note");

            this._connects = [];
            this._hasFocus = false;
            this._keyDownHandled = false;

            var that = this;
            window.__onLoad = function() {
                that._onLoad();
                delete window.__onLoad;
            };

            this._iFrame = window.document.createElement("iframe");
            domAttr.set(this._iFrame, {
                "class": "inputWrapper",
                "onload": "__onLoad()",
                "title": "input wrapper",
                "style": "position: absolute; border: 0 none; outline-style: none; z-index: 100;" +
                    " overflow: hidden; width: 1000px; height: 50px; right: 10000px; top: -10000px;"
            });

            if (pe.lotusEditor.isReadOnly())
                this._iFrame.tabIndex = 100;

            domConstruct.place(this._iFrame, windowModule.body());

            if (has("chrome"))
                topic.subscribe(constants.EVENT.FIRSTTIME_RENDERED, lang.hitch(this, this._chromeFocus));
        },

        _chromeFocus: function() {
            var checkTime = 10000;
            var startTime = new Date();
            var that = this;
            var interval = setInterval(function() {
                if (document.activeElement && document.activeElement.id == "stiframeproxy") // Sametime widget
                {
                    clearInterval(interval);
                    that.grabFocusImp(true);
                    return;
                }
                var curTime = new Date();
                if (curTime - startTime > checkTime)
                    clearInterval(interval);
            }, 1000);
        },

        _onLoad: function() {
            //      console.log("========= iframe loaded");
            this._inputNode = this._iFrame.contentWindow.document.body;
            this._inputNode.contentEditable = true;
            if ((browser.isMobile() || browser.isMobileBrowser()) && pe.lotusEditor.isReadOnly())
            {
            	this._inputNode.contentEditable = false;
            }

            // Key event and text input 
            this._keyHandler = new KeyHandler(this, this._shell, this._iFrame, this._editorFrame);
            this._keyHandler.register();
            if (browser.isIOSBrowser()) {
                this._connects.push(on(browser.getEditAreaDocument(), "touchstart", lang.hitch(this, "_onTouchStart")));
                this._connects.push(on(browser.getEditAreaDocument(), "touchmove", lang.hitch(this, "_onTouchMove")));    
                this._connects.push(on(browser.getEditAreaDocument(), "touchend", lang.hitch(this, "_onTouchEnd")));
                this._connects.push(on(browser.getEditAreaDocument(), "resize", lang.hitch(this, "_onResizeIframe")));                 
            }

            // Mouse event
            //this._connects.push(on(this._mainNode, "mousedown", lang.hitch(this, this._onMouseDown, false)));
            this._connects.push(on(browser.getEditAreaDocument(), "mousedown", lang.hitch(this, "_onMouseDown", false)));
            if (tools.isWin8() && (has("ie") && has("ie") >= 10 ||  has("trident") ))
                this._connects.push(on(this._mainNode, "dblclick", lang.hitch(this, this._onMouseDown, true)));
            this._connects.push(on(this._mainNode, "mousemove", lang.hitch(this, "_onMouseMove")));
            this._connects.push(on(this._mainNode, "mouseleave", lang.hitch(this, "_onMouseLeave")));
            this._connects.push(on(this._editorFrame, "mouseout", lang.hitch(this, "_onFrameMouseLeave")));
            //      this._connects.push( dojo.connect(this._mainNode, "onmouseup", this, "_onMouseUp") );
            this._connects.push(on(browser.getEditAreaDocument(), "mouseup", lang.hitch(this, "_onMouseUp")));
            // Scroll event
            this._connects.push(on(browser.getEditAreaWindow(), "scroll", lang.hitch(this, '_onScroll')));
            if (has("ff"))
                this._connects.push(on(this._mainNode, "DOMMouseScroll", lang.hitch(this, "_onMouseWheel")));
            else
                this._connects.push(on(this._mainNode, "mousewheel", lang.hitch(this, '_onMouseWheel')));

            //      this._connects.push( dojo.connect(this._mainNode, 'onmouseover', this, '_onMouseOver') );
            //      this._connects.push( dojo.connect(this._mainNode, 'onmouseout', this, '_onMouseOut') );

            // Focus event
            this._connects.push(on(this._inputNode, "focus", lang.hitch(this, "grabFocus")));
            this._connects.push(on(this._inputNode, "blur", lang.hitch(this, "loseFocus")));
            
            // drag drop events
            var doc = browser.getEditAreaDocument();
            this._connects.push(on(doc, "dragover", lang.hitch(this, "onDragOver")));
        	
        	if (has("ie")) {
        		this._connects.push(on(doc, "dragleave", lang.hitch(this, "onDragLeave")));
        		this._connects.push(on(doc, "dragenter", lang.hitch(this, "onDragEnter")));
        		this._connects.push(on(this._mainNode, "drop", lang.hitch(this, "onDragDrop")));
        	} else {
        		this._connects.push(on(this._mainNode, "dragleave", lang.hitch(this, "onDragLeave")));
        		this._connects.push(on(this._mainNode, "dragenter", lang.hitch(this, "onDragEnter")));
        		this._connects.push(on(this._mainNode, "drop", lang.hitch(this, "onDragDrop")));
        	}

            // TODO Register DOMFocusOut/DOMFocusIn and onfocusout event for document.
            // To solve the click sidebar/menu/toolbar the cursor blink problem.

            // Context menu
            this._connects.push(on(this._mainNode, "contextmenu", lang.hitch(this, '_onContextMenu')));

            // Window resize
            this._connects.push(on(window, "resize", lang.hitch(this, '_onResize')));

            var focusNode = this._inputNode;
            var editWin = this;
            setTimeout(function() {
                focusNode.contentEditable = true;
                if ((browser.isMobile() || browser.isMobileBrowser()) && pe.lotusEditor.isReadOnly())
                {
            	    focusNode.contentEditable = false;
                }
                focusNode.setAttribute("spellcheck", "false");
                focusNode.setAttribute("aria-hidden", "true");
                focusNode.setAttribute("role", "region"); // region  textbox
                if (DOC_SCENE.focusWindow) {
                    focusNode.focus();
                }

                if (browser.isMobile()) {
                    var docContainer = pe.lotusEditor.document && pe.lotusEditor.document.container;
                    if (docContainer && (docContainer.len == 0 || (docContainer.len == 1 &&
                            docContainer.first.content.modelType == constants.MODELTYPE.PARAGRAPH && docContainer.first.content.isEmpty()))) {
                        // empty document.
                        concord.util.mobileUtil.jsObjCBridge.postEvents([{
                            "name": "emptyDoc",
                            "params": []
                        }]);
                    }
                }
                var sel = editWin.getEditor().getSelection();
                if (!sel)
                {
                    editWin._moveFocusInConn = topic.subscribe(constants.EVENT.FIRSTTIME_RENDERED, function(){
                        editWin.moveFocusIn();
                        editWin._moveFocusInConn.remove();
                        if(pe.scene.isNote())
                        	setTimeout(lang.hitch(pe.scene, pe.scene.setFocus), 0);
                    });
                }
                else
                    editWin.moveFocusIn();
                if (browser.isIOSBrowser()) {
                    editWin._onResizeIframe();
                }
            }, 0);
        },
        _onResizeIframe: function(event) {
            var editorFrame = dojo.byId("editorFrame");
            if (editorFrame) {
            	var height = editorFrame.style.height;
            	var oldHeight = height.substring(0, height.length-2);
            	var newHeight = editorFrame.offsetHeight;
            	if (newHeight !== oldHeight) {
                	dojo.style(editorFrame, "height", newHeight + "px");
            }
            }
            
        },
        _onTouchStart: function(event) {
            var touches = event.touches;
            this._mobileTouchMoved = false;
            if (touches.length == 1) { 
                this.grabFocusImp(true);
                this._mobileClientX = event.clientX || event.changedTouches[0].clientX;
                this._mobileClientY = event.clientY || event.changedTouches[0].clientY;
                if (!this._mobileLongTap)
                    this._mobileLongTap = new Date().getTime();
            }
        },
        _onTouchMove: function(event) {
            this._mobileLongTap = null;
            this._mobileDoubleTapTime = null;
            this._onScroll(event);
        },
        _onTouchEnd: function(event) {
            if (this._mobileLongTap) {
                var longTime = new Date().getTime() - this._mobileLongTap ;
                event.clientX = this._mobileClientX;
                event.clientY = this._mobileClientY;
                if (longTime > 500) {
                    event.clickCnt = 1; //add new key for failed to set detail key
                    event.button = 2; // make it as right click   
                    if (pe.lotusEditor.isReadOnly()) {
                        event.button = 0; // make it as left click   
                    }
                    this._onMouseDown(false, event); 
                    this._onMouseUp(event);
                    if (!pe.lotusEditor.isReadOnly())
                        this._onContextMenu(event);
                } else {
                    var tapOffset = new Date().getTime() - this._mobileDoubleTapTime;
                    if (!this._mobileDoubleTapTime || tapOffset >= 300) {
                        this._mobileDoubleTapTime = new Date().getTime();
                        event.clickCnt = 1; //add new key for failed to set detail key
                        event.button = 0; // make it as left click       
                        this._onMouseDown(false, event);
                        this._onMouseUp(event);
                        var that = this;
                        clearTimeout(this.mobileTimer);
                        this.mobileTimer = setTimeout(function(){                                       
                            that._mobileDoubleTapTime = null;                       
                        },300);                  
                    } else if (tapOffset < 300) {
                        clearTimeout(this.mobileTimer);
                        this.mobileTimer = null;
                        event.clickCnt = 2; //add new key for failed to set detail key
                        event.button = 0; // make it as left click
                        this._onMouseDown(true, event);
                        this._onMouseUp(event);
                        this._mobileDoubleTapTime = null;
                    }
                }
                this._mobileLongTap = null;
            } 
        },
        moveFocusIn: function()
        {
            var sel = this.getEditor().getSelection(); 
            sel && sel.moveTo(window.layoutEngine.rootView.getFirstViewForCursor(), 0);
            if (DOC_SCENE.focusWindow && pe.lotusEditor.isReadOnly()) {
                this.grabFocus();
                sel && sel.focus();
            }
        },
        
        stopEvent: function(event) {
            event.preventDefault(), event.stopPropagation();
        },
        
        onDragOver: function(event)
        {
            this.stopEvent(event);
        },
        
        onDragLeave: function(event)
        {
            this.stopEvent(event);
        },
        
        onDragEnter: function(event)
        {
            this.stopEvent(event);
        },
        
        onDragDrop: function(e)
        {
            var fileList = e.dataTransfer ? e.dataTransfer.files : null; 
            this.stopEvent(e);
            if (!fileList || fileList.length == 0) { 
                return false; 
            }
            var plugin = pe.lotusEditor.getPlugin("InsertImage");
            if (plugin && pe.lotusEditor.getCommand('insertImage').getState() == constants.CMDSTATE.TRISTATE_OFF)
            {
                plugin.uploadImageWithFiles(fileList);
            }
            else
            {
               pe.scene.showWarningMessage(lang18n.INSERT_IMAGE_NOT_PROPER_PLACE, 7500);
            }
        },

        announce: function(message) {
            message = acf.escapeXml(message);
            if (!this.screenReaderNode1) {
                this.screenReaderNode1 = domConstruct.create('div', null, this._mainNode);
                this.screenReaderNode1.style.zIndex = -20000;
                this.screenReaderNode1.style.position = "relative";
                this.screenReaderNode1.style.top = "-10000px";
                this.screenReaderNode1.style.overflow = "hidden";
                this.screenReaderNode1.style.width = "1px";
                this.screenReaderNode1.style.height = "1px";
                wai.setWaiRole(this.screenReaderNode1, 'region');
                wai.setWaiState(this.screenReaderNode1, 'live', 'assertive');
                wai.setWaiState(this.screenReaderNode1, 'label', 'live region');

                this.screenReaderNode2 = domConstruct.create('div', null, this._mainNode);
                this.screenReaderNode2.style.zIndex = -20000;
                this.screenReaderNode2.style.position = "relative";
                this.screenReaderNode2.style.top = "-10000px";
                this.screenReaderNode2.style.overflow = "hidden";
                this.screenReaderNode2.style.width = "1px";
                this.screenReaderNode2.style.height = "1px";
                wai.setWaiRole(this.screenReaderNode2, 'region');
                wai.setWaiState(this.screenReaderNode2, 'live', 'assertive');
                wai.setWaiState(this.screenReaderNode2, 'label', 'live region');

                this.screenReaderNode = this.screenReaderNode1;
            }
            // use two nodes and clean one and use another to fix the issue if two more char are same, and navigator them with key arrowleft/arrowright
            this.screenReaderNode.innerHTML = " ";
            wai.removeWaiState(this.screenReaderNode, 'live');
            if (this.screenReaderNode == this.screenReaderNode1) {
                this.screenReaderNode = this.screenReaderNode2;
            } else {
                this.screenReaderNode = this.screenReaderNode1;
            }
            wai.setWaiState(this.screenReaderNode, 'live', 'assertive');
            this.screenReaderNode.innerHTML = message;
            // console.log("acc: -- "+ message);
        },

        destroy: function() {
            for (var i = 0; i < this._connects.length; i++) {
                this._connects[i].remove();
            }
            this._connects = [];

            this._keyHandler.destroy();

            if (this._iFrame) {
                this._iFrame.remove();
                this._iFrame = null;
            }
        },

        getEditor: function() {
            return this._shell.getEditor();
        },

        grabFocusImp: function(force) {
            if (!this._hasFocus || this._iFrame != document.activeElement || force) {
                //this._shell.focus();
                var selection = this.getEditor().getSelection();
                if (selection) {
                    selection.focus(pe.lotusEditor.isReadOnly());
                }
                this._hasFocus = true;

                if (force && document.activeElement) {
                    var activeE = document.activeElement;
                    document.activeElement.blur();
                    if (has("chrome") && !has("edge") && this._iFrame != activeE)
                        this._iFrame.focus(); // Defect 48122
                }

                if (browser.isMobile())
                    this._iFrame.focus();
                else {
                    if (browser.isIOSBrowser()) {
                        this._iFrame.focus();
                        this._inputNode.focus();
                    } else {
                        this._inputNode.focus();
                        if (has("safari")) {
                            // Safari IME 
                            var doc = this._inputNode.ownerDocument,
                                win = doc.parentWindow || doc.defaultView;
                            var native_range = doc.createRange();
                            native_range.selectNodeContents(this._inputNode);
                            var sel = win.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(native_range);
                        }
                    } 
                }

                this._inGrabFocus = false;
            }
        },

        /**
         * Grab focus for Editor.
         */
        grabFocus: function() {
            //console.log("grab focus.");
            if (browser.isMobile())
                return;
            if (!this._inputNode) // Input node is not ready
                return;
            if (pe.cellBorderPanelOpen)
                return;
            if (has("ff")) {
                // 45339: [A11Y][2.1a]focus should be in the welcome message but not body while the message appears
                var dialogShow = false;
                query(".dijitDialogUnderlayWrapper").some(function(oNode) {
                    if (oNode && oNode.style.display != "none") {
                        dialogShow = true;
                        return true;
                    }
                    return false;
                });
                if (dialogShow) { // some dialog is opened
                    return;
                }
            }
            this.grabFocusImp();
        },

        loseFocus: function() {
            //console.log("Lose focus.");
            if (browser.isMobile())
                return;
            if (this._hasFocus || this._iFrame == document.activeElement) {
                //this._shell.dismissContextMenu();
                this.getEditor().getSelection().blur();
                this._hasFocus = false;
                if (!has("ie") || has("ie") < 8)
                    this._inputNode.blur();
            }
        },
        _onMouseDown: function(isDblClick, event) {
            this.grabFocusImp(true);
            event.preventDefault(), event.stopPropagation();
            // Only handle LEFT/Right button click
            if (mouse.isMiddle(event)) // dojo.mouseButtons.MIDDLE
                return;

            var offsetX = event.clientX;
            var offsetY = event.clientY;
            var target = event.target || event.srcElement;

            var clickCnt = event.detail;
            if (browser.isMobileBrowser() && event.clickCnt) {
                clickCnt = event.clickCnt;
            }
            // Defect 41731, IE and Safari mouse double click is not accurate
            if (mouse.isLeft(event) && !browser.isMobile()) {
                if (clickCnt == 1) {
                    this.oldOffsetX = offsetX;
                    this.oldOffsetY = offsetY;
                } else if (clickCnt > 1) {
                    if (Math.abs(this.oldOffsetX - offsetX) > 3 || Math.abs(this.oldOffsetY - offsetY) > 3) {
                        clickCnt = 1;
                        this.oldOffsetX = offsetX;
                        this.oldOffsetY = offsetY;
                    }
                }
            }

            // Shift + double/triple click, behavior always like single click
            if (isDblClick)
                clickCnt = 2;
            else if (event.shiftKey || mouse.isRight(event) || (tools.isWin8() && (has("trident") || (has("ie") && has("ie") >= 10))))
                clickCnt = 1;
            // notify for spell check
            topic.publish(constants.EVENT.LEFTMOUSEDOWN, this, event);

            var editShell = this._shell;
            //To close the context menu because the dijit menu focus function has defect so that the context menu cannot be closed by onblur event
            //should remove below function when dojo fix its issue on IE10.
            //      if(dojo.isIE)
            //          editShell.dismissContextMenu();
            editShell.dismissContextMenu();
            editShell.dismissMobileMenu();
            var area = editShell.getEditorArea(target, offsetX, offsetY);
            var headerfooterPos = editShell.isPointInHeaderFooter(offsetX, offsetY);

            switch (clickCnt) {
                case 1:
                    var editMode = editShell.getEditMode();
                    //          console.info("click "+editMode+ " x:"+offsetX+" ;y: "+offsetY);
                    var validClick = ((editMode == constants.EDITMODE.EDITOR_MODE) ||
                        (editMode == constants.EDITMODE.HEADER_FOOTER_MODE) ||
                        (editMode == constants.EDITMODE.EDITOR_MODE && editShell.isPositionInEditorContent(area)) ||
                        (editMode == constants.EDITMODE.FOOTNOTE_MODE && editShell.isPositionInFootnotes(area)) ||
                        (editMode == constants.EDITMODE.ENDNOTE_MODE && editShell.isPositionInEndnotes(area)));
                    if ((editMode == constants.EDITMODE.EDITOR_MODE || editMode == constants.EDITMODE.ENDNOTE_MODE) && editShell.isPositionInFootnotes(area)) {
                        editShell.enterFootnotesMode(target, offsetX, offsetY);
                    } else if ((editMode == constants.EDITMODE.EDITOR_MODE || editMode == constants.EDITMODE.FOOTNOTE_MODE) && editShell.isPositionInEndnotes(area)) {
                        editShell.enterEndnotesMode(target, offsetX, offsetY);
                    } else if ((editMode == constants.EDITMODE.FOOTNOTE_MODE || editMode == constants.EDITMODE.ENDNOTE_MODE) && editShell.isPositionInEditorContent(area)) {
                        editShell.enterEditorMode(target, offsetX, offsetY);
                    }
                    if (!validClick)
                        break;

                    if (mouse.isLeft(event))
                    {
                        if (editMode != constants.EDITMODE.HEADER_FOOTER_MODE && headerfooterPos){}
                        else
                        editShell.beginSelect(target, offsetX, offsetY, event.ctrlKey, event.shiftKey, true);
                    }
                    else if (mouse.isRight(event) && !editShell.getSelection().isPositionInSelection(offsetX, offsetY)) {
                        editShell.beginSelect(target, offsetX, offsetY, event.ctrlKey, event.shiftKey, true);
                        editShell.endSelect(target, offsetX, offsetY, event.ctrkKey, true);
                    }

                    break;
                case 2:
                    {
                        var isLeave = false;
                        if (pe.lotusEditor.isReadOnly())
                            isLeave = false;
                        else if (headerfooterPos) {
                            // insert header/footer
                            var sectTools = SectionTools;
                            if (headerfooterPos.bHeader)
                                sectTools.insertHeaderFooter(headerfooterPos.page, true);
                            else
                                sectTools.insertHeaderFooter(headerfooterPos.page, false);
                        } else if (editShell.isPositionInHeaderFooter(area)) {
                            isLeave = editShell.enterHeaderFooterMode(target, offsetX, offsetY);
                        } else {
                            if (editShell.isPositionInFootnotes(area)) {
                                isLeave = editShell.enterFootnotesMode(target, offsetX, offsetY);
                            } else if (editShell.isPositionInEndnotes(area)) {
                                isLeave = editShell.enterEndnotesMode(target, offsetX, offsetY);
                            } else {
                                isLeave = editShell.enterEditorMode(target, offsetX, offsetY);
                            }

                        }
                        if (ModelTools.isValidSel4Find()) {
                            isLeave || editShell.selectWord(target, offsetX, offsetY);
                        }

                        // fix 38692: [IE10+Win8]mouse status is incorrect when double click in body to move focus out from header
                        if (isLeave && isDblClick && tools.isWin8() && (has("trident") || (has("ie") && has("ie") >= 10))) {
                            editShell.endSelect(target, offsetX, offsetY);
                        }
                    }
                    break;
                case 3:
                    editShell.selectParagraph(target, offsetX, offsetY);
                    break;
            }
        },
        
        _onFrameMouseLeave: function(event)
        {
            var frame = dom.byId("editorFrame");
            var offsetX = event.clientX - frame.offsetLeft;
            var offsetY = event.clientY - frame.offsetTop;
            this._shell.leaveSelect(offsetX, offsetY);
        },
        
        _onMouseLeave: function(event)
        {
            var offsetX = event.clientX;
            var offsetY = event.clientY;
            this._shell.leaveSelect(offsetX, offsetY);
        },

        _onMouseMove: function(event) {
            // Set cursor pointer type in Render HTML ??
            var offsetX = event.clientX;
            var offsetY = event.clientY;
            var target = event.target || event.srcElement;

            this.showCoEditTooltip(event);
            this.checkTrackChangeDelete(event);
            this._shell.moveSelect(target, offsetX, offsetY, event.ctrlKey, true);
        },
        
        checkTrackChangeDelete: function(e)
        {
            var target = e.target;
            if (target == this._lastMouseMoveTargetTrackChange)
                return;
            clearTimeout(this._showTrackPopupTimer);
            var tagName = target.tagName;
            this._lastMouseMoveTargetTrackChange = target;
            if (tagName && tagName.toLowerCase() == "span") { //prevent throwing exception, tagName can be undefined for text node
                var classNames = target.className;
                if (classNames.indexOf("delete-text") >=0 || classNames.indexOf("delete-triangle") >=0)
                {
                    target = target.parentNode;
                    classNames = target.className;
                }
                if (classNames.indexOf("track-deleted") >=0 && classNames.indexOf("track-id-listed") >=0)
                {
                    var classNameArr = classNames.split(/\s+/g);
                    var indClass = array.filter(classNameArr, function(c) {
                        return c != "track-id-listed" && c.indexOf("track-id-") == 0;
                    })[0];
                    if (!indClass)
                        return;
                    {
                        // TODO, the id may be an add or edit id, not a delete id.
                        var actId = indClass.substring(9);
                        this._showTrackPopupTimer = setTimeout(function(){
                             topic.publish("/trackChange/hoverDelete", actId);
                        }, 600);
                    }
                }
            }
        },

        showCoEditTooltip: function(e) {
            if (!pe.scene.isIndicatorAuthor()) {
                return;
            }

            var target = e.target;
            if (target == this._lastMouseMoveTarget)
                return;

            if (target && this._lastMouseMoveTarget && target.id && target.id == this._lastMouseMoveTarget.id)
                return;

            this.detachCoEditTooltip();

            this._lastMouseMoveTarget = target;

            var tagName = target.tagName;

            if (tagName.toLowerCase() == "span") {
                var classNames = target.className;
                var classNameArr = classNames.split(/\s+/g);
                var indClass = array.filter(classNameArr, function(c) {
                    return c.indexOf("ind") == 0;
                })[0];
                if (!indClass)
                    return;
                var cssUserKey = indClass.replace("ind", "");
                var userId = pe.scene.getUserIdbyIndicatorCSS(indClass);
                if (!userId)
                    return;

                var line = target.parentNode;
                if (line && !domClass.contains(line, "line")) {
                    line = line.parentNode;
                    if (line.tagName.toLowerCase() == "body")
                        line = null;
                }
                if (!line)
                    return;

                var firstSpan = query("span", line)[0];
                if (!firstSpan)
                    return;

                firstSpan = query("span", firstSpan)[0] || firstSpan;

                var store = pe.scene.getEditorStore();
                if (!store)
                	return;
                
                var u = store.getEditorById(userId);
                if (!u)
                	return;
                
                var userName = u.getName();

                if (userName) {
                    this.coEditTooltip = new CoEditIndicator({
                        label: userName,
                        userId: cssUserKey,
                        forCursor: false,
                        ownerDocument: browser.getEditAreaDocument()
                    });
                    var editorNode = dom.byId("editor", browser.getEditAreaDocument());
                    if (editorNode)
                        editorNode.appendChild(this.coEditTooltip.domNode);
                    this.coEditTooltip.show(firstSpan, line);
                }
            }
        },

        detachCoEditTooltip: function() {
            if (this.coEditTooltip)
                this.coEditTooltip.destroy();
            this.coEditTooltip = null;
        },

        //0: normal, 
        //1: double clicked, can select header/footer, 
        //2: header/footer selected, can also select header/footer
        _selectionState: 0,
        _onMouseUp: function(event) {
            // console.log("Mouse up event.");

            //dojo.stopEvent(event);
            if (!mouse.isLeft(event))
                return;

            var offsetX = event.clientX;
            var offsetY = event.clientY;
            var target = event.target || event.srcElement;
            this._shell.endSelect(target, offsetX, offsetY, event.ctrkKey, true);
        },

        _onContextMenu: function(event) {
            // console.log("context menu event.");
            pe.lotusEditor.getSelection().selectionChange();
            var offsetX = event.clientX + dom.byId('editorFrame').offsetLeft;
            //add offsetY and parent iframe offsetY.
            var offsetY = event.clientY + dom.byId("editorFrame").offsetTop;
            if (browser.isIOSBrowser()) {
                offsetX = event.screenX;
                offsetY = event.screenY;
            }
            var target = event.target || event.srcElement;
            event.preventDefault(), event.stopPropagation();
            if (target.getAttribute("class") != "bookMark")
                this._shell.openContextMenu(target, offsetX, offsetY);
        },

        /**
         * Reference from CKEditor/window.js
         * Gets the current position of the window's scroll.
         * @function
         * @returns {Object} An object with the "x" and "y" properties
         *      containing the scroll position.
         */
        getScrollPosition: function() {
            return {
                x: this._mainNode.scrollLeft || 0,
                y: this._mainNode.scrollTop || 0
            };
        },

        _onResize: function() {
            // TODO Should reference Spreadsheet.  
            // console.log("Window resize event");
        },

        _onMouseWheel: function(event) {
            //      console.log("Mouse wheel event");
            if (pe.lotusEditor.popupPanel)
                pe.lotusEditor.popupPanel.close && pe.lotusEditor.popupPanel.close();
        },

        _scrollTimer: null,
        _onScroll: function(event) {
            if (this._scrollTimer != null) {
                clearTimeout(this._scrollTimer);
            }

            pe.lotusEditor.cleanScrollCache();
            topic.publish(constants.EVENT.PAGEONSCROLL);

            this._shell.dismissContextMenu();
            this._shell.dismissMobileMenu();
            //Async operation, find out current page and refresh page,
            var that = this;
            var time = 100;
            if (browser.isIOSBrowser()) {
                time= 2000;
           }
            this._scrollTimer = setTimeout(function() {
            		if(!pe.lotusEditor.layoutEngine.rootView){
            			console.warn("Can not scroll since no root view!");
            			return;
            		}

                    //  var scrollTop = that._mainNode.scrollTop;
                    that._scrollTimer = null;
                    var scrollTop = pe.lotusEditor.getScrollPosition();
                    //          console.log("Partial rendering... scrollTop=" + scrollTop);

                    pe.lotusEditor.layoutEngine.rootView.render(scrollTop);
                    pe.lotusEditor.getSelection().appendHighlights(pe.lotusEditor.currFocusePage.pageNumber, 'scroll');

                    var curPage = pe.lotusEditor.currFocusePage;
                    var prePage = curPage.previous(),
                        nextPage = curPage.next();

                    if (has("ie") || has("trident")) {
                        curPage.refreshImageDom();
                        prePage && prePage.refreshImageDom();
                        nextPage && nextPage.refreshImageDom();
                    }

                    var totalPageNum = curPage.parent.pages.length();
                    if (totalPageNum > 1 && !concord.util.browser.isMobile()) //In mobile, page info always in the first page. Remove it.
                    {
                        topic.publish(constants.EVENT.SCROLLPAGE, pe.lotusEditor.currFocusePage.pageNumber, totalPageNum);
                    }
                    topic.publish(constants.EVENT.PAGESCROLLED);

                },
                time);
        }
    });
    return EditWindow;
});
