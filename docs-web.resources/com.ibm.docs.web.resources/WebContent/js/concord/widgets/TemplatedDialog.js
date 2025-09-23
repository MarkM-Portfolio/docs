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

dojo.provide("concord.widgets.TemplatedDialog");
dojo.require("dijit.Dialog");
dojo.require("concord.util.BidiUtils");

dojo.declare("concord.widgets.TemplatedDialog", [dijit.Dialog], {
	constructor: function() {
		this.refocus = false;
		if(BidiUtils.isGuiRtl())
			this.dir = 'rtl';
	},

	//called after all widgets are created
	startup : function(){
		this.inherited( arguments );

		dojo.connect(this, "onKeyPress", function(event){
			//you can only reliably get character codes in the keypress event
			event = event || window.event;
			var key = (event.keyCode ? event.keyCode : event.which);
			if(key == 115 && (event.ctrlKey || event.metaKey)){
				if (event.preventDefault) 
					event.preventDefault();
				return;
			} 			
			if (dojo.keys.ENTER===event.keyCode) 
				this._enterKeyPressed(event);
	    	});
	},
	
	dlgPostMixIn: function()
	{
		alert("You need to implement this interface for dialog come from CK! -- dlgPostMixIn");
	},
	
	_enterKeyPressed : function( event ){
		if( this.stopEnterKey( event.target ) )return;
		var button = this.getDefaultButton();
		if( button ){
			dojo.stopEvent( event );
			concord.util.dialogs.fireClickEvent(button);
		}
	},
	
	_isButton : function(node)
	{
		return "button" === node.tagName.toLowerCase() || dojo.hasClass(node, "dijitButton") || dojo.hasClass(node, "dijitButtonContents") || dojo.hasClass(node, "dijitButtonText");
	},
	
	//override if a specific node doesn't need to treat "enter" as clicking the OK button
	stopEnterKey : function( node ){
		var tag = node.tagName.toLowerCase();
		//return "button" === tag || "textarea" === tag || "span" === tag;
		if("textarea" === tag || this._isButton(node))
			return true;
		
		return false;
	},
	
	//called before the dialog become visible every time
	onShow : function() {
		this.inherited( arguments );
	},
	//called before the dialog become invisible every time
	onHide : function() {
		this.inherited( arguments );
		if(typeof pe != 'undefined'){
			setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
		}
	},

	//return the button that will be clicked programmatically when "enter" is pressed anywhere
	getDefaultButton : function() {
		var button = null;
		dojo.query("button[type='submit']",this.domNode).some(function(item){
			button = item;
			return true;
			});
		return button ? dijit.getEnclosingWidget( button ) : null;
	},

	//called after the submit button is clicked and the dialog became invisible
	execute : function( data ) {
		alert( dojo.toJson(data) );
	},
	
	beforeSubmit : function(){
		return true;//true to continue, false to stop
	}
});

