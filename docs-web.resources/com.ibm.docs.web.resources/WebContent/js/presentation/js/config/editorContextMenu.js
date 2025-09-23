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

dojo.provide("pres.config.editorContextMenu");
dojo.require("pres.constants");
dojo.requireLocalization("concord.widgets", "menubar");
dojo.requireLocalization("concord.widgets", "presMenubar");
dojo.requireLocalization("concord.widgets", "toolbar");
dojo.requireLocalization("concord.widgets", "contentBox");

(function()
{
	var c = pres.constants;
	var menuStrs = dojo.i18n.getLocalization("concord.widgets", "menubar");
	var menuStrs2 = dojo.i18n.getLocalization("concord.widgets", "presMenubar");
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets", "toolbar");
	var editorStrs = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
	var shapeStrs = dojo.i18n.getLocalization("concord.widgets", "shapeGallery");
	
	var extension = DOC_SCENE.extension;
	var flag = false;
	if (extension && extension.toLowerCase() == 'pptx' && !DOC_SCENE.isOdfDraft)
		flag = true;

	if (flag)
	{
		pres.config.editorContextMenu = [{
			label: editorStrs.ctxMenu_createSlide,
			cmd: c.CMD_SLIDE_CREATE
		}, {
			label: menuStrs.editMenu_SelectAll,
			accelKey: dojo.isMac ? menuStrs.accel_editMenu_SelectAll_Mac : menuStrs.accel_editMenu_SelectAll,
			accLabel: menuStrs.editMenu_Redo + dojo.isMac ? menuStrs.accel_editMenu_SelectAll_Mac : menuStrs.accel_editMenu_SelectAll,
			cmd: c.CMD_SELECT_ALL_BOX
		}, {
			type: "separator"
		}, {
			label: editorStrs.ctxMenu_createTextBox,
			cmd: c.CMD_TEXTBOX_DRAG_CREATE,
			checked: true,
			checkable: false
		}, {
			label: editorStrs.ctxMenu_addImage,
			cmd: c.CMD_IMAGE_CREATE_DIALOG
		}, {
			label: shapeStrs.title,
			cmd: c.CMD_SHAPE_DRAG_CREATE,
			popup: "shape"
		}, {
			label: editorStrs.ctxMenu_createTable,
			cmd: c.CMD_TABLE_CREATE,
			popup: "table"
		}, {
			type: "separator"
		}, {
			label: menuStrs.teamMenu_AddComment,
			cmd: c.CMD_ADD_COMMENT
		}, {
			type: "separator"
		}, {
			label: editorStrs.ctxMenu_slideLayout,
			cmd: c.CMD_SLIDE_LAYOUT
		}];
	}
	else
	{
		pres.config.editorContextMenu = [{
			label: editorStrs.ctxMenu_createSlide,
			cmd: c.CMD_SLIDE_CREATE
		}, {
			label: menuStrs.editMenu_SelectAll,
			accelKey: dojo.isMac ? menuStrs.accel_editMenu_SelectAll_Mac : menuStrs.accel_editMenu_SelectAll,
			accLabel: menuStrs.editMenu_Redo + dojo.isMac ? menuStrs.accel_editMenu_SelectAll_Mac : menuStrs.accel_editMenu_SelectAll,
			cmd: c.CMD_SELECT_ALL_BOX
		}, {
			type: "separator"
		}, {
			label: editorStrs.ctxMenu_createTextBox,
			cmd: c.CMD_TEXTBOX_DRAG_CREATE,
			checked: true,
			checkable: false
		}, {
			label: editorStrs.ctxMenu_addImage,
			cmd: c.CMD_IMAGE_CREATE_DIALOG
		}, {
			label: editorStrs.ctxMenu_createTable,
			cmd: c.CMD_TABLE_CREATE,
			popup: "table"
		}, {
			type: "separator"
		}, {
			label: menuStrs.teamMenu_AddComment,
			cmd: c.CMD_ADD_COMMENT
		}, {
			type: "separator"
		}, {
			label: editorStrs.ctxMenu_slideLayout,
			cmd: c.CMD_SLIDE_LAYOUT
		}];
	}

})();
