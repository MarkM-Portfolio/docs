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

dojo.provide("writer.plugins.ShortCutKeyHandler");
dojo.require("writer.plugins.Plugin");
dojo.declare("writer.plugins.ShortCutKeyHandler",
[writer.plugins.Plugin], {
	init: function() {

		var focus2Menubar =
		{
			exec: function(evt)
			{
				var menubar = dijit.byId('document_menubar');
		    	var menu = dijit.byId('D_m_File');		    
		    	if(menubar && menu && menu.domNode && menu.domNode.style.display != "none"){
		    		menubar.onItemClick(menu, evt);
		    	}
			}
		};
		this.editor.addCommand("focus2Menubar", focus2Menubar, writer.SHIFT + writer.ALT + 70 /*F*/);

		var focus2Toolbar =
		{
			exec: function()
			{
				var toolBar = dijit.byId('D_t');
		    	if(toolBar){
		    		if(pe.settings.getToolbar() != pe.settings.TOOLBAR_NONE){
		    			toolBar.focus();
		    		}
		    	}
			}
		};
		this.editor.addCommand("focus2Toolbar", focus2Toolbar,  writer.ALT + 121 /*ALT +F10*/);

		var focus2Sidebar =
		{
			exec: function()
			{
				// call side bar interface to set focus
				var sidebar = pe.scene.getSidebar();
				if(sidebar){
					if(sidebar.isCollapsed()){
						pe.scene.toggleSideBarCmd();
					}else{
						setTimeout( function(){	
							sidebar.setSidebarFocus();		    
						}, 200);						
					}    				
				}else{
					pe.scene.toggleSideBarCmd();
				}
			}
		};
		this.editor.addCommand("focus2Sidebar", focus2Sidebar, writer.SHIFT + dojo.keys.F2 /*SHIFT+F2*/);
		var openContextMenu = {
				exec: function(){
					var range = pe.lotusEditor.getSelection().getRanges()[0];
					var start = range.getStartView();
					var pos = pe.lotusEditor.getShell().getChildPosition(start.obj,start.index);
					var page = writer.util.ViewTools.getPage(start.obj);
					var docNode = page.domNode.parentNode;
					var editorFrame = dojo.byId('editorFrame');
					var x = (pos.x + docNode.offsetLeft + editorFrame.offsetLeft)*pe.lotusEditor.getScale();
					var y = (pos.y  + docNode.offsetTop  + editorFrame.offsetTop+20-pe.lotusEditor.getScrollPosition())* pe.lotusEditor.getScale();
					pe.lotusEditor.getShell().openContextMenu(start.obj.domNode, x, y);
				}
		};
		this.editor.addCommand("openContextMenu", openContextMenu, writer.SHIFT + dojo.keys.F10 /*SHIFT+F0*/);
		
}
});
