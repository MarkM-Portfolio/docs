/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.widgets.CommonDialog");
dojo.require("viewer.widgets.viewerDialog");
dojo.declare("viewer.widgets.CommonDialog", [viewer.widgets.viewerDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params) {
		//if (title) title += "#" + Math.random();
		this.inherited( arguments );
	},
	
	setDialogID: function() {
		//Set the dialog id as class name. 
		//  Because all commondialog and the inherited dialogs will be destoried when hide, 
		//  so to prevent id conflict, detect firstly, then append the dialog stack depth on the id.
		this.dialogId = "V_d_" + this.declaredClass.slice(this.declaredClass.lastIndexOf(".")+1);
		if (dojo.byId(this.dialogId))
		{
			this.dialogId = this.dialogId + dijit.Dialog._dialogStack.length;
		}
	},
	
	createContent: function (contentDiv) {
		dojo.addClass( contentDiv, "lotusui30_layout ");
		var content = contentDiv;
		if( this.params.imageclass )
		{
			content = dojo.create("div", null, contentDiv);
			dojo.addClass( content, " lotusErrorContent" );
			var img = dojo.create("IMG", null, content);
			img.src = window.staticResPath + "/js/dojo/resources/blank.gif";
			img.alt="";
			dojo.addClass( img, this.params.imageclass + " lotusIcon");
		}

		var msgsDiv = dojo.create("div", null, content );
		msgsDiv.id="ViewerDialogMSG_"+(new Date()).getTime();
		this.describedInfoID=msgsDiv.id;
		if( this.params.imageclass )
		{
			dojo.addClass( msgsDiv, "lotusErrorForm");
		}
		
		this.fillMsgs(msgsDiv);
	},
	
	fillMsgs: function(msgsDiv) {
		var msg_lines;
		if( this.params.message ) msg_lines = this.params.message.split("\n");
		for( var i=0; i<msg_lines.length; i++ )
		{
			var messageDiv = dojo.create('div', null, msgsDiv);
			//for html viewer
			if(msg_lines[i].indexOf('<')!=-1 && msg_lines[i].indexOf('>')!=-1){
				messageDiv.innerHTML = msg_lines[i];
			}else{
				var textNode = document.createTextNode( msg_lines[i] );
				messageDiv.appendChild(textNode);
			}
			messageDiv.style.cssText = "display:inline-block";
			if( messageDiv.clientWidth > 600 )
				messageDiv.style.cssText = "width:600px;word-wrap:break-word";
			else
				messageDiv.style.cssText = "";

			dojo.addClass (messageDiv, "viewerDialogBold");
		}
	},
	
	hide: function () {
		this._destroy();//for common dialogs, their id are random, need to destroy every time hiding.
	},
	calcWidth: function() {
		return "auto";
	}		
});

