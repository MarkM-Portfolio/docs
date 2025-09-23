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

dojo.provide("websheet.widget.InlineEditor");

dojo.require("websheet.widget.AutoCompleteMixin");
dojo.require("websheet.widget.AutoCompleteProvider");
dojo.require("websheet.widget.RangeHighlightProvider");
dojo.require("websheet.widget.InlineEditorMixin");
dojo.require("websheet.widget.FormulaInputHelper");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.browser");
dojo.requireLocalization("websheet", "base");

dojo.declare('websheet.widget.InlineEditor', 
		[dijit._Widget, dijit._Templated, websheet.widget.AutoCompleteMixin, 
		 websheet.widget._EditorStylePositionMixin, websheet.widget._EditorMessageListener],
{
    "class": "inline-editor inline-editor-border",
    baseClass			:	"",
    conflictClass		:	"conflict-removed", //show red border to notify user the cell  editing has been removed (by other users).
    ONPASTE_EVENT		:	"EDITOR_ON_PASTE",
    templateString		:	"<div class='input-box' dojoAttachPoint='focusNode,textbox,containerNode, inputBox' contenteditable='true' tabindex = '-1'></div>",
    keyEvents			:	['keyup', 'keydown', 'keypress'],
	mouseEvents			:	['mouseover', 'mouseout', 'mousedown', 'mousewheel', 'mouseup', 'click', 'dblclick', 'contextmenu'],
	formEvents			:	['input', 'paste', 'compositionstart', 'compositionupdate', 'compositionend', 'blur', 'focus'],
	
    data				:	null, //data concentrator
    grid				:	null, //currently attached grid, should dispatch event to this grid
    editGrid			:	null, //used in cross-sheet editing (formula editing case), usually this should keep the same with 'grid'
    cellIndicator		:	null, //Display the cell address(currently editing) to user WHEN NECESSARY
    
	formulaAssist		:	null, //displayed a formula list when user type function names; and show formula arguments helper when type arguments.
	
	_isEditing			:	null,
	_isPreEditing		:	null, //if true, inline-editor is in PREEDIT mode, let pass all the keyboard events in this case.
	_isIMETyping		:	null, //if true, do not reformat the content in editor (when editing formula cells).
	_isFocused			:	false,
	_isChanged			:	false,//we should hide the cell indicator when grid scroll back to the original editing position, but don't do this if isChanged is set true (co-editing)
	_isRemoved			:	false,//the editing cell has been removed
	_isHidden			:	false,//the editing cell has been hidden due to hide sheet operation and similar opts
	_isCovered			:	false,//the editing box is (most likely) temporary 'hidden' with z-index?
	_applyOnUncover		:	false,//should apply the editing when uncover, the apply may be delayed to the uncover stage in some case for example, editing and use tool bar menu to set border (three steps).
	_preventCover		:	false,//Some case do not cover the inline-editor even when modal dialog shown or some popups shown.
	_lastSelection		:	null, //keep the last selection of inlineEditor
	
	editor				: 	null,
	_cellCache			:	null, //cached editing cell model, improve the access to formula cells.
	_highlightProvider	:	null, //formula highlight
	_highlights			:	null, //highlights for formula editing.
	_formulaBar			:	null, //may be null
	
	_suspend			:	false, //suspend inline-editor to prevent it from applying edit, we need this flag to make sure the editor will not be applied(affected) in some cases (such as executing some commands). 
	
	_movePicker4Arrow	:	false, //if true, try to move the range picker when receive arrow keys when editing formulas.
	
	_editRowIndex		:	null, // This _editRowIndex, _editColIndex will be used to keep track of the editing cell index of the edit grid.
	_editColIndex		:	null, // These indexes will be updated when co-editing.
    
    /* *********************************	Initialize & destroy	******************************** */
	postCreate: function ()
    {
        this.inherited(arguments);
        this.controller = this.editor.getController();
        this._highlightProvider = this.controller.getHighlightProvider();
        this._formulaBar = this.editor.getFormulaBar();
        dojo.style(this.inputBox, {
        	'width'		: this.DEFAULT_WIDTH,
        	'height'	: this.DEFAULT_HEIGHT,
        	'display'	: 'none',
        	'margin'	:	'0'
        });
        websheet.Utils.setSelectable(this.inputBox, true);
        //form control must have associated text
        dijit.setWaiState(this.inputBox, "label", dojo.i18n.getLocalization("websheet", "base").acc_grid_inlineEditor);
        
        this._createWidgets();
        this._connectEvents();
        this.startListening(this.controller);
    },
    
    postApply: function (result) {
    	var editRow = this.getEditRowIndex();
		var editCol = this.getEditColIndex();
    	if (result.success) {
    		this.editGrid.updateRow(editRow);
    		if (this.isCrossSheetEditing()) {
    			//If is cross sheet editing, switch focus back to the edit grid
        		this.editor.setFocus(websheet.Helper.getCellAddr(this.getEditSheet(), editRow + 1, editCol));
    		}
    		// success on apply;
    		this.editingComplete();
    		// hide inline editor
    		this.clearCursorSelection();
    		if (this.isShow()) {
    			this.hide();
    		}
    		if (this.editor.autoCompleteProvider) {
    			this.editor.autoCompleteProvider.reset();
    		}
    		if (this.editGrid.selection.selector().sleeping()) {
    			this.editGrid.selection.select();
    		}
    	} else if(result.cancel){
    		this.cancel();
    	} else if(result.retry){
    		var inlineEditor = this;
    		setTimeout(function(){
				inlineEditor.focus();
				inlineEditor.collapseToEnd();
			}, 400);
    	} else {
    		this.collapseToEnd();
    	}
    	return result;//success or not
    },
    
    
    _createWidgets: function()
    {
    	//Create the cell indicator
    	this.cellIndicator = new websheet.widget._cellIndicator(this);
    	//Create formula suggestion
    	this.formulaAssist = new websheet.widget.FormulaInputHelper(this);
    },
    
    getNameListener:function(){
    	return this.formulaAssist._store;
    },
    
    _connectEvents: function()
    {
    	var evts = this.mouseEvents.concat(this.keyEvents).concat(this.formEvents);
    	for (var i=0, l=evts.length; i<l; i++){
			this.connect(this.inputBox, 'on' + evts[i], this.dispatchEvents);
		}
    	//IE, dojo.connect can not handle the composition events, use addEventListener instead, 
    	if(dojo.isIE)//auto-complete related.
        {
        	this._ieIMEhandler = dojo.hitch(this, this._oncompositionend);
            this.inputBox.addEventListener('compositionend', this._ieIMEhandler, false);
        }
    	this.connect(dijit.Dialog._DialogLevelManager, 'show', dojo.hitch(this, function(){
    		if (this._isEditing && !this._isCovered && this._hasDialogs()) {
    			this.cover();
    		}
    	}));
    	this.connect(dijit.Dialog._DialogLevelManager, 'hide', dojo.hitch(this, function(){
    		if (this._isEditing && this._isCovered && !this._hasDialogs()) {
    			this.uncover();
    		}
    	}));
    	this.connect(dijit.popup, 'open', dojo.hitch(this, function(){
    		var hasPopups = this._hasPopups();
    		if(this._isEditing && !this._isCovered && hasPopups)
    			this.cover();
    	}));
    	this.connect(dijit.popup, 'hide', dojo.hitch(this, function(){
    		if(this._isEditing && this._isCovered && !this._hasPopups() && !this._hasDialogs())
    			setTimeout(dojo.hitch(this, function(){
    				if(!this._hasPopups() && !this._hasDialogs()) this.uncover();
    				}),100); //timeout to avoid conflict with dojo popup's animation delay.
    	}));
    	// 52750: Docs should not respond to drop an image in the inline editor
    	dojo.connect(this.domNode, "drop", function (e) {
    		dojo.stopEvent(e);
    	});
    },

    // InlineEditor is a Singleton, remove this 'destroy' to prevent it triggered with
    // dojo widgets left-cycle management. 
//    _destroy_: function()
//    {
//    	this.endListening(this.controller);
//    	if(this._ieIMEhandler && this.inputBox.removeEventListener)
//    	{
//    		this.inputBox.removeEventListener('compositionend', this._ieIMEhandler , false);
//    	}
//    	this.inherited(arguments);
//    	this.cellIndicator && this.cellIndicator.destroy();
//    	this.formulaAssist && this.formulaAssist.destroy();
//    },

    /* *********************************	Events Handle	******************************** */
    dispatchEvents: function(e)
    {
    	var d = '_on' + e.type;
    	if(d in this)
    		return this[d](e);
    },
    
    _onkeydown: function(e)
    {
    	if(this.formulaAssist.dispatchEvent(e)){
    		return dojo.stopEvent(e);
    	}
    	var dk = dojo.keys;
    	//Ctrl + 'V' to paste, firefox old version(22 and earlier) does not support clipboard data in paste event, so use this work around.
    	if(dojo.isFF < 23 && ((e.ctrlKey || e.commandKey) && ('V'.charCodeAt(0) == e.keyCode|| 'v'.charCodeAt(0) == e.keyCode)) || (e.shiftKey && e.keyCode == dk.INSERT))
    	{
    		if(!this._pasteContainer)
	        	this._pasteContainer = dojo.create('textarea', { style:{ position : 'absolute', top: '0px', left: '0px', zIndex: -10 , tabindex : "-1"}}, dojo.body());
    		this._pasteContainer.value = '';
    		//backup current cursor selection.
    		this.getInputTextSelection(true);
    		var selection = window.getSelection(), range = selection.getRangeAt(0);
    		if (!selection.isCollapsed)
    		{
    			//if any text selected, delete them, and update the cursor selection.
    			selection.deleteFromDocument();
    			this._lastSelection.start = Math.min(this._lastSelection.start, this._lastSelection.end);
    			this._lastSelection.end = this._lastSelection.start;
    		}
        	this._pasteContainer.focus();
        	setTimeout(dojo.hitch(this, function(){
        		var text = this._pasteContainer.value;//get paste data,
        		this.restoreCursorSelection();//restore cursor selection and paste data into the position.
        		var selection = window.getSelection(), range = selection.getRangeAt(0);
        		var textNode = document.createTextNode(text);
        		range.insertNode(textNode);
        		try{
        			selection.collapse(textNode, textNode.length);
        		} catch(e){}
        		this.adjustBoundary();
        	}),0);
    		return;
    	}
    	//Page UP/DOWN in editor, FF and chrome have some issues, we have to write our own.
    	if(this._isEditing && (e.keyCode == dk.PAGE_UP || e.keyCode == dk.PAGE_DOWN) && !this.grid.isCtrlPressed(e))
    	{
    		//shift + ctrl + pageup/down are switch sheet short-cuts for chrome,
        	if(dojo.isChrome && e.shiftKey) return;
        	dojo.stopEvent(e);
    		if(e.keyCode == dk.PAGE_UP)
    		{
    			this.collapseToStart();
    			this.inputBox.scrollTop = 0;
    		}
    		else
    		{
    			this.collapseToEnd();
    			this.inputBox.scrollTop = this.inputBox.scrollHeight;
    		}
    	}
    	if(this._isEditing && dojo.isChrome && this._toClearContent(e))
    	{
    		//The 'Top level DOM event takes more than 1000ms in this case for Chrome!
			//No idea why this happens, we clear the content ourselves and stop the event to prevent chrome from handling it.
			dojo.stopEvent(e);
			this.inputBox.textContent = '';
			return;
    	}
    	//if it's receiving IME input, should stop reformat the formula content when the keyUp phase.
    	if (e.keyCode == 229 || e.keyCode == 197)
        	this._isIMETyping = true;
        else
        	this._isIMETyping = false;
    	if(dojo.isMac && dojo.isChrome)
    	{
    		//To make some short-cuts work on these browsers, while combined key-press events are not triggered sometimes.
    		//It seems like webkit browsers are more likely to have these problems.
    		return this._onkeypress(e);
    	}
    	if (((e.keyCode == dk.ENTER) && (e.altKey || e.ctrlKey || e.metaKey)) || e.keyCode == 10/*IE, 10 means CtrL + ENTER*/) {
    		if (this._isEditing && !this._brtimer) {
    			this._brtimer = setTimeout(dojo.hitch(this, this._insertLineBreak), 10);
    			return dojo.stopEvent(e);
    		}
    	}
    	this.grid.dispatchKeyEvents(e);
    },
    
    _onkeypress: function(e)
    {
    	if(this._isPreEditing)
    		return this.grid.dispatchKeyEvents(e);
    	 
    	//type ahead
    	this._onKey(e);
    	//If it's browser shortcut, stop it.
    	this._blockBrowserShortcut(e);
    	//if it's receiving IME input, should stop reformat the formula content when the keyUp phase.
        if (e.keyCode == 229 || e.keyCode == 197)
        	this._isIMETyping = true;
        if(this._isEditing && (e.ctrlKey || e.metaKey) && (!dojo.isIE || !e.altKey) && e.keyChar && e.keyChar.toLowerCase() == 'z')
        {
        	return dojo.stopEvent(e); //block the default undo in the editor div.
        }
        if(e.keyChar != "" /*|| (dojo.isWebKit && this._isIMETyping)*/) this.adjustBoundary(); //type in & adjust boundary
        //respond to "alt+enter", create a <br> and insert it into the proper position.
        var dk = dojo.keys;
        if (((e.keyCode == dk.ENTER) && (e.altKey || e.ctrlKey || e.metaKey)) || e.keyCode == 10/*IE, 10 means CtrL + ENTER*/)
        {
            if (this._brtimer) {
            	return;
            } else {
            	this._insertLineBreak();
            }
            //Stop to prevent some browser (Safari) to append "Enter" to make an additional linebreak.
            if(dojo.isWebKit)
            {
            	dojo.stopEvent(e);
            }
        }
        else if(dojo.isWebKit)
        {
        	setTimeout(dojo.hitch(this, function(e){
        		var last = this.inputBox.lastChild;
        		if(last && (!last.tagName || last.tagName.toLowerCase() != 'br'))
        		{
        			this.inputBox.appendChild(dojo.create('br'));
        		}
         	}),20);
        }
        else if(dojo.isFF && this._toClearContent(e))
        {
        	//Delete the last content, FF sometimes insert a <br> into the div,
    		setTimeout(dojo.hitch(this, function(e){
    			for(var idx = 0; idx < this.inputBox.childNodes.length; idx++)
    			{
    				var n = this.inputBox.childNodes[idx];
    				if(n &&  n.getAttribute && n.getAttribute('type' == '_moz'))
    					n.remove();
    				else if(n && n.tagName && n.tagName.toLowerCase() == 'br')
    				{
    					n.remove();
    					this.adjustBoundary();
    				}
    			}
    			//add an empty text node, otherwise the cursor will exceeds the editor box.
    			if(this.inputBox.childNodes.length == 0)
    				this.inputBox.appendChild(document.createTextNode(''));
          	}),0);
        }
        this.grid.dispatchKeyEvents(e);
    },
    
    _onkeyup: function(e)
    {
    	if(this._isPreEditing)
    		return this.grid.dispatchKeyEvents(e);
    	
    	if(this._isIMETyping) return;
    	//1. Handles editor key up event in order to support 'contextual' typing mode
    	if (!this.inputBox.dir && BidiUtils.isBidiOn()){
            this.inputBox.style.direction = BidiUtils.isTextRtl(this.inputBox.innerHTML) ? "rtl" : "ltr";		
            this.inputBox.style.textAlign = (this.inputBox.style.direction === 'rtl') ? 'right' : 'left';
        }
    	//2. if editing formula cell, re-format the content in current inline-editor box.
        var currentContent = this.inputBox.textContent;
    	var bFormula = (currentContent.indexOf("=") == 0) || (this._lastValue && this._lastValue.indexOf("=") == 0);
    	if(bFormula)
    	{
    		var reFormat = false;
    		if(!this._lastValue)
    		{
    			this._lastValue = this.inputBox.textContent;
    			reFormat = true;
    		}
    		else if(this._lastValue != this.inputBox.textContent)
    		{
    			this._lastValue = this.inputBox.textContent;
    			reFormat = true;
    		}
    		if(reFormat)
    		{
    			if(this._reformatTimer)
    			{
    				clearTimeout(this._reformatTimer);
    			}
    			this._reformatTimer = setTimeout(dojo.hitch(this, function(){
    				if(document.activeElement == this.inputBox)
    				{
    					this.getInputTextSelection(true);
        				this.setValue(this.getValue());
        				this.restoreCursorSelection();
    				}
    			}), 200);
    		}
    	}
    	// 3. backup current cursor position
    	this.getInputTextSelection(true);
    	
    	this.grid.dispatchKeyEvents(e);
    	// 4. anything else need to do here?
    },
    
    _onmousedown: function(e){	
    	this._movePicker4Arrow = false;	
    },
    
    _onmouseover: function(e){},
    _onmouseout: function(e){},
    
    _onmouseup: function(e){ 
    	this.getInputTextSelection(true); 
    	this.formulaAssist.dropHelpInfo(this.getValue(), this.getBackupSelection().end, null, this.inputBox);
    },
    _onmousewheel: function(e)
    {
    	this.grid.onMouseWheel(e);
    },
    
    _onclick: function(e){},
    _ondblclick: function(e){},
    _oncontextmenu: function(e){},
    
    _onpaste: function(e)
    {
    	if(this._isEditing)
    	{
    		var iePasteText, webkitPasteText;
	        if (window.clipboardData)
	        {
	            iePasteText = window.clipboardData.getData('Text');
	        }
	        if (e && e.clipboardData)
	        {
	            webkitPasteText = e.clipboardData.getData("text/plain");
	        }
	        var text = dojo.isIE ? iePasteText : webkitPasteText;
	        if(text)
	        {
	        	 var selection = window.getSelection(), range = selection.getRangeAt(0);
	        	 if (!selection.isCollapsed)
	             	selection.deleteFromDocument();
	        	 if (dojo.isChrome) {
	        		 // for chrome 37+, in this special case the container is a <br> that we inserted.
	        		 var container = range.commonAncestorContainer;
	        		 if (container.tagName && container.tagName.toLowerCase() == "br") {
	        			 var before = document.createTextNode('');
	        			 dojo.place(before, container, 'before');
	        			 range = document.createRange();
	        			 range.setStart(before, 0);
	        			 range.setEnd(before, 0);
	        		}
	            }
	        	 var textNode = document.createTextNode(text.replace(/\r\n/gm, '\n'));
	        	 range.insertNode(textNode);
	        	 try{
	        		 selection.collapse(textNode, textNode.length);
	        	 }catch(e){}
	        	 this.adjustBoundary();
	        }
	        dojo.stopEvent(e);
    	}
        else if (dojo.isWebKit)
        {
        	if (this.editor.scene.supportInCurrMode(commandOperate.PASTE)) {
        		dojo.publish(this.ONPASTE_EVENT, [e]);
        	}
        }
    },

    _oncompositionstart: function(e)
    {
    	if (dojo.isFF && !this.isEditing()) {
    		this.editingStart();
    	}
    },

    _oncompositionupdate: function(e)
    {
    	this._oncompositionend(e);
    },
    
    _oncompositionend: function(e)
    {
        this.grid.pre2Edit = false; //close for IME inputs to prevent Grid from handling the following keypress ASC letters.
        if(!this._pendingBoundaryAdjust)
        {
        	this._pendingBoundaryAdjust = setTimeout(dojo.hitch(this, function(){
        		this.adjustBoundary();
        		this._pendingBoundaryAdjust = null;
        	}), 10);
        }
    },
    
    _onblur: function(e) {	this._isFocused = false;	},
    
    _onfocus: function(e)
    {
    	this._isFocused = true;
    },
    
    //overwrite, not necessary to adjust boundary when pre-editing
    _onInput: function (evt)
    {
    	if(this._isPreEditing)
    		return;
    	this.adjustBoundary();
    },
    
    // These rich text short-cuts are not supported, prevent browser from handling.
    _blockBrowserShortcut: function (e)
    {
        var isShortcut = false;
        if ((dojo.isMac && e.metaKey) || e.ctrlKey)
        {
            var c = e.keyChar;
            switch (c)
            {
            case "i": case "I": 
            case "u": case "U":/*View Source Code*/
            case "b": case "B": /*Bookmark*/ 
            	isShortcut = true;
                break;
            default:
                break;
            }
        }
        if (isShortcut)
        {
            e.preventDefault();
            return true;
        }
        return false;
    },
    /* *********************************	Message handler	******************************** */
    _onInsertRow: function(sheet, startRow, endRow)
    {
    	var eventGrid = this.controller.getGrid(sheet.getSheetName());
    	if(eventGrid == this.editGrid)
    	{
    		var editRow = this.getEditRowIndex() + 1, editCol = this.getEditColIndex();
    		if(startRow <= editRow)
    		{
    			this._releaseLockedCell();
    			var insertCount = endRow - startRow + 1;
    			if(editRow + insertCount >= this.editor.getMaxRow())
    			{
    				this._isRemoved = true;
    			}
    			else
    			{
    				this._changeEditIndex(editRow + insertCount, null);
    				this._lockEditCell();
    			}
    			this.updateCellIndicator();
    			this.cellIndicator.glowing();
    		}
    	}
    },
    
    _onDeleteRow: function(sheet, startRow, endRow)
    {
    	var eventGrid = this.controller.getGrid(sheet.getSheetName());
    	if(eventGrid == this.editGrid)
    	{
    		var editRow = this.getEditRowIndex() + 1, editCol = this.getEditColIndex();
    		if(endRow < editRow)
    		{
    			this._releaseLockedCell();
    			this._changeEditIndex(editRow - endRow + startRow - 1, null);
    			this._lockEditCell();
    		}
    		else if(startRow <= editRow && endRow >= editRow)
    		{
    			this._releaseLockedCell();
    			this._isRemoved = true;
    		}
    	}
    	if(this._isRemoved || this._isChanged)
    	{
    		this.updateCellIndicator();
    		this.cellIndicator.glowing();
    	}
    },
    
    _onInsertCol: function(sheet, startCol, endCol)
    {
    	var eventGrid = this.controller.getGrid(sheet.getSheetName());
    	if(eventGrid == this.editGrid)
    	{
    		var editRow = this.getEditRowIndex(), editCol = this.getEditColIndex();
    		if(startCol <= editCol)
    		{
    			this._releaseLockedCell();
    			var insertCount = endCol - startCol + 1;
    			if(editCol + insertCount > websheet.Constant.MaxColumnIndex)
    			{
    				this._isRemoved = true;
    			}
    			else
    			{
    				this._changeEditIndex(null, editCol + insertCount);
    				this._lockEditCell();
    			}
    			this.updateCellIndicator();
    			this.cellIndicator.glowing();
    		}
    	}
    },
    
    _onDeleteCol: function(sheet, startCol, endCol)
    {
    	var eventGrid = this.controller.getGrid(sheet.getSheetName());
    	if(eventGrid == this.editGrid)
    	{
    		var editRow = this.getEditRowIndex(), editCol = this.getEditColIndex();
    		if(endCol < editCol)
    		{
    			this._releaseLockedCell();
    			this._changeEditIndex(null, editCol - endCol + startCol - 1);
    			this._lockEditCell();
    		}
    		else if(startCol <= editCol && endCol >= editCol)
    		{
    			this._releaseLockedCell();
    			this._isRemoved = true;
    		}
    	}
    	if(this._isRemoved || this._isChanged)
    	{
    		this.updateCellIndicator();
    		this.cellIndicator.glowing();
    	}
    },
    
    _onRenameSheet: function(sheet)
    {
    	var eventGrid = this.controller.getGrid(sheet.getSheetName());
    	if(eventGrid == this.editGrid && this.isCrossSheetEditing())
    	{
    		this.updateCellIndicator(true);
    		this.cellIndicator.glowing();
    	}
    },
    
    _onDeleteSheet: function(sheet)
    {
    	var eventGrid = this.controller.getGrid(sheet.getSheetName());
    	if(eventGrid == this.editGrid)
    		this._isRemoved = true;
    	if(this._isRemoved)
    	{
    		this.updateCellIndicator();
    		this._releaseLockedCell();
    		this.cellIndicator.glowing();
    	}
    },
    
    _onHideSheet: function(sheet)
    {
    	var eventGrid = this.controller.getGrid(sheet.getSheetName());
    	if(eventGrid == this.editGrid)
    		this._isHidden = true;
    	if(this._isHidden)
    	{
    		this.updateCellIndicator();
    		this.cellIndicator.glowing();
    	}
    },
    
    _onSort: function(sheetName, startRow, endRow, startCol, endCol, data)
    {
    	var eventGrid = this.controller.getGrid(sheetName);
    	if(eventGrid == this.editGrid)
    	{
    		var editRow = this.getEditRowIndex() + 1, editCol = this.getEditColIndex();
    		if(startRow <= editRow && endRow >= editRow && startCol <= editCol && endCol >= editCol)
    		{
    			var offset = editRow - startRow, to = offset;
    			dojo.forEach(data.sortresults, function(n, index){
    				if(n == offset)
    					to = index;
    			});
    			if(to != offset)
    			{
    				this._releaseLockedCell();
    				this._changeEditIndex(startRow + to, null);
    				this._lockEditCell();
    				this.cellIndicator.glowing();
    			}
    		}
    	}
    	(this._isChanged) && this.updateCellIndicator();
    },
    
    _onMerge: function(sheetName, startRow, endRow, startCol, endCol)
    {
    	var eventGrid = this.controller.getGrid(sheetName);
    	if(eventGrid == this.editGrid)
    	{
    		var editRow = this.getEditRowIndex() + 1, editCol = this.getEditColIndex();
    		if(startRow <= editRow && endRow >= editRow && startCol <= editCol && endCol >= editCol)
    		{
    			if (startCol == editCol && startRow == editRow) {
    				//is editing the master cell, just return
    				return;
    			}
    			this._isRemoved = true;
    			this._releaseLockedCell();
    			this.updateCellIndicator();
    			this.cellIndicator.glowing();
    		}
    	}
    },
    
    _onFilter: function()
    {},
    
    /* *********************************	Functional	******************************** */
    apply: function()
    {
    	if(!this._isEditing) 
    		return true;
    	if(this._suspend) 
    		return false;
    	if(this._isCovered)
    		return this._applyOnUncover = true;
    	
    	this.grid.selection.picker().complete();
    	if (!this._isRemoved) {
    		// Success path to apply cell editing.
    		var editGrid = this.editGrid;
    		var editRow = this.getEditRowIndex();
    		var editCol = this.getEditColIndex();
    		// 1. First, we need to clear the editing indicats in the widget layer.
    		// (TODO, here currently we have not enable this feature.)
    		// 2. Get the apply value
    		var acp = this.editor.autoCompleteProvider;
			//apply the inline editor's value.
			var inValue = this.getValue();
			if(acp && acp._lastCandidate && inValue && acp._lastCandidate.toLowerCase() == inValue.toLowerCase()) {
				inValue = acp._lastCandidate;
			}
			this._releaseLockedCell();
			// 3. check the sheet is exist & apply
			if (this.editor.getDocumentObj().isSheetExist(this.getEditSheet())){
				if (this.editor.scene.supportInCurrMode(commandOperate.CELLEDIT)) {
					// success or not based on result of execCommand, if not success we will not hide the editor;
					var promise = this.editor.execCommand(commandOperate.CELLEDIT, [this.getEditSheet(), inValue, editRow, editCol]);
					if (promise) {
						return promise.then(dojo.hitch(this, "postApply"));
					} else {
						promise = new dojo.Deferred();
						promise.then(dojo.hitch(this, "postApply"));
						promise.resolve({
							success : false
						});
						return promise;
					}
				}
			}
    	}
    	else
    	{
    		if(this._formulaBar) this._formulaBar.setFormulaInputLineValue("");
    		return this.cellIndicator.glowing();
    	}
    },
    
    backupCursorSelection: function (selection)
    {
        if (!this._lastSelection || selection)
        {
            this._lastSelection = selection || this.getInputTextSelection();
        }
    },
    
    clearCursorSelection: function ()
    {
        this._lastSelection = null;
    },
    
    collapseToStart: function()
    {
    	//Summary: Collapse selection!!! move cursor to the "start of edit content"
    	var selection = window.getSelection(),	first = this.inputBox.firstChild;
    	if(!first)	
    		this.inputBox.focus();
    	else {
    		try{
    			selection.collapse(first, 0);
    		} catch(e){}
    	}
    	this._lastSelection = {start : 0, end: 0};
    },
    
    collapseToEnd: function ()
    {	
    	//Summary: Collapse selection!!! move cursor to the "end of edit content".
    	var selection = window.getSelection(),	end = this.inputBox.lastChild;
    	if(!end)
    		this.inputBox.focus();
    	else
    	{
    		try {
    			selection.collapse(end, end.length || 0);
    		} catch(e){
    			
    		}
    		
    		var cl = this.inputBox.textContent.length;
    		this._lastSelection = {start : cl, end : cl};
    	}
    },
    
    cover: function()
    {
    	//Summary: In some cases we do not want to apply the the editing, but we need to hide the editor-box, call uncover to show out again.
    	if(this._preventCover)
    		return (this._applyOnUncover = false);
    	dojo.style(this.inputBox, 'zIndex', -1);
    	this.cellIndicator.hide();
    	this._isCovered = true;
    	this._applyOnUncover = false;
    	this.formulaAssist.cover();
    },
    
    cancel: function()
    {
    	if (this.editGrid) 
    	{
    		this._releaseLockedCell();
    		var refValue = null;
    		if(this.isCrossSheetEditing())
    		{
    			 refValue = websheet.Helper.getCellAddr(this.getEditSheet(), this._editRowIndex + 1, this._editColIndex);
    		}
    		if (refValue)
    			this.editor.setFocus(refValue);
    		this.grid.focus();
    		//hide inline editor
    		this.clearCursorSelection();
    		if (this.isShow()) {
    			this.hide();
    		}
    		if (this.editor.autoCompleteProvider) {
    			this.editor.autoCompleteProvider.reset();
    		}
    	} 
    	else
    	{
    		// currently not editing, directly hide myself.
    		this.hide();
    	}
    	this.grid.selection.picker().complete();
    	this.grid.selection.selector().enableAutofill().enableMover().render();
    },
    
    focus: function ()
    {
    	this.inputBox.focus();
    },
    
    // bNotKeyPress means not input the content, such as LEFT/RIGHT ARROW, DELETE, etc
    formatValue: function(value, bNotKeyPress, cursor)
    {
    	var html = value || "", ranges = null;
    	if (html.indexOf("=") == 0)
    	{
    		var aroundNode;
    		if(this._formulaBar && (document.activeElement == this._formulaBar.formulaInputLineNode)){
    			if(cursor == null)
    				cursor = this._formulaBar.getInputTextSelectionPositon().end;
    			aroundNode = this._formulaBar.formulaInputLineNode;
    		}else{
    			if(cursor == null)
    				cursor = this.getBackupSelection().end;
    			aroundNode = this.inputBox;
    		}
    		var prefer = null;
    		if(!bNotKeyPress)
    			prefer = 'type';
    		this.formulaAssist.dropHelpInfo(value, cursor, prefer, aroundNode);
    		var _ranges = this._highlightProvider.getHighlightsByLexerTokens(this.formulaAssist.getCurrentTokens());
			ranges = _ranges.sort(function(p, l){	return p.index - l.index;	});
			var /*char index*/_cIdx = 0, /*range index*/_rIdx = 0, _html = [];
			while( _cIdx < html.length )
			{
				if(_rIdx < ranges.length)
				{
					var _highlight = ranges[_rIdx];
					var /*split index*/_sIdx = _highlight.index, length = _highlight.token.length;
					if(_sIdx == null)
					{
						//it's a name range
						_sIdx = _highlight._tokenIndex, length = _highlight.getId().length;
					}
					_html.push(this._escape(value.substring(_cIdx, _sIdx)));
					_html.push('<span style="color:');
					_html.push(this._highlightProvider.getColorByIndex(_rIdx));
					_html.push('">');
					_html.push(_highlight.token);
					_html.push('</span>');
					//last
					_rIdx++,_cIdx = _sIdx + length;
				}
				else
				{
					_html.push(this._escape(value.substr(_cIdx)));
					break;
				}
			}
			html = _html.join('');
    	}
    	else
    	{
    		this._cellCache = null;
    		//It's a normal cell with text content, escpase and return;
    		html = this._escape(html);
    	}
    	return {html: html, rangeList: ranges};
    },
    
    getBackupSelection: function ()
    {
    	// Summary: return the backuped cursor selection status
        return this._lastSelection || (this._lastSelection = {start: 0, end: 0});
    },
    
    getEditRowIndex: function()
    {
    	// Summary: return the editor's int edit index rowIndex (0-based), columnIndex (1-based)
    	if(this._isEditing && !this._isRemoved)
    		return this._editRowIndex;
    	return -1;
    },
    
    getEditColIndex: function()
    {
    	if(this._isEditing && !this._isRemoved)
    		return this._editColIndex;
    	return -1;
    },
    
    getEditSheet: function()
    {
    	if(this._isEditing && this.editGrid)
    		return this.editGrid.sheetName;
    	else
    		return this.grid.sheetName;
    },
    
    getEditGrid: function () {
    	return this.editGrid;
    },
    
    getDocumentObj: function() {
    	return this.editor.getDocumentObj();
    },
    
    getInputTextSelection: function(backupSelection)
    {
    	var start = 0, end = 0;
    	var sel = window.getSelection();
    	var nodes = this.inputBox.childNodes;
    	// We can not get a seletoin from an inactive editable node, use the previrously backuped one.
    	if(document.activeElement != this.inputBox || (sel.type && sel.type.toLowerCase() == "none"))
    	{
    		//First use the previous selection status in formula inputline, then use the inline'editor's previous backup selection.
    		var preSelection = this._formulaBar ? this._formulaBar._backupedSelection : null;
    		if(preSelection)
    			this.backupCursorSelection(preSelection);
    		return this.getBackupSelection();
    	}
    	if(this._isEditing)
    	{
    		if(sel.anchorNode == this.inputBox || sel.focusNode == this.inputBox)
    		{
    			if(sel.isCollapsed && dojo.isIE < 10)
    				start = end = (this.getValue().length);
    			else
    			{
    				var anchorOffset = sel.anchorOffset, focusOffset = sel.focusOffset, nlength = nodes.length;
    				if(anchorOffset == 0)
    				{
    					start = end = 0;
    				}
    				else
    				{
    					var fnode = nodes[anchorOffset - 1];
        				if(fnode)
        				{
        					for(var i = 0; i < nlength; i++)
            				{
        						var node = nodes[i];
        						start += node.textContent.length;
            					if(node == fnode)
            						break;
            				}
        					end = start;
        				}
        				else
        					//incase the entire node is selected, this may happen if user press ctrl + a in some browsers.
        					start = 0, end = this.getValue().length;
    				}
    			}
    		}
    		else
    		{
    			var nlength = nodes.length, startLocked = endLocked = false;
    			//incase focusNode's index may be smaller than anchorNode's index for some kind of selection in specific browsers.
    			//lock the start/end index after locate them, and quit when they're both locked(located).
    			for(var i = 0; i < nlength && (!startLocked || !endLocked); i++)
        		{
        			var node = nodes[i], n_length = (node.tagName && node.tagName.toLowerCase() == "br" ? 1 : node.textContent.length);
        			//the span node is the highlighted node, not likely to be the focusedNode or anchoredNode, use it's child node instread, expecting a text node.
        			if(node.tagName && node.tagName.toLowerCase() == "span")
        				node = node.firstChild;
        			if(!node || node.data == null)
        			{
        				start += n_length;
        				end += n_length;
        				continue;
        			}
        			if(node != sel.anchorNode && !startLocked)
        			{
        				start += n_length;
        			}
        			else if( node == sel.anchorNode && !startLocked)
        			{
        				start += sel.anchorOffset;
        				startLocked = true;
        			}
        			if( node != sel.focusNode && !endLocked)
        			{
        				end += n_length;
        			}
        			else if(node == sel.focusNode && !endLocked)
        			{
        				end += sel.focusOffset;
        				endLocked = true;
        			}
        		}
    		}
    	}
    	if(backupSelection)
    		this._lastSelection = {start: start, end: end};
		return {start: start, end: end};
    },
    
    getNode: function ()
    {
    	// Summary: return the editor's DOM node.
        return this.inputBox;
    },
    
    getValue: function ()
    {
    	// Summary: get the edit value of the editor, 'br' will be replaced with '\n'(some special 'br' will not).
        var value = [], nodes = this.inputBox.childNodes;
        dojo.forEach(nodes, function(node, index){
        	if(node.tagName && node.tagName.toLowerCase() == "br" && !(dojo.isWebKit && index == nodes.length - 1) && !(node.getAttribute('type') == '_moz'))
        		value.push("\n");
        	else
        		value.push(node.textContent);
        });
        value = value.join('');
        if(dojo.isIE)
        {
        	value = value.replace(/\u00a0/gm, "\u0020");
        }
        return value;
    },
    
    hide: function ()
    {
    	// Summary: Hide the inline inputbox when cell is leave editing mode, clear the value and lost focus when hide it.
    	this.inputBox.blur();
        this.inputBox.style.display = "none";
        this._highlightProvider.removeHighlight(this._highlights);
        this.reset();
        if(this._isCovered) this.uncover();
        this.updateCellIndicator();
        this.formulaAssist.closeHelpInfo();
    },
    
    isCrossSheetEditing: function()
    {
    	return this._isEditing && (this.editGrid != this.grid);
    },
    
    isCovered:function()
    {
    	return this._isCovered;
    },
    
    isEditingFormula: function()
    {
    	return this._isEditing && (this.inputBox.textContent.indexOf("=") == 0) && !this._isRemoved;
    },
    
    isEditSheetHidden: function()
    {
    	return this._isHidden;
    },
    
    isEditCellRemoved: function()
    {
    	return this._isRemoved;
    },
    
    isEditing: function ()
    {
    	return this._isEditing;
    },
    
    isFocus: function () 
    {
    	return this._isFocused;
    },
    
    isPreEditing: function ()
    {
        return this._isPreEditing;
    },
    
    /**
     * Check if the editor is show state.
     * return: true  -- it's shown
     * 			false -- it's hidden or in preediting mode
     */
    isShow: function ()
    {
        if (this.inputBox.style.display == "" && !this._isPreEditing)
            return true;
        else
            return false;
    },
    
    preventCover: function()
    {
    	// We will hide the inline-editor in some case such as modal dialog show, pop up menus....
    	// call this to prevent cover in all these cases. We need to show out editor together with 
    	// some special dialogs such as spell check dialog. This flag will be cleared when 'reset'.
    	this._preventCover = true;
    },
    
    rangePicking: function(rp)
    {
    	// range picked, update value
    	if(this.isEditingFormula())
    	{
    		var rp = rp || this._rangePicker;
    		
    		var address = rp.getSelectedRangeAddress(this.editGrid == this.grid, true, false, false, !rp.selectingCell());
    		if(!address) 
    			return;
			
			var value = this.getValue();
			var selection = this.getInputTextSelection(true);

			var split = {};
			if(undefined != value && selection){
				if(selection.start != selection.end)
				{
					//The user select something, just replace these selected content with the address and set new value back to editors.
					split.start = selection.start;
					split.end = selection.end;
				}
				else
				{
					//The selection is collapsed, try to find the right 'range' to be replaced with, or try to find a proper place to insert the address if no 'range' to be replaced
					var highlights = this._highlights;
					var pos = selection.start, replacement = null;
					if(highlights)
						for(var i = 0, highlight, token; (highlight = highlights[i]) && (token = highlight._token); i++)
						{
							var start = highlight._tokenIndex, end = start + token.length;
							if(start <= pos && pos <= end)
							{
								replacement = highlight;
								break;
							}
						}
					if(replacement)
					{
						split.start = replacement._tokenIndex;
						split.end = split.start + replacement._token.length;
					}
					else
					{
						split.end = pos > 0? pos : 1;
						var start = pos;
						this._withinQuote = false;//this withinQuote is help to skip those 'terminals in sheet name'
						while(start > 0 && !this._isTerminal(value.charAt(start - 1)))
							start--;
						if(start < 1) start = 1;
						split.start = start;
					}
					
				}
				if(split.end < split.start)
				{
					var t = split.start;
					split.start = split.end;
					split.end = t;
				}
				var length = value.length;
		        var latterStr = value.slice(split.end,length);
		        var preStr = value.slice(0,split.start);
			    var newValue = preStr + address + latterStr;
			    if(this._formulaBar)
			    	this._formulaBar.setFormulaInputLineValue(newValue);
			    this.formulaAssist.suspendSearch();
			    this.setValue(newValue, true);
			    this.setCursor(preStr.length + address.length);
			    this.formulaAssist.resumeSearch();
			}
    	}
    },
    
    rangePicked: function (rp) {
		// range picking complete, what should we do know;
	},
	
    rangeMoved: function(mover)
    {
    	if(this.isEditingFormula())
    	{
    		var rect = mover.self;
    		var withoutSheet = (rect.grid == this.editGrid);
    		var addr = rect.getSelectedRangeAddress(withoutSheet, true);
    		var value = this.inputBox.textContent;
    		var inlineEditor = this;
    		dojo.some(dojo.query('span', this.inputBox), function(span){
    			if(span.textContent == rect._token && value.indexOf(rect._token) == rect._tokenIndex)
    			{
    				inlineEditor.getInputTextSelection(true);
    				span.textContent = addr;
    				inlineEditor.setValue(inlineEditor.inputBox.textContent);
    				inlineEditor.restoreCursorSelection();
    				return true;
    			}
    		});
    	}
    	
    },
    
    restoreCursorSelection: function()
    {
    	if(this._lastSelection)
    	{
    		this.focus();
    		if(this._lastSelection.start == this._lastSelection.end)
    			this.setCursor(this._lastSelection.start);
    		else
    			this.setSelectionRange(this._lastSelection.start, this._lastSelection.end);
    	}
    },
    
    reset: function ()
    {
    	this.inherited(arguments);
        this.textbox.innerHTML =  "";
        this._cellCache = null;
        this._lastValue = null;
        this._highlights = null;
        this._preventCover = this._isEditing = this._isRemoved = this._isChanged = this._isHidden = false;
        dojo.removeClass(this.inputBox, this.conflictClass);
    },
    
    //see suspend() for more details
    resume: function(){this._suspend = false;},
    
    setCursor: function (pos)
    {
    	if(document.activeElement != this.inputBox)
    		this.inputBox.focus();
    	if (pos < 0)
    		//move cursor to the end
    		this.collapseToEnd();
    	else if (pos == 0)
    		//to start
    		this.collapseToStart();
    	else
    	{
			var target = this._getNodesInPosition(pos);
			if (target.startNode)
			{
				var selection = window.getSelection(), offset = target.startOffset;
				var node = target.startNode;
				if((node.tagName && node.tagName.toLowerCase() == 'span'))
				{
					node = node.firstChild;
				}
				try{
					window.getSelection().collapse(node, offset);
				} catch(e){}
				this._lastSelection = {start: pos, end: pos};
			}
			//else there's no content in editor box, just keep the focus
    	}
    },
    
    editingStart: function (/*boolean*/keepValue) {
    	// summary:
    	//		Start editing CURRENT FOCUSED CELL, we can get the focused cell index fom selection manager.
    	// keepValue:
    	//		If this is given with true, will not try to update the value in the input-box
    	//		Usually it is ignored, that means 'try to update the value with current focused cell'.
    	//		The reason for this is that for safari, the IME triggering editing-start may be interrupted by this setValue even when the value is "".
    	var editRow = this.editGrid.selection.getFocusedRow();
    	var editCol = this.editGrid.selection.getFocusedCol();
    	this._editRowIndex = editRow;
    	this._editColIndex = editCol;
    	var sc = this.grid.scroller;
    	var grid = this.grid;
    	// cell protecting detection
    	if(websheet.model.ModelHelper.isCellProtected(this.grid.sheetName, editRow + 1, editCol)){
    		// fail if it's under protection
			this.editor.protectedWarningDlg();
			return;
		}
    	var addr = websheet.Helper.getAddressByIndex(this.grid.sheetName, editRow + 1, editCol, null, editRow + 1, editCol, {refMask: websheet.Constant.RANGE_MASK});
    	if(this.editor.isACLForbiddenArea(addr))
    		return;

    	// autocomplete detection
    	if(!this.editor.autoCompleteProvider)
    		this.editor.autoCompleteProvider = new websheet.widget.AutoCompleteProvider();
    	
    	this.editor.autoCompleteProvider._needData = true;
    	this.editor._formatpainter.clear();
    	
    	// First, scroll to make the edit row visible
    	if ((editRow < sc.firstVisibleRow && editRow > grid.freezeRow)) {
    		sc.scrllToRow(editRow);
    	} else if (editRow >= sc.lastVisibleRow) {
    		sc.scrollToRow(grid.geometry.getFirstRowWithLastRow(editRow + 1, grid.geometry.getScrollableHeight()));
    	}
    	// Scroll to make the column visible
    	if ( editCol >= sc.lastVisibleCol) {
    		sc.scrollToColumn(grid.geometry.getFirstColumnWithLastColumn(editCol, grid.geometry.getScrollableWidth(), true));
    	} else if (editCol < sc.firstVisibleCol && editCol > grid.freezeCol) {
    		sc.scrollToColumn(editCol);
    	}
    	this._maxWidth = this._maxHeight = 0;
    	if (!this._isEditing && this.editGrid != this.grid) {
    		this.editGrid = this.grid;
    	}
        this._isEditing = true;
        this._isPreEditing = false; //switch to editing mode
        this.attachCellStyle(editRow, editCol);
        this.adjustPositionToCell(editRow, editCol);
        this.editGrid.selection.activeSelector().disableAutofill().disableMover().render();
    	if(dojo.isSafari) {
    		// set disabled for the comment button input node will interrupt the IME input on safari 6+ on Mac?
    		// use a fake 'disalbe' here, do not really set the disable attribute for the valueNode.
    		// (see #45558), this only happens on Safari.
    		var commentBtn = dijit.byId("concord_comment_btn");
    		if (commentBtn)
    			dojo.addClass(commentBtn.domNode, "dijitButtonDisabled dijitDisabled");
    	} else {
    		concord.util.events.publish(concord.util.events.commentButtonDisabled,[this._isEditing]);
    	}
    	this.editor.getCommentsHdl().collapseCommentsByFocus(true);
    	var dataValidationHdl = this.editor.getDataValidationHdl();
 		if(dataValidationHdl)
 			dataValidationHdl.closeWarning();
    	grid.hideLinkDiv();
		grid.removeContextMenu();
		this._lockEditCell();
		if (!keepValue) {
			var value = "";
			var currentCell = this.editor.getDocumentObj().getCell(this.getEditSheet(), editRow + 1, editCol, websheet.Constant.CellType.MIXED);
			if (undefined != currentCell) {
				value = currentCell.getEditValue();
			}
			this.setValue(value, true);
		}
		this.show();
		if(this.editGrid.dataSelectionHelper)
			this.editGrid.dataSelectionHelper.close();
    },
    
    editingComplete: function () {
    	this._releaseLockedCell();
    	this._isEditing = false;
        this._colIndex = -1;
        this._rowIndex = -1;
        (this.editGrid || this.grid )['selection'].activeSelector().enableAutofill().enableMover();
        if(dojo.isSafari) {
        	// set disabled for the comment button input node will interrupt the IME input on safari 6+ on Mac?
        	// use a fake 'disalbe' here, do not really set the disable attribute for the valueNode.
        	// (see #45558), this only happens on Safari.
        	var commentBtn = dijit.byId("concord_comment_btn");
        	if (commentBtn)
        		dojo.removeClass(commentBtn.domNode, "dijitButtonDisabled dijitDisabled");
        } else {
        	concord.util.events.publish(concord.util.events.commentButtonDisabled,[this._isEditing]);
        }
    },
    
    setSelectionRange: function(start, end)
    {
    	//Summary: Select the given text in EditorBox
    	var selection = window.getSelection();
    	if(selection.type != "None")
    	{
    		var target = this._getNodesInPosition(start, end);
    		try
    		{
    			var range = document.createRange();
    			range.setStart(target.startNode, target.startOffset); 
    			range.setEnd(target.endNode, target.endOffset); 
    			selection.removeAllRanges();
    			selection.addRange(range);
    		}
    		catch(e){}//silently
    	}
    },
    
    // bNotKeyPress means setValue is not triggered by user key down
    setValue: function (value, bNotKeyPress, cursor)
    {
    	// Summary: Set the value to the editor, and adjust the boundary according to the value.
        if (value == null || this._isRemoved)
            return;
        var formated = this.formatValue(value, bNotKeyPress, cursor);
        this.inputBox.innerHTML = formated.html;
        this._lastValue = this.inputBox.textContent;
        if(this._highlights)
        {
        	this._highlightProvider.removeHighlight(this._highlights);
        	this._highlights = null;
        }
        if(formated.rangeList)
        {
        	this._highlights = this._highlightProvider.highlightRange(formated.rangeList, null, dojo.hitch(this, this.rangeMoved));
        }
        // Chrome and Safari have problem when append a single <BR> after the text node, 
        // The cursor can not move and the height is not changed either, insert a "marker" br
        // to the bottom to fix this problem, this fake br is not treated as "\n" when getValue.
        if (dojo.isWebKit) {
        	this.inputBox.appendChild(dojo.create('br'));
        }
        else {
        	this.inputBox.appendChild(document.createTextNode(""));
        }
        if (this.isShow()) {
        	this.adjustBoundary();
        }
    },
    
    /**
     * Show the inline InputBox when cell is editing mode
     * isFocus: false -- don't set the focus
     * 			ture or undefined -- set the focus by default.
     */
    show: function (isFocus)
    {
    	if(this._cellWidth == 0 || this._cellHeight == 0)
    	{
    		// do not show out editor box if cellWidth/height = 0, this is editing a cell in hidden row/column
    		// via formula input line.
    		return;
    	}
    	if (this._preventCover) {
    		this.updateCellIndicator(true);
    	}
        var showedBefore = this.inputBox.style.display == "";
        this.inputBox.style.display = "";
        if ((isFocus == undefined) || (isFocus == true))
        {
            this.focus();
        }
        if (!showedBefore)
        {
            this.adjustBoundary();
        }
    },
    
    shouldMoveRangePicker: function(setValue)
    {
    	// Summary: Should move range picker 4 arrow keys? If true, the 'MoveRangePicker' logic will try to move the range picker, rather then perform 
    	//		default navigation operations.
    	if(setValue != null)
    		this._movePicker4Arrow = setValue;
    	return this._movePicker4Arrow;
    },
    
    //need to call this when switch sheet
    switchToGrid: function(grid)
    {
    	if(this.grid != grid)	this.grid = grid;
    	if(this._isEditing && (/*(this.inputBox.textContent.indexOf('=') == 0) &&*/ !this._isRemoved) || this._isHidden)
    	{
    		this.grid.selection.initialFocus();
    	}
    	else
    	{
    		this.editGrid = this.grid;
    	}
    },
    
    //suspend the in-line editor make sure the editor will not be applied (if it's in editing mode);
    //!!IMPORTANT make sure to "resume" if you suspend the in-line editor.
    suspend: function() { return (this._suspend = true);},
    
    updateCellIndicator: function(show)
    {
    	if(!this._isCovered && (show || this._isChanged || this._isRemoved || this._isHidden))
    	{
    		var top = this._absTop - 17 + "px", left = 0;
			if(this.isRightAlign())
			{
				var editorPos = this.inputBox.getBoundingClientRect();
				left = editorPos.left + 'px';
			}
			else
				left = this._absLeft + 'px';
    		var addr = '';
    		if(this._isRemoved || !this.editGrid.isEditingCurrentGrid())
    		{
    			//the sheet has been removed by other users?
    			addr = websheet.Constant.INVALID_REF;
    		}
    		else
    		{
    			var row = this.getEditRowIndex() + 1;
    			var col = websheet.Helper.getColChar(this.getEditColIndex());
    			addr = col + row;
    			if(this.editGrid != this.grid)
    			{
    				var sheet = this.editGrid.sheetName;
    				addr = websheet.Helper.getAddressByIndex(sheet, row, col, null, null, null, {refMask: websheet.Constant.CELL_MASK});
    			}
    		}
    		if(this._isRemoved && addr == websheet.Constant.INVALID_REF)
    		{
    			dojo.addClass(this.inputBox, this.conflictClass);
    		}
    		else
    			dojo.removeClass(this.inputBox, this.conflictClass);
    		this.cellIndicator.setPosition(left, top);
    		this.cellIndicator.setAddress(addr);
    		if(this._formulaBar) this._formulaBar.setNameBoxValue(addr);
    		this.cellIndicator.show();
    	}
    	else
    	{
    		//hide it then
    		this.cellIndicator.hide();
    	}
    },
    
    uncover: function()
    {
    	//Summary: Show out the editor-box again, please refer to 'cover', 'isCovered'
    	dojo.style(this.inputBox, 'zIndex', '');
    	this._isCovered = false;
    	if(this._isEditing)
    	{
    		this.updateCellIndicator(true);
    		if(this._applyOnUncover)
    		{
    			this._applyOnUncover = false;
    			return this.apply();
    		}
    		if(document.activeElement != this.inputBox)
    			this.restoreCursorSelection();
    		this.formulaAssist.uncover();
    	}
    },
    
    setPreEditCell: function () {
    	this.waitForInput();
    },
    
    waitForInput: function ()
    {
    	// Summary: Set Spreadsheet to PREEDIT mode by activating the inputBox(but placed in invisible area).
        // 		If IME is opened and the ime-mode is "auto", the IME will automatically activated and begin to handle user keyboard input.
        // 		Should switch to EDITING mode when user press printable keys, this could be done simply by call setEditCell in _EditManager.
        // 		Should call this when the grid's content area got focused.
        if (this._isEditing || this.editor.scene.isHTMLViewMode() || pe.scene.bMobileBrowser) {
        	return false; //do not switch from editing mode to preeditng mode here, use applyEdit to make the switch.
        } 
        dojo.style(this.inputBox, {
        	display : '',
        	width : '0px',	height : '0px', zIndex : '-500',
        	top: '0px', left:'-5px'
        });
        this._isPreEditing = true; //let pass all the keyboard events in preedit mode, leave them to grid.
        this.inputBox.focus();
        this.setValue("");
        return true;
    },
    
    _autoCompleteText: function()
    {
    	this.inherited(arguments);
    	if (this._formulaBar) this._formulaBar.syncFormulaBarOnKeyUp(this.getValue());
    },
    
    //1 based row & column index.
    _changeEditIndex: function(newRowIndex, newColIndex)
    {
    	if (!this.editGrid || !this.editGrid.isEditingCurrentGrid())
    		return;
    	if (newRowIndex != null)
    		this._editRowIndex = newRowIndex - 1;
    	if (newColIndex != null)
    		this._editColIndex = newColIndex;
    	return (this._isChanged = true);
    },
    
    _escape: function(str)
    {
    	return str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/\"/gm, "&quot;").replace(/\'/gm, "&#39;").replace(/\n/gm, "<br>");;
    },
    
    _lockEditCell: function()
    {
    	if(!this.editor.scene.coedit) return;
    	var refValue = websheet.Helper.getCellAddr(this.getEditSheet(), this._editRowIndex + 1, this._editColIndex);
    	var event = new websheet.event.Lock(refValue);
		this.editor.sendMessage(event);
    },
    
    _getNodesInPosition: function (startPosition, endPosition)
    {
    	// Summary: Get the text nodes within which the given positions located and the actuall offset 
    	// within those text nodes.
    	var p_node = l_node = null, nodes = this.inputBox.childNodes;
    	var length = 0, p_offset = l_offset = 0;
    	if(endPosition == null) endPosition = startPosition;
    	for(var idx = 0; length < endPosition && idx < nodes.length; idx++)
    	{
    		var n = nodes[idx], nlength = n.textContent.length;
    		// Linebreak "\n" length is 1.
    		if(n.tagName && n.tagName.toLowerCase()== "br") nlength = 1;
    		if((length += nlength) >= startPosition)
    		{
    			if(!p_node)
    				p_node = n, p_offset = nlength - length + startPosition;
    			if(length >= endPosition)
    			{
    				l_node = n, 
    				l_offset = nlength - length + endPosition;
    				break;
    			}
    		}
    	}
    	if(!p_node || !l_node)
    		p_node = l_node = this.inputBox.firstChild, 
    		p_offset = l_offset = 0;
    	return {startNode : p_node, startOffset: p_offset, endNode: l_node, endOffset: l_offset};
    },
    
    _hasPopups: function()
    {
    	var popup = dijit.popup._stack && dijit.popup._stack.length > 0;
    	if (popup) {
    		if (this.formulaAssist.displayingHelp()) {
    			var widget = dijit.popup.getTopPopup().widget;
    			if ((widget.domNode.id || "").indexOf("ws_formula") == 0) {
    				popup =  false;
    			}
    		}
    	}
    	return popup;
    },
    
    _hasDialogs: function()
    {
    	var n;
    	var hasDialog =  (dijit.Dialog._dialogStack && (n = dijit.Dialog._dialogStack.length) > 1);
    	if(hasDialog) {
    		var topDialog = dijit.Dialog._dialogStack[n-1].dialog;
    		if(topDialog && topDialog.id.indexOf("C_d_MessageBox") == 0){
    			// it must be error formula syntax dialog
    			hasDialog = false;
    		}
    		else if(topDialog.validation)
    			hasDialog = false;
    	}
    	return hasDialog;
    },
    
    _isTerminal: function(token)
	{
		switch(token){
		case "'":
			this._withinQuote = !this._withinQuote;
			break;
		/*Math operator*/case '+': case '-' : case '*': case '/': case '^' : case '&': case '=': case '>': case '<': case '%':
		/*Range operator*/case '=': case ',': case ';': case ' ': case '\U00A0': case '\U3000': /*case ':':*/
		/*Other terminals*/case '{': case '}': case '(': case ')': case '[': case ']':
			if(this._withinQuote)
				return false;
			return true;
		default:
			return false;
		}
	},
	
	_insertLineBreak: function () {
		if (this._brtimer != null) {
			this._brtimer = null;
		}
		var selection = window.getSelection();
		if (!selection.isCollapsed)
			selection.deleteFromDocument();
		            
		var focus = selection.focusNode;
		//The cursor is in a highlighted span or a textnode or just follow a 'br' ?
		if (focus == this.inputBox) {
			var range = selection.getRangeAt(0);
		    var appendBR = document.createElement('br');
			if (dojo.isChrome) {
				// for chrome 37+, in this special case the container is a <br> that we inserted.
				var container = range.commonAncestorContainer;
				if (container.tagName && container.tagName.toLowerCase() == "br") {
					var before = document.createTextNode('');
					dojo.place(before, container, 'before');
					range = document.createRange();
					range.setStart(before, 0);
					range.setEnd(before, 0);
				}
			}
			range.insertNode(appendBR);
			var post = document.createTextNode('');
			dojo.place(post, appendBR, 'after');
			try{
				selection.collapse(post, 0);
			}catch(e){}
		} else {
			var inSpan = focus.parentNode != this.inputBox;
			var pre = inSpan ? focus.parentNode : focus;
			var valueString = focus.textContent,	cursorPosition = selection.focusOffset;
			//Pre node is break into two parts
			pre.textContent = valueString.substring(0, cursorPosition);
			//Insert a linebreak
			var linebreak = document.createElement('br');
			dojo.place(linebreak, pre, 'after');
			//Post node should be textnode
			var post = document.createTextNode(valueString.substring(cursorPosition));
			dojo.place(post, linebreak, 'after');
			//Set cursor to the start of the second part.
			try{
				selection.collapse(post, 0);
			}catch(e){}
		}
		//Adjust boundary
        this.adjustBoundary();
	},
    
    _toClearContent: function(e)
    {
    	var dk = dojo.keys, _bCut = false;
    	if((e.keyCode == dk.BACKSPACE || e.keyCode == dk.DELETE || (_bCut = (e.keyChar == 'x' && this.grid.isCtrlPressed(e)))))
        {
        	var curValue = this.getValue();
        	var selection = this.getInputTextSelection();
        	if(curValue.length == 1 && selection.start == selection.end)
        		return (selection.start == 0 && e.keyCode == dk.DELETE) ||(selection.start == 1 && e.keyCode == dk.BACKSPACE);
        	else
        		return (Math.abs(selection.start - selection.end) == curValue.length) &&( e.keyCode == dk.DELETE || e.keyCode == dk.BACKSPACE || _bCut);
        }
    	return false;
    },
    
    _releaseLockedCell: function()
    {
    	if(!this.editor.scene.coedit || !this._isEditing) return;
    	var refValue = websheet.Helper.getCellAddr(this.getEditSheet(), this._editRowIndex + 1, this._editColIndex);
    	this.editor.sendMessage (new websheet.event.Release(refValue));
    },
    
    _setValueAttr: function ()
    {
        this.inherited(arguments);
        if (this.isShow())
            this.adjustBoundary();
    }
    
});
