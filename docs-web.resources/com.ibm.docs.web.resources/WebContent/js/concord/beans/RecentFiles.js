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

dojo.provide("concord.beans.RecentFiles");
dojo.declare("concord.beans.RecentFiles", null, {
	
	fileItems: null,
	EC_REPO_NOEDITPERMISSION: 1002,
	EC_REPO_NOTFOUNDDOC: 1003, 
	
	constructor : function(){
		this.fileItems = [];
		if(g_recentFiles && g_recentFiles.items)
		{
			for(var i=0; i< g_recentFiles.items.length; i++)
			{
				var aFile = new concord.beans.RecentFileItem(g_recentFiles.items[i]);
				this.fileItems.push(aFile);
			}				
		}
	},

	_loadRecentFiles: function(bUpdate) {		
		this.fileItems = [];
		var url = contextPath + "/api/recentfiles?method=getAll";
		var response, ioArgs;
		dojo.xhrGet({
			url: url,
			handleAs: "json",
			handle: function(r, io) {response = r; ioArgs = io;},
			sync: true
		});
		if(response && response.items)
		{	
			for(var i=0; i< response.items.length; i++)
			{
				var aFile = new concord.beans.RecentFileItem(response.items[i]);
				this.fileItems.push(aFile);
			}
		}
	},	
	
	deleteFileInList: function(docId, repoId)
	{
		var url = contextPath + "/api/deleterecentfile?method=delete&docId=" + docId + "&repoId=" + repoId;;
		var response, ioArgs;
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: function(r, io) {response = r; ioArgs = io;},
			sync: false
		});		
	},	
	
	_exist: function(docId, repoId){
		var url = contextPath + "/api/recentfiles?method=getFileStatus&docId=" + docId + "&repoId=" + repoId;
		var response, ioArgs;
		dojo.xhrGet({
			url: url,
			handleAs: "json",
			handle: function(r, io) {response = r; ioArgs = io;},
			sync: true
		});
		
		if(response && response.status != this.EC_REPO_NOTFOUNDDOC)
			return true;
		
		return false;
	},	
		
	getRecentFiles: function()
	{
		if(this.fileItems == null)
			this._loadRecentFiles();
		
		return this.fileItems;
	},
	
	updateRecentFiles: function()
	{
		this._loadRecentFiles();
	},
		
	openFile: function(docId, repoId)
	{
		if(this._exist(docId, repoId))
		{
			var url = contextPath + "/app/doc/" + repoId + "/" + docId + "/edit/content";
			window.open(url, docId.replace(/[-]/g, '_'), "");
			return true;
		}
		return false;
	}
});

dojo.provide("concord.beans.RecentFileItem");
dojo.declare("concord.beans.RecentFileItem", null, {
	
	constructor : function(entry){
		this.e = entry;
	},

	getDocId: function()
	{
		return this.e.docId;
	},
	
	getRepoId: function()
	{
		return this.e.repoId;
	},
	
	getTitle: function()
	{
		return this.e.docTitle;
	}
});

if(typeof RecentFiles == "undefined" || RecentFiles == null){
	RecentFiles = new concord.beans.RecentFiles();
}

