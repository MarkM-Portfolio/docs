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

dojo.provide("concord.scenes.TextDocSceneRteOnline");

dojo.require("concord.beans.EditorStore");
dojo.require("concord.net.Session");
dojo.require("concord.beans.Document");
dojo.require("concord.scenes.TextDocOfflineScene");
dojo.require("writer.constants");
dojo.declare("concord.scenes.TextDocSceneRteOnline",  [concord.scenes.TextDocOfflineScene], {

	constructor: function(app, sceneInfo) {
		this.inherited(arguments);
		this.localEdit = false;
	},
	
	begin: function() {
		this.session = new concord.net.Session(this, this.sceneInfo.repository, this.sceneInfo.docId);
		this.editors = new concord.beans.EditorStore(null, null, null);	
		this.session.join();
		this.render();
	},
	
	getSession: function() {
		return this.session;
	},
	
	getEditorStore: function() {
		return this.editors;
	},
	
	isDocViewMode: function() {
		return false;
	},

	isIndicatorAuthor: function() {
		return true;
	},

	isTrackAuthor: function() {
		return true;
	},

	getCurrUserId: function() {
		return pe.authenticatedUser.getId();
	},

	getEditorStore: function() {
		return this.editors;
	},
	
	getDocBean: function() {
		var bean = null;
		if (this.session) bean = this.session.bean;
		return bean;
	},

	getUpdatedCriteria: function () {
		return null;
	},

	loading: function() {
	},

	loaded: function(state) {
		if (!state || state.participants.length == 0) {
			this.session.reload();
		} 
		var bean = this.getDocBean();
		if (bean)
		{
			// update document title
			var title = bean.getTitle();
			document.title = bean.getTitle();
			DOC_SCENE.title = document.title; 
			this.bean = bean;
		}
		
		// call editor to load document state
		this.loadState(state);
		dojo.publish(concord.util.events.doc_data_reload, [true]);
		
		if (this.session && this.session.isLoadedBefore())
		{
			this._hideLockBox();
			this._hideLoadingBox();
			this.readonly(false);
		}
		
		// Disable the menu item "Share..." if the document is not sharable.
		if (this.session && pe.shareWithMenuItem && !this.session.bean.getIsSharable())
		{
	        if(this.session.bean && !this.session.bean.getIsCommunityFile())
	          pe.shareWithMenuItem.setDisabled(true);
		}

		concord.util.dialogs.createTemplateFrame();
	},
	
	leave: function() {
		this.session.leave();
	},
	
	isDraftSaved: function() {
		return true;
	},

	saveDraft: function() {
		this.session.save();
	},
	
	switchDraftBadge: function() {
	},

	syncStarted: function() {
	},

	syncFinished: function() {
	},

	updateParticipant: function() {
	},

	coeditStarted: function() {
		this.coedit = true;
		dojo.publish(writer.constants.EVENT.COEDIT_STARTED);		
	},

	coeditStopped: function() {
		this.coedit = false;
		dojo.publish(writer.constants.EVENT.COEDIT_STOPPED);
	},

	userJoined: function(user) {
		var editCell = dojo.byId('editorFrame');
		if(editCell)
		{
	      try {
	      		var editor = this.getEditor();
	        	editor.execCommand("turnOnUserIndicator", {
	        		"user": user.getId(),
	        		notFocus:1
	        	});
	          } catch (e) {}
	      
          dojo.publish(writer.constants.EVENT.COEDIT_USER_JOINED, [user.getId()]);
        }
        else
  	    {
  		  setTimeout(dojo.hitch(this, this.userJoined, user), 1000);
  	    }
	},

	userLeft: function(user) {		
		dojo.publish(writer.constants.EVENT.COEDIT_USER_LEFT, [user]);
	},

	processMessage: function(msg) {
		writer.msg.msgHandler.receiveMessage(msg);
	},

	checkPending:function(){
		return false;
	},

	getLeaveData: function() {
		return null;
	},
	
	setLeaveData: function(data) {
	},
	
	gotoErrorScene: function() {
	},
	
    getUserIdbyIndicatorCSS: function(indClass) {
    	var uid = null, cid = indClass.replace("ind", "");
    	var uStatus = this.getUsersColorStatus(cid);
    	if(uStatus)
    		uid = cid;
    	else if (this._usersColorStatus) {
    		for(var csKey in this._usersColorStatus){
    			var csStatus = this._usersColorStatus[csKey];
    			if(csStatus.key == cid){
    				uid = csKey;
    				break;
    			}
    		}
    	}
    	return uid;
    },

    getUsersColorStatus: function(userId) {
    	return this._usersColorStatus && this._usersColorStatus[userId];
    },

    showInfoMessage: function() {
    },
    
    lock: function() {
    },
    
    unlock: function() {
    },
    
    offline: function() {
    },
    
    makeKickedOut: function() {
    },
    
    reconnecting: function() {
    },
    
    reconnected: function() {
    },
    
    generateRestoreMsg: function() {
    },
    
    restoreState: function() {
    },
    
    showErrorMessage: function() {
    },
    
    showDraftNothingSavedMessage: function() {
    },

    showSavedMessage: function() {
	},
    
    showSavingMessage: function() {
    },
    
    switchAutoPublishWidget: function() {
    },
    
    showRemoteVersionPublishedMessage: function() {
    },
    
    showEndSessionDialog: function() {
    },
	
	showUserCannotJoinMsg: function() {
	}
});