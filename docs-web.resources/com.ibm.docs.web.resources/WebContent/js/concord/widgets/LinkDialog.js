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

dojo.provide("concord.widgets.LinkDialog");

dojo.require("concord.widgets.TemplatedDialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.Select");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("concord.util.dialogs");
dojo.requireLocalization("concord.widgets","LinkDialog");
dojo.require("concord.util.BidiUtils");
(function()
{
	var showNode = function( node, visible )
	{
		node.style.display = visible ? "" : "none"; 
	};
	dojo.declare("concord.widgets.LinkDialog", [concord.widgets.TemplatedDialog], {

		targetChangeHandler : null,
		onshow_hdl : function(){},
		onhide_hdl : function(){},
		onok_hdl : function(){},
		constructor: function() {
			this.inherited(arguments);
			if(BidiUtils.isGuiRtl()) {
				dojo.query("div[name='url']")[0].dir = 'ltr';
			}
		},		
		
		targetChanged : function( value )
		{
			showNode( this.popupFeatures.domNode, value == 'popup' );
			if( this.nls )this.targetFrame.attr( "value", 
				value == 'popup' ? this.nls.targetPopupName : (value.charAt( 0 ) == '_' ? value : '') );
		},
		
		onKeyPressed: function(e){
			if (e.keyCode == dojo.keys.ENTER && e.target.id != 'C_d_LinkCancelButton' && e.target.id != 'C_d_LinkEmailBody') {
				this.chained_ok();
			}
		},
		_initVariables: function()
		{
			this.okButton = dijit.byId("C_d_LinkOkButton");
			this._attrRole("C_d_LinkUrlInput");
			dojo.connect(this, "onKeyUp", dojo.hitch(this,this.onKeyPressed));
		},
		startup : function(){
			this.inherited( arguments );
			this._initVariables();
		},
		dlgPostMixIn: function()
		{
			dojo.connect(this.okButton, "onClick", dojo.hitch(this,this.chained_ok));			
		},
		_attrRole : function(id){
			var node = dojo.byId(id);
			if(node){
				 dijit.setWaiRole(node,'textbox'); 
			}
		},		
//		execute : function(){
//			this.onok_hdl();
//		},
		onShow : function() {
			this.inherited( arguments );
			this.onshow_hdl();
			if (BidiUtils.isGuiRtl()){
        		var div = dojo.query("label[for=C_d_LinkUrlInput]").parent()[0];
        		div.dir = "rtl";
        		div = dojo.query("label[for=C_d_LinkProtocol]").parent()[0];
        		div.dir = "rtl";
        	}
//			var me = this;
//			setTimeout( function()
//				{
//					me.targetChangeHandler = dojo.connect( me.targetType, "onChange", dojo.hitch(me, me.targetChanged) );
//				},0 );
		},
		onHide : function() {
			this.inherited( arguments );
			this.onhide_hdl();
			
			dojo.disconnect( this.targetChangeHandler );
			this._firstFocusItem && this._firstFocusItem.blur();			
		},
		
		chained_ok : function()
		{
			var isValid = false;
			var element = null;
			element = dijit.byId('C_d_LinkUrlInput');
			isValid = element.isValid() || element.readOnly;
			
			if(!isValid)
				element.focus();
			if (isValid)
			{
				this.onok_hdl();
				this.hide();				
			}
		}
	});
	concord.widgets.LinkDialog.show = function( obj )
	{
		var nls;
		var id = "C_d_Link";
		var dlg = dijit.byId( id );
		if( !dlg )
		{
			nls = dojo.i18n.getLocalization("concord.widgets","LinkDialog"); 
			obj.nls = nls;
		}
		concord.util.dialogs.showDlgFromTmplt( id, obj, nls );
	};

})();
