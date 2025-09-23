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

dojo.provide("websheet.listener.BroadCaster");
dojo.require("websheet.listener.Listener");
dojo.require("websheet.listener.NotifyEvent");
dojo.declare("websheet.listener.BroadCaster",null,{
	_list:[],

	constructor: function(args) 
	{
//		dojo.mixin(this, args);
		this._list = [];
	},
	
	/*void*/addListener:function(listener)
	{
		if(listener != null)
			this._list.push(listener);
	},
	
	/*void*/addListeners:function(/*Array*/listeners)
	{
		if(listeners != null)
			this._list = this._list.concat(listeners);
	},
	
	/*boolean*/removeListener:function(listener)
	{
		if (!listener) return false;
		
		for(var i=0; i<this._list.length; i++)
		{
			var l = this._list[i];
			if(l === listener)
			{
				this._list.splice(i, 1);
				return true;
			}
		}
		return false;
	},
	
	/*void*/removeAllListener:function()
	{
		delete this._list;
		this._list = [];
	},
	
	/*array*/getAllListener:function()
	{
		return this._list;
	},
	
	/*boolean*/hasListener:function(listener)
	{
		if (!listener) return (this._list.length != 0);
		
		for(var i=0; i<this._list.length; i++)
		{
			var l = this._list[i];
			if(l === listener)
			{
				return true;
			}
		}
		return false;
	},
	
	broadcast:function(event)
	{
		if(event){
			for(var i=0;i<this._list.length;i++)
			{
				var l = this._list[i];
				l.notify(this, event);
			}
		}
	}
});
