dojo.provide("writer.plugins.Image");
dojo.require("writer.plugins.Plugin");

dojo.declare( "writer.plugins.Image", [writer.plugins.Plugin], {
	init: function()
	{
		var editor = this.editor;
		
		// get image
		var getCurrentImage = function()
		{
			var imageView = writer.util.ViewTools.getCurrSelectedImage();
			return imageView;
		};
		
		// is the same type?
		var isSameWrap = function(imageModel, wrapType, wrapText, behindDoc)
		{
			if (!imageModel[wrapType])
				return false;
				
			if ("wrapSquare" == wrapType &&
				imageModel.wrapSquare.wrapText != wrapText)
					return false;
			
			if ("wrapNone" == wrapType &&
				imageModel.behindDoc != behindDoc)
				return false;
			
			return true;
		};
		
		// Modify Wrap Text
		var modifyImgWrapText = function(wrapText)
		{
			console.log("modify image wrat text:" + wrapText);
			
			var imageView = getCurrentImage();
			
			if (imageView && imageView.modifyWrapText)
				imageView.modifyWrapText(wrapText);
		};
		
		// Change To Inline Image
		var changeToInlineImage = function()
		{
			console.log("change to inline image");
			
			var imageView = getCurrentImage();
			if (!imageView)
				return;
				
			var model = imageView.model;
			if (model.isInline)
			{
				console.log("this is already inline image. no need to change to inline.");
				return;
			}
			
			model.changeAnchorToInline();
		};
		
		// Change To Anchor Image
		var changeToAnchorImage = function(wrapType, wrapText, behindDoc)
		{
			console.log("change to anchor image");
			var imageView = getCurrentImage();
			if (!imageView)
				return;
				
			var model = imageView.model;
			
			if (model.isInline)
			{
				// inline to anchor
				model.changeInlineToAnchor(wrapType, wrapText, behindDoc);
			}
			else
			{
				// anchor to anchor, only change wrap type
				if (isSameWrap(model, wrapType, wrapText, behindDoc))
				{
					console.log("this is already save image. no need to change wrap type.");
					return;
				}
				
				model.changeAnchorWraptype(wrapType, wrapText, behindDoc);
			}
		};
		
		// Commands
		var commands =
		[
			{
				name: "WrapText",
				exec: function() {}
			},
			{
				name: "ImgInline",
				exec: function(){
					changeToInlineImage();
				}
			},
			{
				name: "ImgSquare",
				exec: function(){
					changeToAnchorImage("wrapSquare", "bothSides", "0");
				}
			},
			{
				name: "ImgTopBottom",
				exec: function(){
					changeToAnchorImage("wrapTopAndBottom", null, null);
				}
			},
			{
				name: "ImgBehind",
				exec: function(){
					changeToAnchorImage("wrapNone", null, "1");
				}
			},
			{
				name: "ImgInFront",
				exec: function(){
					changeToAnchorImage("wrapNone", null, "0");
				}
			},
			{
				name: "ImgMoreWrap",
				exec: function() {}
			},
			{
				name: "BothSides",
				exec: function(){
					modifyImgWrapText("bothSides");
				}
			},
			{
				name: "LeftOnly",
				exec: function(){
					modifyImgWrapText("left");
				}
			},
			{
				name: "RightOnly",
				exec: function(){
					modifyImgWrapText("right");
				}
			},
			{
				name: "LargestOnly",
				exec: function(){
					modifyImgWrapText("largest");
				}
			},
		];
		
		// add Commands
		for (var i in commands){
			this.editor.addCommand(commands[i].name, commands[i]);
		}
		
		// Context Menu
		var nls = dojo.i18n.getLocalization("concord.widgets","menubar");
		var ctx = this.editor.ContextMenu;
		var menuItems =
		[
			{
				name: 'WrapText',
				commandID: 'WrapText',
				label : nls.ctxMenu_Image_WrapText,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'image',
				order : 'WrapText',
				disabled : false
			},
			{
				name: 'ImgInline',
				commandID: 'ImgInline',
				label : nls.ctxMenu_Image_WrapText_Inline,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'ImgInline',
				disabled : false
			},
			{
				name: 'ImgSquare',
				commandID: 'ImgSquare',
				label : nls.ctxMenu_Image_WrapText_Square,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'ImgSquare',
				disabled : false
			},
			{
				name: 'ImgTopBottom',
				commandID: 'ImgTopBottom',
				label : nls.ctxMenu_Image_WrapText_TopBottom,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'ImgTopBottom',
				disabled : false
			},
			{
				name: 'ImgBehind',
				commandID: 'ImgBehind',
				label : nls.ctxMenu_Image_WrapText_Behind,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'ImgBehind',
				disabled : false
			},
			{
				name: 'ImgInFront',
				commandID: 'ImgInFront',
				label : nls.ctxMenu_Image_WrapText_InFront,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'ImgInFront',
				disabled : false
			},
			{
				name: 'ImgMoreWrap',
				commandID: 'ImgMoreWrap',
				label : nls.ctxMenu_Image_WrapText_Other,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'ImgMoreWrap',
				disabled : false
			},
			{
				name: 'BothSides',
				commandID: 'BothSides',
				label : nls.ctxMenu_Image_WrapText_BothSides,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'BothSides',
				disabled : false
			},
			{
				name: 'LeftOnly',
				commandID: 'LeftOnly',
				label : nls.ctxMenu_Image_WrapText_LeftOnly,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'LeftOnly',
				disabled : false
			},
			{
				name: 'RightOnly',
				commandID: 'RightOnly',
				label : nls.ctxMenu_Image_WrapText_RightOnly,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'RightOnly',
				disabled : false
			},
			{
				name: 'LargestOnly',
				commandID: 'LargestOnly',
				label : nls.ctxMenu_Image_WrapText_LargestOnly,
				iconClass : 'dijitEditorIcon dijitEditorIconCopy',
				group : 'WrapText',
				order : 'LargestOnly',
				disabled : false
			},
		];
		
		// add menu
		if(ctx && ctx.addMenuItem){
			for (var i in menuItems){
				ctx.addMenuItem(menuItems[i].name, menuItems[i]);
			}
		}
		
		// add listener
		if(ctx && ctx.addListener)
		{
			ctx.addListener(function(target,selection)
			{
				// remove change wrap function
				return{};

				var viewTools = writer.util.ViewTools;
				var imageView = getCurrentImage();
				if (!imageView)
					return {};

				if (viewTools.getTable(imageView))
					return {};

				if (viewTools.getTOC(imageView))
					return {};

				if (viewTools.getTextBox(imageView))
					return {};
					
				var viewType = imageView.getViewType();
				var model = imageView.model;
				var wrapText = model.wrapSquare && model.wrapSquare.wrapText;
				var behindDoc = model.behindDoc && model.behindDoc != "0";
				
				var ret = {};
	
				ret.WrapText =
				{
					disabled: false,
					getSubItems: function()
					{
						return {
							ImgInline:		{disabled: viewType == "text.ImageView"},
							ImgSquare:		{disabled: viewType == "text.SquareImage"},
							ImgTopBottom:	{disabled: viewType == "text.TBImage"},
							ImgBehind:		{disabled: viewType == "text.FloatImage" && behindDoc},
							ImgInFront:		{disabled: viewType == "text.FloatImage" && !behindDoc},
							ImgMoreWrap:
							{
								disabled: viewType != "text.SquareImage",
								getSubItems: function()
								{
									return {
										BothSides:		{disabled: wrapText == "bothSides"},
										LeftOnly:		{disabled: wrapText == "left"},
										RightOnly:		{disabled: wrapText == "right"},
										LargestOnly:	{disabled: wrapText == "largest"}
									};
								}
							}
						};
					}
				};
				
				// set command state
				var setCState = function(items)
				{
					for (var id in items)
					{
						var item = items[id];
					
						cmd = pe.lotusEditor.getCommand(id);
						if (cmd)
							cmd.state = item.disabled ? writer.TRISTATE_DISABLED : writer.TRISTATE_ON;
						
						if (item.getSubItems)
							setCState(item.getSubItems());
					}
				}
				
				setCState(ret);
				
				return ret;
			});
		}
	},
});