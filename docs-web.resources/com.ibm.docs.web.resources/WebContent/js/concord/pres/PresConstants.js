/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) CopyRight IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.pres.PresConstants");

dojo.declare("concord.pres.PresConstants", null, {
	
	//style value using dojo style rule other than DOM rule, please using dojo.getComputedStyle accordingly
	STYLES:
	{
		FONTSIZE: "fontSize",
		FONTNAME: "fontFamily",
		BOLD: "fontWeight",
		ITALIC: "fontStyle",
		UNDERLINE: "textDecoration",
		LINETHROUGH: "textDecoration",
		SUPERSCRIPT: "verticalAlign",
		SUBSCRIPT: "verticalAlign",
		BORDERTOPWIDTH: "borderTopWidth",
		BORDERRIGHTWIDTH: "borderRightWidth",
		BORDERBOTTOMWIDTH: "borderBottomWidth",
		BORDERLEFTWIDTH: "borderLeftWidth",
		PADDINGTOP: "paddingTop",
		PADDINGRIGHT: "paddingRight",
		PADDINGBOTTOM: "paddingBottom",
		PADDINGLEFT: "paddingLeft",
		MARGINTOP: "marginTop",
		MARGINRIGHT: "marginRight",
		MARGINLEFT: "marginLeft",
		MARGINBOTTOM: "marginBottom"
	},
	
	FONTSIZE_BASELINE: 22.5,
	PPICONSTATNT: 96,
	INTOCMCONVERTOR: 2.54,
	
	//table min col width in px
	MIN_COL_WIDTH: 20,
	
	//table styles
	TABLE_PLAIN: 'st_plain',
	TABLE_BLUE: 'st_blue_style',
	TABLE_RED_TINT: 'st_red_tint',
	TABLE_BLUE_HEADER: 'st_blue_header',
	TABLE_DARK_GRAY_HEADER_FOOTER: 'st_dark_gray_header_footer',
	TABLE_LIGHT_GRAY_ROWS: 'st_light_gray_rows',
	TABLE_DARK_GRAY: 'st_dark_gray',
	TABLE_BLUE_TINT: 'st_blue_tint',
	TABLE_RED_HEADER: 'st_red_header',
	TABLE_GREEN_HEADER_FOOTER: 'st_green_header_footer',
	TABLE_PLAINT_ROWS: 'st_plain_rows',
	TABLE_GRAY_TINT: 'st_gray_tint',
	TABLE_GREEN_TINT: 'st_green_tint',
	TABLE_GREEN_HEADER: 'st_green_header',
	TABLE_RED_HEADER_FOOTER: 'st_red_header_footer',
	TABLE_GREEN_STYLE: 'st_green_style',
	TABLE_PURPLE_TINT: 'st_purple_tint',
	TABLE_BLACK_HEADER: 'st_black_header',
	TABLE_PURPLE_HEADER: 'st_purple_header',
	TABLE_LIGHT_BLUE_HEADER_FOOTER: 'st_light_blue_header_footer',
	
	//custom table styles
	TABLE_CUSTOM_PLAIN: 'st_border_plain',
	TABLE_CUSTOM_TOP_HEADER: 'st_border_top_header',
	TABLE_CUSTOM_BOTTOM_SUMMARY: 'st_border_bottom_summary',
	TABLE_CUSTOM_FIRST_COL_HEADER: 'st_border_first_column_header',
	TABLE_CUSTOM_LAST_COL_SUMMARY: 'st_border_last_column_summary',
	
	PERCENTAGE_REGEX: /^[0-9][0-9]*(\.[0-9]*)?\%$/,
	
	ABS_STYLES:
	{
		FONTSIZE: "abs-font-size",
		MARGINLEFT: "abs-margin-left",
		BULLETSCALE: "abs-bullet-scale",
		TEXTINDENT: "abs-text-indent",
		NUMBERTYPE: "abs-number-type",
		STARTNUMBER: "abs-start-number"
	},
	
	MASTER_STYLE_MODEL_VALUE:"master_style_mode_value",
	DEFAULT_COMMON_STYLE:"default_common_style",
	DEFAULT_COMMON_STYLE_STRING:"<div>"
		+"<div id=\"default_common_style\" abs-font-size=\"18\" />"
		+"<div id=\"MP_defaulttitle_1\" abs-font-size=\"44\" />"
		+"<div id=\"MP_defaultsubtitle_1\" abs-font-size=\"32\" />"
		+"<div id=\"MP_defaultgraphic_1\" abs-font-size=\"32\" />"
		+"<div id=\"MP_defaultoutline_1\" abs-font-size=\"32\" abs-margin-left=\"952\" abs-text-indent=\"-952\"/>"
		+"<div id=\"MP_defaultoutline_2\" abs-font-size=\"28\" abs-margin-left=\"2063\" abs-text-indent=\"-793\" />"
		+"<div id=\"MP_defaultoutline_3\" abs-font-size=\"24\" abs-margin-left=\"3175\" abs-text-indent=\"-635\" />"
		+"<div id=\"MP_defaultoutline_4\" abs-font-size=\"20\" abs-margin-left=\"4445\" abs-text-indent=\"-635\" />"
		+"<div id=\"MP_defaultoutline_5\" abs-font-size=\"20\" abs-margin-left=\"5715\" abs-text-indent=\"-635\" />"
		+"<div id=\"MP_defaultoutline_6\" abs-font-size=\"20\" abs-margin-left=\"6985\" abs-text-indent=\"-635\" />"
		+"<div id=\"MP_defaultoutline_7\" abs-font-size=\"20\" abs-margin-left=\"8255\" abs-text-indent=\"-635\" />"
		+"<div id=\"MP_defaultoutline_8\" abs-font-size=\"20\" abs-margin-left=\"9525\" abs-text-indent=\"-635\" />"
		+"<div id=\"MP_defaultoutline_9\" abs-font-size=\"20\" abs-margin-left=\"10795\" abs-text-indent=\"-635\" />"
		+"</div>"
		,
	LIST_BEFORE : ":before",
	//Contentbox Constants >>>=============
	CONTENTBOX_TEXT_TYPE		:"contentBoxTxt",
	CONTENTBOX_NOTES_TYPE		:"contentBoxNotes",
	CONTENTBOX_IMAGE_TYPE		:"contentBoxImg",
	CONTENTBOX_SHAPE_TYPE		:"contentBoxShape",
	CONTENTBOX_TABLE_TYPE		:"contentBoxTbl",
	CONTENTBOX_GROUP_TYPE		:"contentBoxGrp",
	CONTENTBOX_EDIT_TIMEOUT		: 900000,
	BOX_CLASS					:"bc",
	BOX_ID_ATTRIBUTE_NAME		:"boxid",
	HANDLE_IMAGE_SIZE			: 10,
	COMMENT_ICON_SIZE			: 29,
	COMMENT_SIZEFACTOR			: 25,
	HANDLE_IMAGE_SRC			: window.contextPath + window.staticRootPath + "/styles/css/images/square.gif",
	HEIGHT_ADJUST				:5,
	PRESENTATION_CLASS			: "presentation_class",
	LAYOUT_CLASS				: "layoutClass",
	LAYOUT_CLASSSS				: "layoutClassSS", // added by slidesorter on content box data node
	
	CONTENT_BOX_TITLE_CLASS		: 'cb_title',
	CONTENT_BOX_SUBTITLE_CLASS	: 'cb_subtitle',
	CONTENT_BOX_NOTES_CLASS	    : 'cb_notes',
	CONTENT_BOX_OUTLINE_CLASS	: 'cb_outline',
	CONTENT_BOX_GRAPHIC_CLASS	: 'cb_graphic',
	CONTENTBOX_PREFIX			:'contentBox_',
	CONTENTBOX_DATA_PREFIX		:'contentBoxData_',
	IMPORTED_IMAGE_CLASS		: 'importedImage',
	ARROW_LENGTH				: 10,
	//<<<=======================
	// Hyper link related style names
	HYPER_LINK_STYLE:
	{
		HLINK_TARGET: "ltarget",
		HLINK_TOOLTIP: "ltip"
	}
});
(function(){
	PresConstants = new concord.pres.PresConstants();
})();