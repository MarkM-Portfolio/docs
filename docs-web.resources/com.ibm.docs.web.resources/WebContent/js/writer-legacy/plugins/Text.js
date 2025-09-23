dojo.provide("writer.plugins.Text");
dojo.require("writer.plugins.Plugin");
dojo.declare("writer.plugins.Text",
[writer.plugins.Plugin], {
	init: function() {
		var processCommand =
		{
				exec : function(  )
				{
					console.log("processCommand");
				}
		};
		this.editor.addCommand("text", processCommand);
	}

});