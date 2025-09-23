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
    "dojo/keys",
    "dojo/_base/declare",
    "dojo/dom",
    "writer/constants",
    "writer/plugins/Plugin",
    "writer/util/ViewTools",
    "dijit/registry"
], function(keys, declare, dom, constants, Plugin, ViewTools, registry) {


    var ShortCutKeyHandler = declare("writer.plugins.ShortCutKeyHandler", Plugin, {
        init: function() {

            var focus2Menubar = {
                exec: function(evt) {
                    var menubar = registry.byId('document_menubar');
                    var menu = registry.byId('D_m_File');
                    if (menubar && menu && menu.domNode && menu.domNode.style.display != "none") {
                        menubar.onItemClick(menu, evt);
                    }
                }
            };
            this.editor.addCommand("focus2Menubar", focus2Menubar, constants.KEYS.SHIFT + constants.KEYS.ALT + 70 /*F*/ );

            var focus2Toolbar = {
                exec: function() {
                    var toolBar = registry.byId('D_t');
                    if (toolBar) {
                        if (pe.settings.getToolbar() != pe.settings.TOOLBAR_NONE) {
                            toolBar.focus();
                        }
                    }
                }
            };
            this.editor.addCommand("focus2Toolbar", focus2Toolbar, constants.KEYS.ALT + 121 /*ALT +F10*/ );

            var focus2Sidebar = {
                exec: function() {
                    // call side bar interface to set focus
                	var paneMgr = pe.scene.sidePaneMgr;
                	var opened = paneMgr.getCurrentOpenPane();
                	var sidebar = pe.scene.getSidebar();
                	
                	if (opened === sidebar)
                	{
                		setTimeout(function() {
                            opened.setSidebarFocus();
                        }, 200);
                		return;
                	}
                	
                    if (sidebar) {
                        if (sidebar.isCollapsed()) {
                            pe.scene.toggleSideBarCmd();
                        } else {
                            setTimeout(function() {
                                sidebar.setSidebarFocus();
                            }, 200);
                        }
                    } else {
                        pe.scene.toggleSideBarCmd();
                    }
                }
            };
            this.editor.addCommand("focus2Sidebar", focus2Sidebar, constants.KEYS.SHIFT + keys.F2 /*SHIFT+F2*/ );
            
            var focus2TrackChangeSidebar = {
                exec: function() {
                	// call side bar interface to set focus
                	var paneMgr = pe.scene.sidePaneMgr;
                	var opened = paneMgr.getCurrentOpenPane();
                	
                	if (opened && opened.name === "TrackChangeSidePane")
                	{
                		setTimeout(function() {
                			opened.setSidebarFocus();
                		}, 200);
                		return;
                	}
                	
                	pe.scene.toggleTrackChangePanel && pe.scene.toggleTrackChangePanel();
                }
            };
            this.editor.addCommand("focus2TrackChangeSidebar", focus2TrackChangeSidebar, constants.KEYS.SHIFT + keys.F1 /*SHIFT+F3*/ );
            
            var openContextMenu = {
                exec: function() {
                    var range = pe.lotusEditor.getSelection().getRanges()[0];
                    var start = range.getStartView();
                    var pos = pe.lotusEditor.getShell().getChildPosition(start.obj, start.index);
                    var page = ViewTools.getPage(start.obj);
                    var docNode = page.domNode.parentNode;
                    var editorFrame = dom.byId('editorFrame');
                    var x = (pos.x + docNode.offsetLeft + editorFrame.offsetLeft) * pe.lotusEditor.getScale();
                    var y = (pos.y + docNode.offsetTop + editorFrame.offsetTop + 20 - pe.lotusEditor.getScrollPosition()) * pe.lotusEditor.getScale();
                    pe.lotusEditor.getShell().openContextMenu(start.obj.domNode, x, y);
                }
            };
            this.editor.addCommand("openContextMenu", openContextMenu, constants.KEYS.SHIFT + keys.F10 /*SHIFT+F0*/ );

        }
    });

    return ShortCutKeyHandler;
});
