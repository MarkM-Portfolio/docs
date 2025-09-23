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

dojo.provide("concord.spellcheck.SpellCheckDlg");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.widgets.LotusTextButton");
dojo.require("dojo.i18n");
dojo.require("concord.util.events");
dojo.requireLocalization("concord.spellcheck","SpellCheckDlg");
dojo.require("concord.util.BidiUtils");
dojo.declare("concord.spellcheck.SpellCheckDlg", [concord.widgets.concordDialog], {	
	
	nls: null,
	doc: null,
	renderDiv: null,
	renderLabel1: null,
	renderLabel2: null,
	renderLabel3: null,
	misWordSelection: null,
	btnIgnore: null,
	btnReplace: null,
	cellNameLabel: null,

	btnIgnoreId: null,
	btnReplaceId: null,
	btnDoneId: null,
	suggestionsId: null,
	misWordId: null,
	handler: null,
	layoutTable: null,
	warningLabel: null,
	imgContainer: null,
	
	scHandler: null,
	onNextTimer: null,
	eventHandlers: [],
	isBidi: false,
	renderSpan: null,
	
	_getResource: function()
	{
		if(!this.nls)
			this.nls = dojo.i18n.getLocalization("concord.spellcheck","SpellCheckDlg");
	},
	
    _regEvent: function(){
        concord.util.events.subscribe(concord.util.events.spellcheck_cellname_changed, this, 'cellNameChanged');
        concord.util.events.subscribe(concord.util.events.spellcheck_focuscell_removed, this, 'focusCellRemoved');
        concord.util.events.subscribe(concord.util.events.spellcheck_focussheet_removed, this, 'focusSheetRemoved');
        concord.util.events.subscribe(concord.util.events.spellcheck_focussheet_moved, this, 'focusSheetMoved');
    },	
	
	constructor: function (object, title, oklabel, visible, params) {
		this._getResource();			
		this.dialog.attr("title", this.nls.title);
		this._regEvent();
	},
	
	setDialogID: function() {		
		this._getResource();
		this.dialogId="S_d_SpellCheckDlg";
		this.btnIgnoreId="S_d_SpellCheckDlgBtnIgnore";
		this.btnReplaceId="S_d_SpellCheckDlgBtnReplace";
		this.btnDoneId="S_d_SpellCheckDlgBtnDone";
		this.suggestionsId="S_d_SpellCheckDlgSuggestions";
		this.misWordId="S_d_SpellCheckDlgMisWordId";
		return;
	},
	
	createContent: function (contentDiv) {
		this._getResource();
		
		var doc = dojo.doc;
		this.doc = doc;
		
		var warningLabel = dojo.create('label', null, contentDiv);
		warningLabel.appendChild( doc.createTextNode(this.nls.warning) );
		dojo.addClass(warningLabel, "concordDialogBold");
		warningLabel.style.display = 'none';
		this.warningLabel = warningLabel;
		
		//Create layout table
		var layoutTable = dojo.create('table', null, contentDiv);
		dijit.setWaiRole(layoutTable,'presentation');
		this.layoutTable = layoutTable;
		var layoutTbody = dojo.create('tbody', null, layoutTable)
		var layoutTR1 = dojo.create('tr', null, layoutTbody);
		var layoutTR2 = dojo.create('tr', null, layoutTbody);
		var layoutTR3 = dojo.create('tr', null, layoutTbody);
		var layoutTR4 = dojo.create('tr', null, layoutTbody);
		var layoutTR5 = dojo.create('tr', null, layoutTbody);
		var layoutTR6 = dojo.create('tr', null, layoutTbody);
		var layoutTR1TD1 = dojo.create('td', null, layoutTR1);
		var layoutTR1TD2 = dojo.create('td', null, layoutTR1);
		var layoutTR1TD3 = dojo.create('td', null, layoutTR1);
		var layoutTR2TD1 = dojo.create('td', null, layoutTR2);
		var layoutTR2TD2 = dojo.create('td', null, layoutTR2);
		var layoutTR2TD3 = dojo.create('td', null, layoutTR2);
		var layoutTR3TD1 = dojo.create('td', null, layoutTR3);
		var layoutTR3TD2 = dojo.create('td', null, layoutTR3);
		var layoutTR3TD3 = dojo.create('td', null, layoutTR3);
		var layoutTR4TD1 = dojo.create('td', null, layoutTR4);
		var layoutTR4TD2 = dojo.create('td', null, layoutTR4);
		var layoutTR4TD3 = dojo.create('td', null, layoutTR4);		
		var layoutTR5TD1 = dojo.create('td', null, layoutTR5);
		var layoutTR5TD2 = dojo.create('td', null, layoutTR5);
		var layoutTR5TD3 = dojo.create('td', null, layoutTR5);
		var layoutTR6TD1 = dojo.create('td', null, layoutTR6);
		var layoutTR6TD2 = dojo.create('td', null, layoutTR6);
		var layoutTR6TD3 = dojo.create('td', null, layoutTR6);				
		
		this.isBidi = BidiUtils.isBidiOn();

		var styleValue = null;
		var cellPaddingValue = "padding-left: 0.7em;";
		//Mis-word label
		dojo.attr(layoutTR1TD1, "valign", "top");
		var misWordLabel = dojo.create('label', null, layoutTR1TD1);
		misWordLabel.appendChild(doc.createTextNode(this.nls.misword));
		dojo.addClass(misWordLabel, "concordDialogBold");
		//Mis-word contents
		dojo.attr(layoutTR1TD2, "rowspan", "3");
		dojo.attr(layoutTR1TD2, "valign", "top");
		layoutTR1TD2.style.cssText = cellPaddingValue;
		var renderDiv = dojo.create('div', null, layoutTR1TD2);
		this.renderDiv = renderDiv;
		dojo.addClass(renderDiv, "concordDialogBold");
		styleValue = "width: 20em; height: 13em; overflow: auto; border: 1px solid #5b5b5b; background:#E1E1E1;";
		renderDiv.style.cssText = styleValue;  	 
		
		this.imgContainer = dojo.create('div', {id:"sheet_sc_init_imgid"}, this.renderDiv);
		dojo.addClass(this.imgContainer,'dlg_sc_sc_wait_div');	 
		var imgDiv = dojo.create('span', null, this.imgContainer);
		dojo.addClass(imgDiv,'dlg_sc_sc_asyncImg');		
		
		if (this.isBidi){
			this.renderSpan = dojo.create('span', null, renderDiv);
			this.renderSpan.style.display = 'inline-block'; 
		}
		
		var label1 = dojo.create('label', null, this.isBidi ? this.renderSpan : renderDiv);
		label1.appendChild(doc.createTextNode(""));
		this.renderLabel1 = label1;
		var span2 = dojo.create('span', null, this.isBidi ? this.renderSpan : renderDiv);
		styleValue = "color: #FA0000; text-decoration: underline";
		span2.style.cssText = styleValue;  	    		
		
		var label2 = dojo.create('label', {id: this.misWordId}, span2);
		dijit.setWaiRole(label2, 'alert');
		label2.appendChild(doc.createTextNode(""));
		this.renderLabel2 = label2;
		var label3 = dojo.create('label', null, this.isBidi ? this.renderSpan : renderDiv);
		label3.appendChild(doc.createTextNode(""));
		this.renderLabel3 = label3;
		
		
		// cell name
		layoutTR1TD3.style.cssText = cellPaddingValue;
		dojo.attr(layoutTR1TD3, "valign", "top");
		var cellDiv = dojo.create('div', null, layoutTR1TD3);
		dojo.style(cellDiv, 'width', '7em');
		var cellLabel = dojo.create('label', null, cellDiv);
		cellLabel.appendChild(doc.createTextNode(""));
		this.cellNameLabel = cellLabel;		
		dojo.addClass(cellLabel, "concordDialogBold");
		// ignore button	
		var ignoreBtn = new concord.widgets.LotusTextButton({label: this.nls.ignoreBtn, id: this.btnIgnoreId, onClick: dojo.hitch(this, "onIgnore")});
		cellDiv.appendChild(ignoreBtn.domNode);
		this.btnIgnore = ignoreBtn;
		// replace button		
		var replaceBtn = new concord.widgets.LotusTextButton({label: this.nls.replaceBtn, id: this.btnReplaceId, onClick: dojo.hitch(this, "onReplace")});
		cellDiv.appendChild(replaceBtn.domNode);
		this.btnReplace = replaceBtn;
				
		//Suggestions label
		dojo.attr(layoutTR4TD1, "valign", "top");
		var suggestionsLabel = dojo.create('label', null, layoutTR4TD1);
		suggestionsLabel.appendChild(doc.createTextNode(this.nls.suggests));
		dojo.attr(suggestionsLabel,'for',this.suggestionsId);
		dojo.addClass(suggestionsLabel, "concordDialogBold");
		//Suggestions list
		layoutTR4TD2.style.cssText = cellPaddingValue;
		dojo.attr(layoutTR4TD2, "rowspan", "3");
		var sel = dojo.create('select', null, layoutTR4TD2);
		this.misWordSelection = sel;
		this.misWordSelection.id = this.suggestionsId;
		styleValue = "width: 20.1em; height: 13em; overflow: auto; border-color: #5b5b5b; border-width: 1px;";
		this.misWordSelection.style.cssText = styleValue;						
		// done button
		layoutTR6TD2.style.cssText = cellPaddingValue;
		dojo.attr(layoutTR6TD2, "valign", "bottom");
		var doneBtn = new concord.widgets.LotusTextButton({label: this.nls.doneBtn, id: this.btnDoneId, onClick: dojo.hitch(this, "_onOk")});
		layoutTR6TD2.appendChild(doneBtn.domNode);	
		
		dojo.query('button', layoutTable).style('width', '7.5em');
	},
	
	postCreate: function()
	{				
		var btnContainer = this.getBtnContainer();
		if(btnContainer)
		{
			btnContainer.style.display = "none";
		}
		
		this.initHandler();
	},
	
	_updateCellName: function()
	{
		if(this.scHandler && this.cellNameLabel)
		{
			var str = this.scHandler.getCurCellName();
			var result = dojo.string.substitute(this.nls.cellName, [str]);
			this.cellNameLabel.childNodes[0].nodeValue = result;
		}			
	},
	
	_updateRenderView: function()
	{		
		if(this.scHandler)
		{			
			var contents = this.scHandler.getContents();
			var misWord = this.scHandler.getCurrentMisWord();
			if(misWord)
			{
				this._hideWaitingWidget();
				var wordIndex = this.scHandler.getWordIndex(this.scHandler.index);
				
				this.renderLabel1.childNodes[0].nodeValue = contents.substr(0,wordIndex);
				this.renderLabel2.childNodes[0].nodeValue = misWord;				
				this.renderLabel3.childNodes[0].nodeValue = contents.substr(wordIndex+misWord.length);	
						
				this.renderLabel2.scrollIntoView(false);
			}
			else if(this.scHandler.isIteratedAll() || this.scHandler.isEmptySheet())
			{				
				this._hideWaitingWidget();
				dijit.setWaiRole(this.renderLabel1, 'alert');
				this.renderLabel1.childNodes[0].nodeValue = this.nls.complete;
				this.renderLabel2.childNodes[0].nodeValue = "";
				this.renderLabel3.childNodes[0].nodeValue = "";
			}
			else
			{
				this.renderLabel1.childNodes[0].nodeValue = "";
				this.renderLabel2.childNodes[0].nodeValue = "";
				this.renderLabel3.childNodes[0].nodeValue = "";				
			}
			if (this.isBidi){
				var str = "";
				if (this.renderLabel1.childNodes[0].nodeValue != "")
					str = this.renderLabel1.childNodes[0].nodeValue;
				else if (this.renderLabel2.childNodes[0].nodeValue != "")
					str = this.renderLabel2.childNodes[0].nodeValue;
				else if (this.renderLabel3.childNodes[0].nodeValue != "")
					str = this.renderLabel3.childNodes[0].nodeValue;
				if (str != ""){
					var dir = BidiUtils.getResolvedTextDir(str);
					this.renderSpan.style.direction = dir;
				}
			}
		}
	},
	
	initHandler: function()
	{
		if(!this.scHandler)
		{
			this.scHandler = pe.scene.getScHandler();
			this.scHandler.checkText();
		}
	},
	
	_showWaitingWidget: function()
	{
		this._updateOptions(null);
		this.renderLabel1.style.display = 'none';
		this.renderLabel2.style.display = 'none';
		this.renderLabel3.style.display = 'none';
		
		this.imgContainer.style.display = 'block';
		dijit.setWaiRole(this.imgContainer,'alert');
		dijit.setWaiState(this.imgContainer,'label', this.nls.WAITING_MSG);		
	},
	
	_hideWaitingWidget: function()
	{		
		this.imgContainer.style.display = 'none';
		
		this.renderLabel1.style.display = '';
		this.renderLabel2.style.display = '';
		this.renderLabel3.style.display = '';
		dojo.removeAttr(this.imgContainer,'alert');
		dijit.removeWaiState(this.imgContainer, 'label');				
	},
	
	show: function(){
		this.initHandler();
		// show normal UI as default
		this.initWidgets();
		if( !this.scHandler)
		{
			// show no misspelling UI
			this.showWarnMessage();
		}
		else
		{			
			var misWord = this.scHandler.getCurrentMisWord();
			if(misWord && misWord.length)
			{				
				setTimeout(dojo.hitch(this, function(){
					this._updateCellName();	
					this._updateOptions(misWord);
					this._updateRenderView();
				}), 0);	
			}
			else
			{
				// waiting
				setTimeout(dojo.hitch(this, function(){
					this._showWaitingWidget();					
				}), 100);
				
				// check next cell
				setTimeout(dojo.hitch(this, function(){ // set the index as -1 to get current mis-word rather than NEXT when leverage onNext
					this.scHandler.index = -1;
					this.onNext();														
				}), 200);				
			}						
		}
		
		this.inherited(arguments);
	},
	
	hide: function(){
		if(this.onNextTimer)
		{	
			clearInterval(this.onNextTimer);
			this.onNextTimer = null;
		}
		dojo.forEach(this.eventHandlers, dojo.disconnect);
		this.eventHandlers = [];
		this.scHandler = null;
		this.inherited(arguments);				
	},	
	
	onOk: function (editor) {		
		if(this.scHandler)
		{
			this.scHandler.commit();
		}
	},
	
	onCancel: function (editor) {
		if(this.scHandler)
		{
			this.scHandler.commit();
		}
		
		return true;
	},
	
	onNext: function()
	{	
		if(this.scHandler)
		{			
			var misWord = this.scHandler.getNextMisWord();
			if(misWord)
			{// check current cell first
				this._hideWaitingWidget();				
				this._updateOptions(misWord);
				this._updateRenderView();				
			}
			else if(!this.onNextTimer)
			{// if no mis-word in current cell, need a timer to iterate
				this.onNextTimer = setInterval(dojo.hitch(this, function(){																	
					this._showWaitingWidget();
					if( this.scHandler.moveToNextCell() || this.scHandler.isIteratedAll() || this.scHandler.isEmptySheet())
					{// iterated all cells or found a mis-word
						dijit.byId(this.dialogId).domNode.focus();
						this._updateCellName();					
						misWord = this.scHandler.getCurrentMisWord();
						// terminate timer if get a mis-word cell
						clearInterval(this.onNextTimer);
						this.onNextTimer = null;
					}							
					if(misWord)
						this._hideWaitingWidget();					
					this._updateOptions(misWord);
					this._updateRenderView();
				}), 30);		
			}
		}
	},
	
	onIgnore: function()
	{
		if(this.scHandler)
		{
			this.scHandler.ignoreMisWord();
		}
		this.onNext();
	},
	
	onReplace: function()
	{
		if(this.scHandler)
		{
			var correctWord = this.misWordSelection.value;
			if(correctWord)	
				this.scHandler.correctMisWord(correctWord);			
		}
		this.onNext();
	},	
	
	/**
	 * Need init normal widgets every time when show the dialog as which will be hidden rather than destroyed
	 */
	initWidgets: function()
	{
		if(this.layoutTable && this.warningLabel)
		{
			this.layoutTable.style.display = '';
			this.warningLabel.style.display = 'none';
		}
				
		var btnContainer = this.getBtnContainer();
		if(btnContainer)
		{
			btnContainer.style.display = "none";
		}		
	},
	
	/**
	 * called when there is no misspellings
	 */
	showWarnMessage: function()
	{
		if(this.layoutTable && this.warningLabel)
		{
			this.layoutTable.style.display = 'none';
			this.warningLabel.style.display = '';
		}
				
		var btnContainer = this.getBtnContainer();
		if(btnContainer)
		{
			btnContainer.style.display = "";
		}
		
		var cancelBtn = this.getCancelBtn();
		if(cancelBtn)
			cancelBtn.domNode.style.display = 'none';		
		
		if(this.scHandler)
		{			
			this.scHandler.cancel();
		}		
	},
	
	
	_clearOptions: function()
	{
		while(this.misWordSelection.firstChild)
		{			
			this.misWordSelection.removeChild(this.misWordSelection.firstChild);
		}
		// enable the action button when clear the options
		this.btnIgnore.attr('disabled', false);
		this.btnReplace.attr('disabled', false);
	},
	
	/**
	 * to update the options when switch to next mis-word.
	 */
	_updateOptions: function(misWord)
	{// this.scHandler is always valid in ths function.						
		// update suggestions list		
		this._clearOptions();
		
		this.misWordSelection.multiple = 'yes';
		this.misWordSelection.size = 7;								
		
		if(misWord)
		{// ignore option						        
			var suggestions = this.scHandler.getSuggestions(misWord);
			if(suggestions && suggestions.length)
			{	
				for(var i = 0; i < suggestions.length; i++) {												
	                var c = this.doc.createElement('option');
	                c.innerHTML = suggestions[i];	
	                c.value = suggestions[i];
	                if(i ==0) // select the first one by default
	                	c.selected = 'selected';
	                this.misWordSelection.appendChild(c);
				}
				
				this.misWordSelection.multiple = 'yes';
				this.misWordSelection.size = 7;								
			}	
			else
			{
				var c = this.doc.createElement('option');
				c.innerHTML = this.nls.noSuggestions;	
				c.title = this.nls.noSuggestions;
				c.value = null;  
				c.selected = 'selected';
				this.misWordSelection.appendChild(c);
                
				this.btnReplace.attr('disabled', true);
			}
			var node = dojo.byId(this.misWordId);
			if(node){
				//Remove the role first, then reset
				dojo.removeAttr(node,'role');
				dijit.setWaiRole(node, 'alert');
				var msg = dojo.string.substitute(this.nls.MISWORD_MSG, [misWord, this.cellNameLabel.childNodes[0].nodeValue]);
				dijit.setWaiState(node,'label', msg);
			}

			setTimeout(dojo.hitch(this, function(){
				this.btnIgnore.focus();
			}), 100);				
		}
		else
		{            
			this.btnIgnore.attr('disabled', true);
			this.btnReplace.attr('disabled', true);
			setTimeout(dojo.hitch(this, function(){
				var node = dijit.byId(this.btnDoneId);
				if(node)node.focus();
			}), 100);				
		}
	},
	
	/////////////////////////////////////////////////////////////////////////////////
	/////  Handle the co-editing message when do spell check   /////////////////////
	
	cellNameChanged: function(evt)
	{ 		
		setTimeout(dojo.hitch(this, function(){
			if(this.scHandler)
			{
				this.scHandler.focusOnCurrentCell();
				this._updateCellName();
			}
		}), 100);	
	},
	
	focusCellRemoved: function(evt)
	{	
		setTimeout(dojo.hitch(this, function(){
			try{
				if(this.scHandler)
				{
					if( this.scHandler.moveToNextCell() )
					{
						this._updateCellName();					
						var misWord = this.scHandler.getCurrentMisWord();
						this._updateOptions(misWord);
						this._updateRenderView();
					}
					else
					{
						var result = dojo.string.substitute(this.nls.cellName, ['']);
						this.cellNameLabel.childNodes[0].nodeValue = result;
						this._updateOptions(null);
						this._updateRenderView();
					}
				}	
			}catch(e)
			{
				console.log("error to focus next when current cell removed: "+e);
			}
		}), 100);
	},
	
	focusSheetRemoved: function(evt)
	{
		this._onCancel();
	},
	
	focusSheetMoved: function(evt)
	{
		setTimeout(dojo.hitch(this, function(){
			if(this.scHandler)
			{
				this.scHandler.focusOnCurrentCell();
			}
		}), 100);	
	}
});