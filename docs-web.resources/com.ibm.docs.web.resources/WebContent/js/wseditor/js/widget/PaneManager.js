/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("websheet.widget.PaneManager");

dojo.require("websheet.widget.CommonPane");

dojo.declare("websheet.widget.PaneManager", null,{
	// module:
	//		websheet/widget/SideBarManager
	// description:
	// This SideBarManager used to coordinate all the sidebars on left : all the other sidebars(except comments sidebar) 
	// opened, would disable comments sidebar button.
	
	
	_stack : [],// store all the opened left sidebar, such as comments sidebar, acl sidebar, validation sidebar...
    
	_beginZIndex: 100, // Z-index of the first sidebar
	
	_enabled : true,  // sidebar button status
	
	cminW: 0,
	width: -1, // customized width
	cmaxW: 300, // default width
	
	openTopic: "sidePaneOpen",
	closeTopic: "sidePaneClose",
	
	constructor: function()
	{
		this._stack = [];
		dojo.subscribe(this.openTopic, dojo.hitch(this,this._addSidePane));
		dojo.subscribe(this.closeTopic,dojo.hitch(this, this._removeSidePane));
	},
	
	resize: function()
	{
		for(var i = 0, len = this._stack.length ; i < len ; i++)
		{
			var sidePane = this._stack[i];
			if(sidePane instanceof websheet.widget.CommonPane)
			{
				sidePane.resizeSidebar();
			}
			else
			{
			  	if(dojo.isIE)
			  	{
			  		setTimeout( function() { concord.widgets.sidebar.SideBar.resizeSidebar(); }, 200 );
			  	}
			    else
			    {
			    	concord.widgets.sidebar.SideBar.resizeSidebar();
			    }
			}
		}
	},
	
	updateHeight: function(h)
	{
		for(var i = 0, len = this._stack.length ; i < len ; i++)
		{
			var sidePane = this._stack[i];
			if(sidePane && sidePane.domNode)
				sidePane.domNode.style.height = h;
		}
	},
	
	updateWidth: function(w)
	{
		for(var i = 0, len = this._stack.length ; i < len ; i++)
		{
			var sidePane = this._stack[i];
			if(sidePane && sidePane.domNode)
				sidePane.domNode.style.width = w;
		}
	},
	
	hasOpenedSidebar: function()
	{
		return this._stack.length == 0 ? false : true;
	},
	
	getWidth: function()
	{
		if(!this.hasOpenedSidebar())
			return this.cminW;
		if (this.width != -1)
			return this.width;
		this.updateMaxWidth();
		return this.cmaxW;
	},
	
	// this width would be set by js api
	setWidth: function(width)
	{
		// if set width with -1, default width will be used instead
		this.width = width;
		
		if (this.width > 0) {
			// the maximum width is set to be maxWidth/4
			var maxWidth = concord.util.browser.getBrowserWidth()
			if (this.width > maxWidth/4)
				this.width = maxWidth/4;
		}
	},
	
	getHeight: function()
	{
		return pe.scene.getSidebarHeight();
	},
	
	updateMaxWidth: function()
	{
		var maxWidth = concord.util.browser.getBrowserWidth();
	
		if(maxWidth >= 1330){
			this.cmaxW = 300;
		}else{
			this.cmaxW = 225;
		}
	},
	
	_addSidePane: function(args)
	{
		var sidePane = args.sidePane; 
		if(!sidePane || !sidePane.domNode) return;
		var len = this._stack.length -1;
		if(this._stack[len] == sidePane) return;
		
		for(var i = len; i >= 0; i--)
		{
			if(this._stack[i] instanceof websheet.widget.CommonPane)
			{
				var pane = this._stack[i];
				pane.close();
			}	
		}	

		dojo.style(sidePane.domNode,"zIndex", this._beginZIndex + this._stack.length);
		this._stack.push(sidePane);
		
		if(sidePane instanceof websheet.widget.CommonPane)
		{
			this.disableSidebarBtn();
		}
	},
	
	_removeSidePane: function(args)
	{
		var sidePane = args.sidePane; 
		if(!sidePane || !sidePane.domNode) return;
		var pos = -1, bOtherSidePane = false;
		for(var i = this._stack.length -1; i >= 0; i--)
		{
			if(this._stack[i] === sidePane) 
				pos = i;
			else if(this._stack[i] instanceof websheet.widget.CommonPane)
				bOtherSidePane = true;
		}
		if(pos >= 0)
		{
			this._stack.splice(pos,1);
		}
		if(!bOtherSidePane)
			this.enableSidebarBtn();
	},
	
	isSidebarBtnDisable : function()
	{
		return !this._enabled;
	},
	
	getOpenedPane: function()
	{
		if(this.isSidebarBtnDisable())
		{
			var len = this._stack.length;
			if(len > 0)
			{
				return this._stack[len -1];
			}
		}	
		return null;
	},
	
	disableSidebarBtn: function()
	{
		if(!this._enabled) return;
		this._enabled = false;
		var sDiv = dojo.byId("concord_sidebar_btn");
		if(sDiv)
		{
			dojo.addClass(sDiv,"sidebarBtn-disable");
			sDiv.tabIndex = -1;
			dojo.removeAttr(sDiv,"title");
		}
	},
	
	enableSidebarBtn: function()
	{
		if(this._enabled) return;
		this._enabled = true;
		var sDiv = dojo.byId("concord_sidebar_btn");
		if(sDiv)
		{
			dojo.removeClass(sDiv,"sidebarBtn-disable");
			sDiv.tabIndex = 0;
			var sidebar = pe.scene.sidebar;
			if (sidebar) {
				if(!sidebar.isCollapsed())
					dojo.attr(sDiv,"title",sidebar.nls.hideComments);
				else
					dojo.attr(sDiv,"title",sidebar.nls.showComments);
			}
		}
	}
});
