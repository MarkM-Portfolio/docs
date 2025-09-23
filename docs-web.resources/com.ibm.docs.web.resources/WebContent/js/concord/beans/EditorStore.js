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
 * @author dragonli
 */
dojo.provide("concord.beans.EditorStore");
dojo.require("concord.beans.EditorStoreListener");

dojo.require("concord.beans.Editors");
dojo.require("concord.beans.EditorProxy");
dojo.require("concord.util.events");

dojo.declare("concord.beans.EditorStore", [concord.beans.EditorProxyCallback], {
	editorContainer: null,
	listeners: [],
	proxy: null,
	assignedColorMap : {},
	mEditors: null,
	
	/*
	 * construct a document's editor store
	 * @param url
	 * 		the url to access a document's editor resource
	 * @param e
	 * 		initial state of all editors, will retrieve from server if it's null
	 * @param proxy
	 * 		the proxy to connect with remote editor store, can be a proxy pointing to test data
	 */
	constructor: function (url, e, proxy)
	{
		if (proxy)
		{
			this.proxy = proxy;
		}
		else {
			if(!url)
			{
				  var rawUrl = "";
				  if(pe.scene.isHTMLViewMode())
					  rawUrl = pe.scene.getURI();
				  else
					  rawUrl = pe.scene.getSession().url;
				  var lastPosition = rawUrl.lastIndexOf("/");
				  var trueUrl = rawUrl.substring(0, lastPosition);   
				  url = trueUrl + "/editors";    
			}
			this.proxy = new concord.beans.EditorProxy(url);
		}
		
		this.proxy.registerCallback(this);
		if (!e)
		{
			this.proxy.getAll(); // handleStore to receive the sync return data 
		}		 
	},
	
	handleStore: function(e)
	{
		if(e){
			this.editorContainer = new concord.beans.Editors(e);	
		}			
				
		// notify listeners
		for( var i=0; i<this.listeners.length; i++)
		{
			if( this.listeners[i] && this.listeners[i].editorsUpdated )
			  this.listeners[i].editorsUpdated();
		}	
		
		var status = pe.curUser.getUnreadCommentsStatus();
		pe.basetUnreadCommentsTime = Math.abs(status.time);
		pe.basetUnreadCommentsNum = Math.abs(status.number);
		pe.lastCommentsItemTimestamp = pe.basetUnreadCommentsNum;
		var unread = dojo.byId('sidebar_unread_div');
		if (unread){
			unread.innerHTML = status.number;
			if(status.number && status.number > 0)
				dojo.style(unread,"display","");
		}
	},
	
	/**
	* refresh editor's list -- editorContainer
	*/
	refresh: function(isSync)
	{
		this.mEditors = null;
		//To fix defect 41585
		this.proxy.getAll(isSync);
	},
	
	/*
	 * register EditorStoreListener instance
	 */
	registerListener: function (listener)
	{
		this.listeners.push(listener); 
	},
	
	/**
	* remove a listener from listener's list
	*/
	removeListener: function(listener)
	{
		for( var i=0; i<this.listeners.length; i++)
		{
			if( this.listeners[i].id == listener.id )
			{
			  this.listeners.splice(i,1);
			}
		}			
	},
	
	/*
	 * @param editorItem
	 * 		instance of EditorItem
	 */
	add: function (editorItem)
	{
		this.proxy.add(editorItem.toJSObj());
		this.refresh();
	},
	
	/*
	 * @param editorId
	 * 		userId of the editor item
	 * @return
	 * 		true if succeeded
	 */
	remove: function (editorId)
	{
		var success = this.proxy.remove(editorId);
		this.refresh();
	},
	
	update: function(editor) {
		throw("This function in not implemented!");
	},
	
	updateIndicators: function(id, indicators) {
		this.proxy.updateIndicators(id, indicators);
		this.editorContainer.updateEditorIndicators(id, indicators);
	},
	
	updateIndicator: function(id, indicatorId, show) {
		this.proxy.updateIndicator(id, indicatorId, show);
		this.editorContainer.updateEditorIndicator(id, indicatorId, show);
	},		
	
	/*
	 * get total editors count
	 */
	getCount: function ()
	{
		if(!this.editorContainer)
		  return 0;
		  
		return this.editorContainer.items.length;
	},
	
	/*
	 * get indexed editors
	 */
	getFromIndex: function (i)
	{
		if(!this.editorContainer)
		  return null;
		  
		return this.editorContainer.items[i];
	},
	
	getEditorById: function(id)
	{
		if(this.editorContainer)
		{  
		  for (var i = 0; i < this.editorContainer.items.length; i++)
		  {
			  var c = this.editorContainer.items[i];
			  if (c.getEditorId() == id)
			  {
				  return c;
			  }
		  }
		} 
		  
		// get from profile if not in the editor list, -- should never come here... 
		return ProfilePool.getUserProfile(id);		  
	},
	
	getContainer: function() {
		return this.editorContainer;
	},
	
    /*
     * get all editors
     */
   getAllEditors: function(){
	   if(this.mEditors)
		   return this.mEditors;
	   
	  var e = new Object();
	  e.items = new Array();   	 
	  if(this.editorContainer)
	  {  
		    for (var i = 0; i < this.editorContainer.items.length; i++)
		    {			
			    e.items.push(this.editorContainer.items[i].toJSObj());
		    }
		    this.mEditors = e;
	  }
	  return e;
    },
        
    /**
    * clone the editors, which may be revised...
    */
    getClonedEditors: function()
    {
    	var e = new Object();
		  e.items = new Array(); 
		  if(this.editorContainer)
		  {
		    for (var i = 0; i < this.editorContainer.items.length; i++)   
		    {	
    	    var item = this.editorContainer.items[i];
          e.items.push(item.clone());
        }
      }
      return e;
    },
    
    getUserLeaveSessionTime : function(userId)
    {
        if (!this.editorContainer)
            return null;

        for (var i = 0; i < this.editorContainer.items.length; i++) {
            var c = this.editorContainer.items[i];
            if (c.getEditorId() == userId) {
                return c.getLeaveSessionTime();
            }
        }
        
        return null;   
    },
	
	  // the color is used as background color to identify the user's in co-editing.
	  getUserCoeditColor : function( userId )
	  {
		  if (!this.editorContainer)
			  return '';
			  
		  for (var i = 0; i < this.editorContainer.items.length; i++)
		  {
			  var c = this.editorContainer.items[i];
			  if (c.getEditorId() == userId)
			  {
				  return c.getEditorColor();
			  }
		  } 
		  return '';   				  		  
	  },  	  

	  // the color is used as border color to identify the user's in co-editing.
	  getUserCoeditBorderColor : function( userId )
	  {
		  for (var i = 0; i < this.editorContainer.items.length; i++)
		  {
			  var c = this.editorContainer.items[i];
			  if (c.getEditorId() == userId)
			  {
				  return c.getEditorBorderColor();
			  }
		  } 
		  return '';   				  		  
	  },
	  
	/*
	 * implementation of EditorProxyCallback
	 */
	added: function (e)
	{
		var o = new concord.beans.EditorItem(e);
		if (this.exists(o.getEditorId()))
			return;
		
		this.editorContainer.items.push(o);
		for( var i=0; i<this.listeners.length; i++)
		{
			this.listeners[i].editorAdded(o);
		}
	},
	
	/*
	 * implementation of EditorProxyCallback
	 */
	removed: function (editorId)
	{
		var newList = new Array();
		var found = false;
		for (var i = 0; i < this.editorContainer.items.length; i++)
		{
			var c = this.editorContainer.items[i];
			if (c.getEditorId() == editorId)
			{
				found = true;
				continue;
			}
			newList.push(c);
		}
		if (found)
		{
			this.editorContainer.items = newList;
		  for( var i=0; i<this.listeners.length; i++)
		  {
			  this.listeners[i].editorRemoved(editorId);
		  }			
		}
	},
		
	exists: function (editorId)
	{
		if(!this.editorContainer)
		  return false;
		  
		for (var i = 0; i < this.editorContainer.items.length; i++)
		{
			var c = this.editorContainer.items[i];
			if (c.getEditorId() == editorId)
			{
				return true;
			}
		}
		return false;
	}
	
});
