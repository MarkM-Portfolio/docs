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

dojo.provide("websheet.config.ToolbarConfig");
dojo.require("dojo.i18n");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets","toolbar");
dojo.requireLocalization("concord.widgets","menubar");

getCellBorderToolbarConfig = function(){
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	return [
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_ClearBorders",
				title:nls.clearBorders,
				label:nls.clearBorders,
			    iconClass: "borderOpinionToolbar clearBordersIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			},
	        {
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_AllBorders",
				title:nls.allBorders,
				label:nls.allBorders,
			    iconClass: "borderOpinionToolbar allBordersIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			},
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_InnerBorders",
				title:nls.innerBorders,
				label:nls.innerBorders,
			    iconClass: "borderOpinionToolbar innerBordersIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			},
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_HorizontalBorders",
				title:nls.horizontalBorders,
				label:nls.horizontalBorders,
			    iconClass: "borderOpinionToolbar horizontalBordersIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			},
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_VerticalBorders",
				title:nls.verticalBorders,
				label:nls.verticalBorders,
			    iconClass: "borderOpinionToolbar verticalBordersIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			},
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_OuterBorders",
				title:nls.outerBorders,
				label:nls.outerBorders,
			    iconClass: "borderOpinionToolbar outerBordersIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			},
		    {
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_LeftBorder",
				title:nls.leftBorder,
				label:nls.leftBorder,
			    iconClass: "borderOpinionToolbar leftBorderIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			},
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_TopBorder",
				title:nls.topBorder,
				label:nls.topBorder,
			    iconClass: "borderOpinionToolbar topBorderIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			},
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_RightBorder",
				title:nls.rightBorder,
				label:nls.rightBorder,
			    iconClass: "borderOpinionToolbar rightBorderIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			},
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_BottomBorder",
				title:nls.bottomBorder,
				label:nls.bottomBorder,
			    iconClass: "borderOpinionToolbar bottomBorderIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_TYPE		   	
			}
	];
};

getCellBorderStyleToolbarConfig = function(){
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	return [
	        {
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_BorderStyle_ThinSolid",
				title:nls.BorderStyle_ThinSolid,
				label:nls.BorderStyle_ThinSolid,
			    iconClass: "borderOpinionToolbar cellb_1px_solid",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_STYLE		   	
			},
			 {
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_BorderStyle_ThinDotted",
				title:nls.BorderStyle_ThinDotted,
				label:nls.BorderStyle_ThinDotted,
			    iconClass: "borderOpinionToolbar cellb_1px_dot",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_STYLE		   	
			},			 
			 {
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_BorderStyle_ThinDashed",
				title:nls.BorderStyle_ThinDashed,
				label:nls.BorderStyle_ThinDashed,
			    iconClass: "borderOpinionToolbar cellb_1px_dashIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_STYLE		   	
			},
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_BorderStyle_ThickSolid",
				title:nls.BorderStyle_ThickSolid,
				label:nls.BorderStyle_ThickSolid,
			    iconClass: "borderOpinionToolbar cellb_3px_solid",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_STYLE		   	
			},
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_BorderStyle_ThickDotted",
				title:nls.BorderStyle_ThickDotted,
				label:nls.BorderStyle_ThickDotted,
			    iconClass: "borderOpinionToolbar cellb_3px_dot",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_STYLE		   	
			},			 
			{
				type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
				id:"S_t_BorderStyle_ThickDashed",
				title:nls.BorderStyle_ThickDashed,
				label:nls.BorderStyle_ThickDashed,
			    iconClass: "borderOpinionToolbar cellb_3px_dashIcon",
			    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
			    group: websheet.Constant.ToolbarGroup.BORDER_STYLE		   	
			}
	];
};

getToolbarConfig = function(){
	
	//	nls :'Test!',
	//	Group: //the different group should be in seperated by toolbar seperator 
	//  for drop down button: if drop down is a widget, create it by id in menubar.js and set it to dropDown
	// 						  if drop down is a string, set the string as dropDown directly
    //						  methodName is used to lazy load drop down widget
    //						  focusMethod is used to set focus on the drop down menu	
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var arr1=
	[ {
		type:websheet.Constant.ToolbarType.BUTTON,
		id:"S_t_Undo",
		title:nls.undoTip,
		accelKey: dojo.isMac? menuStrs.accel_editMenu_Undo_Mac : menuStrs.accel_editMenu_Undo,
		label:nls.undoTip,
	    iconClass: "websheetToolbarIcon undoIcon",
	    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
	    group: websheet.Constant.ToolbarGroup.TOOLS,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE,
	    aclMODE: websheet.Constant.ACLVisible
	}, {
		type:websheet.Constant.ToolbarType.BUTTON,
		id:"S_t_Redo",
		accelKey: dojo.isMac? menuStrs.accel_editMenu_Redo_Mac : menuStrs.accel_editMenu_Redo,
		title:nls.redoTip,
		label:nls.redoTip,
	    iconClass: "websheetToolbarIcon redoIcon",
	    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
	    group: websheet.Constant.ToolbarGroup.TOOLS,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE,
	    aclMODE: websheet.Constant.ACLVisible
	}, {
		type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
		id: "S_t_FormatPainter",
		title:nls.formatPainterTip,
		label:nls.formatPainterTip,
		iconClass: "websheetToolbarIcon formatPainterIcon",
		mode: websheet.Constant.ToolbarMode.ALL,
		group: websheet.Constant.ToolbarGroup.TOOLS,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}
	];
	
	var arr2 = [
	{
		type:websheet.Constant.ToolbarType.BUTTON,
		id:"S_t_Currency",
		label:websheet.i18n.Number.getCurrencySymbolPerLocale(),
		title:nls.formatAsCurrencyTip,
		/* **currency icon is text that chanable across locale** iconClass: */
		mode: websheet.Constant.ToolbarMode.ALL,
		group: websheet.Constant.ToolbarGroup.COLOR_NUMBER,
		showLabel: true,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.BUTTON,
		id:"S_t_Percent",
		label: nls.percent,
		title: nls.formatAsPercentTip,
		iconClass : "websheetToolbarIcon percentageIcon",
		mode: websheet.Constant.ToolbarMode.ALL,
		group: websheet.Constant.ToolbarGroup.COLOR_NUMBER,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.BUTTON,
		id:"S_t_DecreaseDecimal",
		label:nls.decreaseDecimalTip,
		title:nls.decreaseDecimalTip,
		iconClass: "websheetToolbarIcon decreaseDecimal",
		mode: websheet.Constant.ToolbarMode.ALL,
		group: websheet.Constant.ToolbarGroup.COLOR_NUMBER,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	},	{
		type:websheet.Constant.ToolbarType.BUTTON,
		id:"S_t_IncreaseDecimal",
		label:nls.increaseDecimalTip,
		title:nls.increaseDecimalTip,
		iconClass: "websheetToolbarIcon increaseDecimal",
		mode: websheet.Constant.ToolbarMode.ALL,
		group: websheet.Constant.ToolbarGroup.COLOR_NUMBER,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id:"S_t_NumberFormat",
		title:nls.formatNumberTip,
		label:nls.formatNumberTip,
		iconClass : "websheetToolbarIcon numberFormatIcon",
		dropDown: "S_m_NumberDropDown",
		mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
		group: websheet.Constant.ToolbarGroup.COLOR_NUMBER,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
		id:"S_t_InstantFilter",
		title:nls.instantFilterTip,
		label:nls.instantFilterTip,
		iconClass: "websheetToolbarIcon filterIcon",
		mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
		group: websheet.Constant.ToolbarGroup.COLOR_NUMBER,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id:"S_t_BgColor",
		title: nls.setBgColorTip,
		iconClass:"websheetToolbarIcon bgColorIcon",
		dropDown:"S_m_BackgroundColor",
		methodName:"this.BgColor()",
		mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
		group: websheet.Constant.ToolbarGroup.COLOR_NUMBER,
		showUnderHighContrast:false,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
    }, {
       	type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
	   	id:"S_t_Border",
       	title:nls.setBorderTip,
	   	iconClass:"websheetToolbarIcon borderIcon",
	    dropDown:"S_m_Border",
	    methodName:"this.Border4oneColor()",
	    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
	    group: websheet.Constant.ToolbarGroup.COLOR_NUMBER,
	    showUnderHighContrast:false,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
	    protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
    }
    ];
	
	var arr3=[ 
	{
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id:"S_t_FontName",
		title: nls.selectFontNameTip,
		focusMethod:"this.focusFontName()",
        mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
        group: websheet.Constant.ToolbarGroup.CHAR_FORMATTING,
        showLabel: true,
        showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
	   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	},
	{
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		label:dojo.string.substitute(nls.fontSize, ["10"]),
		id:"S_t_FontSize",
		title: nls.selectFontSizeTip,
//	    dropDown:fontSizeMenu,
		focusMethod:"this.focusFontSize()",
	    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
	    group: websheet.Constant.ToolbarGroup.CHAR_FORMATTING,
	    showLabel: true,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
		id:"S_t_Bold",
		title:nls.boldTip,
		label:nls.boldTip,
		accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Bold_Mac : menuStrs.accel_formatMenu_Textprop_Bold,
	    iconClass: "websheetToolbarIcon boldIcon",
	    mode: websheet.Constant.ToolbarMode.ALL,
	    group: websheet.Constant.ToolbarGroup.CHAR_FORMATTING,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
		id:"S_t_Italic",
		title:nls.italicTip,
		label:nls.italicTip,
		accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Italic_Mac : menuStrs.accel_formatMenu_Textprop_Italic,
	    iconClass: "websheetToolbarIcon italicIcon",
	    mode: websheet.Constant.ToolbarMode.ALL,
	    group: websheet.Constant.ToolbarGroup.CHAR_FORMATTING,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
		id:"S_t_Underline",
		title:nls.underlineTip,
		label:nls.underlineTip,
		accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Underline_Mac : menuStrs.accel_formatMenu_Textprop_Underline,
	    iconClass: "websheetToolbarIcon underlineIcon",
	    mode: websheet.Constant.ToolbarMode.ALL,
	    group: websheet.Constant.ToolbarGroup.CHAR_FORMATTING,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.TOGGLEBUTTON,
		id:"S_t_Strikethrough",
		title:nls.strikeThroughTip,
		label:nls.strikeThroughTip,
	    iconClass: "websheetToolbarIcon strikethroughIcon",
	    mode: websheet.Constant.ToolbarMode.ALL,
	    group: websheet.Constant.ToolbarGroup.CHAR_FORMATTING,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id:"S_t_FontColor",
		iconClass:"websheetToolbarIcon fontColorIcon",
	    title:nls.setFontColorTip,
	    dropDown:"S_m_FontColor",
	    methodName:"this.fontcolorChg()",
	    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
	    group: websheet.Constant.ToolbarGroup.CHAR_FORMATTING,
	    showUnderHighContrast:false,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}];

	var arr4= [{
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id:"S_t_Align",
		title:nls.leftAlignTip,
		label:nls.leftAlignTip,
		focusMethod:"this.focusAlign()",
	    iconClass: "websheetToolbarIcon alignLeftIcon",
	    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
	    group: websheet.Constant.ToolbarGroup.PARA_FORMATTING,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	},{
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id:"S_t_VAlign",
		title:nls.topAlignTip,
		label:nls.topAlignTip,
		focusMethod:"this.focusVAlign()",
	    iconClass: "websheetToolbarIcon alignTopIcon",
	    mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
	    group: websheet.Constant.ToolbarGroup.PARA_FORMATTING,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
	    protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	},{
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id:"S_t_Direction",
		title:nls.autoDirectionTip,
		focusMethod:"this.focusDirection()",	
        iconClass: "autoDirectionIcon",
        mode: websheet.Constant.ToolbarMode.ALL,
        group: websheet.Constant.ToolbarGroup.PARA_FORMATTING,
        showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
	   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {		
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id: "S_t_MirrorSheet",
		title:nls.toggleSheetDirectionTip,
		focusMethod:"this.toggleSheetDirection()",
		iconClass: "sheetLtrDirectionIcon",
        mode: websheet.Constant.ToolbarMode.ALL,
        group: websheet.Constant.ToolbarGroup.PARA_FORMATTING,
        showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	}, {
		type: websheet.Constant.ToolbarType.TOGGLEBUTTON,
		id: "S_t_WrapText",
		title:nls.wrapNoWrapTip,
		label:nls.wrapNoWrapTip,
		iconClass: "websheetToolbarIcon wrapTextIcon",
		mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
		group: websheet.Constant.ToolbarGroup.PARA_FORMATTING,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE,
		  	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type: websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id: "S_t_InsertDeleteRow",
		title:nls.insertOrDeleteRowTip,
		label:nls.insertOrDeleteRowTip,
		iconClass: "websheetToolbarIcon insertDeleteRowIcon",
		mode:websheet.Constant.ToolbarMode.ALL,
		group: websheet.Constant.ToolbarGroup.INSERT,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}, {
		type: websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id: "S_t_InsertDeleteCol",
		title: nls.insertOrDeleteColTip,
		label: nls.insertOrDeleteColTip,
	    iconClass: "websheetToolbarIcon insertDeleteColIcon",
	    mode: websheet.Constant.ToolbarMode.ALL,
	    group: websheet.Constant.ToolbarGroup.INSERT,
	    showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	},{
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_t_MergeSplitCell",
		title:nls.mergeSplitCellTip,
		label:nls.mergeSplitCellTip,
		iconClass: "websheetToolbarIcon mergeCellIcon",
		mode: websheet.Constant.ToolbarMode.ALL | websheet.Constant.ToolbarMode.LIGHT,
		group: websheet.Constant.ToolbarGroup.INSERT,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
	   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	},  {
		type:websheet.Constant.ToolbarType.DROPDOWNBUTTON,
		id: "S_t_QuickFormula",
		title:nls.insertFunctionTip,
		label:nls.insertFunctionTip,
		iconClass: "websheetToolbarIcon formulaIcon",
		dropDown:"S_m_QuickFormula",
		mode:websheet.Constant.ToolbarMode.ALL,
		group: websheet.Constant.ToolbarGroup.INSERT,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	},
	{
		type:websheet.Constant.ToolbarType.BUTTON,
		id:"S_t_InsertChart",
		title:nls.insertChartTip,
		label:nls.insertChartTip,
		iconClass:"websheetToolbarIcon insertChartIcon",
		mode:websheet.Constant.ToolbarMode.ALL,
		group:websheet.Constant.ToolbarGroup.INSERT,
		showMODE:websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}];

	if (!websheet.config.config.SHOW_FONTNAME_IN_TOOLBAR)
	{
		  for(var i = arr3.length - 1; i >= 0; i--)
		  {
			  	if(arr3[i].id === "S_t_FontName")
			  	{
			  		arr3.splice(i, 1);
			  	}
		  }
	}
	
	if(!BidiUtils.isBidiOn())
	{
		  for(var i = arr4.length - 1; i >= 0; i--)
		  {
			  	if(arr4[i].id === "S_t_Direction" || arr4[i].id === "S_t_MirrorSheet")
			  	{
			  		arr4.splice(i, 1);
			  	}
		  }
	}

  	 return arr1.concat(arr2, arr3, arr4);
};