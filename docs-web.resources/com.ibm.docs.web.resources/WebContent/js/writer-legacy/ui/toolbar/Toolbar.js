dojo.provide("writer.ui.toolbar.Toolbar");
dojo.require("writer.ui.menu.Menu");
dojo.require("dojo.i18n");
dojo.require("writer.core.Event");
dojo.require("writer.core.Listener");
dojo.require("writer.ui.toolbar.DropDownButton");
dojo.require("writer.ui.widget.MenuTooltip");
dojo.require("writer.ui.widget.ToggleButtonEx");
dojo.require("concord.util.BidiUtils");
dojo.require("writer.ui.widget.CellBorder");
dojo.requireLocalization("concord.widgets","toolbar");
dojo.requireLocalization("writer.ui.dialog","FindReplaceDlg");
ToolbarConstant = {
		ToolbarMode:
		{
			ALL:	1, 
			LIGHT : 2
//			XXX : 4
		},
		
		ToolbarType:
		{
			BUTTON :	1,
			DROPDOWNBUTTON:	2,
			DROPDOWNBUTTON_STRING:	3,
			SEPERATOR:	4,
			TOGGLEBUTTON: 5,
			BUTTONDROPDOWN:6,
			TOGGLEBUTTONEX: 7
		},
		
		ToolbarGroup:
		{
			TOOLS: 1,
			CHAR_FORMATTING: 2,
			PARA_FORMATTING: 3,
			INSERT: 4,
			BORDER_TYPE: 5
		}
};

getAlignConfig =function(){
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var macShortCuts = dojo.isMac ? "_Mac" : "";
	var alignConfig =[
		{
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_LeftAlign",
			command:"justifyleft",
			accelKey: menuStrs.accel_formatMenu_Left + macShortCuts,
			title:nls.leftAlignTip,
			label:nls.leftAlignTip,
		    iconClass: "docToolbarIcon leftIcon",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_CenterAlign",
			command:"justifycenter",
			accelKey: menuStrs.accel_formatMenu_Center + macShortCuts,
			title:nls.centerTip,
			label:nls.centerTip,
		    iconClass: "docToolbarIcon centerIcon",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_RightAlign",
			command:"justifyright",
			accelKey: menuStrs.accel_formatMenu_Right + macShortCuts,
			title:nls.rightAlignTip,
			label:nls.rightAlignTip,
		    iconClass: "docToolbarIcon rightIcon",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_JustifyAlign",
			command:"justifyblock",
			accelKey: menuStrs.accel_formatMenu_Justify + macShortCuts,
			title:nls.justifyTip,
			label:nls.justifyTip,
		    iconClass: "docToolbarIcon justifyIcon",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}
	];
	return alignConfig;
};

getToolbarConfig = function(){
	
	//	nls :'Test!',
	//	Group: //the different group should be in seperated by toolbar seperator 
	//  for drop down button: if drop down is a widget, create it by id and set it to dropDown
	// 						  if drop down is a string, set the string as dropDown directly
    //						  methodName is used to lazy load drop down widget
    //						  focusMethod is used to set focus on the drop down menu	
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var macShortCuts = dojo.isMac ? "_Mac" : "";
	var arr1=
	[
//	 {
//			type: ToolbarConstant.ToolbarType.BUTTON,
//			id: "D_t_Save",
//			title: nls.saveTip, 
//			command: "saveDraft",
//	        iconClass: "docToolbarIcon saveIcon",
//			group: ToolbarConstant.ToolbarGroup.TOOLS
//	},
	{
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Undo",
			title:nls.undoTip,
			label:nls.undoTip,
			command: "undo",
			accelKey: menuStrs.accel_editMenu_Undo + macShortCuts,
			//disabled: true,
	        iconClass: "docToolbarIcon undoIcon",
	        group: ToolbarConstant.ToolbarGroup.TOOLS
	}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Redo",
			title:nls.redoTip,
			label:nls.redoTip,
			command: "redo",
			accelKey: menuStrs.accel_editMenu_Redo + macShortCuts,
			//disabled: true,
	        iconClass: "docToolbarIcon redoIcon",
	        group: ToolbarConstant.ToolbarGroup.TOOLS
	}, 
	
	 {
		type:ToolbarConstant.ToolbarType.TOGGLEBUTTONEX,
		id:"D_t_FormatPainter",
		command: "formatPainter",
//		accelKey: dojo.isMac ?   menuStrs.accel_formatMenu_Textprop_FormatPainter_Mac : menuStrs.accel_formatMenu_Textprop_FormatPainter,
		title:nls.formatPainter,
	    iconClass: "docToolbarIcon formatPainterIcon",
	    label:nls.formatPainter,
	    group: ToolbarConstant.ToolbarGroup.TOOLS
	 },
//	{
//		type:ToolbarConstant.ToolbarType.BUTTON,
//		id:"D_t_Comment",
//		//TODO: enable when implemented
//	    disabled: true,
//        iconClass: "docToolbarIcon commentIcon",
//        group: ToolbarConstant.ToolbarGroup.TOOLS
//}, 
	{
		type:ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
		id:"D_t_Zoom",
		label:nls.zoom,
		showLabel: true,
		title: nls.zoom,
		domClass: 'customizeDropdown',
//		focusMethod:"this.focusFontName()",
	    group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING

	},	
{
	type:ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
	id:"D_t_FontHeading",
	label:nls.selectStyle_Normal,
	showLabel: true,
	title: nls.selectStyleTip,
	domClass: 'customizeDropdown',
	command: "headingFormat",
//	focusMethod:"this.focusFontName()",
    group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING

},
{
	type:ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
	id:"D_t_FontName",
	title: nls.selectFontNameTip,
	showLabel: true,
	label: nls.selectFontNameTip,
	domClass: 'customizeDropdown',
//	focusMethod:"this.focusFontName()",
    group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING

},
{
		type:ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
		label:dojo.string.substitute(nls.fontSize, ["10"]),
		showLabel: true,
		id:"D_t_FontSize",
		title: nls.selectFontSizeTip,
//		focusMethod:"this.focusFontSize()",
		domClass: 'customizeDropdown',
        group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
},

{
	type:ToolbarConstant.ToolbarType.TOGGLEBUTTON,
	id:"D_t_Bold",
	command: "bold",
	accelKey:  menuStrs.accel_formatMenu_Textprop_Bold + macShortCuts,
	title:nls.boldTip,
    iconClass: "docToolbarIcon boldIcon",
    label:nls.boldTip,
    group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
}, {
	type:ToolbarConstant.ToolbarType.TOGGLEBUTTON,
	id:"D_t_Italic",
	command: "italic",
	accelKey: menuStrs.accel_formatMenu_Textprop_Italic + macShortCuts,
	title:nls.italicTip,
	label:nls.italicTip,
    iconClass: "docToolbarIcon italicIcon",
    group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
}, {
	type:ToolbarConstant.ToolbarType.TOGGLEBUTTON,
	id:"D_t_Underline",
	command: "underline",
	accelKey:  menuStrs.accel_formatMenu_Textprop_Underline + macShortCuts,
	title:nls.underlineTip,
	label:nls.underlineTip,
    iconClass: "docToolbarIcon underlineIcon",
    group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
}, {
	type:ToolbarConstant.ToolbarType.TOGGLEBUTTON,
	id:"D_t_Strike",
	command: "strike",
	title:nls.strikeThroughTip,
	label:nls.strikeThroughTip,
    iconClass: "docToolbarIcon strikeIcon",
    group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
},
	 {
	     type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
	     id:"D_t_FontColor",
	     title:nls.setFontColorTip,
	     label:nls.setFontColorTip,
	     iconClass:"docToolbarIcon fontColorIcon",
	     group:ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
	 },
	 {
	     type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
	     id:"D_t_HighlightColor",
	     title:nls.setHighlightColor,
	     label:nls.setHighlightColor,
	     iconClass:"docToolbarIcon highlightColorIcon",
	     group:ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
	 },
	 
//	 {
//			type:ToolbarConstant.ToolbarType.BUTTON,
//			id:"D_t_ClearFormat",
//			command: "clearFormat",
//			title:nls.clearFormat,
//		    iconClass: "docToolbarIcon clearFormatIcon",
//		    label:nls.clearFormat,
//		    group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
//	 },
	 
	 {
		    type:ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
		    id:"D_t_Align",
		    title:nls.leftAlignTip,
		    label:nls.leftAlignTip,
//		    focusMethod:"focusAlign",
		    accelKey: menuStrs.accel_formatMenu_Left + macShortCuts,
		    iconClass:"docToolbarIcon leftIcon",
		    group:ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		},
	 {
	     type:ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
	     id:"D_t_Direction",
	     title:nls.ltrDirectionTip,
	     label:nls.ltrDirectionTip,
	     iconClass:"cke_button_bidiltr",
	     group:ToolbarConstant.ToolbarGroup.PARA_FORMATTING
	 },
	 {
	     type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
	     id:"D_t_BulletList",
	     command:"bulletList",	// Just for update toolbar status
	     title:nls.bulletedListTip,
	     label:nls.bulletedListTip,
	     iconClass:"docToolbarIcon bulletListIcon",
	     group:ToolbarConstant.ToolbarGroup.PARA_FORMATTING
	 },
	 {
	     type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
	     id:"D_t_NumberList",
	     command:"numberList",	// Just for update toolbar status
	     title:nls.numberedListTip,
	     label:nls.numberedListTip,
	     iconClass:"docToolbarIcon numberListIcon",
	     group:ToolbarConstant.ToolbarGroup.PARA_FORMATTING
	 },
//	 {
//	     type:ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
//	     id:"D_t_MultilevelList",
//	     command:"multiLevelList",
//	     title:nls.multilevelListTip,
//	     label:nls.multilevelListTip,
//	     iconClass:"docToolbarIcon multilevelListIcon",
//	     group:ToolbarConstant.ToolbarGroup.PARA_FORMATTING
//	 },
	 
	 {
	type:ToolbarConstant.ToolbarType.BUTTON,
	id:"D_t_Indent",
	title:nls.indentTip,
	label:nls.indentTip,
    iconClass: "docToolbarIcon indentIcon",
    command:"indent",
    accelKey: menuStrs.accel_formatMenu_Indent + macShortCuts,
    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
}, {
	type:ToolbarConstant.ToolbarType.BUTTON,
	id:"D_t_Outdent",
	title:nls.decreaseIndentTip,
	label:nls.decreaseIndentTip,
    iconClass: "docToolbarIcon outdentIcon",
    command:"outdent",
    accelKey: menuStrs.accel_formatMenu_DecreaseIndent + macShortCuts,
    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
},
//{
//    type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
//    id:"D_t_Border",
//    title:nls.borderTip,
//    command:"borderStyle",	// Just for update toolbar status
//    label:nls.borderTip,
//    iconClass:"docToolbarIcon borderIcon",
//    group:ToolbarConstant.ToolbarGroup.PARA_FORMATTING
//},
{
    type:ToolbarConstant.ToolbarType.BUTTON,
    id:"D_t_InsertImage",
    command:"uploadimage",
    title:nls.insertImage,
    label:nls.insertImage,
    iconClass:"docToolbarIcon imageIcon",
    group:ToolbarConstant.ToolbarGroup.INSERT
},
{
    type:ToolbarConstant.ToolbarType.BUTTON,
    id:"D_t_InsertLink",
    command:"link",
    title:nls.addLink,
    label:nls.addLink,
    iconClass:"docToolbarIcon linkIcon",
    group:ToolbarConstant.ToolbarGroup.INSERT
},

{
	     type:ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
	     id:"D_t_InsertTable",
	     command:"createTableState",
	     title:nls.addTableTip,
	     label:nls.addTableTip,
	     iconClass:"docToolbarIcon tabelStyleIcon",
	     group:ToolbarConstant.ToolbarGroup.INSERT
	 },{
	     type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
	     id:"D_t_AddRow",
	     command:"row",
	     hidden: true,
	     title: nls.insertOrDeleteRowTip,
	     label:nls.insertOrDeleteRowTip,
	     iconClass:"docToolbarIcon addRowIcon",
	     group:ToolbarConstant.ToolbarGroup.INSERT
	 },{
	     type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
	     id:"D_t_AddColumn",
	     command:"column",
	     hidden: true,
	     title: nls.insertOrDeleteColTip,
	     label:nls.insertOrDeleteColTip,
	     iconClass:"docToolbarIcon addColumnIcon",
	     group:ToolbarConstant.ToolbarGroup.INSERT
	 },{
	 	type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
	 	id:"D_t_ColorCell",
	 	command:"setTableColor",
	 	hidden:true,
	 	title:menuStrs.tableMenu_SetTableColor,
	 	label:menuStrs.tableMenu_SetTableColor,
	 	iconClass:"docToolbarIcon colorCellIcon",
	 	group:ToolbarConstant.ToolbarGroup.INSERT
	 },{
		 	type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
		 	id:"D_t_CellBorder",
		 	command:"setCellBorder",
		 	hidden:true,
		 	title:nls.setBorderTip,
		 	label:nls.setBorderTip,
		 	iconClass:"docToolbarIcon cellBorderIcon",
		 	group:ToolbarConstant.ToolbarGroup.INSERT
		 }

//, {
//	type:ToolbarConstant.ToolbarType.BUTTON,
//	id:"D_t_Image",
//    iconClass: "docToolbarIcon imageIcon",
//    command:"uploadimage",
//    title:nls.insertImage,
//    group: ToolbarConstant.ToolbarGroup.INSERT
//}
//, {
//	type:ToolbarConstant.ToolbarType.BUTTON,
//	id:"D_t_Link",
//    iconClass: "docToolbarIcon linkIcon",
//    command:"link",
//    title:nls.addLink,
//    group: ToolbarConstant.ToolbarGroup.INSERT
//}
	
	]; 
	return arr1;
};

getFindBarLeftConfig = function(){
	var nls = dojo.i18n.getLocalization("writer.ui.dialog","FindReplaceDlg");
	var arr1=
	[
	{
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Find_Prev",
			title:nls.pre,
			label:nls.pre,
	        iconClass: "docToolbarIcon findPrevIcon",
	        group: ToolbarConstant.ToolbarGroup.TOOLS
	}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Find_Next",
			title:nls.next,
			label:nls.next,
	        iconClass: "docToolbarIcon findNextIcon",
	        group: ToolbarConstant.ToolbarGroup.TOOLS
	}
	
	]; 
	return arr1;
};

getFindBarCenterConfig = function(){
	var nls = dojo.i18n.getLocalization("writer.ui.dialog","FindReplaceDlg");
	var arr1=
		[
		{
				type:ToolbarConstant.ToolbarType.BUTTON,
				id:"D_t_Replace",
				title:nls.replace,
				label:nls.replace,	
				showLabel: true,
				//disabled: true,	       
		        group: ToolbarConstant.ToolbarGroup.TOOLS
		}, {
				type:ToolbarConstant.ToolbarType.BUTTON,
				id:"D_t_ReplaceAll",
				title:nls.replaceAll,
				label:nls.replaceAll,
				showLabel: true,
				//disabled: true,	    
		        group: ToolbarConstant.ToolbarGroup.TOOLS
		}
		
		]; 
	return arr1;
};

getFindBarRightConfig = function(){
	var nls = dojo.i18n.getLocalization("writer.ui.dialog","FindReplaceDlg");	
	var arr1=
	[
	{
			type:ToolbarConstant.ToolbarType.TOGGLEBUTTON,
			id:"D_t_MatchCase",
			title:nls.matchCase,
			label:nls.matchCase,			
			showLabel: true,	       
	        group: ToolbarConstant.ToolbarGroup.TOOLS
	}, {
			type:ToolbarConstant.ToolbarType.TOGGLEBUTTON,
			id:"D_t_MatchWord",
			title:nls.matchWord,
			label:nls.matchWord,				
			showLabel: true,	    
	        group: ToolbarConstant.ToolbarGroup.TOOLS
	}
	, {
		type:ToolbarConstant.ToolbarType.BUTTON,
		id:"D_t_FindBarClose",
		title:nls.close,
		label:nls.close,
		iconClass: "docToolbarIcon closeFindIcon",		  
        group: ToolbarConstant.ToolbarGroup.TOOLS
}
	
	]; 
	return arr1;
};

createDropDown = function(id)
{
	//refer to Font.js, children dropdown menu items are created there
	var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	if("D_t_FontName" == id)
	{
		var fontNameMenu = new writer.ui.menu.Menu({
			id: "D_m_FontName",
			dir: dirAttr
		});
		dojo.addClass(fontNameMenu.domNode,"lotusActionMenu toolbarMenu");
	    return fontNameMenu;
	}
	else if("D_t_Zoom" == id)
	{
		var zoomMenu = new writer.ui.menu.Menu({
			id: "D_m_Zoom",
			dir: dirAttr
		});
		dojo.addClass(zoomMenu.domNode,"lotusActionMenu toolbarMenu");
	    return zoomMenu;
	}	
	else if("D_t_FontSize" == id)
	{
		var fontSizeMenu = new writer.ui.menu.Menu({
			id: "D_m_FontSize",
			dir: dirAttr
		});
		dojo.addClass(fontSizeMenu.domNode,"lotusActionMenu toolbarMenu");
	    return fontSizeMenu;
	}
	else if("D_t_FontHeading" === id)
	{
		var headerStyleMenu = new writer.ui.menu.Menu({
			id:"D_m_FontHeading",
			dir: dirAttr
		});
		dojo.addClass(headerStyleMenu.domNode,"lotusActionMenu toolbarMenu");
		return headerStyleMenu;
	}
	else if("D_t_AddRow" === id){
		var rowMenu = new writer.ui.menu.Menu({
			id:"D_m_AddRow",
			dir: dirAttr
		});
		dojo.addClass(rowMenu.domNode,"lotusActionMenu toolbarMenu");
		return rowMenu;
	}else if("D_t_AddColumn" === id){
		var columnMenu = new writer.ui.menu.Menu({
			id:"D_m_AddColumn",
			dir: dirAttr
		});
		dojo.addClass(columnMenu.domNode,"lotusActionMenu toolbarMenu");
		return columnMenu;
	}else if("D_t_Align" === id){
		var alignMenu = new writer.ui.menu.Menu({
			id:"D_m_Align",
			dir: dirAttr
		});
		var alignConfigs = getAlignConfig();
		dojo.addClass(alignMenu.domNode,"lotusActionMenu toolbarMenu");
		var commands = [];
		for(var i = 0 ; i < alignConfigs.length; i++)
			{
				
				var config = alignConfigs[i];
				commands[i] = config.command;		
				// pass command into menu item, and use it in onclick, because if use config.command directly, the value may not correct when onClick event happens
				alignMenu.addChild(new dijit.MenuItem({
		    	id: config.id,		    	
		    	title:config.title,
				label:config.label,
				command:config.command,
				// if has accelKey, will not show icon
				//accelKey: config.accelKey,
	        	iconClass: config.iconClass,
			dir: dirAttr,
	        	onClick:function(){ pe.lotusEditor.execCommand(this.command); }
			}));
		}
		return alignMenu;
	}else if("D_t_Direction" === id){
		var directionMenu = new writer.ui.menu.Menu({
			id:"D_m_Direction",
			dir: dirAttr
		});
		dojo.addClass(directionMenu.domNode,"lotusActionMenu toolbarMenu");
		var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");		
		directionMenu.addChild(new dijit.MenuItem({
		    	id: "D_t_BidiLtr",		    	
		    	title:nls.ltrDirectionTip,
		    	label:nls.ltrDirectionTip,
		    	command: "bidiltr",
	        	iconClass: "cke_button_bidiltr",
			dir: dirAttr,
	        	onClick:function(){ pe.lotusEditor.execCommand(this.command); }
			}));
		directionMenu.addChild(new dijit.MenuItem({
		    	id: "D_t_BidiRtl",		    	
		    	title:nls.rtlDirectionTip,
		    	label:nls.rtlDirectionTip,
		    	command: "bidirtl",
	        	iconClass: "cke_button_bidirtl",
			dir: dirAttr,
	        	onClick:function(){ pe.lotusEditor.execCommand(this.command); }
			}));
		return directionMenu;
	}
//	else if("D_t_Border" === id){
//		var borderMenu = new writer.ui.menu.Menu({
//			id:"D_m_Border"
//		});
//		dojo.addClass(borderMenu.domNode, "lotusActionMenu");
//		return borderMenu;
//	}
	else if("D_t_FontColor" === id){
		var colorPalette = writer.ui.widget.ColorPalette({id:"D_m_FontColor",colorType:"ForeColor",palette:"7x10",onChange:function(val){
			// Set timer to hide the widget first, then editor will grab focus.
			if(val == 'autoColor'){
				if(this._selectedCell >= 0)
				{
					dojo.removeClass(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
					this._selectedCell = -1; 
				}
			}
			else
				this._antoColorNode && dojo.style(this._antoColorNode, 'border','');
			setTimeout(function(){ pe.lotusEditor.execCommand("ForeColor",val);
			dojo.query(".docToolbarIcon", dijit.byId("D_t_FontColor").domNode).forEach(function(node){
				 var colorDiv = dojo.byId("colordiv");
				 if(!colorDiv){
					 colorDiv = dojo.create("div",{id:"colordiv", tabIndex:"-1"}, node);
					 dojo.addClass(colorDiv,'colorDiv');
				 }
				 if(val == "autoColor" || val == "auto"){
					 colorDiv.style["backgroundColor"] = "transparent";
					 pe.lotusEditor.dropdwonState["color"] = "autoColor";
				 }
				 else{
					 colorDiv.style["backgroundColor"]= val;
					 pe.lotusEditor.dropdwonState["color"] = val;
				 }
			 });
			}, 10);
			}});

		return colorPalette;
	}
	else if("D_t_ShadingColor" === id){
		return new writer.ui.widget.ColorPalette({id:"D_m_ShadingColor",colorType:"ShadingColor",palette:"7x10",onChange:function(val){
			if(val == 'autoColor'){
				if(this._selectedCell >= 0)
				{
					dojo.removeClass(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
					this._selectedCell = -1; 
				}
			}
			else
				this._antoColorNode && dojo.style(this._antoColorNode, 'border','');
			setTimeout(function(){ pe.lotusEditor.execCommand("ForeColor",val); }, 10);
			}});
	}
	else if("D_t_HighlightColor" === id){
		return new writer.ui.widget.ColorPalette({id:"D_m_HighlightColor",colorType:"HighlightColor",palette:"7x10",onChange:function(val){
			if(val == 'autoColor'){
				if(this._selectedCell >= 0)
				{
					dojo.removeClass(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
					this._selectedCell = -1; 
				}
			}
			else
				this._antoColorNode && dojo.style(this._antoColorNode, 'border','');
			setTimeout(function(){
				pe.lotusEditor.execCommand("HighlightColor",val);
				dojo.query(".docToolbarIcon", dijit.byId("D_t_HighlightColor").domNode).forEach(function(node){
					 var colorDiv = dojo.byId("highlighcolordiv");
					 if(!colorDiv){
						 colorDiv = dojo.create("div",{id:"highlighcolordiv", tabIndex:"-1"}, node);
						 dojo.addClass(colorDiv,'colorDiv');
					 }
					 if(val=="autoColor" || val == "auto"){
						 colorDiv.style["backgroundColor"] = "transparent";
						 pe.lotusEditor.dropdwonState["backgroundColor"] = "autoColor";
					 }
					 else{
						 colorDiv.style["backgroundColor"] = val;
						 pe.lotusEditor.dropdwonState["backgroundColor"] = val;
					 }
				 });
				}, 10);
			}});
	}
	else if("D_t_BulletList" === id){
		return new writer.ui.widget.ListStyle({type:"bulletList"});
	}
	else if("D_t_NumberList" === id){
		return new writer.ui.widget.ListStyle({type:"numberList"});
	}
	else if("D_t_MultilevelList" === id){
		return new writer.ui.widget.ListStyle({type:"multilevelList"});
	}
	else if("D_t_InsertTable" === id){
		return new writer.ui.widget.TablePicker();
	}
	else if("D_t_CellBorder" === id){
		return new writer.ui.widget.CellBorder();
	}
	else if("D_t_ColorCell" === id){
		return new writer.ui.widget.ColorPalette({id:"D_m_ColorCell",colorType:"CellColor",palette:"7x10",onChange:function(val){
			if(val == 'autoColor'){
				if(this._selectedCell >= 0)
				{
					dojo.removeClass(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
					this._selectedCell = -1; 
				}
			}
			else
				this._antoColorNode && dojo.style(this._antoColorNode, 'border','');
			setTimeout(function(){ 
				pe.lotusEditor.execCommand("setTableColor",val);
				dojo.query(".docToolbarIcon", dijit.byId("D_t_ColorCell").domNode).forEach(function(node){
					var colorDiv = dojo.byId("colorcelldiv");
					if(!colorDiv){
						colorDiv = dojo.create("div",{id:"colorcelldiv",tabIndex:"-1"},node);
						dojo.addClass(colorDiv,'colorDiv');
					}
					if(val=="autoColor" || val == "auto") {
						colorDiv.style["backgroundColor"] = "transparent";
						pe.lotusEditor.dropdwonState["cellColor"] = "autoColor";
					}
					else{
						colorDiv.style["backgroundColor"] = val;
						pe.lotusEditor.dropdwonState["cellColor"] = val;
					}
				  });
				}, 10);
			}});
	}
	else return null;
};
createFindReplaceToolbar = function(node, _toolbar, whichPart){
	var id, tWidgets;
	if("left"== whichPart){
		id ="D_t_FindReplaceLeft";
		tWidgets = getFindBarLeftConfig();
	}else if("right" == whichPart){
		id ="D_t_FindReplaceRight";
		tWidgets = getFindBarRightConfig();
	}else if("center" == whichPart){
		id ="D_t_FindReplaceCenter";
		tWidgets = getFindBarCenterConfig();
	}
	if(tWidgets)
		createToolbar(node, _toolbar, id, tWidgets);
};

createToolbar = function(node, _toolbar, id, tWidgets) {
	var toolbarId = id ? id : "D_t";
	var toolbar = new dijit.Toolbar({ id: toolbarId });
	dijit.setWaiState(toolbar.domNode, "label", "writer");
	var preGroup = null;
	var widgets = tWidgets ? tWidgets : getToolbarConfig();
	var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
	dojo.forEach(widgets, function(widget) {
			var curGroup = widget.group;
			if(!BidiUtils.isBidiOn() && widget.id.indexOf('D_t_Direction') != -1)
				return;

			if(BidiUtils.isGuiRtl()) {
				switch (widget.id)
				{
				case 'D_t_Undo':
					widget.iconClass = "docToolbarIcon redoIcon";
					break;
				case 'D_t_Redo':
					widget.iconClass = "docToolbarIcon undoIcon";
				}
				}

			if (!preGroup) {
				preGroup = curGroup;	
			}
			if (preGroup != curGroup) {
				toolbar.addChild(new dijit.ToolbarSeparator());
				preGroup = curGroup;
			}
			if(widget.type == ToolbarConstant.ToolbarType.BUTTON) {
				var label = widget.label ? widget.label : "";
				var showLabel = widget.showLabel ? widget.showLabel : false;
				var title = widget.title ? widget.title : "";
				var icon = widget.iconClass ? widget.iconClass : "";
				toolbar.addChild(new dijit.form.Button({
					id:widget.id,
					title:title,
					iconClass: icon,
					accelKey: widget.accelKey,
				    label:label,
				    showLabel:showLabel,
				    value:title,
			        disabled: widget.disabled || false
			    }));
			}
			else if(widget.type == ToolbarConstant.ToolbarType.TOGGLEBUTTON) {
				var label = widget.label ? widget.label : "";
				var showLabel = widget.showLabel ? widget.showLabel : false;
				var title = widget.title ? widget.title : "";
				var icon = widget.iconClass ? widget.iconClass : "";
				toolbar.addChild(new dijit.form.ToggleButton({
					id:widget.id,
					title:widget.title,
			        iconClass: icon,
			        accelKey: widget.accelKey,
			        label:label,
			        showLabel:showLabel,
			        value:title,
			        disabled: widget.disabled || false
			    }));
			}
			else if(widget.type == ToolbarConstant.ToolbarType.TOGGLEBUTTONEX) {
				var label = widget.label ? widget.label : "";
				var showLabel = widget.showLabel ? widget.showLabel : false;
				var title = widget.title ? widget.title : "";
				var icon = widget.iconClass ? widget.iconClass : "";
				toolbar.addChild(new writer.ui.widget.ToggleButtonEx({
					id:widget.id,
					title:widget.title,
			        iconClass: icon,
			        accelKey: widget.accelKey,
			        label:label,
			        showLabel:showLabel,
			        value:title,
			        disabled: widget.disabled || false
			    }));
			}
			else if(widget.type == ToolbarConstant.ToolbarType.DROPDOWNBUTTON) {
				var dropDownWidget = widget.dropDown;
				if (!widget.dropDown) {
					dropDownWidget = this.createDropDown(widget.id);
				}
				var label = widget.label ? widget.label : "";
				var showLabel = widget.showLabel ? widget.showLabel : false;
				var title = widget.title ? widget.title : "";
				var icon = widget.iconClass ? widget.iconClass : "";
				//TODO:
				//with dropDown as string, rather than a menu or other widget
				var tmp = null;
				toolbar.addChild(tmp =new writer.ui.toolbar.DropDownButton({
			    	id:widget.id,
					iconClass:icon,
			    	title:title,
			    	label:label,
			    	showLabel:showLabel,
			    	accelKey: widget.accelKey,
			    	value:title,
			        dropDown:dropDownWidget,
			        methodName:widget.methodName,
			        disabled:widget.disabled || false,
			      //  focusMethod:widget.focusMethod,
			        toolbar: _toolbar,
				dir: dirAttr
			    }));
				if(widget.domClass)
					dojo.addClass(tmp.domNode,widget.domClass);
				
				dijit.removeWaiState(tmp.focusNode, "labelledby");
				dijit.setWaiState(tmp.focusNode, "label", title);
			}
			else if(widget.type===ToolbarConstant.ToolbarType.BUTTONDROPDOWN){
				var dropDownWidget = widget.dropDown;
				if (!widget.dropDown) {
					dropDownWidget = this.createDropDown(widget.id);
				}
				var label = widget.label ? widget.label : "";
				var showLabel = widget.showLabel ? widget.showLabel : false;
				var title = widget.title ? widget.title : "";
				var icon = widget.iconClass ? widget.iconClass : "";
				toolbar.addChild(new writer.ui.widget.ButtonDropDown({
			    	id:widget.id,
					iconClass:icon,
			    	title:title,
			    	label:label,
			    	showLabel:showLabel,
			    	accelKey: widget.accelKey,
			    	value:title,
			        dropDown:dropDownWidget,
			        methodName:widget.methodName,
			        disabled:widget.disabled || false,
			       // focusMethod:widget.focusMethod,
			        toolbar: _toolbar,
				dir: dirAttr
			    }));
			}
			
			var commandName = widget.command;
			var widgetDom = dijit.byId(widget.id);
			if(commandName && (commandName !='createTableState' && commandName !='multiLevelList' && commandName != 'headingFormat')){
				dojo.connect(widgetDom, "onClick", dojo.hitch(_toolbar, _toolbar.dispatchCmd, commandName));
			}
			var domClass = "toolbar_off"; 
			if(widget.hidden)
				domClass = "toolbar_hidden";
			else if(widget.disabled)
				domClass = "toolbar_disabled";
			widgetDom.set('class', domClass);
	});

	_toolbar.widgets = widgets;
    _toolbar.postCreate();
    toolbar.placeAt(node);
    toolbar.startup();

    if (pe.settings && pe.settings.getToolbar() == pe.settings.TOOLBAR_NONE) {
    	_toolbar.toggle(true);
    }
 
	dojo.forEach(toolbar.getChildren(), function(w){
		dojo.connect(w, "focus", function(){
			// #30610
			var tb = dijit.getEnclosingWidget(this.domNode.parentNode);
			if(tb) 
				tb._set("focusedChild", this);
		});
		if(w && w.titleNode)
		{
			var title = w.titleNode.title;
			if(title)
			{
				w.tooltip = new writer.ui.widget.MenuTooltip({
					widget: w
				});
				w._setTitleAttr = function(/*Boolean*/ value){
					this._set("title", value);
				},
				w.tooltip.setTitleAck(title, w.accelKey);
				w.titleNode.title = "";
				w.title = "";
				w.watch("title", function(name, oldValue, value){
					if(this.tooltip && value)
					{
						this.tooltip.setTitleAck(value, this.accelKey);
					}
					setTimeout(dojo.hitch(this, function(){
						this.titleNode.title = "";
					}), 10);
				});
			}
		}
	});


};

createFloatingToolbar = function(node, editorToolbar)
{
	var floatingToolbar = new dijit.Toolbar({});
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	
	var floatingItems = [ {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Image1",
		    iconClass: "docToolbarIcon imageIcon",
		    command:"uploadimage",
		    title:nls.insertImage,
		    group: ToolbarConstant.ToolbarGroup.INSERT
		}
		, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Link1",
		    iconClass: "docToolbarIcon linkIcon",
		    command:"link",
		    title:nls.addLink,
		    group: ToolbarConstant.ToolbarGroup.INSERT
		}
		,{
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Indent1",
			title:nls.indentTip,
		    iconClass: "docToolbarIcon indentIcon",
		    command:"indent",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Outdent1",
			title:nls.decreaseIndentTip,
		    iconClass: "docToolbarIcon outdentIcon",
		    command:"outdent",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Left1",
			command:"AlignLeft",
			title:nls.leftAlignTip,
		    iconClass: "docToolbarIcon leftIcon",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Center1",
			command:"AlignCenter",
			title:nls.centerTip,
		    iconClass: "docToolbarIcon centerIcon",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Right1",
			command:"AlignRight",
			title:nls.rightAlignTip,
		    iconClass: "docToolbarIcon rightIcon",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}, {
			type:ToolbarConstant.ToolbarType.BUTTON,
			id:"D_t_Justify1",
			command:"Justify",
			title:nls.justifyTip,
		    iconClass: "docToolbarIcon justifyIcon",
		    group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
		}
	];
	
	for(var i = 0; i < floatingItems.length; i++){
		var widget = floatingItems[i];
		floatingToolbar.addChild(new dijit.form.Button({
			id		: widget.id,
			title	: widget.title || "",
			iconClass: widget.iconClass || "",
		    label	: widget.label || "",
	        disabled: widget.disabled || false
	    }));
		
		if(i != floatingItems.length - 1 && ((i + 1) % 4) != 0 )
			floatingToolbar.addChild(new dijit.ToolbarSeparator());
		
		var commandName = widget.command;
		var widgetDom = dijit.byId(widget.id);
		if(commandName){
			dojo.connect(widgetDom, "onClick", dojo.hitch(editorToolbar, editorToolbar.dispatchCmd, commandName));
		}
	}
	
	// TODO Need update status.
	floatingToolbar.placeAt(node);
	floatingToolbar.startup();
};

dojo.declare("writer.ui.toolbar.Toolbar", null, {

	widgets: null,
	base:null,
	multiSelCellFlag: true,
	colorPalleteList:null,
	selectFormatItem:"",
	toolbarMenuCheckState:{},
	toolbarMenuDisableState:{},
	_registerCommand : function(){
		if (this.widgets){
			var _toolbar = this;
			dojo.forEach(this.widgets, function(widget) {
				if (widget.command){
					var command = pe.lotusEditor.getCommand(widget.command);
					if (command){
						_toolbar.setToolbarStateById(widget.id, command.getState());
						
						var listener = new writer.core.Listener();
						listener.startListening(command);
						listener.notify = function(){
							_toolbar.setToolbarStateById(widget.id, command.getState());
						};
					}
				}
			});
		}
	},
	
	postCreate: function() {			             
//		  dojo.addClass(dijit.byId('D_t_Save').domNode,"lotusDijitButtonImg");
		  dojo.addClass(dijit.byId('D_t_Undo').domNode,"lotusDijitButtonImg");
		  dojo.addClass(dijit.byId('D_t_Redo').domNode,"lotusDijitButtonImg");
		  dojo.subscribe(writer.EVENT.LOAD_READY, this, this._registerCommand);
	},
	
 	dispatchCmd:function(method){
 		if( method == "formatPainter"){
 			pe.lotusEditor.execCommand(method, {"toggled": arguments[2]});
 		}
 		else
 			pe.lotusEditor.execCommand(method);
		// Fix issue 38414
		if(dojo.isIE){
			 setTimeout( function(){
			      pe.lotusEditor.focus();
			    }, 0);
		}
	},	
	checkToolbarById: function(toolbarId, bCheck) {
		var widget = dijit.byId(toolbarId);
		if (widget) {
			if (true != bCheck) {
				bCheck = false;
			}
			widget.attr("checked", bCheck);
		}
	},
	
	disableToolbarById: function(toolbarId, bDisabled) {
		var widget = dijit.byId(toolbarId);
		if(true != bDisabled)
			bDisabled = false;
		if(widget){
			widget.attr("disabled", bDisabled);
			if (widget.dropDown && widget.closeDropDown)
				widget.closeDropDown();
		}
	},
	setToolbarStateById: function(toolbarId, state) {
		var widget = dijit.byId(toolbarId);
		if(widget){
			if(widget.baseClass == "dijitToggleButton"  ){
				if (state == writer.TRISTATE_DISABLED){
					this.disableToolbarById(toolbarId, true);
				}else if (state == writer.TRISTATE_ON){			
					this.disableToolbarById(toolbarId, false);
					this.checkToolbarById(toolbarId, true);
				}else if (state == writer.TRISTATE_OFF){
					this.disableToolbarById(toolbarId, false);
					this.checkToolbarById(toolbarId, false);
				}
			}
			
			var toolbarClass = 'toolbar_off';
			if (state == writer.TRISTATE_DISABLED){
				toolbarClass = 'toolbar_disabled';
				widget.attr("disabled", true);
			}else if (state == writer.TRISTATE_ON){
				widget.attr("disabled", false);				
				if(toolbarId == "D_t_BulletList" || toolbarId == "D_t_NumberList"){
					toolbarClass = 'toolbar_on dijitToggleButton dijitToggleButtonChecked dijitChecked';
				}else{
					toolbarClass = 'toolbar_on';
				}
					
			}
			else if(state == writer.TRISTATE_HIDDEN)
			{
				toolbarClass = 'toolbar_hidden';
				if (widget.dropDown && widget.closeDropDown)
					widget.closeDropDown()
			}else{
				widget.attr("disabled", false);
			}	
			widget.set('class',toolbarClass);			
		}
	},
	
	//connect focus method, and it will be call back when open drop down
	_connectFocusEvent:function(node, dropDown, focusMethod){
		var me = this;
		// dropdown on open will call focus function, and by default focus function will move to the first item
		// override it with our own focusMethod.
		dojo.connect(node, "openDropDown", this, function(){me.dispatchCmd(focusMethod, true);});
		dropDown.autoFocus = false;
	},
	/* show/hide toolbar */
	toggle: function(bPreventStatus)
	{
		var n = dojo.byId("lotus_editor_toolbar");
		var display = dojo.style(n, "display");
		var toolbarSetting;
		
		if (display == "none")
		{
			dojo.style(n, "display", "");
			toolbarSetting = pe.settings.TOOLBAR_BASIC;
		}
		else
		{
			dojo.style(n, "display", "none");
			toolbarSetting = pe.settings.TOOLBAR_NONE;
		}
		
		if (pe.settings && !bPreventStatus) {
			pe.settings.setToolbar(toolbarSetting);
		}
	}


});
