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

dojo.provide("websheet.widget.AutoCompleteMixin");

dojo.declare('websheet.widget.AutoCompleteMixin', null,
{
	provider: null,
	
    postCreate: function()
    {
    	var node = this.focusNode;
    	if(node.addEventListener)
    	{
    		// IE, dojo connect can not handle these events, use addEventListener instead.
    		this._searchOnCompositionStartHandler = dojo.hitch(this, this._searchOnCompositionStart);
    		this._searchOnCompositionEndHandler = dojo.hitch(this, this._searchOnCompositionEnd);
    		node.addEventListener('compositionstart', this._searchOnCompositionStartHandler, false);
    		node.addEventListener('compositionend', this._searchOnCompositionEndHandler, false);
    	}
    	
    	// a11y
    	// https://bugzilla.mozilla.org/show_bug.cgi?id=526315
    	
    	dojo.attr(node, "aria-autocomplete", "inline");
    	dojo.attr(node, "role", "textbox");
    	// it happens prior to setting this.editor, have to access with global variable here
    	this.editor = window["pe"].scene.editor;
    	this.inherited(arguments);
    },
    
    destroy: function()
    {
    	var node = this.focusNode;
    	if(node.removeEventListener && this._searchOnCompositionStartHandler && this._searchOnCompositionEndHandler)
    	{
    		// IE, dojo connect can not handle these events, use addEventListener instead.
    		node.removeEventListener('compositionstart', this._searchOnCompositionStartHandler, false);
    		node.removeEventListener('compositionend', this._searchOnCompositionEndHandler , false);
    	}
    	this.inherited(arguments);
    },
    
    _searchOnCompositionStart: function(){
    	this._ime = true; 
    },
    
    _searchOnCompositionEnd: function(){
    	this._ime = false;
    	this._onKey(
        {
        	charOrCode: 229
        }); // fake IME key to cause a search
    },
    
    _getCaretPos: function ( /*DomNode*/ element)
    {
        // khtml 3.5.2 has selection* methods as does webkit nightlies from 2005-06-22
        var pos = 0;
        if (typeof (element.selectionStart) == "number")
        {
            // FIXME: this is totally borked on Moz < 1.3. Any recourse?
            pos = element.selectionStart;
        }
        else if (dojo.isIE)
        {
            // in the case of a mouse click in a popup being handled,
            // then the dojo.doc.selection is not the textarea, but the popup
            // var r = dojo.doc.selection.createRange();
            // hack to get IE 6 to play nice. What a POS browser.
            var tr = dojo.doc.selection.createRange()
                .duplicate();
            var ntr = element.createTextRange();
            tr.move("character", 0);
            ntr.move("character", 0);
            try
            {
                // If control doesn't have focus, you get an exception.
                // Seems to happen on reverse-tab, but can also happen on tab (seems to be a race condition - only happens sometimes).
                // There appears to be no workaround for this - googled for quite a while.
                ntr.setEndPoint("EndToEnd", tr);
                pos = String(ntr.text)
                    .replace(/\r/g, "")
                    .length;
            }
            catch (e)
            {
                // If focus has shifted, 0 is fine for caret pos.
            }
        }
        return pos;
    },
    
    _onInput: function (evt)
    {
        if(this.adjustBoundary)
        	this.adjustBoundary();
    },
    
    _abortQuery: function()
    {
        if(this.searchTimer)
        {
    		clearTimeout(this.searchTimer);
    		this.searchTimer = null;
        }
    },

    _onKey: function ( /*Event*/ evt)
    {
        // summary:
        //		Handles keyboard events
        var key = evt.charOrCode;
        // except for cutting/pasting case - ctrl + x/v
        if (evt.altKey || ((evt.ctrlKey || evt.metaKey) && (key != 'x' && key != 'v')) || key == dojo.keys.SHIFT)
        {
            return; // throw out weird key combinations and spurious events
        }
        var doSearch = false;
        var dk = dojo.keys;
        this._prev_key_backspace = false;
        this._abortQuery();
        switch (key)
        {
	        case dk.DELETE:
	        case dk.BACKSPACE:
	            this._prev_key_backspace = true;
	            doSearch = true;
	            break;
	
	        default:
	            // Non char keys (F1-F12 etc..)  shouldn't open list.
	            // Ascii characters and IME input (Chinese, Japanese etc.) should.
	            // IME input produces keycode == 229.
	            doSearch = typeof key == 'string' || key == 229;
	        	break;
        }
        if (doSearch)
        {
            // need to wait a tad before start search so that the event
            // bubbles through DOM and we have value visible
        	this.searchTimer = setTimeout(dojo.hitch(this, function(){
        		if(!this._ime)
        			this._startSearchFromInput();
        	}), 10);
        }
    },

    _autoCompleteText: function ( /*String*/ text)
    {
        // summary:
        // 		Fill in the textbox with the first item from the drop down
        // 		list, and highlight the characters that were
        // 		auto-completed. For example, if user typed "CA" and the
        // 		drop down list appeared, the textbox would be changed to
        // 		"California" and "ifornia" would be highlighted.
        var fn = this.focusNode;
//
//        // IE7: clear selection so next highlight works all the time
//        dijit.selectInputText(fn, fn.textContent.length);
        // does text autoComplete the value in the textbox?
        var caseFilter = 'toLowerCase';
        if (text[caseFilter](0)
            .indexOf(this.focusNode.textContent[caseFilter](0)) == 0)
        {
        	var sel = window.getSelection(), val = "";
        	if(fn.tagName && fn.tagName.toLowerCase() == 'div')
        	{
        		val = fn.textContent;
        		fn.textContent = val + text.substring(val.length);
        		if(dojo.isIE)
        		{
        			var range = document.createRange();
        			range.setStart(fn.firstChild, val.length);
        			range.setEnd(fn.firstChild, fn.textContent.length);
        			var sel = window.getSelection();
        			sel.removeAllRanges();
        			sel.addRange(range);
        		}
        		else
        		{
        			sel.collapse(fn.firstChild, val.length);
                	sel.extend(fn, 1);
        		}
        	}
        	else
        	{
        		val = fn.value;
        		fn.value = val + text.substring(val.length);
        		dijit.selectInputText(fn, val.length);
        	}
        }
        else
        {
            // text does not autoComplete; replace the whole value and highlight
            fn.value = text;
            dijit.selectInputText(fn);
        }
        
        this.adjustBoundary && this.adjustBoundary();
    },

    checkStore: function()
    {
    	if (this.editor.autoComplete)
    	{
	    	if(this.provider._needData)
	    	{
	    		var grid = this.editor.getCurrentGrid();
	    		var sheetName = grid.getSheetName();
	    		var selected = grid.selection.getFocusedCell();
	    		var rowIndex = selected.focusRow;
	    		var colIndex = selected.focusCol;
	    		var items = websheet.Utils.getTypeAheadCellList(sheetName, rowIndex, colIndex);
	    		this.provider.setCandidates(items);
	    		this.provider._needData = false;
	    	}
    	}
    	else
    	{
    		this.provider.reset();
    	}
    },
    
//    getAdjacentRowItems: function(sheet, rowIndex, colIndex, direction)
//    {
//    	// rowIndex is 0 based;
//    	if(direction < 0)
//    		rowIndex = rowIndex - 1;
//    	else
//    		rowIndex = rowIndex + 1;
//    	
//    	var maxRow = this.editor.getMaxRow();
//    	if(rowIndex < 0 || rowIndex >= maxRow)
//    		return [];
//    	
//    	// getRow is 1 based;
//    	var prevRow = sheet.getRow(rowIndex + 1, true);
//    	if(!(prevRow && prevRow._valueCells.length))
//    		return [];
//    	
//    	var items = [];
//    	var sheetId = sheet._id;
//    	var index = dojo.indexOf(sheet._rows, prevRow);
//    	
//    	while(prevRow != null)
//    	{
//    		var cell = prevRow._valueCells[colIndex - 1];
//        	if (!cell || !cell._calculatedValue || cell.isNumber() || cell.isCovered())
//            {
//                break;
//            }
//        	else
//        	{
//        		var value = cell._calculatedValue;
//        		// do not count number (formula, or with "'" text number)
//        		// isNaN will return false for empty string, add additional code for check that.
//        		if(!cell._error && (isNaN(value) || (dojo.isString(value) && dojo.trim(value).length == 0)))
//        		{
//        			items.push(value + "");
//        		}
//        		
//        		prevRow = null;
//        		
//    			if(direction < 0)
//    			{
//    				rowIndex = rowIndex - 1;
//    				index = index - 1;
//    			}
//    			else
//    			{
//    				rowIndex = rowIndex + 1;
//    				index = index + 1;
//    			}
//    			
//    			if(rowIndex < 0 || rowIndex >= maxRow || index < 0)
//    	    		break;
//    			
//        		prevRow = sheet._rows[index];
//        		// get row id by index
//        		var prevRowId = sheet.getRowId(rowIndex);
//        		if(!(prevRow && prevRowId && prevRow._id == prevRowId))
//        			prevRow = null;
//        	}
//    	}
//    	
//    	return items;
//    },
    
    _startSearchFromInput: function ()
    {
    	var value = this.getValue();
    	this._lastInput = value;
    	
    	if(this._prev_key_backspace)
    	{
    		return;
    	}
    	if (!this.editor) {
    		this.editor = pe.lotusEditor;
    	}
    	if(!this.editor.autoCompleteProvider)
    		this.editor.autoCompleteProvider = new websheet.widget.AutoCompleteProvider();

    	this.provider = this.editor.autoCompleteProvider;
    	
    	this.checkStore();
    	
    	this.provider.startSearch(value, dojo.hitch(this, function(result){
        	if(result && !this._prev_key_backspace)
        		this._announceFirst(result); 
        }));
    },

    _announceFirst: function (text)
    {
        this.focusNode.textContent = this.focusNode.textContent.substring(0, this._lastInput.length);
        // autocomplete the rest of the option to announce change
        this._autoCompleteText(text);
    }
});