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

dojo.provide("concord.widgets.LockBox");
dojo.require("concord.widgets.CommonDialog");
dojo.require("concord.widgets.LotusTextButton");
dojo.require("concord.util.BidiUtils");

dojo.declare("concord.widgets.LockBox", [concord.widgets.CommonDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params) {
		visible = false;
		this.okVisible = false;
		this.closeVisible = false;
		this.titleMsg = params.titleMsg;
		this.inherited( arguments );
	},
	
	postCreate: function()
	{
		// No button in LockBox, so do not show the gray line in footer div, but only show an empty area.
		var footerDiv = this.getBtnContainer();
		if (footerDiv)
		{
			footerDiv.className = "dijitDialogPaneContentArea";
			footerDiv.style.cssText = "height: 20px";
		}
	},
	
	createContent: function (contentDiv) {
		dojo.addClass( contentDiv, "lotusui30_layout ");
		var content = contentDiv;
		
		var imgClass = "lotusIcon";
		if( this.params.imageclass )
			imgClass = this.params.imageclass + " lotusIcon";
		
		content = dojo.create("div", null, contentDiv);
		dojo.addClass( content, " lotusErrorContent" );
		if(BidiUtils.isGuiRtl())
			dojo.attr(content, "dir", "rtl");

		var img = dojo.create("IMG", null, content);
		if(this.params.errorType == "info")
			img.src = window.contextPath + window.staticRootPath + "/images/msgInfo48.png";
		else if(this.params.errorType == "warning")
			img.src = window.contextPath + window.staticRootPath + "/images/msgWarning48.png";
		else
			img.src = window.contextPath + window.staticRootPath + "/js/dojo/resources/blank.gif";
		
		dojo.addClass( img, imgClass);
		dojo.attr(img,'alt','');

		var msgsDiv = dojo.create("div", null, content );
		if(this.describedInfoId)
			msgsDiv.id = this.describedInfoId;
		if( this.params.imageclass )
		{
			dojo.addClass( msgsDiv, "lotusErrorForm");
		}
		if( this.params.msgsDivStyle )
		{
			msgsDiv.style.cssText = this.params.msgsDivStyle;
		}
		
		this.fillMsgs(msgsDiv);
	},	
	
	fillMsgs: function(msgsDiv) {
		if(this.titleMsg) {
			var titleDiv = dojo.create("div", null, msgsDiv);
			dojo.addClass( titleDiv, "concordDialogTitleMessage");
			var textNode = document.createTextNode( this.titleMsg );
			titleDiv.appendChild(textNode);
		}
		var msg_lines = {};
		if( this.params.message ) msg_lines = this.params.message.split("\n");		
		var table = dojo.create('table', null, msgsDiv);
		dijit.setWaiRole(table,'presentation');
		for( var i=0; i<msg_lines.length; i++ )
		{
			var tr = dojo.create('tr', null, table);
			var td = dojo.create('td', null, tr);
			var textNode = document.createTextNode( msg_lines[i] );
			td.appendChild(textNode);
		}
		if( table.clientWidth > 400 )
			table.style.cssText = "display:inline-block;width:400px;word-wrap:break-word";
		
		var url = pe.scene.getFileDetailsURL(); //"http://localhost:9080/docs/version.txt";
		if(this.params.customizedBtnLabel && url) {
			var tr = dojo.create('tr', null, table);
			var td = dojo.create('td', null, tr);	
			dojo.addClass( td, "concordDialogPaddingTop");		
			var param = {label: this.params.customizedBtnLabel, id: this.params.customizedBtnLabel,onClick: dojo.hitch(this, "_onClick", url)};;
			var button = new concord.widgets.LotusTextButton(param);
			
			var btnDiv = dojo.create("div", null, td);			
			btnDiv.appendChild(button.domNode);			
		}
	},
	
	_onClick: function(url) {
		setTimeout(dojo.hitch(this, this._goBackFiles, url), 30);		
	},
	
	_goBackFiles: function(url) {
		window.location = url; 
		this.hide();
	}
});
