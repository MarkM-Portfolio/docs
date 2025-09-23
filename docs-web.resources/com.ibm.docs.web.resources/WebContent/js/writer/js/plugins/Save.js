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
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-attr",
    "writer/constants",
    "writer/plugins/Plugin",
    "dojo/i18n!concord/widgets/nls/CKResource",
    "concord/db/indexDB"
], function(declare, lang, dom, domAttr, constants, Plugin, i18nCKResource, indexDB) {

    var Save = declare("writer.plugins.Save", Plugin, {
        init: function() {
            var saveDraftCmd = {
                exec: function() {
                    setTimeout(lang.hitch(pe.lotusEditor.currentScene, pe.lotusEditor.currentScene.saveDraft), 0);
                    return true;
                }
            };

            var saveOfflineCmd = {
        	   exec: function(bSerialized) {
        		   var jsonStr = pe.lotusEditor.document.getData("json");
        		   if (pe.scene.localEdit)
        		   	    window.db && window.db.save({id:DOC_SCENE.docId, data:jsonStr}, function(){});
        		   else if (bSerialized) {
        		    	// Send json content to parent window in different origin and save it in parent window's indexDB for offline support
        		   	    var origin = "file://";
        		        var action = "save";
        		        var seq = pe.scene.session && pe.scene.sesssion.getCurrentSeq();
        		   		window.parent.postMessage({id: DOC_SCENE.docId, action: action, content: jsonStr, messageIndex: seq}, origin);
        		   }

				   pe.scene.setDirty(false);
        		   return true;
        	   }
            };

            var publisher = {
                publish: function(data, callback) {

                    pe.scene.updatePageCount(true);

                    if (g_concordInDebugMode) try {
                        console.log('publish plugin entry');
                    } catch (e) {}

                    var publishPackage = preparePublishPackageAndCleanDoc();
                    if (data != null) {
                        lang.mixin(publishPackage, data);
                    }
                    pe.lotusEditor.currentScene.publish(publishPackage, callback);
                    if (g_concordInDebugMode) try {
                        console.log('publish plugin exit');
                    } catch (e) {}
                }
            };
            var preparePublishPackageAndCleanDoc = function() {
                //Get document name and return package
                var docName = domAttr.get(dom.byId('doc_title_text'), "title");

                if (!pe.scene.bean.newTitle) { //If bean.newTitle does not exist then this is the first time user is renaming the document
                    if (pe.scene.bean.getTitle() == docName) { //If equal then this is not a new name				
                        return {};
                    } else { //User has renamed document for first time here.
                        pe.scene.bean.newTitle = docName;
                        return {
                            "newTitle": docName
                        };
                    }
                } else { // user may have renamed the doc again
                    if (pe.scene.bean.newTitle == docName) { // Same name user did not rename more than once
                        return {};
                    } else {
                        pe.scene.bean.newTitle = docName;
                        return {
                            "newTitle": docName
                        };
                    }
                }
            };
            var publishDialogCmd = {
                exec: function(editor) {
                    if (!pe.scene.publishDlg) {
                        var nls = i18nCKResource;
                        var okLabel = nls.concordsave.publishOkLabel;
                        var titleLabel = nls.concordsave.concordpublishLabel;
                        if (pe.scene.showCheckinMenu()) {
                            okLabel = nls.concordsave.yesLabel;
                            titleLabel = nls.concordsave.checkinLabel;
                        }

                        pe.scene.publishDlg = new concord.widgets.PublishDialog(publisher, titleLabel, okLabel);
                    }
                    pe.scene.publishDlg.show();
                }
            };
            var SFRDialogCmd = {
                exec: function(editor) {
                    pe.scene.submitForReview();
                    //pe.scene.setFocusToDialog();
                }
            };
            var saveVersionCmd = {
            	 exec: function() {
                    setTimeout(lang.hitch(pe.lotusEditor.currentScene, pe.lotusEditor.currentScene.saveDraft, null, true), 0);
                    return true;
                }
            }

			if (!pe.scene.localEdit) {
            	this.editor.addCommand('saveDraft', saveDraftCmd, constants.KEYS.CTRL + 83); // CTRL + S
            	this.editor.addCommand('saveOffline', saveDraftCmd);
            } else
            	this.editor.addCommand('saveOffline', saveOfflineCmd, constants.KEYS.CTRL + 83);
			this.editor.addCommand('saveVersion', saveVersionCmd);
            this.editor.addCommand('publishDialog', publishDialogCmd);
            this.editor.addCommand('SFRDialog', SFRDialogCmd);
        }
    });

    return Save;
});
