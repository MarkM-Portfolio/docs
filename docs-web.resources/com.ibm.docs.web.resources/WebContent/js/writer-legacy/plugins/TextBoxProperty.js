
dojo.provide("writer.plugins.TextBoxProperty");
dojo.require("writer.plugins.Plugin");
dojo.require("concord.widgets.ResizePropDlg");
dojo.requireLocalization("concord.widgets","menubar");

dojo.declare( "writer.plugins.TextBoxProperty", [writer.plugins.Plugin], {
	init: function()
	{
		var that = this;
		var textboxPropCmd = 
		{
			exec: function()
			{
				var boxView = writer.util.ViewTools.getCurrSelectedTextbox();
				if(boxView){								
					if(!this.dlg)
						this.dlg = new concord.widgets.ResizePropDlg(this.editor, null, null, null, {type:"TEXTBOX"});
					this.dlg.setSizeInfo({focusObj :boxView,width: boxView.getWholeWidth(),height: boxView.getWholeHeight()});
					this.dlg.show();
				}
				
			}
		};
		
		this.editor.addCommand("textboxProp", textboxPropCmd);
		this.addContextMenu();
		dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.selectionChangeHandler);
	},	

	getSelectedTextBox: function(){
		var boxView = writer.util.ViewTools.getCurrSelectedTextbox();
		if (boxView)
			return boxView.model;

		return null;
	},
	
	selectionChangeHandler: function(){
		var txtbox = this.getSelectedTextBox();
		pe.lotusEditor.getCommand('textboxProp').setState(txtbox == null ? writer.TRISTATE_DISABLED : writer.TRISTATE_ON);
	},
	
	addContextMenu: function(){
		var nls = dojo.i18n.getLocalization("concord.widgets","menubar");
		var ctx = this.editor.ContextMenu;
		var menuItem = {
            	name: 'textboxProperty',	
            	commandID: 'textboxProp',
				label : nls.formatMenu_Properties,
				group : 'textbox',
				order : 'textboxProperty',
				disabled : false
            };
		if(ctx && ctx.addMenuItem){
			ctx.addMenuItem(menuItem.name, menuItem);
		}
		
		var that = this;
		if(ctx && ctx.addListener) ctx.addListener(function(target,selection){
			var img = that.getSelectedTextBox();
			var ret = {};
			if(img)
			{
				ret.textboxProperty = menuItem;
				return ret;
			}
			else
				return;
		});
	}
});