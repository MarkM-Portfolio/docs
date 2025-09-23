dojo.provide("writer.plugins.Endnotes");
dojo.require("writer.plugins.Plugin");

dojo.declare("writer.plugins.Endnotes",
[writer.plugins.Plugin], {
	init: function()
	{
		
	},
	isInEndnotes:function(){
		var editor = this.editor;
		var shell = editor.getShell();
		var model = shell.getEditMode();
		return model==EDITMODE.ENDNOTE_MODE;
	}
});