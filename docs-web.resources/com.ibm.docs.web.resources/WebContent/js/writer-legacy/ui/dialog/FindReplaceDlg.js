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

dojo.provide("writer.ui.dialog.FindReplaceDlg");

dojo.require("concord.widgets.TemplatedDialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("concord.util.dialogs");
dojo.requireLocalization("writer.ui.dialog","FindReplaceDlg");

(function()
{
	dojo.declare("writer.ui.dialog.FindReplaceDlg", [concord.widgets.TemplatedDialog], {
		
		onShow : function()
		{
			this.inherited( arguments );
			dojo.hitch(this,this.onshow_hdl)();
		},
		onHide : function() {
			this.inherited( arguments );
			this.onhide_hdl();
			
			this._firstFocusItem && this._firstFocusItem.blur();
		},		
		
		getDefaultButton : function() {
			return this.findButton;		
		},
			
		onload_hdl : function(){},
		find_hdl : function(){},
		replace_hdl : function(){},
		replaceall_hdl : function(){},
		onhide_hdl : function(){},
		onload_hdl : function(){},
		onshow_hdl : function(){},
		
		_initVariables: function()
		{
			this._loadNls();
			
			this.preButton = dijit.byId("P_FindReplacePreButton");
			this.nextButton = dijit.byId("P_FindReplaceNextButton");
			this.replaceButton = dijit.byId("P_FindReplaceReplaceButton");
			this.replaceAllButton = dijit.byId("P_FindReplaceReplaceAllButton");
			
			this.findText_replace = dijit.byId("P_FindReplaceFindText_Replace");
			// Defect 23778. Can't get find text from the dijit widget.
			this.findText_replaceInput = dojo.byId("P_FindReplaceFindText_Replace");
			this.findText_replace.attr("onFocus", function() { this.focusNode.select(); });
			this.replaceText = dijit.byId("P_FindReplaceReplaceText");
			this.replaceText.attr("onFocus", function() { this.focusNode.select(); });
			dojo.addClass (this.findText_replace.domNode, "inputBox");
			dojo.addClass (this.replaceText.domNode, "inputBox");
			
			
			this.replaceCaseChk = dojo.byId("P_FindReplaceReplaceCaseChk");
			this.replaceWordChk = dojo.byId("P_FindReplaceReplaceWordChk");			
			this.highlightChk = dojo.byId("P_FindReplaceReplaceHighlightChk");
		},
        
		startup : function()
		{
			this.inherited( arguments );

			this.onload_hdl();
			this._initVariables();			
		},
		
		dlgPostMixIn: function(){
			dojo.connect( this.highlightChk, "onchange", dojo.hitch(this, this.highlight_hdl) );
			dojo.connect( this.replaceWordChk, "onchange", dojo.hitch(this, this.find_hdl) );
			dojo.connect( this.replaceCaseChk, "onchange", dojo.hitch(this, this.find_hdl) );
			dojo.connect( this.findText_replaceInput, "onkeyup", dojo.hitch(this, this.find_hdl) );
			dojo.connect( this.nextButton, "onClick", dojo.hitch(this, this.navigate_hdl,'next') );
			dojo.connect( this.preButton, "onClick", dojo.hitch(this, this.navigate_hdl,'pre') );
			dojo.connect( this.replaceButton, "onClick", dojo.hitch(this, this.replace_hdl) );
			dojo.connect( this.replaceAllButton, "onClick", dojo.hitch(this, this.replaceall_hdl) );
			dojo.connect( this.findText_replaceInput, "onkeydown", this, function(evt){
	        	if(evt.ctrlKey || evt.altKey || evt.metaKey)
	        	{
	        		dojo.stopEvent(evt);
	        		evt.preventDefault( true );
	        	}
	        } );
		},
		
		_loadNls :function (){
			if(!this.nls)
				this.nls = dojo.i18n.getLocalization("writer.ui.dialog","FindReplaceDlg"); 
			return this.nls;	
		}
		
	} );
	
	writer.ui.dialog.FindReplaceDlg.show = function( startpage, obj )
	{
		if (!obj) obj={};
		//Below is the 'interface' for caller of FindReplace dialog to implement.
		//They are all hitched and connected to the dialog, so caller can 
		//  use 'this' to refer any info of dialog in these callbacks.
		if (!obj.onshow_hdl) obj.onshow_hdl = function(){};
		if (!obj.onload_hdl) obj.onload_hdl = function(){};
		if (!obj.onhide_hdl) obj.onhide_hdl = function(){};
		if (!obj.find_hdl) obj.find_hdl = function(){alert ("a find handle ");};
		if (!obj.replace_hdl) obj.replace_hdl = function(){alert ("a replace handle");};
		if (!obj.replaceall_hdl) obj.replaceall_hdl = function(){alert ("a replace all handle");};
		
		var nls = dojo.i18n.getLocalization("writer.ui.dialog","FindReplaceDlg"); ;
		var id = "P_FindReplace";
//		var dialog = dijit.byId( id );
//		if( dialog ) {
//			dialog.hide();
//			dialog.destroyRecursive();
//			dialog = null;
//		}
		concord.util.dialogs.showDlgFromTmplt( id, obj, nls );
	};
})();
