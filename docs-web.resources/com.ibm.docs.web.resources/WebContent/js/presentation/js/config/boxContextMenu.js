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

dojo.provide("pres.config.boxContextMenu");
dojo.require("pres.constants");
dojo.requireLocalization("concord.widgets", "menubar");
dojo.requireLocalization("concord.widgets", "presMenubar");
dojo.requireLocalization("concord.widgets", "toolbar");
dojo.requireLocalization("concord.widgets", "contentBox");
dojo.requireLocalization("pres", "pres");
(function()
{
	var c = pres.constants;
	var presStrs = dojo.i18n.getLocalization("pres", "pres");
	var boxStrs = dojo.i18n.getLocalization("concord.widgets", "contentBox");
	var menuStrs = dojo.i18n.getLocalization("concord.widgets", "menubar");
	var menuStrs2 = dojo.i18n.getLocalization("concord.widgets", "presMenubar");
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets", "toolbar");

	pres.config.boxContextMenu = [{
		label: menuStrs.editMenu_Cut,
		accelKey: dojo.isMac ? menuStrs.accel_editMenu_Cut_Mac : menuStrs.accel_editMenu_Cut,
		accLabel: menuStrs.editMenu_Cut + " " + (dojo.isMac ? menuStrs.accel_editMenu_Cut_Mac : menuStrs.accel_editMenu_Cut),
		cmd: c.CMD_CUT
	}, {
		label: menuStrs.editMenu_Copy,
		accelKey: dojo.isMac ? menuStrs.accel_editMenu_Copy_Mac : menuStrs.accel_editMenu_Copy,
		accLabel: menuStrs.editMenu_Copy + " " + (dojo.isMac ? menuStrs.accel_editMenu_Copy_Mac : menuStrs.accel_editMenu_Copy),
		cmd: c.CMD_COPY
	}, {
		label: menuStrs.editMenu_Paste,
		accelKey: dojo.isMac ? menuStrs.accel_editMenu_Paste_Mac : menuStrs.accel_editMenu_Paste,
		accLabel: menuStrs.editMenu_Paste + " " + (dojo.isMac ? menuStrs.accel_editMenu_Paste_Mac : menuStrs.accel_editMenu_Paste),
		cmd: c.CMD_PASTE
	},/* {
		label: boxStrs.ctxMenu_delete,
		cmd: c.CMD_DELETE_BOX
	},*/ {
		type: "separator"
	}, /*{
		label: menuStrs.formatMenu_Properties,
		cmd: c.CMD_SHOW_PROPERTIES
	}, {
		type: "separator"
	},*/ {
		label: menuStrs.teamMenu_AddComment,
		cmd: c.CMD_ADD_COMMENT,
		disabled: true
	},{
		type: "separator"
	},/*{
		label: presStrs.changeImage,
		cmd: c.CMD_ADD_COMMENT,
		forImage: true
	},{
		type: "separator",
		forImage: true
	},*/{
		label: presStrs.align_slide,
		cmd: c.CMD_BOX_ALIGN_ALL,
		children: [{
			label: menuStrs.formatMenu_Left,
			cmd: c.CMD_BOX_ALIGN_LEFT
		}, {
			label: menuStrs.formatMenu_Center,
			cmd: c.CMD_BOX_ALIGN_CENTER
		}, {
			label: menuStrs.formatMenu_Right,
			cmd: c.CMD_BOX_ALIGN_RIGHT
		}, {
			type: "separator"
		}, {
			label: menuStrs.formatMenu_Top,
			cmd: c.CMD_BOX_ALIGN_TOP
		}, {
			label: menuStrs.formatMenu_Middle,
			cmd: c.CMD_BOX_ALIGN_MIDDLE
		}, {
			label: menuStrs.formatMenu_Bottom,
			cmd: c.CMD_BOX_ALIGN_BOTTOM
		}]
	},{
		label: presStrs.objects_distribute,
		cmd: c.CMD_DISTRIBUTE,
		children: [{
			label: presStrs.objects_distribute_h,
			cmd: c.CMD_DISTRIBUTE_H
		}, {
			label: presStrs.objects_distribute_v,
			cmd: c.CMD_DISTRIBUTE_V
		}]
	},{
		label: presStrs.order,
		cmd: c.CMD_ORDER,
		children: [{
			label: boxStrs.ctxMenu_bringToFront,
			cmd: c.CMD_BRING_FRONT
		}, {
			label: boxStrs.ctxMenu_sendToBack,
			cmd: c.CMD_SEND_BACK
		}]
	}];
	
	//add imageOpacityMenu for pptx
	var extension = DOC_SCENE.extension;
	if(extension && extension.toLowerCase() == 'pptx' && !DOC_SCENE.isOdfDraft)
	{
		var imageOpacityMenu = {
			label: presStrs.set_transparency_menu,
			cmd : c.CMD_TRANSPARENCY_DIALOG_OPEN,
			disabled: true
		};
		pres.config.boxContextMenu.push(imageOpacityMenu);
	}

	if (pres.utils.helper.isMobileBrowser())
	{
		pres.config.boxContextMenu.push({type: "separator"});
		var deleteMenu = {
			label: presStrs.delete_general,
			cmd : c.CMD_DELETE_BOX
		};
		pres.config.boxContextMenu.push(deleteMenu);
	}

})();
