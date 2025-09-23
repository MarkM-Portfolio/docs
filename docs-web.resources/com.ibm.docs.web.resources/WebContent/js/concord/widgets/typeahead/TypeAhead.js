/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2007, 2014                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.typeahead.TypeAhead");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.string");
dojo.require("concord.widgets.typeahead.data.TypeAheadStore");

dojo.declare(
	"concord.widgets.typeahead.TypeAhead",
	[dijit.form.ComboBox],
	{
	widgetType: "TypeAhead",
	
	pageSize: 15,
	hasDownArrow: false,
	autoComplete: false,
	multi: true,
	valueAttr: "id",
	searchAttr: "name",
	url: "",
	token: "",
	separator: ",",				//what are we looking for as a user separator (e.g. ",")
	defaultSeparator: ", ",		//when we append a value what should we use (e.g. ", ")
	helpText: "", 				//a help text string before the widget is used
	inline: false,

	//if the srcNode is a textarea swap it back in
	buildRendering: function(){
		this.inherited("buildRendering", arguments);
		
		/*<input type="text" autocomplete="off" name="${name}" class='dijitReset'
			dojoAttachEvent="onkeypress:_onKeyPress, onfocus:_update, compositionend,onkeyup"
			dojoAttachPoint="textbox,focusNode" waiRole="textbox" waiState="haspopup-true,autocomplete-list"
		/>*/
		
		var name = this.srcNodeRef.nodeName;
		if (name.toLowerCase() == "textarea"){
			try{
				//typeahead source node was a textarea, swapping back in
				this.srcNodeRef.setAttribute("name", this.name);
				dojo.addClass(this.srcNodeRef, "dijitReset");
				this.srcNodeRef.setAttribute("waiRole", "textbox");
				this.srcNodeRef.setAttribute("waiState", "haspopup-true,autocomplete-list");
				//this.focusNode.parentNode.replaceChild(this.srcNodeRef, this.focusNode);
				dojo.connect(this.srcNodeRef, "keypress", this, "_onKeyPress");
				//SHGH _update is no longer in ValidationTextBox in 1.3.1
				//dojo.connect(this.srcNodeRef, "focus", this, "_update");
				dojo.connect(this.srcNodeRef, "compositionend", this, "compositionend");
				//SHGH onkeyup is no longer in ValidationTextBox in 1.3.1
//				dojo.connect(this.srcNodeRef, "keyup", this, "onkeyup");
				
				this.domNode = this.srcNodeRef;
				this.focusNode = this.srcNodeRef;
				
				this.textbox = this.srcNodeRef;
			}catch(e){
				console.error(e);
			}
			
			dojo.addClass(this.focusNode, "typeaheadInput");
		}else{
			if(this.inline){
				dojo.addClass(this.focusNode.parentNode, "typeaheadInputInline");
//				dojo.style(this.focusNode, {
//				background: "transparent",
//				border:"none"
//				});
			}
			else{
				dojo.addClass(this.focusNode.parentNode, "typeaheadInput");
			}
			
		}
	},
	
	_announceOption: function(node){	
		var orgValue = this.getValue();		
		this.inherited("_announceOption", arguments);
//		var val = this.getValue();
//		if (val == ""){
			//alert('announce messed us up, reset value');
			this.focusNode.value = orgValue;
//		}
	},
		
	//after selecting an option put the cursor at the end of the input
	_selectOption: function(){
		this.inherited("_selectOption", arguments);
		this.onSelectOption();
	},	
	
	//override postMixInProperties
	//we don't want to 
	postMixInProperties: function(){
		
		if(!this.hasDownArrow){
			this.baseClass = "dijitTextBox";
		}
		console.debug("postMix");
		//instead of loading html type options we want to load from a specified url
		if(!this.store && this.url){
			console.debug("need a store");
			this.store = this.newStore();
		}
		
		//this.inherited("postMixInProperties",arguments);
		dijit.form.ComboBoxMixin.prototype.postMixInProperties.apply(this, arguments);
		
	},
		
	postCreate: function(){	
		this.inherited("postCreate", arguments);		
		dojo.connect(this.focusNode, "onfocus", this, "onFocus");
		
		dojo.connect(this, "onFocus", this, "clearText");
		if (this.helpText) this.focusNode.value = this.helpText;
		
		dojo.connect(this, "_showResultList", this, "_fixPosition");
	},	
	
	clearText: function(){
		if (this.focusNode.value == this.helpText){
			this.focusNode.value = "";
			dojo.disconnect(this, "onFocus", this, "clearText");
		}
	},

	onFocus: function(){
		if (!this.store._loadFinished && !this.store._loadInProgress){
			//run a fetch against the store to make sure it loading/loaded		
			console.debug("run first fetch on unitialized store");
			this.store.fetch({queryOptions:{ignoreCase:false, deep:false}, query: "", onComplete:dojo.hitch(this, "onFirstLoad"), start:0, count:0});
		}
	},

	onFirstLoad: function(){
		console.debug("the store has been loaded");
		//notification that the store has been loaded, no action
	},
	
	newStore: function(){
		return new concord.widgets.typeahead.data.TypeAheadStore({
			url: this.url, 
			token: this.token,
			searchAttributes: [this.searchAttr],
			highlightAttributes: [this.searchAttr],	
			sortBy: this.searchAttr,
			strict: this.strict
		});
	},
	
	//given an item from the data store 
	//return a label object indicating type (html/text)
	//and the displayed label
	_getMenuLabelFromItem: function(item){
		var label = this.formatLabel(item);
		return {
			html: true, 
			label: label 
		};
	},
	
	//for a given item format a label string
	//returned markup is displayed as suggestion
	formatLabel: function(item){
		return this.store.getValue(item, this.searchAttr);
	},
	
	//when a user selects an item from the suggested list
	//extract return value from target item
//	_doSelect: function(tgt){
//		this.item = tgt.item;
//		this.setValue(this.store.getValue(tgt.item, this.valueAttr || this.searchAttr), true);
//		this.onSelect(this.item);
//	},
	
	onSelectOption: function(){
		this.setValue(this.store.getValue(this.item, this.valueAttr || this.searchAttr), true);
		console.debug("onSelectOption: ", this.getValue());
		this._setCaretPos(this.focusNode, this.focusNode.value.length);
		this.onSelect(this.item);
	},
	
	//Support widget-specific callback.
	onSelect: function(item){
		console.debug("onSelect", item);
	},
	
	//called when a search is about to occur
	//override so we can handle multi valued fields
	_startSearchFromInput: function(){
		console.debug("startSearchFromInput");
		var input = this.focusNode.value;
		if (this.multi){
			var idx = input.lastIndexOf(this.separator) + 1;			
			input = input.substring(idx);
		}
		input = dojo.string.trim(input);
	
		this._startSearch(input);
	},

	//override _startSearch so we can create our own menu type
	_startSearch: function(/*String*/ key){
		if (!key || key == "") {
			var newvalue = this.getDisplayedValue();
			if(newvalue.length <= 1){
				if(this._isShowingNow){
					doSearch = false;
					this._hideResultList();
				}
			}
			return;
		}
		
		if(!this._popupWidget){	
			this._popupWidget = new concord.widgets.typeahead.TypeAheadMenu({
				onChange: dojo.hitch(this, this._selectOption)
			});
		}
		console.debug("propogate");
		this.inherited("_startSearch", arguments);
	},

	removeCommas: function(str) {
	   return str.replace(/,/g, " ");
	},
	
	//when a value is set (from a user selection)
	//handle formatting the value for multi valued field
	setValue: function(newvalue){		
		newvalue = dojo.string.trim(newvalue);
		newvalue = this.removeCommas(newvalue);
		if (!this.multi){
			this.focusNode.value = newvalue;
		}else{
			var last = this.focusNode.value.lastIndexOf(this.separator);
			if (last > 0){
				var sub = this.focusNode.value.substring(0, last);
				this.focusNode.value = sub + this.defaultSeparator + newvalue + this.defaultSeparator;
			}else{
				this.focusNode.value = (!newvalue) ? "" : newvalue + this.defaultSeparator;
			}
		}
	},
	
	//override get value, this is used to restore a value when we hide the
	//result list, we don't want the value changed
	getValue: function(){
		return this.focusNode.value;
	},
	
	//override setDisplayedValue, no-op
	//this is only used to restore a previous value which breaks multi
	setDisplayedValue: function(){
		return;
	},
	
	//override _autoCompleteText
	//messes up multi value fields and cases where searchAttr != valueAttr	
	_autoCompleteText: function(){
		return;
	},

	// Override to select the first option when opening the list.
	// An option must always be selected to resolve Enter to selected option.
	_openResultList: function(/*Object*/ results, /*Object*/ dataObject){
		this.results = results;
		this.inherited("_openResultList", arguments);
		this._popupWidget.highlightFirstOption();
		//this._announceOption(this._popupWidget.getHighlightedOption());
	},
	
	_onKeyPress: function(/*Event*/ evt){
		
		var key = evt.charOrCode;
		switch(key){
			case ' ':
				setTimeout(dojo.hitch(this, "_startSearchFromInput"),1);
				return;
			case this.separator:
				// Resolve upon comma (show Highlighted Option)
				var pw = this._popupWidget;
				//if(this.separator == evt.keyChar){
				if(this._isShowingNow){	
					if(pw.getHighlightedOption()){
						pw.attr('value', { target: pw.getHighlightedOption() });
						dojo.stopEvent(evt);//prevent extra ","
					}
					this._hideResultList();
				}
				break;
			default:
				break;
		}
		this.inherited("_onKeyPress", arguments);
	},
	
	// #124274: Typeahed results covering write area while mentioning (Only in SC/EE)
	_fixPosition: function() {
		var isEE = dojo.query('[widgetid^="com_ibm_social_ee_widget"]').length > 0;

		if (isEE) {
			var pwNode = this._popupWidget.domNode.parentNode;

			var pwBox  = dojo.position(pwNode, true);
			var cnBox  = dojo.position(this.domNode, true);

			// Fix the top position of the popup
			dojo.style(pwNode, {top: pwBox.y + 5 + 'px'});

			// If the popup is above the mention, fix the height of the popup
			if (pwBox.y < cnBox.y) {
				var lbNode = this._popupWidget.domNode;
				var lbBox  = dojo.position(lbNode);

				dojo.style(lbNode, {height: lbBox.h - dojo.style(this.focusNode, 'height') + 'px'});
			}
		}
	}
});
