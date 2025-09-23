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

dojo.provide("pres.config.sorterContextMenu");
dojo.require("pres.constants");
dojo.requireLocalization("concord.widgets", "menubar");
dojo.requireLocalization("concord.widgets", "presMenubar");
dojo.requireLocalization("concord.widgets", "toolbar");
dojo.requireLocalization("concord.widgets", "contentBox");
dojo.requireLocalization("concord.widgets", "slidesorter");
(function()
{
	var c = pres.constants;
	var menuStrs = dojo.i18n.getLocalization("concord.widgets", "menubar");
	var menuStrs2 = dojo.i18n.getLocalization("concord.widgets", "presMenubar");
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets", "toolbar");
	var sorterStrs = dojo.i18n.getLocalization("concord.widgets", "slidesorter");
	pres.config.sorterContextMenu = [{
		label: sorterStrs.ctxMenu_CUT,
		cmd: c.CMD_CUT
	}, {
		label: sorterStrs.ctxMenu_COPY,
		cmd: c.CMD_COPY
	}, {
		label: menuStrs.editMenu_Paste,
		cmd: c.CMD_PASTE
	}, {
		type: "separator"
	}, {
		label: menuStrs.teamMenu_AddComment,
		cmd: c.CMD_ADD_COMMENT
	}, {
		type: "separator"
	}, {
		label: sorterStrs.ctxMenu_CREATE_SLIDE,
		cmd: c.CMD_SLIDE_CREATE
	}, {
		label: menuStrs.createMenu_DuplicateSlide,
		cmd: c.CMD_SLIDE_DUPLICATE
	}, {
		label: sorterStrs.ctxMenu_DELETE_SLIDE,
		cmd: c.CMD_SLIDE_DELETE
	},  {
		type: "separator"
	}, {
		label: sorterStrs.ctxMenu_SLIDE_LAYOUT,
		cmd: c.CMD_SLIDE_LAYOUT
	}, {
		type: "separator"
	}, {
		label: sorterStrs.ctxMenu_MOVE_UP,
		cmd: c.CMD_SLIDE_MOVE_UP
	}, {
		label: sorterStrs.ctxMenu_MOVE_DOWN,
		cmd: c.CMD_SLIDE_MOVE_DOWN
	}];

})();
