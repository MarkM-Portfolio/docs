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

dojo.provide("pres.widget.SideBar");
dojo.require("concord.widgets.sidebar.SideBar");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");

dojo.require("pres.widget.Sorter");

dojo.declare("pres.widget.SideBar", [dijit.layout.ContentPane], {

	postCreate: function()
	{
		this.inherited(arguments);
		
		var w = 0;
		if (!pe.scene.isHTMLViewMode() && !pe.scene.isMobile)
		{
			pe.scene.toggleSideBar();
			var dom = dojo.byId("ll_sidebar_div");
			w = dojo.style(dom, "width");
			dojo.place(dom, this.domNode);
		}
		
		if (w == 0)
			dojo.addClass(dojo.body(), "hidden_sidebar");
		dojo.contentBox(this.domNode, {w: w});
	},
	
	resize: function()
	{
		this.inherited(arguments);
		this.doLayout();
	},

	onSideBarResized: function(w)
	{
		dojo.contentBox(this.domNode, {w: w});
		var dom = dojo.byId("ll_sidebar_div");
		dom && dojo.marginBox(dom, {
			w: w
		});
		if (w == 0)
			dojo.addClass(dojo.body(), "hidden_sidebar");
		else
			dojo.removeClass(dojo.body(), "hidden_sidebar");
		this.getParent().resize();
	},

	doLayout: function()
	{
		var dom = dojo.byId("ll_sidebar_div");
		if (dom)
		{
			var h = dojo.style(this.domNode, "height");
			dojo.marginBox(dom, {
				h: h
			});
			concord.widgets.sidebar.SideBar.resizeSidebar();
		}
	}

});
