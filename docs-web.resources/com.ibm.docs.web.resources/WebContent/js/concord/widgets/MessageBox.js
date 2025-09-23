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

dojo.provide("concord.widgets.MessageBox");
dojo.require("concord.widgets.CommonDialog");
dojo.declare("concord.widgets.MessageBox", [concord.widgets.CommonDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params ) {
		visible = false;
		this.describedInfoId = "describedInfoId_" + (new Date()).getTime();
		this.inherited( arguments );
	},
	
	onOk: function (editor) {
		if( this.params.callback )
			this.params.callback(editor);
	},
	
	onCancel: function(editor) {
		if (this.params.cancelCallback)
			this.params.cancelCallback(editor);
			
		return true;
	}
});

dojo.provide("concord.widgets.SingletonConfirmBox");
//This kind SingletonConfirmBox should be used for the message box only show one time when loading
dojo.declare("concord.widgets.SingletonConfirmBox",[concord.widgets.MessageBox],{
	
	constructor: function(){
		this.inherited( arguments );
	},
	
	returnFocus: function() {
		var widget = concord.feature.FeatureController.getWidget();
		if(widget){	
			if(widget.isShown()){
				widget.setFocus();
			}else{
				widget.show();
			}				
			return;
		}
		this.inherited(arguments);		 
	}
});