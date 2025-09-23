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

dojo.provide("websheet.config.ContextMenuConfig");
dojo.require("dojo.i18n");
dojo.require("websheet.model.ModelHelper");
dojo.require("concord.util.browser");
dojo.requireLocalization("concord.widgets","toolbar");
dojo.requireLocalization("concord.widgets","menubar");

getSheetCMenuConfig = function(){
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var items = 
	[
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Insert_Sheet",
		label: menuStrs.SHEET_CONTEXT_InsertSheet,
		method:"execCommand",
		args:commandOperate.INSERTSHEET,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.WORKBOOKPROTECTINVISIBLE,
		aclMODE: websheet.Constant.ACLVisible
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Delete_Sheet",
		label: menuStrs.SHEET_CONTEXT_DeleteSheet,
		method:"execCommand",
		args:commandOperate.DELETESHEET,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.WORKBOOKPROTECTINVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Hide_Sheet",
		label: menuStrs.SHEET_CONTEXT_Hide,
		method:"execCommand",
		args:commandOperate.HIDESHEET,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Rename_Sheet",
		label: menuStrs.SHEET_CONTEXT_RenameSheet,
		method:"execCommand",
		args:commandOperate.RENAMESHEET,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.WORKBOOKPROTECTINVISIBLE
	 },
	 {
			type: websheet.Constant.ToolbarType.BUTTON,
			id: "S_CM_ACL_Sheet",
			label: menuStrs.ctxMenu_Sheet_ACL,
			isShow: g_enableACL,
			method:"execCommand",
			args:commandOperate.ACCESSPERMISSION,
			args2: {bSheet:true},
			showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
			protectMODE: websheet.Constant.ProtectVisible.WORKBOOKPROTECTINVISIBLE
	  },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Move_Sheet",
		label: menuStrs.SHEET_CONTEXT_MoveSheet,
		method:"execCommand",
		args:commandOperate.MOVESHEET,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.WORKBOOKPROTECTINVISIBLE
	 }
	];
	return items;
};
getCommonCMenuConfig = function(){
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var menu = 
	[
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Cut",
		group: "Edit",
		label: menuStrs.editMenu_Cut,
		method: "execCommand",
		args: commandOperate.CUT,
		args2:[],
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Copy",
		group: "Edit",
		label: menuStrs.editMenu_Copy,
		method: "execCommand",
		args: commandOperate.COPY,
		aclMODE: websheet.Constant.ACLVisible,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Paste",
		group: "Edit",
		label: menuStrs.editMenu_Paste,
		method: "execCommand",
		args: commandOperate.PASTE,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 }
	];
	return menu;
};

getCellCMenuConfig = function(){
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var menu  = 
	[
	{
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_InsertCellRight",
		label: menuStrs.contextMenu_insertCellRight,
		method: "execCommand",
		args: commandOperate.INSERTCELL,
		group: "Cells",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_InsertCellDown",
		label: menuStrs.contextMenu_insertCellDown,
		method: "execCommand",
		args: commandOperate.INSERTCELLDOWN,
		group: "Cells",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_DeleteCellLeft",
		label: menuStrs.editMenu_DeleteCellLeft,
		method: "execCommand",
		args: commandOperate.DELETECELL,
		group: "Cells",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_DeleteCellUp",
		label: menuStrs.editMenu_DeleteCellUp,
		method: "execCommand",
		args: commandOperate.DELETECELLUP,
		group: "Cells",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Wrap",
		label: toolbarStrs.wrapNoWrapTip,
		method: "execCommand",
		args: commandOperate.WRAPTEXT,
		group: "Wrap",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_MergeSplit",
		label: toolbarStrs.mergeSplitCellTip,
		method: "execCommand",
		args: commandOperate.MERGECELL,
		group: "Merge",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_ClearCell",
		label: menuStrs.editMenu_ClearCell,
		method: "execCommand",
		args: commandOperate.CLEAR,
		group: "Clear",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_InsertChart",
		label: toolbarStrs.insertChartTip,
		method: "execCommand",
		args: commandOperate.INSERTCHART,
		group: "chart",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	  },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_Validation",
		group: "validation",
		label: toolbarStrs.dataValidationTip,
		method: "execCommand",
		args: commandOperate.VALIDATION,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	},
	{
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_ACL",
		group: "ACL",
		label: menuStrs.ctxMenu_Range_ACL,
		isShow: g_enableACL,
		method: "execCommand",
		args: commandOperate.ACCESSPERMISSION,
		args2: {bRange:true},
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}
	];	
	if(pe.scene.bMobileBrowser) {
	// for mobile, autofill/remove formatting should be enabled by context menu
		menu.push(
		{
			type: websheet.Constant.ToolbarType.BUTTON,
			id: "S_CM_Autofill",
			label: toolbarStrs.startAutofillTip,
			method: "execCommand",
			args: commandOperate.STARTAUTOFILL,
			group: "Autofill",
			showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
			protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
		}
		);
		menu.push(
				{
					type: websheet.Constant.ToolbarType.BUTTON,
					id: "S_CM_RemoveFormatting",
					label: toolbarStrs.removeFormatTip,
					method: "execCommand",
					args: commandOperate.DEFAULTSTYLE,
					group: "Style",
					showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
					protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
				}
				);
	}
	return menu;
};

getRowCMenuConfig = function(){
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var menu = 
	[
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_InertRowAbove",
		label: menuStrs.contextMenu_InsertRowAbove,
		method: "execCommand",
		args: commandOperate.INSERTROW,
		group: "InsDltRow",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_InertRowBelow",
		label: menuStrs.contextMenu_InsertRowBelow,
		method: "execCommand",
		args: commandOperate.INSERTROWBELOW,
		group: "InsDltRow",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_DeleteRow",
		label: menuStrs.editMenu_DeleteRow,
		method: "execCommand",
		args: commandOperate.DELETEROW,
		group: "InsDltRow",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_ShowRow",
		label: menuStrs.SHEET_CONTEXT_Show,
		method: "execCommand",
		args: commandOperate.SHOWROW,
		group: "ShowHideRow",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
		aclMODE: websheet.Constant.ACLVisible
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_HideRow",
		label: menuStrs.SHEET_CONTEXT_Hide,
		method: "execCommand",
		args: commandOperate.HIDEROW,
		group: "ShowHideRow",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
		aclMODE: websheet.Constant.ACLVisible
	 },
	 {
			type: websheet.Constant.ToolbarType.BUTTON,
			id: "S_CM_ClearRow",
			label: menuStrs.editMenu_ClearCell,
			method: "execCommand",
			args: commandOperate.CLEAR,
			group: "Clear",
			protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
			showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_RowValidation",
		group: "validation",
		label: toolbarStrs.dataValidationTip,
		method: "execCommand",
		args: commandOperate.VALIDATION,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	},
	{
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_RowACL",
		group: "ACL",
		label: menuStrs.ctxMenu_Range_ACL,
		isShow: g_enableACL,
		method: "execCommand",
		args: commandOperate.ACCESSPERMISSION,
		args2: {bRange:true},
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}
    ];
	return menu;
};

getColCMenuConfig = function(){
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var menu = 
	[
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_InsertColumnBefore",
		label: menuStrs.contextMenu_InsertColumnBefore,
		method: "execCommand",
		args: commandOperate.INSERTCOLUMN,
		group: "InsDltCol",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_InsertColumnAfter",
		label: menuStrs.contextMenu_InsertColumnAfter,
		method: "execCommand",
		args: commandOperate.INSERTCOLUMNAFTER,
		group: "InsDltCol",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_DeleteColumn",
		label: menuStrs.editMenu_DeleteColumn,
		method: "execCommand",
		args: commandOperate.DELETECOLUMN,
		group: "InsDltCol",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_ShowColumn",
		label: menuStrs.SHEET_CONTEXT_Show,
		method: "execCommand",
		args: commandOperate.SHOWCOLUMN,
		group: "ShowHideCol",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
		aclMODE: websheet.Constant.ACLVisible
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_HideColumn",
		label: menuStrs.SHEET_CONTEXT_Hide,
		method: "execCommand",
		args: commandOperate.HIDECOLUMN,
		group: "ShowHideCol",
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
		aclMODE: websheet.Constant.ACLVisible
	 },
	 {
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_ColValidation",
		group: "validation",
		label: toolbarStrs.dataValidationTip,
		method: "execCommand",
		args: commandOperate.VALIDATION,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	},
	{
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_ColACL",
		group: "ACL",
		label: menuStrs.ctxMenu_Range_ACL,
		isShow: g_enableACL,
		method: "execCommand",
		args: commandOperate.ACCESSPERMISSION,
		args2: {bRange:true},
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}
	];
	return menu;
};

getChartCMenuConfig = function(){
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var menu = 
	[
	];
	if(!dojo.isIE || dojo.isIE>=9)
	{
		menu.push(
		{
			type: websheet.Constant.ToolbarType.BUTTON,
			id: "S_CM_DownloadChartImage",
			label: menuStrs.contextMenu_DownloadImage,
			method: "execCommand",
			args:commandOperate.DOWNLOADCHART,
			showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE | websheet.Constant.ModeVisible.VIEWDRAFTMODEVISIBLE
	    });
	}
//	if(g_enableSetChart)
	{
		menu.push(
		{
			type: websheet.Constant.ToolbarType.BUTTON,
			id: "S_CM_ChartProperties",
			label: menuStrs.formatMenu_EditChart,
			method: "execCommand",
			args:commandOperate.CHARTPROPERTIES,
			showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
			protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
		});
	}
	if (pe.scene.bMobileBrowser) {
		menu.push({
			type: websheet.Constant.ToolbarType.BUTTON,
			id: "S_CM_DeleteChart",
			label: menuStrs.ctxMenu_delete,
			method: "execCommand",
			args:commandOperate.DELETEFRAME,
			showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
			protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
			
		});
	}
	return menu;
};

getImageCMenuConfig = function(){
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var menu = 
	[
	{
		type: websheet.Constant.ToolbarType.BUTTON,
		id: "S_CM_ImageProperties",
		label: menuStrs.formatMenu_ImageProperties,
		method: "execCommand",
		args:commandOperate.IMAGEPROPERTIES,
		showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
	}
	];
	if (pe.scene.bMobileBrowser) {
		menu.push({
			type: websheet.Constant.ToolbarType.BUTTON,
			id: "S_CM_DeleteImage",
			label: menuStrs.ctxMenu_delete,
			method: "execCommand",
			args:commandOperate.DELETEFRAME,
			showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,
			protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE
			
		});
	}
	
	return menu;
};

createCMItems = function(editor, attrs, dirAttr)
{
	if(!attrs || attrs.length == 0) return null;
	var length = attrs.length;
	var items = [];
	var preGroup = null;
	var isDocumentProtected = websheet.model.ModelHelper.isDocumentProtected();
	var isSheetProtected = websheet.model.ModelHelper.isSheetProtected();
	for(var i = 0; i < length; i++)
	{
		var bShow = attrs[i].isShow != undefined ? attrs[i].isShow : true;
		if(bShow && _showInCurrMode(editor.scene, attrs[i])){
			var curGroup = attrs[i].group;
			if(!preGroup)
				preGroup = curGroup;
			if(preGroup != curGroup)
			{
				items.push(new dijit.MenuSeparator());
				preGroup = curGroup;
			}
			var method = null;
			if(!attrs[i].args2)
				method = dojo.hitch(editor,attrs[i].method, attrs[i].args);
			else
				method = dojo.hitch(editor,attrs[i].method, attrs[i].args, attrs[i].args2);
			var bDisable = (attrs[i].disabled) ? true :false;
			var item = new dijit.MenuItem({
		        label: attrs[i].label,
		        id: attrs[i].id,
		        disabled:bDisable,
		        onClick: method,
			dir: dirAttr
		    });
			items.push(item);
		}
	}
	return items;
};

