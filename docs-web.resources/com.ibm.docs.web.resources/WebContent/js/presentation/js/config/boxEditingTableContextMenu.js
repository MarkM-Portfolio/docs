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

dojo.provide("pres.config.boxEditingTableContextMenu");
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
	var menuStrs = dojo.i18n.getLocalization("concord.widgets", "menubar");
	var menuStrs2 = dojo.i18n.getLocalization("concord.widgets", "presMenubar");
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets", "toolbar");
	var editorStrs = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
	var ckStrs = dojo.i18n.getLocalization("concord.widgets", "CKResource");
	pres.config.boxEditingTableContextMenu = [{
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
	},{
		type: "separator"
	}, {
		label: menuStrs.contextMenu_Template,
		cmd: c.CMD_TABLE_UPDATE_TEMPLATE,
		showUnderHighContrast: false,
		popup: "tableTemplate"
	}, {
		showUnderHighContrast: false,
		type: "separator"
	}, {
		label: menuStrs.tableMenu_Row,
		cmd: c.CMD_TABLE_ROW,
		children: [{
			label: menuStrs.tableMenu_InsertRowAbove,
			cmd: c.CMD_TABLE_INSERT_ROW_ABOVE
		}, {
			label: menuStrs.tableMenu_InsertRowBelow,
			cmd: c.CMD_TABLE_INSERT_ROW_BELOW
		}, {
			label: menuStrs.tableMenu_MoveRowAbove,
			cmd: c.CMD_TABLE_MOVE_ROW_UP
		}, {
			label: menuStrs.tableMenu_MoveRowBelow,
			cmd: c.CMD_TABLE_MOVE_ROW_DOWN
		}, {
			type: "separator"
		}, {
			label: menuStrs.tableMenu_RowDelete,
			cmd: c.CMD_TABLE_DELETE_ROW
		}, {
			type: "separator"
		}, {
			label: menuStrs.ctxMenuMakeHeaderRow,
			cmd: c.CMD_TABLE_SET_ROW_HEADER
		}, {
			label: menuStrs.ctxMenuMakeNonHeaderRow,
			cmd: c.CMD_TABLE_REMOVE_ROW_HEADER
		}]
	}, {
		label: menuStrs.tableMenu_Column,
		cmd: c.CMD_TABLE_COLUMN,
		children: [{
			label: menuStrs.tableMenu_InsertColumnBefore,
			cmd: c.CMD_TABLE_INSERT_COLUMN_BEFORE
		}, {
			label: menuStrs.tableMenu_InsertColumnAfter,
			cmd: c.CMD_TABLE_INSERT_COLUMN_AFTER
		}, {
			label: menuStrs.tableMenu_MoveColumnBefore,
			cmd: c.CMD_TABLE_MOVE_COLUMN_LEFT
		}, {
			label: menuStrs.tableMenu_MoveColumnAfter,
			cmd: c.CMD_TABLE_MOVE_COLUMN_RIGHT
		}, {
			type: "separator"
		}, {
			label: menuStrs.tableMenu_ColumnDelete,
			cmd: c.CMD_TABLE_DELETE_COLUMN
		}, {
			type: "separator"
		}, {
			label: menuStrs.ctxMenuMakeHeaderCol,
			cmd: c.CMD_TABLE_SET_COLUMN_HEADER
		}, {
			label: menuStrs.ctxMenuMakeNonHeaderCol,
			cmd: c.CMD_TABLE_REMOVE_COLUMN_HEADER
		}]
	}, {
		label: menuStrs.tableMenu_Cell,
		cmd: c.CMD_TABLE_CELL,
		children: [{
			type: "separator"
		}, {
				label: menuStrs.tableMenu_SetTableColor,
				cmd: c.CMD_TABLE_COLOR_CELL,
				showUnderHighContrast: false,
				popup: "color"
			},
			{
				label: menuStrs.tableMenu_CellClearContents,
				cmd: c.CMD_TABLE_CLEAR_CELL
			}
		]
	}];

	if (pres.utils.helper.isMobileBrowser())
	{
		pres.config.boxEditingTableContextMenu.push({type: "separator"});
		var deleteMenu = {
			label: presStrs.delete_general,
			cmd : c.CMD_DELETE_BOX
		};
		pres.config.boxEditingTableContextMenu.push(deleteMenu);
	}

})();
