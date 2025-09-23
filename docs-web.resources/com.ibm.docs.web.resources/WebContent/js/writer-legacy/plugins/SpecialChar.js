
dojo.provide("writer.plugins.SpecialChar");
dojo.require("writer.plugins.Plugin");
dojo.require("concord.widgets.specialcharDlg");

dojo.declare( "writer.plugins.SpecialChar", [writer.plugins.Plugin], {
	init: function()
	{
		var insertSpecialCmd = 
		{
			exec: function()
			{
				var dlg = new concord.widgets.specialcharDlg();
				dlg.show();
			}
		};
		
		this.editor.addCommand("specialchar", insertSpecialCmd);
	}
});