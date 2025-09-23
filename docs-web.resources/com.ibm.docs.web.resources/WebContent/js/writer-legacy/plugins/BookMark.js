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

dojo.provide("writer.plugins.BookMark");
dojo.require("writer.plugins.Plugin");
dojo.require("writer.ui.widget.BookmarkDlg");
dojo.require("writer.util.ViewTools");
dojo.require("writer.util.BookmarkTools");


dojo.declare("writer.plugins.BookMark",
[writer.plugins.Plugin], {
	onSelectionChange: function(){

		var toc_plugin = this.editor.getPlugin("Toc");
		var toc_disable = toc_plugin && toc_plugin.getSelectedToc();
		var field_plugin = this.editor.getPlugin("Field");
		var field_disable = field_plugin && field_plugin.ifInField();

		var disable =  toc_disable || field_disable;
		this.editor.getCommand('insertBookmark').setState( (!disable) ? writer.TRISTATE_OFF :writer.TRISTATE_DISABLED);
	},
	
	doToggle: function(){
		var doc = concord.util.browser.getEditAreaDocument();
		if(pe.scene.isShowBookMark()){
			if(dojo.hasClass(doc.body,"bookMarkDisabled"))
				dojo.removeClass(doc.body, "bookMarkDisabled");
		}
		else{
			if(!dojo.hasClass(doc.body,"bookMarkDisabled"))
				dojo.addClass(doc.body, "bookMarkDisabled");
		}
	},
	
	getWidget: function(){
		if( !this.pWidgetObj ){
			var mainNode = dojo.byId("mainNode");
			var tmpNode = dojo.create("div", null, mainNode);
			this.pWidgetObj = new writer.ui.widget.BookmarkDlg({id:"bookmarkPanel"},tmpNode);
		}
		return this.pWidgetObj;
	},
	
	editBookmark: function(  line ){
		this.getWidget().editBookmark( line );
	},
	
	init: function() {
		//toggle show bookmark.
		var editor = this.editor;
		var toggleMethod = this.doToggle;
		var plugin = this;
		var toggleBookMark =
		{
			exec: function()
			{
				pe.scene.setShowBookMark(!pe.scene.isShowBookMark());
				toggleMethod();
			}
		};
		
		this.editor.addCommand("toggleBookMark", toggleBookMark);

		var toggleBeforeLoad = function(){
			this.doToggle();
			if(this.handler){
				dojo.unsubscribe(this.handler);
				delete this.handler;
			}
		};
		this.handler = dojo.subscribe(writer.EVENT.BEFORE_LOAD, this, toggleBeforeLoad);
		//insert book mark
		var insertBookMark =
		{
				exec: function()
				{
					//insert book mark widget...
					plugin.getWidget().createBookmark(  editor.getSelection() );
				}	
		}
		
		this.editor.addCommand("insertBookmark", insertBookMark);
		
		var editBookMark = 
		{
				exec: function()
				{
					var selection = editor.getSelection();
					plugin.getWidget().editBookmark( null, editor.getSelection() );
				}
		}
		
		this.editor.addCommand("editBookmark",editBookMark, writer.CTRL + writer.ALT + 66);// Ctrl+alt+b
		
		dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.onSelectionChange);
}
});