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


/**
 * @Save plugin.
 */
dojo.provide("writer.plugins.Save");
dojo.require("writer.plugins.Plugin");
dojo.declare("writer.plugins.Save",
[writer.plugins.Plugin], {
	init: function() {
		var saveDraftCmd =
		{
			exec : function(  )
			{
				setTimeout(dojo.hitch(pe.lotusEditor.currentScene,pe.lotusEditor.currentScene.saveDraft),0);   
				return true;
			}
		};
		var publisher = {
				publish : function(data, callback){
					
					pe.scene.updatePageCount(true);
					
					if (g_concordInDebugMode) try {console.log('publish plugin entry');} catch(e){}
					
					var publishPackage = preparePublishPackageAndCleanDoc();
					if(data != null)
					{
						dojo.mixin(publishPackage, data); 
					}
					pe.lotusEditor.currentScene.publish(publishPackage, callback);
					if (g_concordInDebugMode) try {console.log('publish plugin exit');} catch(e){}		
				}
			};
		var preparePublishPackageAndCleanDoc = function()
		{
			//Get document name and return package
			var docName = dojo.attr(dojo.byId('doc_title_text'), "title");	

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
		};
		var publishDialogCmd = {
				exec : function(editor){
					if( !pe.scene.publishDlg )
					{
						var nls = dojo.i18n.getLocalization("concord.widgets","CKResource");
						var okLabel = nls.concordsave.publishOkLabel;
						var titleLabel = nls.concordsave.concordpublishLabel;
						if(pe.scene.showCheckinMenu())	
						{
							okLabel = nls.concordsave.checkinLabel;
							titleLabel = nls.concordsave.checkinLabel;
						}
						
						pe.scene.publishDlg = new concord.widgets.PublishDialog( publisher, titleLabel, okLabel );
					}
					pe.scene.publishDlg.show();
				}
		};
		var SFRDialogCmd = {
				exec : function(editor){
					pe.scene.submitForReview();
					//pe.scene.setFocusToDialog();
				}
			};	
		if(pe.scene.supportSaveShortCut())
		{
			this.editor.addCommand( 'saveDraft', saveDraftCmd, writer.CTRL +  83); // CTRL + S			
		}
		else
		{
			this.editor.addCommand( 'saveDraft', saveDraftCmd);
		}		
		this.editor.addCommand( 'publishDialog', publishDialogCmd);
		this.editor.addCommand( 'SFRDialog', SFRDialogCmd);
	}
});


