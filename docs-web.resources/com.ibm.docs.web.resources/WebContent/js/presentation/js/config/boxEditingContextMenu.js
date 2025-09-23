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

dojo.provide("pres.config.boxEditingContextMenu");
dojo.require("pres.constants");
dojo.require("pres.utils.helper");
dojo.requireLocalization("pres", "pres");
dojo.requireLocalization("concord.widgets", "menubar");
dojo.requireLocalization("concord.widgets", "presMenubar");
dojo.requireLocalization("concord.widgets", "toolbar");
dojo.requireLocalization("concord.widgets", "contentBox");
dojo.requireLocalization("concord.widgets", "CKResource");

(function()
{
	var c = pres.constants;
	var presStrs = dojo.i18n.getLocalization("pres", "pres");
	var boxStrs = dojo.i18n.getLocalization("concord.widgets", "contentBox");
	var menuStrs = dojo.i18n.getLocalization("concord.widgets", "menubar");
	var menuStrs2 = dojo.i18n.getLocalization("concord.widgets", "presMenubar");
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets", "toolbar");
	var ckStrs = dojo.i18n.getLocalization("concord.widgets", "CKResource");
	
	pres.config.boxEditingContextMenu = [{
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
	}, {
		type: "separator"
	}, {
		label: menuStrs.teamMenu_AddComment,
		cmd: c.CMD_ADD_COMMENT
	}, {
		type: "separator"
	}, {
		cmd: c.CMD_BULLET,
		type: "bullet",
		popup: "bullet",
		label: ckStrs.liststyles.titles.bullets
	}, {
		cmd: c.CMD_NUMBERING,
		type: "number",
		popup: "number",
		label: ckStrs.liststyles.titles.numeric
	}];
	if (pres.utils.helper.isMobileBrowser())
	{
		pres.config.boxEditingContextMenu.push({type: "separator"});
		var deleteMenu = {
			label: presStrs.delete_general,
			cmd : c.CMD_DELETE_BOX
		};
		pres.config.boxEditingContextMenu.push(deleteMenu);
	}

})();
