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

dojo.provide("pres.config.menuBar");
dojo.require("pres.constants");
dojo.require("concord.editor.PopularFonts");
dojo.requireLocalization("concord.widgets", "menubar");
dojo.requireLocalization("concord.widgets", "presMenubar");
dojo.requireLocalization("concord.widgets", "toolbar");
dojo.requireLocalization("concord.widgets", "contentBox");
dojo.requireLocalization("concord.widgets", "notifyTool");
dojo.requireLocalization("concord.widgets", "CKResource");
dojo.require("concord.beans.RecentFiles");
dojo.require("concord.util.uri");
dojo.requireLocalization("pres", "pres");

pres.config.menuBar = new function()
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
		var ckStrs = dojo.i18n.getLocalization("concord.widgets", "CKResource");
		var bShowDownloadMenu = pe.scene.showDownloadMenu();   // GK to disable download menu from docs UI
		var MODE = {};
		var commandOperate = {};
		var fontNames = concord.editor.PopularFonts.getLangSpecFontArray();
		var fontNameMenuItems = [];
		var isExternal = concord.util.uri.isExternal();
		var isECM = concord.util.uri.isECMDocument();
		
		dojo.forEach(fontNames, function(fn)
		{
			fontNameMenuItems.push({
				label: fn,
				value: fn,
				checked: false,
				decorator: function(menuItem, index, label)
				{
					menuItem.domNode.style.fontFamily = label;
				}
			});
		});
		var spellCheckMenuItems = [];
		if (spellcheckerManager)
		{
			for ( var i = 0; i < spellcheckerManager.supportedLang.length; i++)
			{
				var dic = spellcheckerManager.supportedLang[i];
				var newDic = dic.replace(/-/, '_');
				var id = 'P_i_' + dic;
				var label_id = 'toolsMenu_Dictionary' + '_' + newDic;
				var label = menuStrs[label_id];
				var acc = dic.substr(0, 2).toUpperCase() + '.';
				spellCheckMenuItems.push({
					value: dic,
					label: acc + label,
					title: acc + label,
					checked: spellcheckerManager.lang == dic
				});
			}
		}
		
		var extension = DOC_SCENE.extension;
		var flag = false;
		if (extension && extension.toLowerCase() == 'pptx' && !DOC_SCENE.isOdfDraft)
			flag = true;

		var objArr = null;
		if (flag)
		{
			objArr = [{
				label: menuStrs.createMenu_TextBox,
				cmd: c.CMD_TEXTBOX_DRAG_CREATE,
				checked: true,
				checkable: false
			}, {
				label: presStrs.insert_link_menu,
				cmd: c.CMD_LINK_ADD
			}, {
				label: menuStrs.createMenu_Image,
				cmd: c.CMD_IMAGE_CREATE_DIALOG
			}, {
				label: menuStrs.createMenu_Shape,
				cmd: c.CMD_SHAPE_DRAG_CREATE,
				popup: "shape"
			}];
		}
		else
		{
			objArr = [{
				label: menuStrs.createMenu_TextBox,
				cmd: c.CMD_TEXTBOX_DRAG_CREATE,
				checked: true,
				checkable: false
			}, {
				label: presStrs.insert_link_menu,
				cmd: c.CMD_LINK_ADD
			}, {
				label: menuStrs.createMenu_Image,
				cmd: c.CMD_IMAGE_CREATE_DIALOG
			}];
		}

		var config = [
				{
					label: menuStrs.fileMenu,
					tag: "file",
					children: [{
						label: menuStrs.fileMenu_ShareWith,
						isShow: pe.scene.showShareMenu(),
						cmd: c.CMD_SHARE
					}, {
						type: "separator"
					}, {
						label: menuStrs.fileMenu_New,
						isShow: pe.scene.showNewMenu(),
						children: [{
							label: menuStrs.fileMenu_NewDocument,
							cmd: c.CMD_NEW_DOCUMENT
						}, {
							label: menuStrs.fileMenu_NewSpreadsheet,
							cmd: c.CMD_NEW_SPREADSHEET
						}, {
							label: menuStrs.fileMenu_NewPresentation,
							cmd: c.CMD_NEW_PRESENTATION
						}]
					}, {
						label: menuStrs.fileMenu_RecentFile,
						isShow: pe.scene.showRecentFilesMenu(),
						tag: "recent",
						popup: "recent"
					}, {
						label: menuStrs.fileMenu_ViewFileDetails,
						isShow: pe.scene.showFileDetailMenu(),
						cmd: c.CMD_VIEWFILEDETAILS
					}, {
						label: menuStrs.fileMenu_Discard,
						isShow: pe.scene.showDiscardMenu(),
						cmd: c.CMD_DISCARDDRAFT
					}, {
						type: "separator"
					}, {
						label: (window.gTPRepoName != "")? dojo.string.substitute(menuStrs.fileMenu_PublishVersion3,[window.gTPRepoName]): menuStrs.fileMenu_PublishVersion2,
						isShow: DOC_SCENE.isPublishable && (isExternal || isECM),
						cmd: c.CMD_SAVEVERSION
					}, {
						label: menuStrs.fileMenu_SaveAs,
						isShow: pe.scene.showSaveAsMenu(),
						cmd: c.CMD_SAVE_AS
					},
					{
						id: "P_i_AutoPublish",
						isShow: pe.scene.showSetAutoPublishMenu(),
						label: (isExternal ? ((window.gTPRepoName != "") ? dojo.string.substitute(menuStrs.fileMenu_AutoPublish3,[window.gTPRepoName]): menuStrs.fileMenu_AutoPublish2) : pe.scene.showCheckinMenu()? menuStrs.fileMenu_AutoCheckIn:menuStrs.fileMenu_AutoPublish),
						tag: "autopublish",
						showMODE: MODE.EDITMODEVISIBLE,
						//isShow: false,
						cmd: c.CMD_AUTOPUBLISH,
						checked: pe.scene.autoPublishSet(),
						disabled: !pe.scene.autoPublishFeature(),
						variable: "autoPublishMenuItem"
						//tooltip: {tip: menuStrs.fileMenu_AutoPublish_Tips, pos: "after"}
					},
					/*
					 * { label: menuStrs.filemenu_revisionhistory, cmd: c.CMD_SHOWREVISION, showMODE: g_revision_enabled ? MODE.EDITMODEVISIBLE : MODE.INVISIBLE },
					 */
					{
						label: pe.scene.showCheckinMenu() ? menuStrs.fileMenu_CheckinVersion : menuStrs.fileMenu_PublishVersion,
						isShow: DOC_SCENE.isPublishable && !concord.util.uri.isExternalREST(),
						showMODE: MODE.EDITMODEVISIBLE,
						cmd: c.CMD_PUBLISH,
						variable: "publishMenuItem",
						disabled: pe.scene.isNeedRenderSFR()
						//tooltip:{tip:"Click to open Publish Dialog",pos:"after"}
					},
					{
						label: menuStrs.fileMenu_Download,
						isShow: bShowDownloadMenu,
						tag: "download",
						popup: "download"
					},
 	 				{		 	
 	 		     		isShow: true,	 		     	
 		 		     	label: menuStrs.fileMenu_SubmitForReview,
 		 		     	showMODE: MODE.EDITMODEVISIBLE,
 		 		     	cmd:c.CMD_SFRDIALOG,
 		 		     	variable: "reviewMenuItem",
 		 		     	disabled: !pe.scene.isNeedRenderSFR()
 	 				},					
					{
						type: "separator",
						isShow: bShowDownloadMenu
//					}, {
//						label: menuStrs.fileMenu_PrintToPDF,
//						cmd: c.CMD_PRINT_PDF
					},
					{
						label: menuStrs.fileMenu_Print,
						isShow: bShowDownloadMenu,
						accelKey: dojo.isMac ? menuStrs.accel_fileMenu_Print_Mac : menuStrs.accel_fileMenu_Print,
						cmd: c.CMD_PRINT
					}]
				},

				// Edit Menu
				{
					label: menuStrs.editMenu,
					tag: "edit",
					children: [
							{
								label: menuStrs.editMenu_Undo,
								showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
								accelKey: dojo.isMac ? menuStrs.accel_editMenu_Undo_Mac : menuStrs.accel_editMenu_Undo,
								accLabel: menuStrs.editMenu_Undo + " "
									+ (dojo.isMac ? menuStrs.accel_editMenu_Undo_Mac : menuStrs.accel_editMenu_Undo),
								cmd: c.CMD_UNDO,
								disabled: true
							},
							{
								label: menuStrs.editMenu_Redo,
								showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
								accelKey: dojo.isMac ? menuStrs.accel_editMenu_Redo_Mac : menuStrs.accel_editMenu_Redo,
								accLabel: menuStrs.editMenu_Redo + " "
									+ (dojo.isMac ? menuStrs.accel_editMenu_Redo_Mac : menuStrs.accel_editMenu_Redo),
								command: commandOperate.REDO,
								cmd: c.CMD_REDO,
								disabled: true
							},
							{
								type: "separator"
							},
							{
								label: menuStrs.editMenu_Cut,
								showMODE: MODE.EDITMODEVISIBLE,
								accelKey: dojo.isMac ? menuStrs.accel_editMenu_Cut_Mac : menuStrs.accel_editMenu_Cut,
								accLabel: menuStrs.editMenu_Cut + " "
									+ (dojo.isMac ? menuStrs.accel_editMenu_Cut_Mac : menuStrs.accel_editMenu_Cut),
								cmd: c.CMD_CUT
							},
							{
								label: menuStrs.editMenu_Copy,
								accelKey: dojo.isMac ? menuStrs.accel_editMenu_Copy_Mac : menuStrs.accel_editMenu_Copy,
								accLabel: menuStrs.editMenu_Copy + " "
									+ (dojo.isMac ? menuStrs.accel_editMenu_Copy_Mac : menuStrs.accel_editMenu_Copy),
								cmd: c.CMD_COPY
							},
							{
								label: menuStrs.editMenu_Paste,
								showMODE: MODE.EDITMODEVISIBLE,
								accelKey: dojo.isMac ? menuStrs.accel_editMenu_Paste_Mac : menuStrs.accel_editMenu_Paste,
								accLabel: menuStrs.editMenu_Paste + " "
									+ (dojo.isMac ? menuStrs.accel_editMenu_Paste_Mac : menuStrs.accel_editMenu_Paste),
								cmd: c.CMD_PASTE
							},
							{
								type: "separator"
							},
							{
								label: menuStrs.editMenu_SelectAll,
								accelKey: dojo.isMac ? menuStrs.accel_editMenu_SelectAll_Mac : menuStrs.accel_editMenu_SelectAll,
								accLabel: menuStrs.editMenu_Redo + dojo.isMac ? menuStrs.accel_editMenu_SelectAll_Mac
									: menuStrs.accel_editMenu_SelectAll,
								cmd: c.CMD_SELECT_ALL
							}]
				},

				// View Menu
				{
					label: menuStrs.viewMenu,
					tag: "view",
					children: [{
						label: menuStrs.viewMenu_Toolbar,
						checked: !pe.settings || pe.settings.getToolbar(),
						cmd: c.CMD_TOGGLE_TOOLBAR
					}, {
						label: menuStrs.viewMenu_SlideSorter,
						checked: true,
						cmd: c.CMD_TOGGLE_SORTER
					}, {
						checked: true,
						label: menuStrs.viewMenu_SpeakerNotes,
						cmd: c.CMD_TOGGLE_NOTES
					}, {
						type: "separator"
					}, {
						label: menuStrs.viewMenu_Coediting,
						checked: pe.settings && pe.settings.getIndicator(),
						cmd: c.CMD_TOGGLE_COEDIT_COLOR
					}, {
						type: "separator"
					}, {
						label: menuStrs.viewMenu_UnsupportWarning,
						checked: !pe.settings || pe.settings.getShowUnsupportedFeature(),
						cmd: c.CMD_TOGGLE_SHOW_UNSUPPORT_WARNING
					}]
				},

				// Insert Menu
				{
					label: menuStrs.createMenu,
					tag: "insert",
					children: objArr
				},

				// Format Menu
				{
					label: menuStrs.formatMenu,
					tag: "format",
					children: [/*
							{
								label: menuStrs.formatMenu_Properties,
								cmd: c.CMD_SHOW_PROPERTIES
							},
							{
								type: "separator"
							},*/
							{
								cmd: c.CMD_FONT_NAME,
								label: menuStrs.formatMenu_FontName,
								children: fontNameMenuItems
							},
							{
								cmd: c.CMD_BOLD,
								label: menuStrs.formatMenu_TextProperties,
								children: [
										{
											cmd: c.CMD_BOLD,
											checked: false,
											label: menuStrs.layoutMenu_Textprop_Bold,
											accelKey: dojo.isMac ? menuStrs.accel_formatMenu_Textprop_Bold_Mac
												: menuStrs.accel_formatMenu_Textprop_Bold,
											accLabel: menuStrs.formatMenu_Bold
												+ " "
												+ (dojo.isMac ? menuStrs.accel_formatMenu_Textprop_Bold_Mac
													: menuStrs.accel_formatMenu_Textprop_Bold)
										},
										{
											cmd: c.CMD_ITALIC,
											checked: false,
											label: menuStrs.layoutMenu_Textprop_Italic,
											accelKey: dojo.isMac ? menuStrs.accel_formatMenu_Textprop_Italic_Mac
												: menuStrs.accel_formatMenu_Textprop_Italic,
											accLabel: menuStrs.formatMenu_Italic
												+ " "
												+ (dojo.isMac ? menuStrs.accel_formatMenu_Textprop_Italic_Mac
													: menuStrs.accel_formatMenu_Textprop_Italic)
										},
										{
											cmd: c.CMD_UNDERLINE,
											checked: false,
											label: menuStrs.layoutMenu_Textprop_Underline,
											accelKey: dojo.isMac ? menuStrs.accel_formatMenu_Textprop_Underline_Mac
												: menuStrs.accel_formatMenu_Textprop_Underline,
											accLabel: menuStrs.formatMenu_Underline
												+ " "
												+ (dojo.isMac ? menuStrs.accel_formatMenu_Textprop_Underline_Mac
													: menuStrs.accel_formatMenu_Textprop_Underline)
										}, {
											label: menuStrs.layoutMenu_Textprop_Strikethrough,
											cmd: c.CMD_STRIKETHROUGH,
											checked: false
										}, {
											cmd: c.CMD_SUPERSCRIPT,
											checked: false,
											label: menuStrs.formatMenu_Superscript
										}, {
											cmd: c.CMD_SUBSCRIPT,
											checked: false,
											label: menuStrs.formatMenu_Subscript
										}, {
											type: "separator"
										}, {
											cmd: c.CMD_FONT_SIZE_INCREASE,
											label: menuStrs.formatMenu_IncreaseSize
										}, {
											cmd: c.CMD_FONT_SIZE_DECREASE,
											label: menuStrs.formatMenu_DecreaseSize
										}]
							}, {
								type: "separator"
							}, {
								label: menuStrs.formatMenu_Text_Direction,
								cmd: c.CMD_DIRECTION,
								children: [{
									label: menuStrs.formatMenu_Ltr,
									checked: false,
									cmd: c.CMD_DIRECTION_LTR
								}, {
									label: menuStrs.formatMenu_Rtl,
									checked: false,
									cmd: c.CMD_DIRECTION_RTL
								}]
							}, {
								label: menuStrs.formatMenu_Indent,
								cmd: c.CMD_INDENT
							}, {
								label: menuStrs.formatMenu_DecreaseIndent,
								cmd: c.CMD_OUTDENT
							}, {
								cmd: c.CMD_LINESPACING,
								label:presStrs.formatMenu_LineSpacing,
								children:[{
									label : BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("1") : "1",
									value : "1",
									checked : false									
								},{
									label:BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("1.15") : "1.15",
									value : "1.15",
									checked : false
								},{
									label:BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("1.5") : "1.5",
									value : "1.5",
									checked : false
								},{
									label:BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("2") : "2",
									value : "2",
									checked : false
								},{
									label:BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("2.5") : "2.5",
									value : "2.5",
									checked : false
								},{
									label:BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("3") : "3",
									value : "3",
									checked : false
								},{
									label : presStrs.formatMenu_LineSpacing_Customize,
									value : c.LINESPACE_CUSTOM_OPTION,
									checked : false
								}]
							}, {
								label: presStrs.align_text,
								cmd: c.CMD_ALIGN_ALL,
								children: [{
									label: menuStrs.formatMenu_Left,
									checked: true,
									cmd: c.CMD_ALIGN_LEFT
								}, {
									label: menuStrs.formatMenu_Center,
									checked: false,
									cmd: c.CMD_ALIGN_CENTER
								}, {
									label: menuStrs.formatMenu_Right,
									checked: false,
									cmd: c.CMD_ALIGN_RIGHT
								}, {
									label: menuStrs.formatMenu_Top,
									checked: true,
									cmd: c.CMD_ALIGN_TOP
								}, {
									label: menuStrs.formatMenu_Middle,
									checked: false,
									cmd: c.CMD_ALIGN_MIDDLE
								}, {
									label: menuStrs.formatMenu_Bottom,
									checked: false,
									cmd: c.CMD_ALIGN_BOTTOM
								}]
							}, {
								type: "separator"
							},{
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
							}, {
								label: presStrs.order,
								cmd: c.CMD_ORDER,
								children: [{
									label: boxStrs.ctxMenu_bringToFront,
									cmd: c.CMD_BRING_FRONT
								}, {
									label: boxStrs.ctxMenu_sendToBack,
									cmd: c.CMD_SEND_BACK
								}]
							}, {
								label: presStrs.rotate,
								cmd: c.CMD_ROTATE,
								children: [{
									label: presStrs.rotate_right,
									cmd: c.CMD_ROTATE_RIGHT
								}, {
									label: presStrs.rotate_left,
									cmd: c.CMD_ROTATE_LEFT
								}, {
									label: presStrs.flipX,
									cmd: c.CMD_FLIP_X
								}, {
									label: presStrs.flipY,
									cmd: c.CMD_FLIP_Y
								}]
							}/* {
								type: "separator"
							}, {
								label: toolbarStrs.removeFormatTip,
								cmd: c.CMD_CLEAR_FORMAT
							}*/]
				},

				{
					label: notifyStrs.slides,
					tag: "slides",
					children: [{
						label: menuStrs.presentationMenu_SlideShow,
						cmd: c.CMD_SLIDE_SHOW
					}, {
						label: menuStrs.presentationMenu_SlideShowFromCurrent,
						cmd: c.CMD_SLIDE_SHOW_FROM_CURRENT
					}, {
						label: menuStrs.presentationMenu_SlideShowWithCoview,
						cmd: c.CMD_SLIDE_SHOW_WITH_COVIEW
					}, {
						type: "separator"
					}, {
						label: menuStrs.createMenu_NewSlide,
						cmd: c.CMD_SLIDE_CREATE
					}, {
						label: menuStrs.createMenu_DuplicateSlide,
						cmd: c.CMD_SLIDE_DUPLICATE
					}, {
						label: menuStrs.editMenu_DeleteSlide,
						cmd: c.CMD_SLIDE_DELETE
					}, {
						type: "separator"
					}, {
						label: menuStrs.layoutMenu_SlideLayout,
						cmd: c.CMD_SLIDE_LAYOUT
					}, {
						type: "separator"
					}, {
						label: menuStrs.presentationMenu_SlideTransitions,
						cmd: c.CMD_SLIDE_TRANSITION
					}]
				},

				// Table Menu
				{
					label: menuStrs.tableMenu,
					tag: "table",
					children: [{
						label: menuStrs.tableMenu_Create,
						cmd: c.CMD_TABLE_CREATE,
						popup: "table"
					}, {
						label: menuStrs.formatMenu_Template,
						showUnderHighContrast: false,
						cmd: c.CMD_TABLE_UPDATE_TEMPLATE,
						popup: "tableTemplate"
					}, {
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
						}, {
							label: menuStrs.tableMenu_CellClearContents,
							cmd: c.CMD_TABLE_CLEAR_CELL
						}]
					}]
				},

				// TEAM Menu
				{
					label: menuStrs.teamMenu,
					tag: "team",
					children: [{
						label: menuStrs.teamMenu_AddComment,
						cmd: c.CMD_ADD_COMMENT,
						disabled: false
					}]
				},

				// TOOL Menu
				{
					label: menuStrs.toolsMenu,
					tag: "tools",
					children: [{
						label: menuStrs.toolsMenu_SelectDictionary,
						children: spellCheckMenuItems,
						cmd: c.CMD_SELECT_DICT,
						disabled: dojo.isSafari && dojo.isSafari < 5.1
					}, {
						label: menuStrs.viewMenu_AutomaticSpellCheck,
						checked: pe.settings && pe.settings.getAutoSpellCheck(),
						cmd: c.CMD_TOGGLE_SPELL_CHECK,
						disabled: dojo.isSafari && dojo.isSafari < 5.1
					}, {
						label: menuStrs.toolsMenu_Preferences,
						isShow: pe.scene.showPreferences(),
						cmd: c.CMD_PREFERENCES
					}]
				},

				// HELP Menu
				{
					label: menuStrs.helpMenu,
					isShow: false,
					tag: "help",
					children: [{
						label: menuStrs.helpMenu_Overview,
						cmd: c.CMD_HELP
					}, {
						label: menuStrs.helpMenu_About,
						isShow: false,
						cmd: c.CMD_HELP_ABOUT
					}, 
					{
						label: menuStrs.helpMenu_NewFeatures,
						disabled: !g_hasNewFeature,
						cmd: c.CMD_HELP_NEWFEATURES
					}, 
					{
						tag: "helptour",
						label: menuStrs.helpMenu_Tour,
						cmd: c.CMD_HELP_USERTOUR
					}, 
										
					//use following invisible command model as global variables. 
					{
						cmd: c.CMD_OBJECT_OPACITY,
						isShow: false
					}, {
						cmd: c.CMD_ARROW_TYPE,
						isShow: false
					}, {
						cmd: c.CMD_LINE_WIDTH,
						isShow: false
					}, {
						cmd: c.CMD_LINE_DASHTYPE,
						isShow: false
					}, {
						cmd: c.CMD_LINE_JOIN,
						isShow: false
					}, {
						cmd: c.CMD_LINE_CAP,
						isShow: false
					}]
				}
		];
		
		//add Image Opacity Menu for pptx under format==config[4]
		if (flag)
		{
			config[4].children.push({
				type: "separator"
			},{
				label: presStrs.set_transparency_menu,
				cmd: c.CMD_TRANSPARENCY_DIALOG_OPEN																	
			});
		}
		
		if(!pe.scene.getFileDetailsURL())
		{
			config[0].children.splice(4, 1);
		}
		
		return config;
	};
};
