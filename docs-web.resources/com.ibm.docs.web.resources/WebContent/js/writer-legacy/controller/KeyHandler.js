dojo.provide("writer.controller.KeyHandler");


dojo.declare("writer.controller.KeyHandler", null, {
	_impl: null,
	
	constructor: function(editWin, shell, inputFrame, editorFrame)
	{
		if (dojo.isWebKit)
			this._impl = new writer.controller.WebKitKeyImpl(editWin, shell, inputFrame, editorFrame);
		else if (dojo.isIE)
			this._impl = new writer.controller.TridentKeyImpl(editWin, shell, inputFrame, editorFrame);
		else
			this._impl = new writer.controller.GeckoKeyImpl(editWin, shell, inputFrame, editorFrame);
	},
	
	register: function()
	{
		this._impl.register();
	},
	
	destroy: function()
	{
		this._impl.destroy();
	}
});

dojo.declare("writer.controller.KeyImpl", null, {
	_editWin: null,
	_shell: null,
	_inputFrame: null,
	_inputNode: null,
	_editorFrame: null,
	_connects: [],
	_keyDownHandled: false,
	_bLog: false,
	
	constructor: function(editWin, shell, inputFrame, editorFrame) {
		this._editWin = editWin;
		this._shell = shell;
		this._inputFrame = inputFrame;
		this._inputNode = inputFrame.contentWindow.document.body;
		this._isInputShown = false;
		this._editorFrame = editorFrame;
		this._mainNode = concord.util.browser.getEditAreaDocument();
		this._connects = [];
		this._keyDownHandled = false;
	},
	
	register: function() {
		this._connects.push( dojo.connect(this._inputNode, "onkeydown", this, "_onKeyDown") );
		this._connects.push( dojo.connect(this._inputNode, "onkeypress", this, "_onKeyPress") );
		this._connects.push( dojo.connect(this._inputNode, "onkeyup", this, "_onKeyUp") );
		this._connects.push( dojo.connect(this._inputNode, "textInput", this, "_onTextInput") );
		if( dojo.isWebKit && !dojo.isEdge ){
			this._connects.push( dojo.connect(this._inputNode, "onbeforecopy", this, "_onBeforeCopy") );
			this._connects.push( dojo.connect(this._inputNode, "onbeforecut", this, "_onBeforeCut") );
		}
		if (dojo.isIE)
		{
			// IE9 started to support addEventListener, and composition events can only been hooked by addEventListener
			this._inputNode.addEventListener("compositionstart", dojo.hitch(this, "_onCompositionStart"), false);
			this._inputNode.addEventListener("compositionupdate", dojo.hitch(this, "_onCompositionUpdate"), false);
			this._inputNode.addEventListener("compositionend", dojo.hitch(this, "_onCompositionEnd"), false);
		}
		else {
			this._connects.push( dojo.connect(this._inputNode, "oncompositionstart", this, "_onCompositionStart") );
			this._connects.push( dojo.connect(this._inputNode, "oncompositionupdate", this, "_onCompositionUpdate") );
			this._connects.push( dojo.connect(this._inputNode, "oncompositionend", this, "_onCompositionEnd") );
			
			this._connects.push( dojo.connect(this._inputNode, "onfocus", this, "_onFocus") );
			this._connects.push( dojo.connect(this._inputNode, "onblur", this, "_onBlur") );
		}
	},
	/**
	 * onbeforecopy event
	 * @param event
	 */
	_onBeforeCopy: function( event )
	{
//		console.log("before copy");
		pe.lotusEditor.execCommand( "copy");
		return false;
	},
	/**
	 * onbeforecut event
	 * @param event
	 */
	_onBeforeCut: function( event )
	{
		// console.log("before cut",event.target);
		pe.lotusEditor.execCommand( "cut");
		return false;
	},
	
	destroy: function() {
//		console.log("destory ...");
		for(var i = 0; i < this._connects.length; i++)
		{
			dojo.disconnect(this._connects[i]);
		}	
		this._connects = [];				
	},
	
	_getInput: function()
	{
		return this._inputNode.textContent || this._inputNode.innerText || '';
	},
	
	_clearInput: function()
	{
		if (!(dojo.isSafari && (navigator.platform == "Win32" || navigator.platform == "Windows")))
			this._inputNode.textContent = this._inputNode.innerText = '';
	},
	
	_insertText: function(text, dontClear, imeUpdate)
	{
//		console.log("_insertText:"+text+" "+dontClear+" "+imeUpdate);
		if(this._shell.getEditor().isReadOnly()){
			return;
		}
		if (text && text.length > 0)
		{
			var udm = pe.lotusEditor.undoManager;
			if (!imeUpdate && !udm.isIMEInput())
			{
				this._shell.insertText(text,true);
			}
			else {
				if (!this._emptyRunProps && udm.isIMEInput())
				{
					this._shell.insertText(text,true);
				}
				else {
					var style = {};
					if (this._emptyRunProps)
					{
						style = dojo.clone(this._emptyRunProps);
					}

					if (imeUpdate)
					{
						style = dojo.clone(this.textStyle);
						if(style["color"]){
							style['coloreBeforeIME'] = style["color"];
						}else
							style['coloreBeforeIME'] = "auto";
						if (this.textStyle["background-color"])
						{	// there are background color for the text, set the font color as the same
							style["color"] = this.textStyle["background-color"];
						}
						else {
							style["color"] = "#ffffff";
						}							
					}
					var obj = {};
					obj.c = text;
					obj.fmt = [{l:text.length, rt:"rPr", style:style}];
					this._shell.insertText(obj);						
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
	_getKeyCombination: function(keyEvent)
	{
		var keyCombination = keyEvent.keyCode;
		if ( keyEvent.ctrlKey || keyEvent.metaKey )
			keyCombination += writer.CTRL;

		if ( keyEvent.shiftKey )
			keyCombination += writer.SHIFT;

		if ( keyEvent.altKey )
			keyCombination += writer.ALT;
		
		return keyCombination;
	},
	
	/**
	 * Return true if the key event has no CTRL/ALT key, otherwise return false.
	 */
	_isNormalKey: function(keyEvent)
	{
		if ( keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.altKey)
			return false;
		return true;
	},
	
	_onKeyDown: function(event)
	{
		if(pe.lotusEditor.popupPanel)
			pe.lotusEditor.popupPanel.close && pe.lotusEditor.popupPanel.close(); 
//		console.log("_onKeyDown ");
		if (this._bLog)
			console.log(event.type + ": " + event.keyCode + ": " + event.charCode);
		if(this._imeLen > 0){
			return true;
		}
		var keyCombination = this._getKeyCombination(event);
		
		this._keyDownHandled = false;
		if (this._shell.getEditor())
		{
			var commandName = this._shell.getEditor().getKeyStroke(keyCombination);
			if (commandName) {
				var data = null;
				if("focus2Menubar" == commandName)
					data = event;
				this._keyDownHandled = this._shell.getEditor().execCommand(commandName, data);
			}
		}
		
		var keys = dojo.keys;
		if (!this._keyDownHandled)
		{
			var editorShell = this._shell;
			switch (keyCombination)
			{
			case (keys.ENTER + writer.SHIFT):
				// why can't this be treated as one kind of command as well, just like backspace
				this._keyDownHandled = editorShell.insertText("\r");
				break;
			case writer.CTRL:
				break;
			default:
				break;
			}
			if( this._shell.getEditor().Paintingformat ){
				delete this._shell.getEditor().Paintingformat;
				dojo.publish(writer.EVENT.SELECTION_CHANGE);
			}
		}
//		console.log( "this._keyDownHandled: " + this._keyDownHandled );
		if (this._keyDownHandled)
		{
			dojo.stopEvent(event);
			this._keyDownHandled = false;
			this._clearInput();
			return true;
		}
		return false;
	},
	
	_onKeyPress: function(event)
	{
		if (this._bLog)
			console.log(event.type + ": " + event.keyCode + ": " + event.charCode);
	},
	
	_onKeyUp: function(event)
	{
		if (this._bLog)
			console.log(event.type + ": " + event.keyCode + ": " + event.charCode);
	},
	
	_onTextInput: function(event) 
	{
		if (this._bLog)
			console.log(event.type + ": " + event.data);
	},

	refreshStartPos: function(){
		if(!this.reassign){
			var selection = this._shell.getSelection();
			var range = selection.getRanges()[0];
			this._startParaPos = range.getStartParaPos();
			this._startParaPos.index = this.startIndex;
			this.reassign = true;
		}
	},
	
	_recordStart: function()
	{
		// record where the paragraph position is
		var selection = this._shell.getSelection();
		var cursor = selection.getCursor();
		var cursorCtx = cursor.getContext();
		this._targetPara = cursorCtx._run.model.paragraph;
		var range = selection.getRanges()[0];
		this._startParaPos = range.getStartParaPos();
		this.startIndex = this._startParaPos.index;
		this.reassign = false;
		this._rootView = range.rootView;
		this._imeLen = 0;
		this.align = range.getEndParaPos().obj.directProperty.getAlign();
		
		// record current undo stack
		pe.lotusEditor.undoManager.imeBegin();
	},
	
	_onCompositionStart: function(event) 
	{
		if (this._bLog)
			console.log(event.type + ": " + event.data + ", focus window title:"+document.activeElement.title);
		
		var selection = this._shell.getSelection();
		var ranges = selection.getRanges();
		if (ranges && (ranges.length > 1 || (ranges.length == 1 && !ranges[0].isCollapsed()))) {
			// when there is selection, delete it before IME composition input to
			// put it in undo queue, so user can undo it
			pe.lotusEditor.execCommand("delete");
		}
		
		this._recordStart();
		this.leaveHandler = dojo.subscribe(writer.EVENT.BEFORELEAVE,this,this.removeUnconfirmContent);
		this.updateHandler = dojo.subscribe(writer.EVENT.ENDUPDATEDOCMODEL,this,this.updateInputNodePos);
	},
	
	_onCompositionUpdate: function(event) 
	{
		if (this._bLog)
			console.log(event.type + ": " + event.data + ", focus window title:"+document.activeElement.title);
		
		var selection = this._shell.getSelection();
		if (event.data && event.data.length > 0)
		{
			if (this._imeLen > 0)
			{
				// delete previously inserted
				this.refreshStartPos();
				var start = this._startParaPos;
				var end = {};
				end.obj = start.obj;
				end.index = start.index + this._imeLen;
				// selection.select(start, end);
				selection.selectRangesBeforeUpdate([new writer.core.Range( start, end, this._rootView )]);
				this._shell.deleteText(true);
			}
			
			if (dojo.isFF && this._usePadding)
			{
				dojo.style(this._inputNode,"textIndent", this._inputIndent + "px");
				dojo.style(this._inputNode,"paddingLeft", "0px");
				this._usePadding = false;
			}
			
			// Defect 48544, it will break input procedure. 
//			if (dojo.isIE)
//			{
//				// in IE, for IME like Microsoft Pinyin, when you input a punctuation (e.g: ,) after chinese words,
//				// the previous words will be inserted then start a new word spelling, however there are no other
//				// event to tell you the truth, so have to compare what is in the input frame, and what's in the
//				// event data, to distinguish
//				var input = this._getInput();
//				var i = input.lastIndexOf(event.data);
//				if (i > 0)
//				{
//					// recover to previous undo state before commit in IME
//					pe.lotusEditor.undoManager.imeEnd();
//
//					var t = input.substr(0, i);
//					pe.lotusEditor.undoManager.imeCommit(true);
//					this._insertText(t, false);
//					pe.lotusEditor.undoManager.imeCommit(false);
//					this._recordStart();
//					this.showInputNode(false);
//					this.showInputNode(true);
//				}
//			}
			
			// insert updated
			this._insertText(event.data, true, true);
			this._imeLen = event.data.length;
		}
	},
	updateInputNodePos:function(){
		// update the input node position to fix 40903: character in IME editor shadowed when input in new pasted textbox in the new document
		if(this.align != "left"){
			this.refreshStartPos();
			var para = this._startParaPos.obj;
			var runModel =para.byIndex( this._startParaPos.index, true, true);
			if (!runModel) return;
			var viewPosition = writer.util.RangeTools.toViewPosition(runModel, this._startParaPos.index - runModel.start,this._rootView);
			var runPos = viewPosition.obj.getChildPosition(viewPosition.index, false, false, true);
			var pos = pe.lotusEditor.getShell().logicalToClient(runPos);
			dojo.style(this._inputFrame,{"position":"absolute", "left":pos.x+"px"});
			dojo.style(this._inputNode,"textIndent", "0px");
			dojo.style(this._inputNode,"paddingLeft", "0px");
		}
	},
	
	removeUnconfirmContent: function(){
		if (this._imeLen > 0)
		{
			// delete previously inserted
			this.refreshStartPos();
			var start = this._startParaPos;
			var end = {};
			end.obj = start.obj;
			end.index = start.index + this._imeLen;
			// selection.select(start, end);
			var selection = this._shell.getSelection();
			var range = new writer.core.Range( start, end,this._rootView );
			selection.selectRangesBeforeUpdate([range]);		
			this._shell.deleteText(true);
		}
	},
	
	_onCompositionEnd: function(event) 
	{
		if (this._bLog)
			console.log(event.type + ": " + event.data);
		var selection = this._shell.getSelection();
		if (this._imeLen > 0)
		{
			// delete previously inserted
			this.refreshStartPos();
			var start = this._startParaPos;
			var end = {};
			end.obj = start.obj;
			end.index = start.index + this._imeLen;
			// selection.select(start, end);
			selection.selectRangesBeforeUpdate([new writer.core.Range( start, end,this._rootView )]);
			this._shell.deleteText(true);
			this._imeLen = 0;
			
		}
		
		// recover to previous undo state before commit in IME
		pe.lotusEditor.undoManager.imeEnd();
		if(this.updateHandler){
			dojo.unsubscribe(this.updateHandler);
			this.updateHandler = null;
		}
		if(this.leaveHandler){
			dojo.unsubscribe(this.leaveHandler);
			this.leaveHandler = null;
		}	
			
		this.showInputNode(false);
	},
	
	getElementPos: function(node)
	{
		var x = 0; y = 0;
		var tmpNode = node;
		while (tmpNode)
		{
			x += tmpNode.offsetLeft;
			y += tmpNode.offsetTop;
			tmpNode = tmpNode.offsetParent;
		}
		return {x:x,y:y};
	},
	
	/**
	 * Update the input Node position.
	 * 
	 */
	showInputNode: function(bShow)
	{
		var selection = this._shell.getSelection();
		var cursor = selection._cursor;
		
		if (this._isInputShown == bShow)
		{
			return;
		}
		
		if(bShow)
		{
			this._defaultStyle = this._defaultStyle || dojo.attr(this._inputFrame, "style");
			this._inShow = true;
			var scrollLeft = this._mainNode.documentElement.scrollLeft || this._mainNode.body.scrollLeft;
			var scrollTop = this._mainNode.documentElement.scrollTop || this._mainNode.body.scrollTop;
			var cursorX=Number (cursor.getX().replace('px','')) - scrollLeft + this._editorFrame.offsetLeft;
			var cursorY=Number (cursor.getY().replace('px','')) - scrollTop + this._editorFrame.offsetTop;
			
			var range = selection.getRanges()[0];
			var view = range.getStartView();	// Input quickly, the model changed but no view.
			if (!view) return;
			var vtools = writer.util.ViewTools;
			var container = view && vtools.getCell(view.obj);
			var isCell = false;
			if (!container)
			{
				container = vtools.getBody(view.obj);
			}
			else {
				isCell = true;
			}
			if (!container)
			{
				container = vtools.getHeader(view.obj);
				if (!container)
				{
					container = vtools.getFooter(view.obj);
				}
			}
			
			// record the text properties if current position is an empty text run
			this._emptyRunProps = null;
			var start = range.getStartParaPos();
			var para = start.obj;
			var ret = para.getInsertionTarget(start.index);
			if (ret.target && !ret.target.length && ret.target.isTextRun && ret.target.isTextRun())
			{	// start to input in a empty run, then it may be deleted after calling shell.deleteText
				// need to keep the text property styles, then set those styles back after calling shell.deleteText
				this._emptyRunProps = ret.target.textProperty.toJson() || {};
			}
			
			if (!ret.follow)
			{
				var cursorCtx = cursor.getContext();
				this.textStyle = cursorCtx._run.getComputedStyle();
			}
			else {
				this.textStyle = ret.follow.getComputedStyle();
			}
			
			this._inputNode.setAttribute("style", "margin:0px; background-color:transparent; word-wrap:break-word; overflow:auto;");
			this._inputNode.setAttribute("scroll", "no");
			for (var key in this.textStyle) 
			{ 
				if (key == "background-color")
					continue;
				this._inputNode.style[common.tools.cssStyleToDomStyle(key)] = this.textStyle[key];
			}

			//reset position
			var paddingLeft = 0;
			if (isCell)
			{
				paddingLeft = container.getPaddingLeft();
			}
			var containerPos = this.getElementPos(container.domNode);
			var editorPos = this.getElementPos(this._editorFrame);
			var left = containerPos.x + editorPos.x + 1 + paddingLeft;
			var top = cursorY + 1;
			dojo.style(this._inputFrame,{"position":"absolute", "left":left+"px", "top":top+"px", "width":container.getWidth()+"px", "height":"400px"});
			var textIndent = cursorX - left + 1;
			this._inputIndent = textIndent;
			dojo.style(this._inputNode,"textIndent", "0px");
			dojo.style(this._inputNode,"paddingLeft", "0px");
			if (dojo.isFF)
			{
				this._usePadding = true;
				dojo.style(this._inputNode, "paddingLeft", textIndent + "px");
			}
			else
			{
				this._usePadding = false;
				dojo.style(this._inputNode,"textIndent",textIndent + "px");
			}
			if (this._bLog)
				console.log("INPUT FRAME: left=" + left + " top=" + top + " textIndent=" + textIndent);
			selection.blur();
			cursor.lock();
		}
		else if( this._inShow )
		{
			this._inShow = false;
			dojo.attr(this._inputFrame, "style", this._defaultStyle);
			cursor.unlock();
			selection.focus();
		}
		
		this._isInputShown = bShow;
	},
	_onFocus:function(event) {
		this.justfocused = true;
	},
	_onBlur:function(event){
		this.justfocused = false;
	}
});

/*
 * For webkit browsers, use textInput event to get input, 
 * including ascii, IME and punctuation in IME
 */
dojo.declare("writer.controller.WebKitKeyImpl", writer.controller.KeyImpl, {
	
	_onTextInput: function(event) 
	{
		this._bLog && console.log("_onTextInput:"+ event.data + ", focus window title:"+document.activeElement.title);
		this.inherited(arguments);
		if( !pe.lotusEditor.isPasting )
		{
			// in case compositionEnd is not triggerred
			if (this._imeLen > 0)
				this._onCompositionEnd(event);

			this._insertText(event.data, false);
			pe.lotusEditor.undoManager.imeCommit(false);
			dojo.stopEvent( event );
		}
		
		if(dojo.isSafari < 6){
			this._editorFrame.focus();
			this._inputFrame.focus();
			this._inputNode.focus();
		}
	},
	
	_onCompositionStart: function(event)
	{
		this.inherited(arguments);
		this.showInputNode(true);
	},
	
	_onCompositionEnd: function(event) 
	{
		this.inherited(arguments);
		// if there are input in the event, the following textInput will contain input content from IME		
		if (event.data && event.data.length > 0)
		{
			pe.lotusEditor.undoManager.imeCommit(true);
		}
		else {
			pe.lotusEditor.undoManager.imeCommit(false);
		}
	}
});

/*
 * For mozilla browsers, use keypress event to get input from ascii,
 * use compositionend to get input from IME
 */
dojo.declare("writer.controller.GeckoKeyImpl", writer.controller.KeyImpl, {
	_onKeyPress: function(event)
	{
		this.inherited(arguments);
		
		if(event.charCode > 0 && (event.charCode > 127 || this._isNormalKey(event)))
		{
			var text = String.fromCharCode(event.charCode);
			this._insertText(text, false);
			dojo.stopEvent( event );
		}
	},
	
	_onCompositionStart: function(event)
	{
		this.inherited(arguments);
		this.showInputNode(true);
		this.justfocused = true;
	},
	
	_onCompositionEnd: function(event) 
	{
		this.inherited(arguments);
		
		if (document.activeElement === this._inputFrame && !this.justfocused){
			this._inputNode.blur();
			this._inputNode.focus();
			this.justfocused = true;
		}

		pe.lotusEditor.undoManager.imeCommit(true);
		this._insertText(event.data, false);
		pe.lotusEditor.undoManager.imeCommit(false);
		dojo.stopEvent( event );
	}
});

/*
 * For IE browsers, use keypress event to get input from ascii,
 * use compositionend to get input from IME
 */
dojo.declare("writer.controller.TridentKeyImpl", writer.controller.KeyImpl, {
	_onKeyPress: function(event)
	{
		this.inherited(arguments);
		
		if(event.charCode > 0 && (event.charCode > 127 || this._isNormalKey(event)) )
		{
			var text = String.fromCharCode(event.charCode);
			this._insertText(text, false);
			dojo.stopEvent( event );
		}
	},
	
	_onKeyDown: function(event)
	{
		var handled = this.inherited(arguments);
		
		if (handled) return;
		var notShowInputNode = false;
		if(common.tools.isWin8() && dojo.isIE && dojo.isIE >= 10 && event.shiftKey)
			notShowInputNode = true;
		if(event.keyCode == 229 && !notShowInputNode)
			this.showInputNode(true);
	},
	
	_onCompositionEnd: function(event) 
	{
		this.inherited(arguments);
		
		pe.lotusEditor.undoManager.imeCommit(true);
		var input = event.data;
		if(dojo.isIE >= 10)
			input = this._getInput();
//		if (common.tools.isWin7() && dojo.isIE >= 11)
//			input = this._getInput();
//		else if (common.tools.isWin8() && dojo.isIE >= 11) {
//			input = this._getInput();
//		}
		this._insertText(input, false);
		pe.lotusEditor.undoManager.imeCommit(false);
		dojo.stopEvent( event );
	}
});
