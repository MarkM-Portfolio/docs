dojo.provide("writer.ui.menu.Menu");
dojo.require("dijit.Menu");
dojo.declare("writer.ui.menu.Menu", [dijit.Menu], {

	setMenuState: function()
	{
		var menuChildren = this.getChildren();
		var menuChild, cmdState, cmd;
		for(var i=0;i<menuChildren.length;i++)
		{
			menuChild = menuChildren[i];
			if(menuChild.commandID){
				cmd = pe.lotusEditor.getCommand(menuChild.commandID);
				if(!cmd)
				{
					console.warn("Can't find command: " + menuChild.commandID);
					continue;
				}	
				cmdState = cmd.state;
				menuChild.setDisabled(cmdState == writer.TRISTATE_DISABLED || cmdState == writer.TRISTATE_HIDDEN);
				if (menuChild.attr){
					menuChild.attr("checked",(cmdState == writer.TRISTATE_ON));
				}
			}
		}
	},
	
	onOpen : function( e )
	{
		this.inherited('onOpen',arguments);
		this.setMenuState();
		
		if(pe.lotusEditor.popupPanel)
			pe.lotusEditor.popupPanel.close && pe.lotusEditor.popupPanel.close(true);
	}
});