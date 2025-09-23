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

dojo.provide("websheet.dialog.spreadsheetSettings");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.cookie");
dojo.require("dojo.i18n");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("websheet.dialog","spreadsheetSettings");
dojo.requireLocalization("websheet.i18n","Number");

dojo.declare("websheet.dialog.spreadsheetSettings", [concord.widgets.concordDialog], {
	oldValue: null,
	
	constructor: function() {
	},
	setDialogID: function() {
		// Overridden
		this.dialogId="S_d_spreadsheetSettings";
		this.localeListID="S_d_spreadsheetSettingsLocaleList";
		return;
	},
	createContent: function (contentDiv) {
		var nls = dojo.i18n.getLocalization("websheet.dialog", "spreadsheetSettings");
		dijit.setWaiRole(contentDiv,'application');
		var layoutSettingLabel = dojo.create('div', null, contentDiv);
		dojo.addClass(layoutSettingLabel,"sigleDiv");
      	var settingLabel = dojo.create('label',null,layoutSettingLabel);
      	settingLabel.appendChild(dojo.doc.createTextNode(nls.LOCALE_DESC));
		dojo.addClass(settingLabel, "concordTaskLabel");
		dojo.attr(settingLabel,'for',this.localeListID);
        var localeStore =  new dojo.data.ItemFileReadStore({
        						data: this.getLocaleStore()});
		var localeListDiv = dojo.create('div', null, contentDiv);
		dojo.addClass(localeListDiv,"websheetlocaleListDiv");
		
        var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
        this.localeList = this.editor.localeList = new dijit.form.ComboBox({
        						store: localeStore,
        						autoComplete: true,
        						searchAttr: "name",
        						id:this.localeListID,
        						dir: dirAttr,
        						fetchProperties: {sort : [{attribute: "name"}]}
        					});
        // cause the class dijitArrowButton would make the combobox not display
        dojo.removeClass(this.localeList.domNode.firstChild, "dijitArrowButton");
        
        var locale = this.editor.scene.getLocale();
        localeStore.fetchItemByIdentity({identity: locale, onItem: this._onItem});
        // comment the statement below, because the Combox need solve the key event( such as ENTER) by itself, 
        // and if have this statement, make JAWS read nothing when press ArrowDown to show the select list
        //dojo.connect(localeList.domNode, "onkeypress", dojo.hitch(this, this.onKeyPress));
        dijit.setWaiState(this.localeList.textbox,'required','true');
        localeListDiv.appendChild(this.localeList.domNode);
        
        this.oldValue = this.localeList.displayedValue;
        dojo.connect(this.localeList, "onChange", dojo.hitch( this, function(){
        	dijit.setWaiState(this.localeList.textbox, "invalid", false);
        	this.setWarningMsg("");
        }));
        dojo.connect(this.localeList.textbox, "onkeydown", dojo.hitch( this, function(e){
        	var keyCode = e.keyCode;
        	var dk = dojo.keys;
        	if(keyCode == dk.ENTER)
        		this._onOk(this.editor);
        	}));
        dojo.connect(this.localeList.textbox, "onkeypress", dojo.hitch( this, function(){
        	dijit.setWaiState(this.localeList.textbox, "invalid", false);
        	this.setWarningMsg("");
        	}));
	},

	/* the store is used by spreadsheet setting */
	/* json store */getLocaleStore: function() {
		var nls = dojo.i18n.getLocalization("websheet.dialog", "spreadsheetSettings");
		var store = {
				identifier:"id",
				label:"name",
				items: [
				        {name: nls.Spain_Catalan, id: "ca"}, // "Spain (Catalan)"
				        {name: nls.Denmark, id: "da"}, // Denmark
				        {name: nls.Germany, id: "de-de"}, // Germany
				        {name: nls.Greek, id: "el"}, // Greek
				        {name: nls.United_States, id: "en-us"}, // United States
				        {name: nls.United_Kingdom, id: "en-gb"}, // United Kingdom
				        {name: nls.Spain, id: "es-es"}, // Spain
				        {name: nls.Finland, id: "fi"}, // Finland
				        {name: nls.France, id: "fr-fr"}, // France
				        {name: nls.Italy, id: "it"}, // Italy
				        {name: nls.Japan, id: "ja"}, // Japan
				        {name: nls.Korean, id: "ko-kr"}, // Korean
				        {name: nls.Norway, id: "nb"}, // Norway
				        {name: nls.Netherlands, id: "nl"}, // Netherlands
				        {name: nls.Poland, id: "pl"}, // Poland
				        {name: nls.Brazil, id: "pt-br"}, // Brazil
				        {name: nls.Portugal, id: "pt"}, // Portugal
				        {name: nls.Russia, id: "ru"}, // Russia
				        {name: nls.Sweden, id: "sv-se"}, // Sweden
				        {name: nls.Thailand, id: "th"}, // Thailand
				        {name: nls.Turkey, id: "tr"}, // Turkey
				        {name: nls.China, id: "zh-cn"}, // China
				        {name: nls.Taiwan_China, id: "zh-tw"}, // Taiwan (China)
				        {name: nls.Israel, id: "he"} // Israel
				        ]
			};
		
		return store;
	},
	
	/*void*/_onItem: function (item) {
		if (item) {
			// set default locale in ComboBox
			var editor = websheet.model.ModelHelper.getEditor();
			var store = editor.localeList.store;
			editor.localeList._setValueAttr(store.getValue(item, "name"));
		}
	},

	/*string*/_getLocaleId: function (editor, displayedValue) {
		var locale = null;
		
		var store = editor.localeList.store;
		var items = store._getItemsArray();
		var found = false;
		for (var i = 0; i < items.length; ++i) {
			var item = items[i];
			var value = store.getValue(item, "name");
			if (value == displayedValue ) {
				found = true;
				locale = store.getValue(item, "id");
				break;
			}
		}
		
		return locale;		
	},
		
	onOk: function (editor) {
		var value = editor.localeList.getDisplayedValue();
		var nls = dojo.i18n.getLocalization("websheet.dialog", "spreadsheetSettings");
		if (!value && value === "") {
			this.setWarningMsg (nls.INPUT_EMPTY_LOCALENAME);
			dijit.setWaiState(this.localeList.textbox, "invalid", true);
			return false;
		}
		
		var locale = this._getLocaleId (editor, value);
		if (!locale) {
			dijit.setWaiState(this.localeList.textbox, "invalid", true);
			this.setWarningMsg (nls.INPUT_INVALID_LOCALENAME);
			return false;
		}
		var oldLocale = this.editor.scene.getLocale();
		if (locale == oldLocale) return true;
		
 		this.editor.scene.setLocale(locale);
 		
 		// must invalidate show value prior to reset number format
 		var cellList = websheet.Utils.invalidateShowValue();
 		websheet.Utils.broadcast(cellList);
 		
 		editor.resetNumberFormat();
 		editor.getAllFormulasDlg().setDirty(true);
 		var dataValidationHdl = editor.getDataValidationHdl();
 		if(dataValidationHdl)
 			dataValidationHdl.setLocalDirty();
 		this.oldValue = value;
 		
 		dojo["requireLocalization"]("websheet.i18n",'Number', locale);
		var newNLS = dojo.i18n.getLocalization("websheet.i18n","Number", locale);
		websheet.i18n.Number.setNLS(newNLS);
		dijit.setWaiState(this.localeList.textbox, "invalid", false);
		//update status bar result (if any).
		editor.getStatusBar().renderResult();
		//update LayoutEngine cached bundle;
		websheet.grid.LayoutEngine.getInstance().reloadDefaultState();
		
		editor.getController().getInlineEditor().formulaAssist.resetLocale();
		websheet.model.ModelHelper.resetLocale();
		websheet.parse.FormulaParseHelper.resetLocale();
		return true;
	},
	
	//set old locale back
	onCancel: function (editor) {
		editor.localeList.setDisplayedValue(this.oldValue);
		return true;
	}
});