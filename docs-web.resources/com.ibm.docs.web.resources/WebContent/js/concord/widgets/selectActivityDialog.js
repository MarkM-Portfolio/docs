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

dojo.provide("concord.widgets.selectActivityDialog");
dojo.require("dijit.Dialog");
dojo.require("concord.widgets.concordDialog");
dojo.require("dojo.i18n");
dojo.require("concord.beans.TaskService");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.Select");
dojo.requireLocalization("concord.widgets","selectActivityDialog");
dojo.require("concord.beans.Activity");
dojo.require("concord.util.events");
dojo.declare("concord.widgets.selectActivityDialog", [concord.widgets.concordDialog], {
	
	constructor: function(object) {
		this.editor = object;
		
		var dialog = this.dialog;
		dialog.titleNode.innerHTML = this.DIALOG_TITLE;
	},
	
	_setNLSStr: function() {
		this.nls = dojo.i18n.getLocalization("concord.widgets","selectActivityDialog");
		if(this.nls)
		{
			this.DIALOG_TITLE = this.nls.DIALOG_TITLE;  
			if(window.pe.scene.docType == "pres"){
				this.DIALOG_NOTICE = this.nls.DIALOG_NOTICE_PRES;
			}else{
				this.DIALOG_NOTICE = this.nls.DIALOG_NOTICE;
			}
			
			this.LISTBOX_TITLE = this.nls.LISTBOX_TITLE;
			this.NEW_ACTIVITY = this.nls.NEW_ACTIVITY;
			this.LISTBOX_DEFAULT = this.nls.LISTBOX_DEFAULT;
			this.NEW_ACTIVITY_NAME = this.nls.NEW_ACTIVITY_NAME;
			
			this.INVALID_SELECTION = this.nls.INVALID_SELECTION;
			this.ACTIVITY_NAME_REQUIRED = this.nls.ACTIVITY_NAME_REQUIRED;
			this.DEFAULT_NOT_WORK = this.nls.DEFAULT_NOT_WORK;
			this.LINK_FAIL = this.nls.LINK_FAIL;
		}	
	},
		
	setDialogID: function() {
		this.dialogId = "C_d_SelectActivityDialog";
	},	
	
	createContent: function (contentDiv) {
		this._setNLSStr();
		var doc = dojo.doc;
		
		// notice div
		var aDiv = dojo.create('div', {style: "width: 400px"}, contentDiv);
		var textNode = doc.createTextNode(this.DIALOG_NOTICE);
		aDiv.appendChild(textNode);
		dojo.addClass (aDiv, "concordDialogBold");
		aDiv.appendChild(dojo.create('br', null, contentDiv));
		
		// activity selection title div
		aDiv = dojo.create('div', null, contentDiv);
		aDiv.appendChild(dojo.create('br', null, contentDiv));
		textNode = doc.createTextNode(this.LISTBOX_TITLE);
		aDiv.appendChild(textNode);
		
		var options = [];
		
		options[0] = {
				label: this.LISTBOX_DEFAULT,
				value: '-1',
				selected: true
			};

		options[1] = {
				label: this.NEW_ACTIVITY,
				value: '0'
			};
							
		// activity select div
		aDiv = dojo.create('div', null, contentDiv);
		
		var select = new dijit.form.Select({
            name: 'select2',
            options: options,
            style: {'width': '350px'},
            id: 'C_d_SelectActivitySelect'
        }).placeAt(aDiv);
        
        options = null;
		dojo.connect(select, "onChange", dojo.hitch( this, this._comboOnChange ));
		
		aDiv.appendChild(dojo.create('br', null, contentDiv));
		aDiv.appendChild(dojo.create('br', null, contentDiv));
		
		// new activity div
		aDiv = dojo.create('div', {id:'new_activity_div'}, contentDiv);
		textNode = doc.createTextNode(this.NEW_ACTIVITY_NAME);
		aDiv.appendChild(textNode);
		aDiv.appendChild(dojo.create('br', null, contentDiv));
        var nameInput = pe.scene.bean.getTitle();//apply default value
        
		var actNameInput = new dijit.form.TextBox({value:nameInput, intermediateChanges:true, style: dojo.isIE ? {'width': '350px','height':'15px','padding-top':'2px'} : {'width': '350px'}, id:'C_d_SelectActivityNewActivity'});
		aDiv.appendChild(actNameInput.domNode);
		
		aDiv.appendChild(dojo.create('br', null, contentDiv));
		aDiv.appendChild(dojo.create('br', null, contentDiv));
		
		aDiv.style.display = "none";
	},
		
	_comboOnChange: function(selection){
		
		this.setWarningMsg("");
		
		if (selection == "0")
		{
			var aDiv = document.getElementById( 'new_activity_div' );
			if (aDiv != null && aDiv.style.display == "none")
			{
				aDiv.style.display = "";
			}	
		}
		else
		{
			var aDiv = document.getElementById( 'new_activity_div' );
			if (aDiv != null && aDiv.style.display == "")
			{
				aDiv.style.display = "none";
			}	
		}
	},	
	
//	show: function(){
//		this.dialog._fadeIn.play();
//		this.inherited(arguments);
//	}, 
	
	onShow:function(editor){		
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs', 'presModal':true}];
		setTimeout(dojo.hitch(this, concord.util.events.publish,concord.util.events.presentationFocus, eventData), 25);
	},

	reset: function(){
		var selection = dijit.byId('C_d_SelectActivitySelect');
		var options = selection.options;
		if (options.length>2){
			var removedOptions=options.slice(2); // the first two options should not be removed
			selection.removeOption(removedOptions);
			removedOptions = null;
		}
		
		var underlay = dijit._underlay;
		if(!underlay){
			underlay = dijit._underlay = new dijit.DialogUnderlay(null);
		}
		underlay.show();
		
		var queryResult = concord.beans.TaskService.getActivities(null);
		var addedOptions = [];
		for(var i = 0; i<queryResult.length; i++)
		{
			addedOptions[i] = {
					label: queryResult[i].getTitle(),
					value: queryResult[i].getId()
			};
		}
		
		queryResult = null;
		
		selection.addOption(addedOptions);
		addedOptions = null;
		
		underlay.hide();
	},
	
	onOk: function (editor) {
		//if(window.g_presentationMode) {
		//	window.pe.scene.enableDefaultMouseDownHandler();
		//}
		var result = false;
		var selection = dijit.byId('C_d_SelectActivitySelect').getValue();
		if (selection == undefined )
		{
		    this.setWarningMsg(this.INVALID_SELECTION);
			return false;
		}
		
		
		if (selection == "0")
		{
			// new an activity to link
			var nameInput = dijit.byId("C_d_SelectActivityNewActivity").getValue();
			if ((nameInput!=undefined)&&(nameInput.length>0))
			{
				var activity = concord.beans.TaskService.linkNewActivity(pe.scene.bean, nameInput, null);
				if ((activity != undefined)&&(activity!=null))
				{
					concord.beans.TaskService.updateActLink(activity.getId(), activity.getTitle());
					return true;
				}
			}
			else
			{
				this.setWarningMsg(this.ACTIVITY_NAME_REQUIRED);
				return false;
			}
		}
		else if (selection != "-1")
		{
		    // select an existing activity to link
			var activity = concord.beans.TaskService.linkExistActivity(pe.scene.bean, selection, null);
			if ((activity != undefined)&&(activity!=null))
			{				
				concord.beans.TaskService.updateActLink(activity.getId(), activity.getTitle());
				return true;
			}
		}
		else
		{
			this.setWarningMsg(this.DEFAULT_NOT_WORK);
			return false;
		}
			
		if ((result==undefined)||(result==false))
		{
			this.setWarningMsg(this.LINK_FAIL);
			return false;
		}
	},
	
	onCancel: function (editor) {
		//if(window.g_presentationMode) {
		//	window.pe.scene.enableDefaultMouseDownHandler();
		//}
		// do nothing
		return true;
	}


});
