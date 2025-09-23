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

dojo.provide("pres.handler.BasicOptHandler");
dojo.require("concord.widgets.PublishDialog");
dojo.require("concord.util.uri");
dojo.requireLocalization("concord.widgets", "CKResource");

dojo.declare("pres.handler.BasicOptHandler", null, {

	publishPres: function()
	{
		pe.scene.msgPublisher.sendPending();
		pe.scene.session && pe.scene.session.save(true);
		var basicOptHandler = this;
		var saver = {
				publish : function(data, callback){
					var d = {};
					d.data = data;
					d.cb = callback;
					basicOptHandler._doPublish(d);
				}
			};
		var nls = dojo.i18n.getLocalization("concord.widgets","CKResource");
		if( !pe.scene.publishDlg )
		{
			var okLabel =  nls.concordsave.publishOkLabel;
			var titleLabel = nls.concordsave.concordpublishLabel;
			if(pe.scene.showCheckinMenu())	
			{
				okLabel = nls.concordsave.yesLabel;
				titleLabel = nls.concordsave.checkinLabel;
			}		
			pe.scene.publishDlg = new concord.widgets.PublishDialog( saver, titleLabel, okLabel );
		}
		pe.scene.publishDlg.show();
	},
	_doPublish:function(d){
		var publishPackage = this._preparePublishPackageAndCleanDoc();
		if(d.data != null)
		{
			dojo.mixin(publishPackage, d.data); 
		}
		pe.scene.publish(publishPackage, d.cb);
	},
	_preparePublishPackageAndCleanDoc:function()
	{
		//Get document name and return package
		var title = document.getElementById('doc_title_text');
		var docName = dojo.attr(title, "title");	
		if (!pe.scene.bean.newTitle){ //If bean.newTitle does not exist then this is the first time user is renaming the document
			if (pe.scene.bean.getTitle() == docName){  //If equal then this is not a new name				
				return {};							
			} else { //User has renamed document for first time here.
				pe.scene.bean.newTitle = docName;
				return { "newTitle":docName};
			}						
		} else {  // user may have renamed the doc again
			if (pe.scene.bean.newTitle == docName){ // Same name user did not rename more than once
				return {};				
			}else {
				pe.scene.bean.newTitle = docName;
				return {"newTitle":docName};								
			}					
		}
	},
	printPresHtml: function()
	{
		var s = pe.scene;
		if (!s.isHTMLViewMode())
		{
			s.msgPublisher.sendPending();
			s.session && s.session.save(true);
		}
		s.printHtml();
	}
});