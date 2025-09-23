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

dojo.provide("pres.config.toolbar");
dojo.require("pres.constants");
dojo.require("concord.editor.PopularFonts");
dojo.requireLocalization("concord.widgets", "menubar");
dojo.requireLocalization("concord.widgets", "presMenubar");
dojo.requireLocalization("concord.widgets", "toolbar");
dojo.requireLocalization("concord.widgets", "contentBox");
dojo.requireLocalization("concord.widgets", "notifyTool");
dojo.requireLocalization("concord.widgets", "slideEditor");
dojo.requireLocalization("concord.widgets", "shapeGallery");
dojo.requireLocalization("pres", "pres");

pres.config.toolbar = new function()
{

	// wrapper in a function to make sure pe.scene loaded
	this.init = function()
	{
		var c = pres.constants;
		var presStrs = dojo.i18n.getLocalization("pres", "pres");
		var menuStrs = dojo.i18n.getLocalization("concord.widgets", "menubar");
		var menuStrs2 = dojo.i18n.getLocalization("concord.widgets", "presMenubar");
		var toolbarStrs = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		var boxStrs = dojo.i18n.getLocalization("concord.widgets", "contentBox");
		var notifyStrs = dojo.i18n.getLocalization("concord.widgets", "notifyTool");
		var editorStrs = dojo.i18n.getLocalization("concord.widgets", "slideEditor");
		var shapeStrs = dojo.i18n.getLocalization("concord.widgets", "shapeGallery");
		var extension = DOC_SCENE.extension;
		var flag = false;
		if (extension && extension.toLowerCase() == 'pptx' && !DOC_SCENE.isOdfDraft)
			flag = true;
		var objArr = null;
		var editArr = null;
		if (flag)
		{
			objArr = [{
				cmd: c.CMD_TEXTBOX_DRAG_CREATE,
				icon: "newTextIcon",
				type: "toggle",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				label: editorStrs.ctxMenu_createTextBox
			}, {
				cmd: c.CMD_IMAGE_CREATE_DIALOG,
				icon: "newImageIcon",
				type: "button",
				label: editorStrs.ctxMenu_addImage
			},
			{
				cmd: c.CMD_SHAPE_DRAG_CREATE,
				icon: "newShapeIcon",
				type: "shape",
				label: shapeStrs.title
			}, { label: presStrs.insert_link, cmd: c.CMD_LINK_ADD, icon: "newLinkIcon", type: "button" }, {
				label: toolbarStrs.addTableTip,
				cmd: c.CMD_TABLE_CREATE,
				icon: "newTableIcon",
				type: "table"
			}, {
				icon: "slideShowIcon",
				label: notifyStrs.slides,
				cmd: c.CMD_SLIDE_SHOW,
				type: "combo",
				children: [{
					label: menuStrs.presentationMenu_SlideShow,
					cmd: c.CMD_SLIDE_SHOW
				}, {
					label: menuStrs.presentationMenu_SlideShowFromCurrent,
					cmd: c.CMD_SLIDE_SHOW_FROM_CURRENT
				}, {
					label: menuStrs.presentationMenu_SlideShowWithCoview,
					cmd: c.CMD_SLIDE_SHOW_WITH_COVIEW
				}]
			}];

			editArr = [{
				cmd: c.CMD_FONT_NAME,
				checkable: true,
				type: "dropdown",
				label: toolbarStrs.selectFontNameTip,
				items: concord.editor.PopularFonts.getLangSpecFontArray(),
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				decorator: function(menuItem, index, label)
				{
					menuItem.domNode.style.fontFamily = label;
				}
			}, {
				cmd: c.CMD_FONT_SIZE,
				label: toolbarStrs.selectFontSizeTip,
				items: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(c.FONT_SIZE_ITEMS) : c.FONT_SIZE_ITEMS,
				checkable: true,
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				type: "fontsize"
			}, {
				cmd: c.CMD_BOLD,
				label: toolbarStrs.boldTip,
				icon: "boldIcon",
				type: "toggle"
			}, {
				cmd: c.CMD_ITALIC,
				label: toolbarStrs.italicTip,
				icon: "italicIcon",
				type: "toggle"
			}, {
				cmd: c.CMD_UNDERLINE,
				label: toolbarStrs.underlineTip,
				icon: "underlineIcon",
				type: "toggle"
			}, {
				cmd: c.CMD_FONT_COLOR,
				label: toolbarStrs.setFontColorTip,
				showButton: false,
				icon: "fontColorIcon",
				showUnderHighContrast: false,
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				type: "color"
			}, {
				cmd: c.CMD_BG_COLOR,
				label: presStrs.color_set_fill,
				icon: "bgColorIcon",
				showUnderHighContrast: false,
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				type: "color"
			}, {
				cmd: c.CMD_BORDER_COLOR,
				label: presStrs.setBorderStyleTip,
				icon: "borderIcon",
				forBorder: true,
				showUnderHighContrast: false,
				type: "color"
			}];
		}
		else
		{
			objArr = [{
				cmd: c.CMD_TEXTBOX_DRAG_CREATE,
				icon: "newTextIcon",
				type: "toggle",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				label: editorStrs.ctxMenu_createTextBox
			}, {
				cmd: c.CMD_IMAGE_CREATE_DIALOG,
				icon: "newImageIcon",
				type: "button",
				label: editorStrs.ctxMenu_addImage
			},{ label: presStrs.insert_link, cmd: c.CMD_LINK_ADD, icon: "newLinkIcon", type: "button" },{
				label: toolbarStrs.addTableTip,
				cmd: c.CMD_TABLE_CREATE,
				icon: "newTableIcon",
				type: "table"
			}, {
				icon: "slideShowIcon",
				type: "combo",
				label: notifyStrs.slides,
				cmd: c.CMD_SLIDE_SHOW,
				children: [{
					label: menuStrs.presentationMenu_SlideShow,
					cmd: c.CMD_SLIDE_SHOW
				}, {
					label: menuStrs.presentationMenu_SlideShowFromCurrent,
					cmd: c.CMD_SLIDE_SHOW_FROM_CURRENT
				}, {
					label: menuStrs.presentationMenu_SlideShowWithCoview,
					cmd: c.CMD_SLIDE_SHOW_WITH_COVIEW
				}]
			}];
			editArr = [{
				cmd: c.CMD_FONT_NAME,
				checkable: true,
				type: "dropdown",
				label: toolbarStrs.FontName,
				items: concord.editor.PopularFonts.getLangSpecFontArray(),
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				decorator: function(menuItem, index, label)
				{
					menuItem.domNode.style.fontFamily = label;
				}
			}, {
				cmd: c.CMD_FONT_SIZE,
				label: toolbarStrs.selectFontSizeTip,
				items: c.FONT_SIZE_ITEMS,
				checkable: true,
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				type: "fontsize"
			}, {
				cmd: c.CMD_BOLD,
				label: toolbarStrs.boldTip,
				icon: "boldIcon",
				type: "toggle"
			}, {
				cmd: c.CMD_ITALIC,
				label: toolbarStrs.italicTip,
				icon: "italicIcon",
				type: "toggle"
			}, {
				cmd: c.CMD_UNDERLINE,
				label: toolbarStrs.underlineTip,
				icon: "underlineIcon",
				type: "toggle"
			}, {
				cmd: c.CMD_FONT_COLOR,
				label: toolbarStrs.setFontColorTip,
				icon: "fontColorIcon",
				showButton: false,
				showUnderHighContrast: false,
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				type: "color"
			}, {
				cmd: c.CMD_BG_COLOR,
				label: presStrs.color_set_fill,
				icon: "bgColorIcon",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				showUnderHighContrast: false,
				type: "color"
			}];
		}
		var config = [{
			type: "group",
			mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
			children: [{
				cmd: c.CMD_UNDO,
				disabled: true,
				label: toolbarStrs.undoTip,
				icon: "undoIcon",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				type: "button"
			}, {
				label: toolbarStrs.redoTip,
				disabled: true,
				cmd: c.CMD_REDO,
				icon: "redoIcon",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				type: "button"
			}, {
				label: toolbarStrs.formatPainterTip,
				disabled: true,
				cmd: c.CMD_FORMATPAINTER,
				icon: "formatPainterIcon",
				type: "toggle",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT
			}, {
				label: toolbarStrs.showSorterTip,
				disabled: false,
				cmd: c.CMD_SHOWSORTER,
				icon: "sorterShowIcon",
				type: "toggle",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT
			}]
		}, {
			type: "group",
			children: [{
				icon: "slideIcon",
				type: "combo",
				cmd: c.CMD_SLIDE_CREATE,
				label: menuStrs.createMenu_NewSlide,
				children: [{
					label: menuStrs.createMenu_NewSlide,
					cmd: c.CMD_SLIDE_CREATE
				}, {
					label: menuStrs.layoutMenu_SlideLayout,
					cmd: c.CMD_SLIDE_LAYOUT
				}]
			}]
		}, {
			type: "group",
			children: [{
				cmd: c.CMD_ZOOM_FIT,
				type: "button",
				icon: "zoomFitIcon",
				label: presStrs.zoom_fit
			}, {
				cmd: c.CMD_ZOOM,
				type: "zoom",
				label: presStrs.zoom
			}]
		}, {
			type: "group",
			mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
			children: editArr
		}, {
			type: "group",
			mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
			children: [{
				cmd: c.CMD_ALIGN_H,
				icon: "alignLeftIcon",
				type: "dropdown",
				showLabel: false,
				checkable: true,
				label: toolbarStrs.leftAlignTip,
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				children: [{
					label: toolbarStrs.leftAlignTip,
					icon: "alignLeftIcon",
					checked: true,
					mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
					cmd: c.CMD_ALIGN_LEFT
				}, {
					label: toolbarStrs.centerTip,
					icon: "alignCenterIcon",
					checked: false,
					mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
					cmd: c.CMD_ALIGN_CENTER
				}, {
					label: toolbarStrs.rightAlignTip,
					icon: "alignRightIcon",
					checked: false,
					mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
					cmd: c.CMD_ALIGN_RIGHT
				}]
			}, {
				cmd: c.CMD_ALIGN_V,
				icon: "alignTopIcon",
				type: "dropdown",
				showLabel: false,
				checkable: true,
				label: toolbarStrs.topAlignTip,
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				children: [{
					label: toolbarStrs.topAlignTip,
					icon: "alignTopIcon",
					checked: true,
					mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
					cmd: c.CMD_ALIGN_TOP
				}, {
					label: toolbarStrs.middleAlignTip,
					icon: "alignMiddleIcon",
					checked: false,
					mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
					cmd: c.CMD_ALIGN_MIDDLE
				}, {
					label: toolbarStrs.bottomAlignTip,
					icon: "alignBottomIcon",
					checked: false,
					mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
					cmd: c.CMD_ALIGN_BOTTOM
				}]
			}, {
				cmd: c.CMD_DIRECTION,
				icon: "textDirLtrIcon",
				type: "dropdown",
				showLabel: false,
				checkable: true,
				label: toolbarStrs.ltrDirectionTip,
				children: [{
					label: toolbarStrs.ltrDirectionTip,
					icon: "textDirLtrIcon",
					checked: true,
					cmd: c.CMD_DIRECTION_LTR
				}, {
					label: toolbarStrs.rtlDirectionTip,
					icon: "textDirRtlIcon",
					checked: false,
					cmd: c.CMD_DIRECTION_RTL
				}]
			}, {
				cmd: c.CMD_BULLET,
				icon: "bulletIcon",
				type: "bullet",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				label: toolbarStrs.bulletedListTip
			}, {
				cmd: c.CMD_NUMBERING,
				icon: "numberingIcon",
				type: "number",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				label: toolbarStrs.numberedListTip
			}, {
				cmd: c.CMD_INDENT,
				icon: "indentIcon",
				type: "button",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				label: toolbarStrs.indentTip
			}, {
				cmd: c.CMD_OUTDENT,
				icon: "outdentIcon",
				type: "button",
				mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
				label: toolbarStrs.decreaseIndentTip
			}]
		}, {
			type: "group",
			mode: c.ToolbarMode.ALL | c.ToolbarMode.LIGHT,
			children: objArr
		}];
		return config;
	};
};
