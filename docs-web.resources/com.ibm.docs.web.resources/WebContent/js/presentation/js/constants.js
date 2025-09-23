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

dojo.provide("pres.constants");

pres.constants = {

	CMD_ZOOM: "zoom",
	CMD_ZOOM_FIT: "zoom_fit",
	
	CMD_DISTRIBUTE: "distribute",
	CMD_DISTRIBUTE_V: "distribute_v",
	CMD_DISTRIBUTE_H: "distribute_h",
	
	CMD_HELP_ABOUT: "help_about",
	CMD_HELP: "help",
	CMD_HELP_NEWFEATURES: "newFeatures",
	CMD_HELP_USERTOUR: "userTour",
	CMD_PREFERENCES: "preferences",

	CMD_TOGGLE_SORTER: "toggle_sorter",
	CMD_TOGGLE_TOOLBAR: "toggle_toolbar",
	CMD_TOGGLE_SIDEBAR: "toggle_sidebar",
	CMD_TOGGLE_NOTES: "toggle_notes",
	CMD_TOGGLE_COEDIT_COLOR: "toggle_coedit_color",
	CMD_TOGGLE_SHOW_UNSUPPORT_WARNING: "toggle_unsupport_warning",

	CMD_TOGGLE_SPELL_CHECK: "toggle_spell_check",
	CMD_SELECT_DICT: "select_dict",

	CMD_SHARE: "share",
	CMD_NEW_DOCUMENT: "new_document",
	CMD_NEW_SPREADSHEET: "new_spreadsheet",
	CMD_NEW_PRESENTATION: "new_presetation",

	CMD_NEW_DOCUMENT_FROM_TEMPLATE: "new_document_from_template",
	CMD_NEW_SPREADSHEET_FROM_TEMPLATE: "new_spreadsheet_from_template",

	CMD_OPEN_RECENT: "open",
	CMD_SAVE: "save",
	CMD_SAVEVERSION: "save_version",
	CMD_SAVE_AS: "save_as",

	CMD_DISCARDDRAFT: "discarddraft",
	CMD_VIEWFILEDETAILS: "filedetails",
	CMD_SHOWREVISION: "showrevision",

	CMD_AUTOPUBLISH: "autopublish",
	CMD_PUBLISH: "publish",
	CMD_SFRDIALOG: "submitforreview",

	CMD_PRINT: "print",
	CMD_PRINT_PDF: "print_pdf",

	CMD_UNDO: "undo",
	CMD_REDO: "redo",
	CMD_FORMATPAINTER: "formatpainter",
	CMD_SHOWSORTER: "showsorter",

	CMD_ALIGN_H: "align_h",
	CMD_ALIGN_V: "align_v",
	CMD_ALIGN_ALL: "align_all",

	CMD_ALIGN_LEFT: "align_left",
	CMD_ALIGN_RIGHT: "align_right",
	CMD_ALIGN_CENTER: "align_center",

	CMD_ALIGN_TOP: "align_top",
	CMD_ALIGN_MIDDLE: "align_middle",
	CMD_ALIGN_BOTTOM: "align_bottom",
	
	CMD_DIRECTION: "direction",
	CMD_DIRECTION_LTR: "directiion_ltr",
	CMD_DIRECTION_RTL: "directiion_rtl",
	
	CMD_BOX_ALIGN_H: "box_align_h",
	CMD_BOX_ALIGN_V: "box_align_v",
	CMD_BOX_ALIGN_ALL: "box_align_all",

	CMD_BOX_ALIGN_LEFT: "box_align_left",
	CMD_BOX_ALIGN_RIGHT: "box_align_right",
	CMD_BOX_ALIGN_CENTER: "box_align_center",

	CMD_BOX_ALIGN_TOP: "box_align_top",
	CMD_BOX_ALIGN_MIDDLE: "box_align_middle",
	CMD_BOX_ALIGN_BOTTOM: "box_align_bottom",

	CMD_NUMBERING: "numbering",
	CMD_BULLET: "bullet",
	CMD_INDENT: "indent",
	CMD_OUTDENT: "outdent",

	CMD_CLEAR_FORMAT: "clear_format",

	CMD_SHOW_PROPERTIES: "show_properties",
	CMD_CUT: "cut",
	CMD_PASTE: "paste",
	CMD_COPY: "copy",
	CMD_DELETE_BOX: "delete_box",
	CMD_SELECT_ALL: "select_all",
	CMD_SELECT_ALL_SLIDE: "select_all_slide",
	CMD_SELECT_ALL_BOX: "select_all_box",
	CMD_ORDER: "order",
	CMD_BRING_FRONT: "bring_front",
	CMD_SEND_BACK: "send_back",
	
	CMD_ROTATE: "rotate",
	CMD_ROTATE_RIGHT: "rotate_right",
	CMD_ROTATE_LEFT: "rotate_left",
	CMD_FLIP_X: "flipX",
	CMD_FLIP_Y: "flipY",

	CMD_SLIDE_CREATE: "create_slide",
	CMD_SLIDE_DUPLICATE: "duplicate_slide",
	CMD_SLIDE_DELETE: "delete_slide",
	CMD_SLIDE_LAYOUT: "slide_layout",
	CMD_SLIDE_TRANSITION: "slide_transitions",
	CMD_SLIDE_MOVE_UP: "slide_up",
	CMD_SLIDE_MOVE_DOWN: "slide_down",

	CMD_IMAGE_CREATE_DIALOG: "open_image_create_dialog",

	CMD_TEXTBOX_CREATE: "create_textbox",
	CMD_TEXTBOX_DRAG_CREATE: "drag_create_textbox",
	CMD_SHAPE_CREATE: "create_shape",
	CMD_SHAPE_DRAG_CREATE: "drag_create_shape",
	CMD_ADD_COMMENT: 'add_comment',
	CMD_OBJECT_OPACITY:"set_object_opacity",
	CMD_TRANSPARENCY_DIALOG_OPEN:"open_transparency_dialog",
	
	CMD_LINK_ADD: "add_link",
	CMD_LINK_EDIT: "edit_link",
	CMD_LINK_OPEN: "open_link",
	CMD_LINK_REMOVE: "remove_link",

	CMD_TABLE_CREATE: "create_table",
	CMD_TABLE_UPDATE_TEMPLATE: "table_update_template",
	CMD_TABLE_INSERT_ROW_ABOVE: "table_insert_row_above",
	CMD_TABLE_INSERT_ROW_BELOW: "table_insert_row_below",
	CMD_TABLE_MOVE_ROW_UP: "table_move_row_up",
	CMD_TABLE_MOVE_ROW_DOWN: "table_move_row_down",
	CMD_TABLE_DELETE_ROW: "table_delete_row",
	CMD_TABLE_SET_ROW_HEADER: "table_set_row_header",
	CMD_TABLE_REMOVE_ROW_HEADER: "table_remove_row_header",

	CMD_TABLE_ROW: "table_row",
	CMD_TABLE_COLUMN: "table_column",
	CMD_TABLE_CELL: "table_cell",

	CMD_TABLE_INSERT_COLUMN_BEFORE: "table_insert_column_before",
	CMD_TABLE_INSERT_COLUMN_AFTER: "table_insert_column_after",
	CMD_TABLE_MOVE_COLUMN_LEFT: "table_move_column_left",
	CMD_TABLE_MOVE_COLUMN_RIGHT: "table_move_column_right",
	CMD_TABLE_DELETE_COLUMN: "table_delete_column",
	CMD_TABLE_SET_COLUMN_HEADER: "table_set_column_header",
	CMD_TABLE_REMOVE_COLUMN_HEADER: "table_remove_column_header",

	CMD_TABLE_CLEAR_CELL: "table_clear_cell",
	CMD_TABLE_COLOR_CELL: "table_color_cell",
	CMD_TABLE_CELL_PROPERTIES: "table_cell_properties",

	CMD_STYLETABLE_OPEN_PANEL: "open_styletable_panel",

	CMD_SLIDE_SHOW: "slide_show",
	CMD_SLIDE_SHOW_FROM_CURRENT: "slide_show_from_current",
	CMD_SLIDE_SHOW_WITH_COVIEW: "slide_show_with_coview",

	CMD_FONT_NAME: "font_name",
	CMD_FONT_SIZE: "font_size",
	CMD_FONT_SIZE_INCREASE: "font_size_increase",
	CMD_FONT_SIZE_DECREASE: "font_size_decrease",
	CMD_BOLD: "bold",
	CMD_ITALIC: "italic",
	CMD_UNDERLINE: "underline",
	CMD_STRIKETHROUGH: "strikethrough",
	CMD_BG_COLOR: "bg_color",
	CMD_BORDER_COLOR: "border_color",
	CMD_FONT_COLOR: "font_color",

	CMD_SUPERSCRIPT: "superscript",
	CMD_SUBSCRIPT: "subscript",
	
	CMD_SPELLCHECK_IGNORE: "spellcheck_ignore",
	CMD_SPELLCHECK_SKIP_ALL: "spellcheck_skip_all",
	CMD_SPELLCHECK_REPLACE: "spellcheck_replace",
	CMD_SPELLCHECK_REPLACE_ALL: "spellcheck_replace_all",
	
	CMD_LINESPACING: "linespacing",
    LINESPACE_DEFAULT_NORMAL_TEXT: 1.2558,
    LINESPACE_DEFAULT_BULLET_TEXT: 1.2558,
	LINESPACE_CUSTOM_OPTION: "linespace_custom",
	LINESPACE_ADJUST_VALUE: 1.2558,
		
	MAX_SLIDE_NUM: 300,

	KEY_CTRL: 0x110000,
	KEY_SHIFT: 0x220000,
	KEY_ALT: 0x440000,

	DEFAULT_TEXTBOX_TOP: 41, // in %
	DEFAULT_TEXTBOX_LEFT: 30, // in %
	DEFAULT_TEXTBOX_WIDTH: 40, // in %
	DEFAULT_TEXTBOX_HEIGHT: 18, // in %

	DEFAULT_TABLE_ROWS: 5,
	DEFAULT_TABLE_COLS: 4,
	ROW_MAX: 10,
	COL_MAX: 10,
	ROW_MIN: 1,
	COL_MIN: 1,
	DEFAULT_TABLE_HEIGHT: 30, // in %
	DEFAULT_TABLE_WIDTH: 60, // in %
	DEFAULT_TABLE_TOP: 25, // in %
	DEFAULT_TABLE_LEFT: 16.45, // in %
	ROW_MIN_HEIGHT_CM: 0.3, // in cm
	COL_MIN_WIDTH_CM: 0.3, // in cm

	DEFAULT_IMAGE_HEIGHT: 200, // px
	DEFAULT_IMAGE_WIDTH: 200, // px
	DEFAULT_IMAGE_LEFT: 200, // px
	DEFAULT_IMAGE_TOP: 300, // px

	DEFAULT_OPACITY:100,
	
	DEFAULT_SHAPE_HEIGHT: 5, // cm
	DEFAULT_SHAPE_WIDTH: 5, // cm

	APIEvent:
	{
		/**
	     * this event is fired after all controllers and models are loaded in editor.js
	     */
		LOAD_READY: "LOAD_READY"
	},
    
	SHAPE_TYPES: {
		line: 'line',
		arrow: 'straightConnector1',
		doublearrow: 'straightConnector1',
		rectangle: 'rect',
		isoscelestriangle: 'triangle',
		ellipse: 'ellipse',
		diamond: 'diamond',
		fivepointedstar: 'star5',
		roundedrectangle: 'roundRect',
		rectangularcallout: 'wedgeRectCallout',
		hexagon: 'hexagon',
		rightarrow: "rightArrow",
		leftrightarrow: "leftRightArrow",
		cube: "cube",
		flowchartmagneticdisk: "flowChartMagneticDisk",
		wedgeellipsecallout: "wedgeEllipseCallout",
		rttriangle: "rtTriangle",
		trapezoid: "trapezoid",
		chevron: "chevron"	
	},
	ARROW_LINE_TYPES: {
	  head: 'head', //head line arrow
	  tail: 'tail', //tail line arrow
	  headTail: 'headTail' // line arrow has both head and tail
	},
	ARROW_TYPES: {
	  none: 'none',
	  triangle: 'triangle', //triangle angle
	  arrow: 'arrow', //open arrow
	  stealth: 'stealth',
	  diamond: 'diamond',
	  oval: 'oval'
	},
	SHAPE_DEFAULT_RATIO: {	//	width-height ratio
		isoscelestriangle: 1.16,
		rectangularcallout: 1.49,
		hexagon: 1.16,
		rightarrow: 2.02,
		leftrightarrow: 2.51,
		flowchartmagneticdisk: 1.49,
		wedgeellipsecallout: 1.49,
		trapezoid: 0.75
	},

	SHAPE_ID_FIX_PREFIX: '_sifpre',
	SHAPE_ID_FIX_SUFFIX: '_sifsuf',
	SHAPE_DEFAULT_GAP: 63500, // in EMU

	// 1 cm = 0.393700787 inch = 0.393700787 * 72 pt = 0.393700787 * 72 * 12700 emu
	CM_TO_EMU_FACTOR: 360000,
	PT_TO_EMU_FACTOR: 12700,

	MAX_ROW_COUNT: 50,
	MAX_COL_COUNT: 25,

	BOX_BORDER: 1,

	PRESENTATION_CLASS: "presentation_class",
	LAYOUT_CLASS: "layoutClass",
	LAYOUT_CLASSSS: "layoutClassSS", // added by slidesorter on content box data node

	CONTENT_BOX_TITLE_CLASS: 'cb_title',
	CONTENT_BOX_SUBTITLE_CLASS: 'cb_subtitle',
	CONTENT_BOX_NOTES_CLASS: 'cb_notes',
	CONTENT_BOX_OUTLINE_CLASS: 'cb_outline',
	CONTENT_BOX_GRAPHIC_CLASS: 'cb_graphic',
	CONTENTBOX_PREFIX: 'contentBox_',
	CONTENTBOX_DATA_PREFIX: 'contentBoxData_',
	IMPORTED_IMAGE_CLASS: 'importedImage',
	
	FONT_SIZE_ITEMS : [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, 96],
	FONT_SIZE_ITEMS_EXTEND: [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, 96, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600],

	CMD_ARROW_TYPE: "line_arrow",
	CMD_LINE_WIDTH: "line_width",
	CMD_LINE_JOIN: "line_linejoin",
	CMD_LINE_CAP: "line_linecap",
	LINE_CAP_ROUND: "round",
	LINE_CAP_FLAT: "butt",
	LINE_CAP_SQUARE: "square",
	CMD_LINE_DASHTYPE: "line_dasharray",
	LINE_WIDTH_ITEMS : [0.25, 0.5, 0.75, 1, 2, 3, 4, 5, 6],
	LINE_WIDTH_MAXITEM : [100],
	LINE_WIDTH_ITEMS_EXTEND : [0.25, 0.5, 0.75,1],
	LINE_ENDPOINT_TYPE:['head_none-tail_none','head_none-tail_arrow','head_arrow-tail_none',
						'head_arrow-tail_arrow','head_none-tail_triangle','head_triangle-tail_none',
						'head_triangle-tail_triangle','head_oval-tail_triangle','head_diamond-tail_triangle',
						'head_diamond-tail_diamond','head_oval-tail_oval'],
	LINE_DASH_TYPE: ['solid', 'dash', 'sysDash', 'sysDot', 'dashDot', 'lgDash'],
	LINE_DASH_TYPE_VALUE: ['none', '4, 3', '3, 1', '1, 1', '4, 3, 1, 3', '8, 3'],
	ToolbarMode: {
		ALL:	1, 
		LIGHT : 2
//		XXX : 4
	}
};