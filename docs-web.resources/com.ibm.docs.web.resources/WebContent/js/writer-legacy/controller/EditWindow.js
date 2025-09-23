dojo.provide("writer.controller.EditWindow");
dojo.require("writer.controller.KeyHandler");
dojo.require("writer.core.Event");
dojo.require("concord.util.acf");

/**
 * This object will capture all Key, Mouse, Focus, Context menu and Window resize events.
 * Then dispatch these events to Shell and Command.
 */
dojo.declare("writer.controller.EditWindow",
null, {
	// DOM node to receive text inputs
	_shell : null,
	_inputNode: null,
	_iFrame : null,
	
	_editorFrame: null,		// Just use to calculate the editor frame's offset.
	
	_mainNode: null,
	_connects : null,
	_hasFocus : false,
	_keyDownHandled : false,	// If the key Down event has been handled, the NEXT key press event should not be handled.
	
	_keyHandler: null,
	
	constructor: function(createParam) {
		this._shell = createParam.shell;
		
		this._editorFrame = dojo.byId("editorFrame");
		this._mainNode = concord.util.browser.getEditAreaDocument().body;
		if (pe.scene.isNote())
			dojo.addClass(this._mainNode, "note")
		this._connects = [];
		this._hasFocus = false;
		this._keyDownHandled = false;

		var that = this;
		window.__onLoad = function()
		{
			that._onLoad();
			delete window.__onLoad;
		};
		
		this._iFrame = window.document.createElement("iframe");
		dojo.attr(this._iFrame, {"class": "inputWrapper", "onload":"__onLoad()","title":"input wrapper",
			"style": "position: absolute; border: 0 none; outline-style: none; z-index: 100;" +
					" overflow: hidden; width: 1000px; height: 50px; right: 10000px; top: -10000px;"});
		
		if (pe.lotusEditor.isReadOnly())
			this._iFrame.tabIndex = 100;
		
		dojo.place(this._iFrame, dojo.body());
		
		if(dojo.isChrome)
			dojo.subscribe(writer.EVENT.FIRSTTIME_RENDERED,this,this._chromeFocus);
	},
	
	_chromeFocus:function(){
		var checkTime = 10000;
		var startTime = new Date();
		var that = this;
		var interval = setInterval(function(){
			if(document.activeElement && document.activeElement.id == "stiframeproxy")	// Sametime widget
			{
		      clearInterval(interval);
		      that.grabFocusImp(true);
		      return;
		     }
		     var curTime = new Date();
		     if(curTime - startTime > checkTime)
		    	 clearInterval(interval);
		}, 1000);
	},
	
	_onLoad: function(){
//		console.log("========= iframe loaded");
		this._inputNode = this._iFrame.contentWindow.document.body;
		this._inputNode.contentEditable = true;
		
		// Key event and text input 
		this._keyHandler = new writer.controller.KeyHandler(this, this._shell, this._iFrame, this._editorFrame);
		this._keyHandler.register();
		
		// Mouse event
		this._connects.push( dojo.connect(this._mainNode, "onmousedown",dojo.hitch(this, this._onMouseDown,false)) );
		if(common.tools.isWin8() && dojo.isIE && dojo.isIE >= 10)
			this._connects.push( dojo.connect(this._mainNode, "ondblclick",dojo.hitch(this, this._onMouseDown,true)));
		this._connects.push( dojo.connect(this._mainNode, "onmousemove", this, "_onMouseMove") );
//		this._connects.push( dojo.connect(this._mainNode, "onmouseup", this, "_onMouseUp") );
		this._connects.push( dojo.connect(concord.util.browser.getEditAreaDocument(), "onmouseup", this, "_onMouseUp") );
		// Scroll event
		this._connects.push( dojo.connect(concord.util.browser.getEditAreaWindow(), 'onscroll', this, '_onScroll') );
		if(dojo.isFF)
			this._connects.push( dojo.connect(this._mainNode, "DOMMouseScroll", this, "_onMouseWheel") );
		else
			this._connects.push( dojo.connect(this._mainNode, 'onmousewheel', this, '_onMouseWheel') );
		
//		this._connects.push( dojo.connect(this._mainNode, 'onmouseover', this, '_onMouseOver') );
//		this._connects.push( dojo.connect(this._mainNode, 'onmouseout', this, '_onMouseOut') );
		
		// Focus event
		this._connects.push( dojo.connect(this._inputNode, "onfocus", this, "grabFocus") );
		this._connects.push( dojo.connect(this._inputNode, "onblur", this, "loseFocus") );
		
		// TODO Register DOMFocusOut/DOMFocusIn and onfocusout event for document.
		// To solve the click sidebar/menu/toolbar the cursor blink problem.
		
		// Context menu
		this._connects.push( dojo.connect( this._mainNode, 'oncontextmenu', this, '_onContextMenu') );
		
		// Window resize
		this._connects.push( dojo.connect( window, 'onresize', this, '_onResize') );
		
		var focusNode = this._inputNode;
		var editWin = this;
		setTimeout(function(){ 
			focusNode.contentEditable = true; 
			focusNode.setAttribute("spellcheck", "false");
			focusNode.setAttribute("aria-hidden", "true");
			focusNode.setAttribute("role", "region");// region  textbox
			if(DOC_SCENE.focusWindow){
				focusNode.focus();
			}
			
			if(concord.util.browser.isMobile())
			{
				var docContainer = pe.lotusEditor.document && pe.lotusEditor.document.container;
				if(docContainer && (docContainer.len == 0 || (docContainer.len == 1 &&
						docContainer.first.content.modelType == writer.MODELTYPE.PARAGRAPH && docContainer.first.content.isEmpty())))
				{
					// empty document.
					concord.util.mobileUtil.jsObjCBridge.postEvents([{"name":"emptyDoc", "params":[]}]);
				}
			}
			var sel = editWin.getEditor().getSelection();
			sel.moveTo(window.layoutEngine.rootView.getFirstViewForCursor(), 0);
			if(DOC_SCENE.focusWindow && pe.lotusEditor.isReadOnly())
			{
				editWin.grabFocus();
				sel.focus();
			}
		}, 0);
	},
	
	announce: function(message){
		message = concord.util.acf.escapeXml(message);
		if(!this.screenReaderNode1){
			this.screenReaderNode1 = dojo.create('div',null, this._mainNode);
    		this.screenReaderNode1.style.zIndex = -20000;
    		this.screenReaderNode1.style.position = "relative";
    		this.screenReaderNode1.style.top = "-10000px";
    		this.screenReaderNode1.style.overflow = "hidden";
    		this.screenReaderNode1.style.width = "1px";
    		this.screenReaderNode1.style.height = "1px";
        	dijit.setWaiRole(this.screenReaderNode1,'region');
			dijit.setWaiState(this.screenReaderNode1,'live', 'assertive');
			dijit.setWaiState(this.screenReaderNode1,'label', 'live region');
			
			this.screenReaderNode2 = dojo.create('div',null, this._mainNode);
			this.screenReaderNode2.style.zIndex = -20000;
			this.screenReaderNode2.style.position = "relative";
    		this.screenReaderNode2.style.top = "-10000px";
    		this.screenReaderNode2.style.overflow = "hidden";
    		this.screenReaderNode2.style.width = "1px";
    		this.screenReaderNode2.style.height = "1px";
        	dijit.setWaiRole(this.screenReaderNode2,'region');
			dijit.setWaiState(this.screenReaderNode2, 'live', 'assertive');
			dijit.setWaiState(this.screenReaderNode2,'label', 'live region');
			
			this.screenReaderNode = this.screenReaderNode1;
		}
		// use two nodes and clean one and use another to fix the issue if two more char are same, and navigator them with key arrowleft/arrowright
		this.screenReaderNode.innerHTML = " ";
		dijit.removeWaiState(this.screenReaderNode, 'live');
		if(this.screenReaderNode == this.screenReaderNode1){
			this.screenReaderNode = this.screenReaderNode2;
		}else{
			this.screenReaderNode = this.screenReaderNode1;
		}
		dijit.setWaiState(this.screenReaderNode, 'live', 'assertive');
		this.screenReaderNode.innerHTML = message;
		// console.log("acc: -- "+ message);
	},
	
	destroy: function(){
		for(var i = 0; i < this._connects.length; i++)
		{
			dojo.disconnect(this._connects[i]);
		}	
		this._connects = [];
		
		this._keyHandler.destroy();
		
		if(this._iFrame)
		{
			this._iFrame.remove();
			this._iFrame = null;
		}
	},
	
	getEditor: function(){
		return this._shell.getEditor();
	},

	grabFocusImp: function(force){
		if(!this._hasFocus || this._iFrame != document.activeElement || force)
		{
			//this._shell.focus();
			this.getEditor().getSelection().focus(pe.lotusEditor.isReadOnly());
			this._hasFocus = true;
			
			if(force && document.activeElement)
			{
				var activeE = document.activeElement;
				document.activeElement.blur();
				if(dojo.isChrome && !dojo.isEdge && this._iFrame != activeE)
					this._iFrame.focus();	// Defect 48122
			}
			
			if(concord.util.browser.isMobile())
				this._iFrame.focus();
			else
			{
				this._inputNode.focus();
				if (dojo.isSafari)
				{
					// Safari IME 
					var doc = this._inputNode.ownerDocument, win = doc.parentWindow || doc.defaultView;
					var native_range = doc.createRange();
					native_range.selectNodeContents(this._inputNode);
					var sel = win.getSelection();
					sel.removeAllRanges();
					sel.addRange(native_range);
				}
			}
			
			this._inGrabFocus = false;
		}
	},
	
	/**
	 * Grab focus for Editor.
	 */
	grabFocus: function(){
		//console.log("grab focus.");
		if(concord.util.browser.isMobile())
			return;
		if(!this._inputNode)	// Input node is not ready
			return;
		if (pe.cellBorderPanelOpen)
			return;
		if(dojo.isFF){
			// 45339: [A11Y][2.1a]focus should be in the welcome message but not body while the message appears
			var dialogShow = false;
			dojo.query(".dijitDialogUnderlayWrapper").some(function(oNode){
				if(oNode && oNode.style.display !="none"){
					dialogShow = true;
					return true;
				}
				return false;
			});
			if(dialogShow){// some dialog is opened
				return;
			}
		}
		this.grabFocusImp();
	},
		
	loseFocus : function(){
		//console.log("Lose focus.");
		if(concord.util.browser.isMobile())
			return;
		if(this._hasFocus || this._iFrame == document.activeElement)
		{	
			//this._shell.dismissContextMenu();
			this.getEditor().getSelection().blur();
			this._hasFocus = false;
			if (!dojo.isIE || dojo.isIE < 8)
				this._inputNode.blur();
		}
	},
	_onMouseDown: function(isDblClick,event)
	{
		this.grabFocusImp(true);
		dojo.stopEvent(event);
		// Only handle LEFT/Right button click
		if(event.button != dojo.mouseButtons.LEFT && event.button != dojo.mouseButtons.RIGHT)	// dojo.mouseButtons.MIDDLE
			return;

		var offsetX = event.clientX;
		var offsetY = event.clientY;
		var target = event.target || event.srcElement;
		
		var clickCnt = event.detail;
		
		// Defect 41731, IE and Safari mouse double click is not accurate
		if(event.button == dojo.mouseButtons.LEFT && !concord.util.browser.isMobile())
		{
			if(clickCnt == 1)
			{
				this.oldOffsetX = offsetX;
				this.oldOffsetY = offsetY;
			}	
			else if(clickCnt > 1)
			{
				if(Math.abs(this.oldOffsetX - offsetX) > 3 || Math.abs(this.oldOffsetY - offsetY)  > 3 )
				{
					clickCnt = 1;
					this.oldOffsetX = offsetX;
					this.oldOffsetY = offsetY;
				}	
			}
		}
		
		// Shift + double/triple click, behavior always like single click
		if(isDblClick)
			clickCnt = 2;
		else if(event.shiftKey || event.button == dojo.mouseButtons.RIGHT ||(common.tools.isWin8() && dojo.isIE && dojo.isIE >= 10))
			clickCnt = 1;
		// notify for spell check
		dojo.publish(writer.EVENT.LEFTMOUSEDOWN, [this, event]);
		
		var editShell = this._shell;
		//To close the context menu because the dijit menu focus function has defect so that the context menu cannot be closed by onblur event
		//should remove below function when dojo fix its issue on IE10.
//		if(dojo.isIE)
//			editShell.dismissContextMenu();
		editShell.dismissContextMenu();
		var area = editShell.getEditorArea(target, offsetX, offsetY);
		var headerfooterPos = editShell.isPointInHeaderFooter(offsetX, offsetY);
		
		switch(clickCnt)
		{
		case 1:
			var editMode = editShell.getEditMode();			
//			console.info("click "+editMode+ " x:"+offsetX+" ;y: "+offsetY);
			var validClick = ((editMode == EDITMODE.EDITOR_MODE)||
							  (editMode == EDITMODE.HEADER_FOOTER_MODE)||
							  (editMode == EDITMODE.EDITOR_MODE && editShell.isPositionInEditorContent(area)) ||
				              (editMode == EDITMODE.FOOTNOTE_MODE && editShell.isPositionInFootnotes(area))||
				              (editMode == EDITMODE.ENDNOTE_MODE && editShell.isPositionInEndnotes(area)) );
			if((editMode == EDITMODE.EDITOR_MODE ||editMode == EDITMODE.ENDNOTE_MODE )&& editShell.isPositionInFootnotes(area)){
				editShell.enterFootnotesMode(target, offsetX, offsetY);				
			}else if((editMode == EDITMODE.EDITOR_MODE || editMode == EDITMODE.FOOTNOTE_MODE)&& editShell.isPositionInEndnotes(area)){
				editShell.enterEndnotesMode(target, offsetX, offsetY);	
			}else if((editMode == EDITMODE.FOOTNOTE_MODE||editMode == EDITMODE.ENDNOTE_MODE )&& editShell.isPositionInEditorContent(area)){
				editShell.enterEditorMode(target,offsetX, offsetY);
			}
			if( !validClick )
				break;
			
			if (event.button == dojo.mouseButtons.LEFT)
			  editShell.beginSelect(target, offsetX, offsetY, event.ctrlKey, event.shiftKey, true);
			else if (event.button == dojo.mouseButtons.RIGHT && !editShell.getSelection().isPositionInSelection(offsetX, offsetY)){
			  editShell.beginSelect(target, offsetX, offsetY, event.ctrlKey, event.shiftKey, true);
			  editShell.endSelect(target, offsetX, offsetY, event.ctrkKey, true);
			}
			
			break;
		case 2:
			{
				var isLeave = false; 
				if(pe.lotusEditor.isReadOnly())
					isLeave = false;
				else if (headerfooterPos)
				{
					// insert header/footer
					var sectTools = writer.util.SectionTools;
					if (headerfooterPos.bHeader)
						sectTools.insertHeaderFooter(headerfooterPos.page, true);
					else
						sectTools.insertHeaderFooter(headerfooterPos.page, false);
				}
				else if(editShell.isPositionInHeaderFooter(area))
				{
					isLeave = editShell.enterHeaderFooterMode(target,offsetX, offsetY);
				}
				else
				{					
					if(editShell.isPositionInFootnotes(area)){
						isLeave = editShell.enterFootnotesMode(target, offsetX, offsetY);	
					}else if(editShell.isPositionInEndnotes(area)){
						isLeave =  editShell.enterEndnotesMode(target, offsetX, offsetY);	
					}else{
						isLeave = editShell.enterEditorMode(target,offsetX, offsetY);
					}
					
				}
				if(writer.util.ModelTools.isValidSel4Find()){
					isLeave || editShell.selectWord(target, offsetX, offsetY);
				}
				
				// fix 38692: [IE10+Win8]mouse status is incorrect when double click in body to move focus out from header
				if(isLeave && isDblClick && common.tools.isWin8() && dojo.isIE && dojo.isIE >= 10){					
					editShell.endSelect(target,offsetX, offsetY);
				}
			}
			break;
		case 3:
			editShell.selectParagraph(target, offsetX, offsetY);
			break;
		}
	},
	
	_onMouseMove: function(event)
	{
		// Set cursor pointer type in Render HTML ??
		var offsetX = event.clientX;
		var offsetY = event.clientY;
		var target = event.target || event.srcElement;

		this.showCoEditTooltip(event);
		this._shell.moveSelect(target, offsetX, offsetY, event.ctrlKey, true);
	},

	showCoEditTooltip: function(e)
	{
		if (!pe.scene.isIndicatorAuthor())
		{
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

		if (tagName.toLowerCase() == "span")
		{
			var classNames = target.className;
			var classNameArr = classNames.split(/\s+/g);
			var indClass = dojo.filter(classNameArr, function(c){
				return c.indexOf("ind") == 0;
			})[0];
			if (!indClass)
				return;
			var userId = indClass.replace("ind", "");
			if (!pe.scene.getUsersColorStatus(userId))
				return;
			
			var line = target.parentNode;
			if (line && !dojo.hasClass(line, "line"))
			{
				line = line.parentNode;
				if (line.tagName.toLowerCase() == "body")
					line = null;
			}
			if (!line)
				return;
			
			var firstSpan = dojo.query("span", line)[0];
			if (!firstSpan)
				return;
			
			firstSpan = dojo.query("span", firstSpan)[0] || firstSpan;
			
			var userName = concord.util.user.getUserFullName(userId);
			
			if (userName)
			{
				this.coEditTooltip = new writer.ui.widget.CoEditIndicator(
				{
					label: userName,
					userId: userId,
					forCursor: false,
					ownerDocument: concord.util.browser.getEditAreaDocument()
				});
				var editorNode = dojo.byId("editor", concord.util.browser.getEditAreaDocument()); 
				if (editorNode)
					editorNode.appendChild(this.coEditTooltip.domNode);
				this.coEditTooltip.show(firstSpan, line);
			}
		}
	},

	detachCoEditTooltip: function()
	{
		if (this.coEditTooltip)
			this.coEditTooltip.destroy();
		this.coEditTooltip = null;
	},

	//0: normal, 
	//1: double clicked, can select header/footer, 
	//2: header/footer selected, can also select header/footer
	_selectionState: 0,
	_onMouseUp: function(event)
	{
		// console.log("Mouse up event.");
		
		//dojo.stopEvent(event);
		if(event.button != dojo.mouseButtons.LEFT)
			return;

		var offsetX = event.clientX;
		var offsetY = event.clientY;
		var target = event.target || event.srcElement;
		this._shell.endSelect(target, offsetX, offsetY, event.ctrkKey, true);
	},
	
	_onContextMenu: function(event)
	{
		// console.log("context menu event.");
		pe.lotusEditor.getSelection().selectionChange();
		var offsetX = event.clientX+dojo.byId('editorFrame').offsetLeft;
		//add offsetY and parent iframe offsetY.
		var offsetY = event.clientY + dojo.byId("editorFrame").offsetTop;
		var target = event.target || event.srcElement;
		dojo.stopEvent(event);
		if( target.getAttribute("class")!="bookMark" )
			this._shell.openContextMenu(target, offsetX, offsetY);
	},
	
	/**
	 * Reference from CKEditor/window.js
	 * Gets the current position of the window's scroll.
	 * @function
	 * @returns {Object} An object with the "x" and "y" properties
	 *		containing the scroll position.
	 */
	getScrollPosition : function()
	{
		return {
			x : this._mainNode.scrollLeft || 0,
			y : this._mainNode.scrollTop || 0
		};
	},
	
	_onResize : function()
	{
		// TODO Should reference Spreadsheet.  
		// console.log("Window resize event");
	},
	
	_onMouseWheel : function(event)
	{
//		console.log("Mouse wheel event");
	},
	
	_scrollTimer: null,
	_onScroll : function(event)
	{
		if (this._scrollTimer != null){
			clearTimeout(this._scrollTimer);
		}
		
		pe.lotusEditor.cleanScrollCache();
		
		this._shell.dismissContextMenu();
		//Async operation, find out current page and refresh page,
		var that = this;
		this._scrollTimer = setTimeout(function(){
		//	var scrollTop = that._mainNode.scrollTop;
			that._scrollTimer = null;
			var scrollTop = pe.lotusEditor.getScrollPosition();
//			console.log("Partial rendering... scrollTop=" + scrollTop);
			
			pe.lotusEditor.layoutEngine.rootView.render(scrollTop);
			pe.lotusEditor.getSelection().appendHighlights(pe.lotusEditor.currFocusePage.pageNumber,'scroll');
			
			var curPage = pe.lotusEditor.currFocusePage;
			var prePage = curPage.previous(), nextPage = curPage.next();

			if(dojo.isIE){
				curPage.refreshImageDom();
				prePage && prePage.refreshImageDom();
				nextPage && nextPage.refreshImageDom();
			}
			
			var totalPageNum = curPage.parent.pages.length();
			if(totalPageNum > 1 && !concord.util.browser.isMobile())//In mobile, page info always in the first page. Remove it.
			{
				dojo.publish(writer.EVENT.SCROLLPAGE, [pe.lotusEditor.currFocusePage.pageNumber, totalPageNum]);
			}
			dojo.publish(writer.EVENT.PAGESCROLLED, []);
		},100);
	}
});