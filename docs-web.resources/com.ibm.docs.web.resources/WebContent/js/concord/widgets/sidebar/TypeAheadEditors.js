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

dojo.provide("concord.widgets.sidebar.TypeAheadEditors");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("concord.util.emailParser");
dojo.require("concord.beans.EditorStore");

dojo.declare(
	"concord.widgets.sidebar.TypeAheadEditors",
	[dijit.form.FilteringSelect, concord.beans.EditorStoreListener],
	{
		curIndex: -1,
		editorlist: null,	
		eAts:null,
		constructor: function(args){
			this.updateStore();			
			pe.scene.getEditorStore().registerListener(this);
		},
		searchAttr: "displayName",
		hasDownArrow: false,
		postCreate: function()
		{	
			this.inherited(arguments);			
			this.store.fetch({queryOptions:{ignoreCase:false, deep:false}, query: "", onComplete:dojo.hitch(this, "onFirstLoad"), start:0, count:0});
		},

		onFocus : function()
		{
		},
		
		validate: function(isFocused) {
				return true;
		},

		onFirstLoad: function(){
			this.store.close();
		},
			
		getPrincipal: function(){
			return concord.util.emailParser.getEmail(this.textbox.value);			
		},
		getUserID: function() {
			var idx = this.curIndex;
			if(idx < 0 || idx >= this.editorlist.items.length)
				return null;
			return this.editorlist.items[idx].userId;			
		},
		
		getUserName: function() {
			var idx = this.curIndex;
			if(idx < 0 || idx >= this.editorlist.items.length)
				return null;
			return this.editorlist.items[idx].displayName;			
		},
		
		getOrgID: function() {			
			var idx = this.curIndex; 
			if(idx < 0 || idx >= this.editorlist.items.length)
				return null;
			return this.editorlist.items[idx].orgId;			
		},
		
		updateStore: function() {
		    var editorStore = pe.scene.getEditorStore();
		    this.editorlist = editorStore.getClonedEditors();
		    var editors = editorStore.getClonedEditors();
	     	for(var i = 0; i < editors.items.length; i++)
	     	{
	     		editors.items[i].displayName = '@' + editors.items[i].displayName;
	     	}
	     	this.eAts = dojo.clone(editors);
		    var dataStore = new dojo.data.ItemFileReadStore({
			     data: editors  
			  });
			this.store= dataStore;		
		},
		setAssignee: function(id) {
			for(var idx=0; idx <= this.eAts.items.length; idx++)
			{
				var item = this.eAts.items[idx];
				if (id == item.userId)      	   
				{
					this.setDisplayedValue(item.displayName);      		   
					break;
				}
			}			
		},
		
		_selectOption: function(evt)
		{
			this.inherited(arguments); 
			setTimeout(dojo.hitch(this, function() {  dojo.publish(concord.util.events.typeahead_selection, [this]); }), 200);
		},
		
		_onKey: function(/*Event*/ evt) {
			this.inherited("_onKey", arguments);      
			var key = evt.charOrCode;
			if (key == dojo.keys.ENTER) {
				setTimeout(dojo.hitch(this, function() {  dojo.publish(concord.util.events.typeahead_selection, [this]); }), 200);             
			}
		},	
		///////////////////////////////////////////////////////////////////////////////////////////////////
		//  implement of  concord.beans.EditorStoreListener   /////////////////////////////////////////////
		editorsUpdated: function()
		{
			this.updateStore();
		}		
});

