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
dojo.require('concord.util.events');

dojo.provide("concord.beans.Document");

dojo.declare("concord.beans.Document", null, {
	activity: null,
	reviewPending: "pending",
	
	constructor: function(e) {
		this.e = e;
	},
	
	getTitle: function() {
		return this.e.title;
	},
	
	setTitle: function(title) {
		this.e.title = title;
	},
	
	getMimeType: function() {
		return this.e.mimetype;
	},
	
	getExtension: function() {
		return this.e.extension;
	},
	
	getOwner: function() {
		return this.e.owner;
	},

	getRepository: function() {
		return this.e.repo_id;
	},
	
	getUri: function() {
		return this.e.doc_uri; 
	},
	
	getModified: function() {
		return this.e.modified; 
	},
	
	getIsSharable: function() {
		if (typeof(this.e.sharable) != 'undefined' && this.e.sharable != null)
		{
			return this.e.sharable != false;
		}
		return true;
	},
	
	getIsExternal: function() {
		if (this.e.is_external)
		{
			return this.e.is_external == true;
		}
		return false;
	},
	
	getIsCommunityFile: function() {
	  if (typeof(this.e.iscommunityfile) != 'undefined' && this.e.iscommunityfile != null)
	  {
	    return this.e.iscommunityfile == "communityFiles";
	  }
	  return false;
	},
	
	setActivity: function(act) {
		this.activity = act;
	},
	
	getActivity: function(){
		return this.activity;
	},
	
	update: function(meta){
		dojo.mixin(this.e, meta);
		concord.util.events.publish(concord.util.events.document_metadata_updated, [this]);
	},
	
	getMetadata: function(){
		var meta = {};
		dojo.mixin(meta, this.e);
		return meta;
	},
	
	isLocked: function() {
		if(this.e && this.e.locked)
			return this.e.locked;
		else
			return false;
	},
	
	getLockOwner: function() {
		// get email, id, name from the json
		return this.e.lockOwner;
	},
	
	getApproveState: function() { // pending, null
		if(this.e.globalApprovalProperties)
			return this.e.globalApprovalProperties.approvalState;
		return null; 
	},
		
	getApproveProcess: function() { // BasicApproval
		if(this.e.globalApprovalProperties)
			return this.e.globalApprovalProperties.approvalProcess;
		return null;
	},
	
	getApprovers: function() {
		// approvers jsonarray, get the approver's approvalScope, approvalState, approverId, approverSelf, approverType one by one 
		return this.e.approvers;
	}

});
