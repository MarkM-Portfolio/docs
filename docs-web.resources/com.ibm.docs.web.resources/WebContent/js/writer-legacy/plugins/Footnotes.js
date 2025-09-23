dojo.provide("writer.plugins.Footnotes");
dojo.require("writer.plugins.Plugin");

dojo.declare("writer.plugins.Footnotes",
[writer.plugins.Plugin], {
	init: function()
	{
		
	},
	isInFootnotes:function(){
		var editor = this.editor;
		var shell = editor.getShell();
		var model = shell.getEditMode();
		return model==EDITMODE.FOOTNOTE_MODE;
	}
});