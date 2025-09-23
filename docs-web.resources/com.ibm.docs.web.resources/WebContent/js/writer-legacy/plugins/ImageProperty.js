
dojo.provide("writer.plugins.ImageProperty");
dojo.require("writer.plugins.Plugin");
dojo.require("concord.widgets.ImagePropertyDialog");
dojo.requireLocalization("concord.widgets","ImagePropHandler");
dojo.requireLocalization("concord.widgets","menubar");

dojo.declare( "writer.plugins.ImageProperty", [writer.plugins.Plugin], {
	init: function()
	{
		var that = this;
		var imagePropCmd = 
		{
			exec: function()
			{
				var imageHandler = {
						editor : pe.lotusEditor,
						_selectedImg : null,
						getImageInfo:function(){		
							var data = {};		
							this._selectedImg = that.getSelectedImg();
							if(this._selectedImg){
								data.isSupportAlt = true;
								data.Alt = this._selectedImg.description || "";
								data.width = common.tools.toPxValue(this._selectedImg.width);
								data.height = common.tools.toPxValue(this._selectedImg.height);
								data.MaxWidth = 2112; // 22 in
								data.MaxHeight = 2112; // 22 in
							}
							return data;
						},
						
						setImageInfo: function(width, height, border, alt){
							var img = that.getSelectedImg();
							if(img && this._selectedImg != img)
							{
								// The selected image was changed by other co-editor.
								return;
							}	
							
							var msgs = [], msg;
							if(alt != img.description)
							{
								msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute, [WRITER.MSG.createSetAttributeAct( img ,null,null,{'descr':alt },{'descr': img.description } )] );
								msgs.push(msg);
								
								img.setDescription(alt);
							}
							
							width = common.tools.toCmValue(width+"px");
							height = common.tools.toCmValue(height+"px");
							
							var oldWidth = common.tools.toCmValue(img.width);
							var oldHeight = common.tools.toCmValue(img.height);
							
							if(width != oldWidth || height != oldHeight){
								var newSz = {}, oldSz = {};
								newSz.cx = width + "cm";
								newSz.cy = height + "cm";
								img.setSize(newSz);
								
								oldSz.cx = oldWidth + "cm";
								oldSz.cy = oldHeight + "cm";
								msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute, [WRITER.MSG.createSetAttributeAct( img ,null,null,{'size':newSz },{'size': oldSz } )] );
								msgs.push(msg);
							}
							
							WRITER.MSG.sendMessage( msgs );
						}
				};

				var nls = dojo.i18n.getLocalization("concord.widgets","ImagePropHandler");
				if(!this.dlg)
					this.dlg = new concord.widgets.ImagePropertyDialog(imageHandler, nls.dialogtitle, null, null);
				this.dlg.show();
			}
		};
		
		this.editor.addCommand("imageProp", imagePropCmd);
		this.addContextMenu();
		dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.selectionChangeHandler);
	},
	
	getSelectedImg: function(){
		var imageView = writer.util.ViewTools.getCurrSelectedImage();
		if (imageView)
			return imageView.model;

		return null;
	},
	
	selectionChangeHandler: function(){
		var img = this.getSelectedImg();
		pe.lotusEditor.getCommand('imageProp').setState(img == null ? writer.TRISTATE_DISABLED : writer.TRISTATE_ON);
	},
	
	addContextMenu: function(){
		var nls = dojo.i18n.getLocalization("concord.widgets","menubar");
		var ctx = this.editor.ContextMenu;
		var menuItem = {
            	name: 'imageProperty',	
            	commandID: 'imageProp',
				label : nls.formatMenu_ImageProperties,
				group : 'image',
				order : 'ImageProperty',
				disabled : false
            };
		if(ctx && ctx.addMenuItem){
			ctx.addMenuItem(menuItem.name, menuItem);
		}
		
		var that = this;
		if(ctx && ctx.addListener) ctx.addListener(function(target,selection){
			var img = that.getSelectedImg();
			var ret = {};
			if(img)
			{
				ret.imageProperty = menuItem;
				return ret;
			}
			else
				return;
		});
	}
});