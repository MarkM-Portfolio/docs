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

dojo.provide("concord.widgets.InsertTableDlg");

dojo.require("concord.widgets.TemplatedDialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("concord.util.dialogs");
dojo.requireLocalization("concord.widgets","InsertTableDlg");

(function()
{
	dojo.declare("concord.widgets.InsertTableDlg", [concord.widgets.TemplatedDialog], {

		onShow : function()
		{
			this.inherited( arguments );	
			this.stRows.setDisabled(false);
			this.stRows.setValue(4);
			this.stCols.setDisabled(false);
			this.stCols.setValue(4);
			
			dojo.hitch(this,this.onshow_hdl)()
		},
		onHide : function() {
			this.inherited( arguments );
			this.onhide_hdl();
		},
		
		onload_hdl : function(){},
		onok_hdl : function(){},
		onshow_hdl : function(){},
		onhide_hdl : function(){},
		getDefaultButton : function() {
			return this.okButton;
		},
		
		_initVariables: function()
		{
			this.stRows = dijit.byId("C_d_InsertTableRows");
			this.stCols = dijit.byId("C_d_InsertTableCols");
			this._attrTextboxRole("C_d_InsertTableRows");
			this._attrTextboxRole("C_d_InsertTableCols");
			this.okButton = dijit.byId("C_d_InsertTableOkButton");
		},
		
		_attrTextboxRole : function(id){
			var node = dojo.byId(id);
			if(node){
				 dijit.setWaiRole(node,'textbox');    
			}
		},
				
		startup : function()
		{ 
			this.inherited( arguments );
			this._initVariables();
			this.onload_hdl();
		},
		
		dlgPostMixIn: function()
		{
//			dojo.connect(this.useTemplate.domNode, "onclick", dojo.hitch(this,this.switchComponentState));
			dojo.connect(this.okButton, "onClick", dojo.hitch(this,this.chained_onok));			
		},
		
		chained_onok : function()
		{
			if (this.validate())
			{
				this.onok_hdl();
				this.hide();
			}
			else
			{
				//this.validate() will show the validate message
			}
		}
	} );
	
	concord.widgets.InsertTableDlg.show = function( obj )
	{
		if (!obj) obj={};

		//Below is the 'interface' for caller of insert table dialog to implement.
		//They are all hitched and connected to the dialog, so caller can 
		//  use 'this' to refer any info of dialog in these callbacks.
		if (!obj.onshow_hdl) obj.onshow_hdl = function(){};
		if (!obj.onload_hdl) obj.onload_hdl = function(){};
		if (!obj.onhide_hdl) obj.onhide_hdl = function(){};
		if (!obj.onok_hdl) obj.onok_hdl = function(){alert ("on OK handle");};

		var nls;
		var id = "C_d_InsertTable";
		var dlg = dijit.byId( id );
		if( !dlg )
		{
			nls = dojo.i18n.getLocalization("concord.widgets","InsertTableDlg"); 
		}
		concord.util.dialogs.showDlgFromTmplt( id, obj, nls );
	};
})();
