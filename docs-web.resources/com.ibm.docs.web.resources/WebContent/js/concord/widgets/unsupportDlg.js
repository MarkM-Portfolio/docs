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

dojo.provide("concord.widgets.unsupportDlg");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.feature.FeatureController");
dojo.requireLocalization("concord.widgets","unsupportDlg");

dojo.declare("concord.widgets.unsupportDlg", [concord.widgets.concordDialog], {
	dlgnls: null,
	unsupFeatureList: null,
	notshowCB: null,
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	// The 'list' param must be something like this : [{"id":"601","isPreserved":false},{"id":"603","isPreserved":true}]
	// To add new 'unsupport feature id string', just modify the ../nls/unsupportDlg.js
	constructor: function(object, title, oklabel, visible, list) {
		this.unsupFeatureList = list;
		this.dlgnls = dojo.i18n.getLocalization("concord.widgets","unsupportDlg");
		if (!title)
		{		
			title = this.dlgnls.unsupportdlgTitle;
		}
		title += "#" + "C_d_UnsupportFeature";
		this.inherited( arguments );
		concord.util.events.subscribe(concord.util.events.doc_data_reload, this, 'setFocus');		
	},
	
	createContent: function (contentDiv) {
		var content,msgsDiv,ulEle,feature,featureStr,preserveStr,sentence,item = null;
		
		dojo.addClass( contentDiv, "lotusui30_layout ");
		content = contentDiv;
		msgsDiv = dojo.create("div", null, content );
		msgsDiv.id = "unsupportedFeatureId_" + (new Date()).getTime();
		this.describedInfoId = msgsDiv.id ;  
		
		dojo.style( msgsDiv, "width", "40em" );
		
//		var hasUnsupFeature = false, oldVersionDiv;
		
		var dlgHeader = dojo.create('div', {innerHTML:this.dlgnls.convertNotifyMsg, "class":"unsupportDlgHeader"}, msgsDiv);
//		ulEle = dojo.create('ul', {}, msgsDiv);
//		
//		//using "try catch" here so it's no need to judge 'if undefined' for every variable.
//		try	
//		{
//			for(var i = 0; i < this.unsupFeatureList.length; i++)
//			{
//				feature = dojo.trim(this.unsupFeatureList[i].id);
//				//fallback the id as description if not found in nls.
//				//featureStr = this.dlgnls[feature]? this.dlgnls[feature] : (feature+": ${0}"); 
//				featureStr = this.dlgnls[feature];
//				if (null == featureStr) continue;
//				
//				if(feature == '900') 	// old ODF version code
//				{
//					oldVersionDiv = dojo.create('div', {innerHTML:featureStr}, msgsDiv, "first");
//					continue;
//				}	
//				hasUnsupFeature = true;
//				
//				preserveStr = this.unsupFeatureList[i].isPreserved? this.dlgnls.PRESERVED : this.dlgnls.NOTPRESERVED;
//				item = dojo.create('li', {innerHTML:dojo.string.substitute(featureStr,[preserveStr])}, ulEle);
//				if (false === this.unsupFeatureList[i].isPreserved)
//				{
//					dojo.addClass( item, "cannotpreserved");
//				}
//			}
//		}
//		catch(e)
//		{
//			console.log("There are errors in createcontent of unsupport dialog : " + e);
//		}
//		
//		if(!hasUnsupFeature)
//		{
//			msgsDiv.removeChild(ulEle);
//			msgsDiv.removeChild(dlgHeader);
//			if(oldVersionDiv)
//				dojo.create('br', null, msgsDiv);	// Add a br after version div
//		}	
//		else if(oldVersionDiv)
//		{
//			// Add a break line under ODF Version
//			dojo.create('div', {"class":"dijitDialogPaneActionBar"}, oldVersionDiv);
//		}
		
		var chkdiv = dojo.create("label", null, msgsDiv );
		this.notshowCB = new dijit.form.CheckBox({checked: false,id:this.dialogId+"NotShowChk"});
		dojo.addClass( this.notshowCB.domNode, "notshowWarning" );
		chkdiv.appendChild(this.notshowCB.domNode);
		chkdiv.appendChild(dojo.doc.createTextNode(this.dlgnls.notShowCB));
//		dojo.create("div",{innerHTML:this.dlgnls.notShowNote}, msgsDiv);
	},
	
	focus:function(){
		this.dialog._getFocusItems(this.dialog.domNode);
		dijit.focus(this.dialog._firstFocusItem);
	},
	
	setFocus: function(){
		setTimeout( dojo.hitch(this, function(){        
			var okBtn = dojo.byId(this.OKButtonID);
			if(okBtn){
				okBtn.focus();
			} 
		}), 1000);		
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
	},
	
	onOk: function (editor) {
		// Overridden
		var showstatus = !this.notshowCB.checked;
		//sometime pe.showUnsupportMenuItem is not ready now, so put data in settings firstly.
		pe && pe.settings && pe.settings.setShowUnsupportedFeature(showstatus);
		pe && pe.showUnsupportMenuItem && pe.showUnsupportMenuItem.attr("checked", showstatus);
		delete pe.scene.unsupportDlg;
		return true;
	}
});