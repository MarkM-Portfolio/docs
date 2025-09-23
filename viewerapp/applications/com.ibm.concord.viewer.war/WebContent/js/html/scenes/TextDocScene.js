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
dojo.provide("html.scenes.TextDocScene");

dojo.require("html.scenes.AbstractScene");

dojo.declare("html.scenes.TextDocScene", 
			[html.scenes.AbstractScene], {

	DEFAULT_STYLE: 'slideMode',
	style: this.DEFAULT_STYLE,
	constructor: function(){
			
	},
	
	getTitleImageName: function(){
		if(g_env!="smart_cloud")
			return "ibmdocs_wordprocessing_32.png";
		else
			return "ibmdocs_textdocument_24.png";
	},

	insertModeButton: function(toolbar){
//		var button = new dijit.form.ToggleButton({
//			id: "T_Mode_Normal",
//			title: this.nls.labelNormal,
//			iconClass: "normalModeIcon",
//			showLabel: false,
//		    label: this.nls.labelNormal,
//		    _onClick: dojo.hitch(this, function(){		    	
//		    	})
//		});
//		button.attr('disabled', true);
//		toolbar.addChild(button);	
	},
	
	showHelp: function(){
		window.open(window.location.protocol+'//'+window.location.host + gPres_help_URL + this.helpTail);
	},
	
	loadData: function(){
		var con=dojo.byId("frm");
		var src=DOC_SCENE.version+"/content.html";
		if(DOC_SCENE.snapshotId!='null')
			dojo.attr(con,'src',src+'?sid='+DOC_SCENE.snapshotId);
		else
			dojo.attr(con,'src',src);
		var func=function(){
			var content_doc=frames['frm'].document;
			var precss=dojo.create("link");
			dojo.attr(precss,"href",staticResPath+"/js/html/css/htmlview.css");
			dojo.attr(precss,"type","text/css");
			dojo.attr(precss,"rel","stylesheet");
			var head=content_doc.getElementsByTagName("head")[0];
			head.appendChild(precss);
			precss=dojo.create("link");
			dojo.attr(precss,"href",staticResPath+"/js/html/css/concordstyles.css");
			dojo.attr(precss,"type","text/css");
			dojo.attr(precss,"rel","stylesheet");
			head.appendChild(precss);
			dojo.addClass(head.parentNode,'viewerfixedpage');
			dojo.addClass(frames['frm'].document.body,'pagefixedPage');
			pe.scene.setUIDimensions();
			pe.scene.hideErrorMessage();
			//fix image issue
			if(DOC_SCENE.snapshotId!='null')
			{
				var imgs=content_doc.getElementsByTagName('img');
				for(var i=0;i<imgs.length;i++)
				{
					if(imgs[i].hasAttribute('src'))
						imgs[i].src=imgs[i].src+'?sid='+DOC_SCENE.snapshotId;
				}
			}
		};
		if (con.attachEvent){ //For IE
			con.attachEvent("onload",func); 
		} else { 
			con.onload = func; 
		} 
	},
	
	setUIDimensions:function(){
		var bodyNode=frames['frm'].document.body;
		var width=parseFloat(bodyNode.style.width);
		var padding=parseFloat(bodyNode.style.paddingLeft)*2;
		var a=(parseFloat(dojo.byId('contentPane').offsetWidth)-this.CmToPx(width)-this.CmToPx(padding))/2;
		if(a>0)
			frames['frm'].document.body.style.marginLeft=a+'px';
	},
	CmToPx:  function (cm){
		var inch = cm/2.54;
		var pt = inch*72;
		var px = pt/0.75;
		return px;
	},
 	createContentWidget: function(){
 		var contentContainer = dijit.byId("contentPane");
 		var normalContentView=dojo.create('iframe');
 		dojo.attr(normalContentView,'id','frm');
 		dojo.attr(normalContentView,'name','frm');
 		dojo.style(normalContentView,'display','block');
 		dojo.style(normalContentView,'height','100%');
 		dojo.style(normalContentView,'width','100%');
 		dojo.style(normalContentView,'border','none');
 		contentContainer.setContent(normalContentView);
 		return normalContentView;
 	},
	insertZoomButton: function(toolbar){
	},
	insertPageButton: function(toolbar){
	},
	setCurrentScale: function(newScale){
	}
});