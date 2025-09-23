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
dojo.provide("viewer.scenes.SheetDocScene");

dojo.require("viewer.scenes.BasicDocScene");
dojo.declare("viewer.scenes.SheetDocScene", 
			[viewer.scenes.BasicDocScene], {
	
	constructor: function(){
		
	},
	
	createThumbnailWidget: function(){
		var thumbnailPane = dojo.byId('thumbnailPane');
		if(thumbnailPane&&thumbnailPane.nextSibling)
		{
			if (dojo.isIE){
				this.thumbnailView = new viewer.widgets.ThumbnailPicker({id: "thumbnailView",
					size: this.doc.getPages(),
				pagesInfo: this.doc.getPagesInfo(),
					thumbWidth: this.DEFUALT_THUMBNAIL_WIDTH,
					//baseUri: this.getThumbnailRoot(),
					baseUri: this.getPageRoot(),
					tabIndex: 0,
					viewManager: this
					});
				dijit.byId('thumbnailPane').setContent(this.thumbnailView.domNode);
				dojo.style(thumbnailPane, "width", "0px");
				dojo.style(thumbnailPane.nextSibling, "width", "0px");

			} else {
				dojo.destroy(thumbnailPane.nextSibling);
				dojo.destroy(thumbnailPane);
			}
			this.setCurrentStyle();
		}
	},
	
	setCurrentStyle: function(){
		var contentPane = dojo.byId('contentPane');
		dojo.style(contentPane,"left","0px");
		dojo.style(contentPane,"width","100%");
		dojo.publish(viewer.util.Events.STYLE_CHANGED, [""]);
		dojo.publish(viewer.util.Events.SCALE_CHANGED, ["1.0"]);
		dijit.byId('T_Mode_Continuous').attr('checked', false);
	},
	
	getTitleImageName: function(){
		if(g_env!="smart_cloud")
			return "ibmdocs_spreadsheets_32.png";
		else
			return "ibmdocs_spreadsheet_24.png";
	},
	showHelp: function(){
		var regEx = new RegExp("^((https|http|)?:\/\/)[^\s]+");
		if(regEx.test(gSheet_help_URL)){
			window.open(gSheet_help_URL);
		}
		else{
			window.open(window.location.protocol+'//'+window.location.host + gSheet_help_URL + this.helpTail);
		}
	}

});