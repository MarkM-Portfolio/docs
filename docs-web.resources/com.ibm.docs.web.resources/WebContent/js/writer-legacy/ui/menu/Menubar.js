dojo.provide("writer.ui.menu.Menubar");
dojo.require("dojo.i18n");
dojo.require("writer.ui.menu.Menu");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.uri");
dojo.require("writer.ui.widget.MenuTooltip");
dojo.requireLocalization("concord.widgets","menubar");
dojo.requireLocalization("writer","lang");
createMenubar = function(node){
	dojo.require('dijit.MenuBar');
    dojo.require('dijit.MenuBarItem');
    dojo.require('dijit.PopupMenuBarItem');
    dojo.require('dijit.Menu');
    dojo.require('dijit.MenuItem');
    dojo.require('dijit.PopupMenuItem');

//    var tempDisableStr = " not implemented";
    
	var nls = dojo.i18n.getLocalization("concord.widgets","menubar");

	if( pe && pe.settings && !pe.settings.getMenubar() )
	{
		var div = document.getElementById(node);
		if (div) div.style.display = "none";
	}
	var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';	
	var menubar = new dijit.MenuBar( {
		id: "document_menubar",
		dir: dirAttr
	} );
	dojo.addClass(menubar.domNode,"lotusActionMenu");
//	if (CKEDITOR.env.ie && CKEDITOR.env.version>=9 ){
//		menubar.connect(menubar.domNode, 'onmousedown', function(evt) {
//			evt.preventDefault();
//		});
//	}
	var fileMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(fileMenu.domNode,"lotusActionMenu");
	fileMenu.domNode.style.display ='none';
	document.body.appendChild(fileMenu.domNode);
	
	var entitlements = pe.authenticatedUser.getEntitlements();
	var enableAssignment = entitlements.assignment.booleanValue;
	var enableCoedit = entitlements.coedit.booleanValue;
	
	var macShortCuts = dojo.isMac ? "_Mac" : "";
	
	var fileSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(fileSubMenu.domNode,"lotusActionMenu");
	fileSubMenu.domNode.style.display ='none';
	document.body.appendChild(fileSubMenu.domNode);
	var isConn = concord.util.uri.isLCFilesDocument();
	
	if( pe.scene.showShareMenu() )
	{
		pe.shareWithMenuItem = new dijit.MenuItem(
		{
			id: "D_i_Share",
			label: nls.fileMenu_ShareWith,
		    onClick: function()
		    	{
		    		//pe.lotusEditor.execCommand( 'shareFiler' );
					pe.scene.shareWith(pe.lotusEditor);
		    	},
		    	dir: dirAttr
		});
		fileMenu.addChild( pe.shareWithMenuItem );
		fileMenu.addChild( new dijit.MenuSeparator() );
	}
	
	if( pe.scene.showNewMenu() )
	{
		fileSubMenu.addChild( new dijit.MenuItem(
		{
			id: "D_i_NewDoc",
			label: nls.fileMenu_NewDocument,
			iconClass: 'menubarFileNewDocIcon',
			onClick: function()
		    	{
					pe.scene.createTextDoc(this, false);
		    	},
		    	dir: dirAttr
		}));
		fileSubMenu.addChild( new dijit.MenuItem(
		{
			id: "D_i_NewSheet",
			label: nls.fileMenu_NewSpreadsheet,
			onClick: function ()
				{
					pe.scene.createSheetDoc(this);
			},
			dir: dirAttr
		}));
		fileSubMenu.addChild( new dijit.MenuItem(
		{
			id: "D_i_NewPres",
			label: nls.fileMenu_NewPresentation,
			onClick: function ()
				{
					pe.scene.createPresDoc(this);
				},
				dir: dirAttr
		}));
	/*
		var fromTemplateSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
		dojo.addClass(fromTemplateSubMenu.domNode,"lotusActionMenu");
		fromTemplateSubMenu.domNode.style.display = 'none';
		document.body.appendChild(fromTemplateSubMenu.domNode);
		fromTemplateSubMenu.addChild( new dijit.MenuItem(
		{
			id: "D_i_NewDocFromTemp",
			disabled: true,
			label: nls.fileMenu_NewDocument,
			onClick: function()
			{
					pe.scene.createTextDocFromTemplate(this);
			},
			dir: dirAttr
		}));
		
		fromTemplateSubMenu.addChild( new dijit.MenuItem(
		{
			id: "D_i_NewSheetFromTemp",
			label: nls.fileMenu_NewSpreadsheet,
			onClick: function ()
				{
					pe.scene.createSheetDocFromTemplate(this);
				},
			dir: dirAttr
		}));
		
		var fromTemplate = new dijit.PopupMenuItem(
		{
			id: 'D_i_NewFromTemplate',
			label:  nls.fileMenu_NewFromTemplate,
		popup: fromTemplateSubMenu,
	    	dir: dirAttr
		});
		dojo.style( fromTemplate.arrowWrapper, 'visibility', '' );
		fileSubMenu.addChild( fromTemplate );
	*/	
		var fileNew = new dijit.PopupMenuItem(
		{
			id: "D_i_New",
			label: nls.fileMenu_New,
			popup: fileSubMenu,
			dir: dirAttr
		});
		dojo.style( fileNew.arrowWrapper, 'visibility', '' );
		fileMenu.addChild( fileNew );
	}
	
	if( pe.scene.showRecentFilesMenu() )
	{	
		var recentFilePopMenu = pe.scene.getRecentFilesMenu();
		pe.recentFileMenuItem = new dijit.PopupMenuItem(
		{
					id: "D_i_recentOpenFiles",
					label: nls.fileMenu_RecentFile,
				    popup: recentFilePopMenu,
				    dir: dirAttr
		});
		dojo.style( pe.recentFileMenuItem.arrowWrapper, 'visibility', '' );
		fileMenu.addChild( pe.recentFileMenuItem );
	}
		
	if(pe.scene.showFileDetailMenu()){
			fileMenu.addChild( new dijit.MenuItem(
			{
				id: "D_i_ViewFileDetails",
				label: nls.fileMenu_ViewFileDetails,
				onClick: function()
				{
					pe.scene.goBackToFileDetails();
				},
				dir: dirAttr
			}));
	}

	if( pe.scene.showDiscardMenu() )
	{
			pe.discardMenuItem = new dijit.MenuItem(
					{
						id: "D_i_Discard",
						label: nls.fileMenu_Discard,
		//			    disabled: (!pe.lotusEditor.currentScene.session.isSingleMode()),
					    onClick: function()
					    	{
					    		concord.util.dialogs.showDiscardDlg();
				    	},
		    			dir: dirAttr
					});
			fileMenu.addChild(pe.discardMenuItem);
			fileMenu.addChild( new dijit.MenuSeparator() );
	}
		
	if(DOC_SCENE.isPublishable)
	{
		fileMenu.addChild( new dijit.MenuItem(
					{
						id: "D_i_Save",
						label: nls.fileMenu_Save,
						accelKey: macShortCuts ? nls["accel_fileMenu_Save"+ macShortCuts]  : nls.accel_fileMenu_Save,
					    onClick: function()
					    	{
								pe.lotusEditor.execCommand( 'saveDraft' );
					    	},
			    			dir: dirAttr
			}));
	}
	
	if( pe.scene.showSaveAsMenu() )
	{
		fileMenu.addChild( new dijit.MenuItem(
				{
					id: "D_i_SaveAs",
					label: nls.fileMenu_SaveAs,
				    onClick: function()
				    	{
				    		pe.scene.saveAsDoc(this);
				    	},
				    	dir: dirAttr
		}));		
	}
	
	if(DOC_SCENE.isPublishable)
	{
		if(pe.scene.showSetAutoPublishMenu())
		{
			pe.autoPublishMenuItem = new dijit.CheckedMenuItem(
					{
										id: "D_i_AutoPublish",
										label: menuStrs.fileMenu_AutoPublish,
										checked: pe.scene.autoPublishSet(),
										disabled: !pe.scene.autoPublishFeature(),
									    onClick: function()
									    {
									    	var checked = window["pe"].autoPublishMenuItem.attr("checked");
									    	pe.scene.switchAutoPublish(checked);
									    },
									    dir: dirAttr
					});
					fileMenu.addChild(pe.autoPublishMenuItem);
//				    new writer.ui.widget.MenuTooltip({
//				    	widget : pe.autoPublishMenuItem,	        
//				        label: nls.fileMenu_AutoPublish_Tips,
//				        position: ["after"]
//				    });	
		}	    
		
		if(!concord.util.uri.isExternalREST())
		{
			var publishLable = pe.scene.showCheckinMenu() ? nls.fileMenu_CheckinVersion : menuStrs.fileMenu_PublishVersion;
			pe.publishMenuItem = new dijit.MenuItem(
			{
						id: "D_i_Publish",
						label: publishLable,
						disabled: pe.scene.isNeedRenderSFR(),
					    onClick: function()
					    {
					    	    pe.lotusEditor.execCommand( 'publishDialog' );
					    },
					    dir: dirAttr
			});
			fileMenu.addChild(pe.publishMenuItem);
		}
	}
	
	// Download ...
	var downloadSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(downloadSubMenu.domNode,"lotusActionMenu");
	downloadSubMenu.domNode.style.display ='none';
	document.body.appendChild(downloadSubMenu.domNode);
	
	downloadSubMenu.addChild( new dijit.MenuItem(
	{
		id: "D_i_ExportToPDF",
		label: concord.util.strings.getBidiRtlFormatStr(nls.fileMenu_ExportToPDF),
		onClick: function()
		{
			pe.scene.exportPdf(pe.lotusEditor);
		},
		dir: dirAttr
	}));
	
	var labelExport = concord.util.strings.getDefaultFileFormatStr(nls.fileMenu_ExportToMS, nls.fileMenu_ExportToODF);
	if(labelExport != "txt")
	{
		downloadSubMenu.addChild( new dijit.MenuItem(
				{
					id: "D_i_ExportToDefault",
					label: labelExport,
					onClick: function ()
					{
						pe.scene.exportToDefault();
					},
					dir: dirAttr
				}));		
	}

	var fileDownload = new dijit.PopupMenuItem(
	{
		id: "D_i_Download",
		label: nls.fileMenu_Download,
		popup: downloadSubMenu,
		dir: dirAttr
	});
	dojo.style( fileDownload.arrowWrapper, 'visibility', '' );
	fileMenu.addChild( fileDownload );	
	
	// Submit for Review ...
	if (pe.scene.showSubmitReviewMenu())
	{
		pe.reviewMenuItem = new dijit.MenuItem(
		{
					id:'P_i_SFR',
					label: nls.fileMenu_SubmitForReview,
					disabled: !pe.scene.isNeedRenderSFR(),
					onClick: function(){
						pe.lotusEditor.execCommand( 'SFRDialog' );
					},
					dir: dirAttr
		});		
		fileMenu.addChild(pe.reviewMenuItem);	
	}

	fileMenu.addChild( new dijit.MenuSeparator() );
	
	fileMenu.addChild( new dijit.MenuItem(
			{
				id: "D_i_PageSetup",
				label: nls.fileMenu_PgSetup,
			    onClick: function()
			    {
			    	if( !pe.lotusEditor.pgSetDlg ) {
			    		dojo["require"]("writer.ui.dialog.PageSetup");
			    		var dlgNls = dojo.i18n.getLocalization("writer","lang");
			    		pe.lotusEditor.pgSetDlg = new writer.ui.dialog.PageSetup(pe.lotusEditor, dlgNls.PAGE_SETUP);
			    	}
			    	pe.lotusEditor.pgSetDlg.show();
			    },
			    dir: dirAttr
			}));
	
	fileMenu.addChild( new dijit.MenuItem(
	{
		id: "D_i_PrintToPDF",
		label: nls.fileMenu_PrintToPDF,
		onClick: function()
		{
			pe.scene.exportPdf(pe.lotusEditor);
		},
		dir: dirAttr
	}));
//	fileMenu.addChild( new dijit.MenuItem(
//	{
//		id: "D_i_Print",
//		label: nls.fileMenu_Print,
//	    iconClass: 'menubarFilePrintIcon',
//	    accelKey: nls.accel_fileMenu_Print + macShortCuts,
//	    onClick: function()
//	    {
////	    	pe.lotusEditor.execCommand( 'printHtml' );
//	    }
//	}));
	
	menubar.addChild( new dijit.PopupMenuBarItem(
	{
		id: "D_m_File",
		label: nls.fileMenu,
	    popup: fileMenu,
	    	dir: dirAttr
	}));
	
	var editMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(editMenu.domNode,"lotusActionMenu");
	editMenu.domNode.style.display ='none';
	document.body.appendChild(editMenu.domNode);
	
	editMenu.addChild( new dijit.MenuItem(
	{
		id: "D_i_Undo",
		commandID:'undo',
		label: nls.editMenu_Undo,
	    iconClass: 'menubarEditUndoIcon',
	    accelKey: macShortCuts ? nls["accel_editMenu_Undo"+ macShortCuts]  : nls.accel_editMenu_Undo, 
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'undo' );
	    	},
	    dir: dirAttr
	}));
	editMenu.addChild( new dijit.MenuItem(
	{
		id: "D_i_Redo",
		commandID:'redo',
		label: nls.editMenu_Redo,
	    iconClass: 'menubarEditRedoIcon',
	    accelKey: macShortCuts ? nls["accel_editMenu_Redo"+ macShortCuts]  : nls.accel_editMenu_Redo, 
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'redo' );
	    	},
	    dir: dirAttr
	}));
	editMenu.addChild( new dijit.MenuSeparator() );
	editMenu.addChild( new dijit.MenuItem(
	{
		id: "D_i_Cut",
		commandID:'contextCut',
		disabled: true,
		label: nls.editMenu_Cut,
	    iconClass: 'menubarEditCutIcon',
	    accelKey: macShortCuts ? nls["accel_editMenu_Cut"+ macShortCuts]  : nls.accel_editMenu_Cut,  
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'contextCut' );
	    	},
	    dir: dirAttr
	}));
	editMenu.addChild( new dijit.MenuItem(
	{
		id: "D_i_Copy",
		commandID:'contextCopy',
		label: nls.editMenu_Copy,
	    iconClass: 'menubarEditCopyIcon',
	    accelKey: macShortCuts ? nls["accel_editMenu_Copy"+ macShortCuts]  : nls.accel_editMenu_Copy, 
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'contextCopy' );
	    	},
	    dir: dirAttr
	}));
	editMenu.addChild( new dijit.MenuItem(
	{
		id: "D_i_Paste",
		commandID:'contextPaste',
		label: nls.editMenu_Paste,
	    iconClass: 'menubarEditPasteIcon',
	    accelKey:  macShortCuts ? nls["accel_editMenu_Paste"+ macShortCuts]  : nls.accel_editMenu_Paste, 
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'contextPaste' );
	    	},
	    dir: dirAttr
	}));

	editMenu.addChild( new dijit.MenuItem(
	{
		id: "D_i_SelectAll",
		label: nls.editMenu_SelectAll,
	    iconClass: 'menubarEditSelectAllIcon',
	    accelKey:  macShortCuts ? nls["accel_editMenu_SelectAll"+ macShortCuts]  : nls.accel_editMenu_SelectAll, 
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'selectAll' );
	    	},
	    dir: dirAttr
	}));
	editMenu.addChild( new dijit.MenuSeparator() );
	editMenu.addChild( new dijit.MenuItem(
	{
		id: "D_i_Find",
		label: nls.editMenu_FindReplace,
	    iconClass: 'menubarEditFindIcon',
	    accelKey:  macShortCuts ? nls["accel_editMenu_Find"+ macShortCuts]  : nls.accel_editMenu_Find, 
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'find' );
	    	},
	    dir: dirAttr
	}));
//	editMenu.addChild( new dijit.MenuItem(
//	{
//		id: "D_i_Replace",
//		label: nls.editMenu_Replace,
//	    iconClass: 'menubarEditReplaceIcon',
//	    onClick: function()
//	    	{
//	    		pe.lotusEditor.execCommand( 'replace' );
//	    	}
//	}));

	menubar.addChild( new dijit.PopupMenuBarItem(
	{
		id: "D_m_Edit",
		label: nls.editMenu,
	    popup: editMenu,
	    dir: dirAttr
	}));
	
	var viewMenu = new writer.ui.menu.Menu( {dir: dirAttr} );
	dojo.addClass(viewMenu.domNode,"lotusActionMenu");
	viewMenu.domNode.style.display ='none';
	document.body.appendChild(viewMenu.domNode);
	
	pe.toolbarMenuItem= new dijit.CheckedMenuItem(
			{
				id: "D_i_Toolbar",
				label: nls.viewMenu_Toolbar,
				checked: true,
				onChange: function(checked)
				{
					pe.scene.toolbar.toggle();
					pe.lotusEditor.focus();
				},
	    			dir: dirAttr
			});
	viewMenu.addChild(pe.toolbarMenuItem);
	
	/*pe.toolboxMenuItem = new dijit.CheckedMenuItem(
			{
				id: "D_i_Toolbox",
				label: "Handy Toolbox",	// TODO nls
				checked: (dojo.cookie("floatingToolbarDisplay") == "show"),
				onChange: function(isChecked)
				{
					pe.scene.showFloatingToolbox(isChecked);
				}
			});
	viewMenu.addChild(pe.toolboxMenuItem);*/
	
	pe.toolboxMenuItem = new dijit.CheckedMenuItem(
			{
				id: "D_i_CarriageReturn",
				label:  nls.viewMenu_CarriageReturn,
				checked: pe.scene.isCarriageReturn(),
				onChange: function(isChecked)
				{
					pe.lotusEditor.execCommand('toggleCarriageReturn');
				},
	    			dir: dirAttr
			});
	viewMenu.addChild(pe.toolboxMenuItem);
	
//	pe.sidebarMenuItem = new dijit.CheckedMenuItem(
//	{
//		id: "D_i_Sidebar",
//		label: nls.viewMenu_Sidebar,
//	    iconClass: 'menubarShowCommentsIcon',
//		checked: true,
//		onChange: function(checked)
//			{
//				pe.scene.toggleSideBar();
//			}
//	});
//	viewMenu.addChild( pe.sidebarMenuItem );
	
	if (enableAssignment)
	{
		pe.assignmentMenuItem =  new dijit.CheckedMenuItem(
		{
			id: "D_i_Assignment",
			label: nls.viewMenu_Assignment,
			iconClass: 'menubarShowTasksIcon',
			checked: true,
			onChange: function(checked)
				{
//					pe.lotusEditor.execCommand( 'showTasksCmd' );
				},
	    			dir: dirAttr
				});
		viewMenu.addChild(pe.assignmentMenuItem);
	}
	
	pe.bookMarkMenuItem = new dijit.CheckedMenuItem(
			{
				id: "D_i_ShowBookmark",
				label:  nls.viewMenu_Bookmark,
				checked: pe.scene.isShowBookMark(),
				onChange: function(isChecked)
				{
					pe.lotusEditor.execCommand('toggleBookMark');
				},
	    			dir: dirAttr
			});
	viewMenu.addChild(pe.bookMarkMenuItem);
	
	if (enableCoedit)
	{	
		pe.coedtingMenuItem =  new dijit.CheckedMenuItem(
		{
			id: "D_i_Coediting",
			label: nls.viewMenu_Coediting ,
			checked: pe.scene.isIndicatorAuthor(),
			onChange: function(checked)
			{
				pe.lotusEditor.execCommand( 'showAndHideUserIndicator' );
			},
	    		dir: dirAttr
			});
		viewMenu.addChild(pe.coedtingMenuItem);
	}

	viewMenu.addChild( new dijit.MenuSeparator() );


	pe.showUnsupportMenuItem = new dijit.CheckedMenuItem(
	{
		id: "D_i_ShowUnsupportWarning",
		label: nls.viewMenu_UnsupportWarning,
		checked: pe.settings?pe.settings.getShowUnsupportedFeature():true,
		onChange: function(checked)
			{
				pe.settings.setShowUnsupportedFeature(checked);
				pe.lotusEditor.focus();
			},
	    		dir: dirAttr
	});
	viewMenu.addChild(pe.showUnsupportMenuItem);
	
	menubar.addChild( new dijit.PopupMenuBarItem(
	{
		id: "D_m_View",
		label: nls.viewMenu,
	    popup: viewMenu,
	    	dir: dirAttr
	}));
	
	var insertMenu = new writer.ui.menu.Menu( {dir: dirAttr} );
	dojo.addClass(insertMenu.domNode,"lotusActionMenu");
	insertMenu.domNode.style.display ='none';
	document.body.appendChild(insertMenu.domNode);
	
	insertMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_Pagebreak',
		commandID:'pagebreak',
		label: nls.insertMenu_break,
	    iconClass: 'menubarCreatePageBreakIcon',
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'pagebreak' );
	    	},
	    	dir: dirAttr
	}));
	
	insertMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_Sectionbreak',
		commandID:'sectionbreak',
		label: nls.insertMenu_sectionbreak,
	    iconClass: 'menubarCreatePageBreakIcon',
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'sectionbreak' );
	    	},
	    	dir: dirAttr
	}));
	
	insertMenu.addChild( new dijit.MenuSeparator() );
	insertMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_Image',
		commandID:'uploadimage',
		label: nls.insertMenu_Image,
	    iconClass: 'menubarCreateImageIcon',
	    onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'uploadimage' );
	    	},
	    	dir: dirAttr
	}));	
	
	insertMenu.addChild( new dijit.MenuItem(
	{
				id: 'D_i_BookMark',
				commandID:'insertBookmark',
				label: nls.insertMenu_Bookmark,
			    onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'insertBookmark' );
		    	},
		    	dir: dirAttr
	}));		
			
	

	insertMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_Weblink',
		commandID:'link',
		label: nls.insertMenu_WebLink,
		accelKey:  macShortCuts ? nls["accel_insertMenu_Link"+ macShortCuts]  : nls.accel_insertMenu_Link, 
		iconClass: 'menubarCreateLinkIcon',
		onClick: function()
			{
			    pe.lotusEditor.execCommand( 'link' );
			},
	    	dir: dirAttr
	}));
	insertMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_SpecialChar',
		commandID:'specialchar',
		label: nls.insertMenu_SpecialCharacter,
		iconClass: 'menubarCreateSpecialCharIcon',
		onClick: function()
			{
			    pe.lotusEditor.execCommand( 'specialchar' );
			},
	    	dir: dirAttr
	}));
//	editor.on( 'selectionChange', function(ev)
//			{
//				var selection = ev.data.selection;
//				if (!selection){
//					selection = editor.getSelection();
//				}
//				//The only place to handle link, specialchar, uploadimage, insertDate, insertTime  state
//				//If we have future requirement to support complex state, we should move code to each plugin with separate onSelectionChange handler
//				var state = MSGUTIL.containsTask(selection)? CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_OFF ;
//				editor.getCommand('specialchar').setState( state );
//				//editor.getCommand('link').setState( state );
//				editor.getCommand('uploadimage').setState( state );
//				editor.getCommand('insertDate').setState( state );
//				editor.getCommand('insertTime').setState( state );
//				
//			});
	
//	insertMenu.addChild( new dijit.MenuSeparator() );
//	insertMenu.addChild( new dijit.MenuItem(
//	{
//		id: 'D_i_Horizontalrule',
//		commandID:'horizontalrule',
//		label: nls.insertMenu_HorizontalLine,
//		iconClass: 'menubarCreateHorizontalRuleIcon',
//		onClick: function()
//			{
////			    pe.lotusEditor.execCommand( 'horizontalrule' );
//			}
//	}));
	insertMenu.addChild( new dijit.MenuSeparator() );
	
	
	pe.headerMenuItem = new dijit.MenuItem(
			{
				id: "D_i_Header",
				label: nls.insertMenu_Header,
//				accelKey: nls.accel_insertMenu_Header + macShortCuts,
			    onClick: function()
			    {
			    	pe.lotusEditor.execCommand( 'insertHeader' );
			    },
	    			dir: dirAttr
			});
	insertMenu.addChild(pe.headerMenuItem);
	
	pe.footerMenuItem = new dijit.MenuItem(
			{
				id: "D_i_Footer",
				label: nls.insertMenu_Footer,
//				accelKey: nls.accel_insertMenu_Footer + macShortCuts,
			    onClick: function()
			    {
			    	pe.lotusEditor.execCommand( 'insertFooter' );
			    },
	    			dir: dirAttr
			});
	insertMenu.addChild(pe.footerMenuItem);
	
	var pagenumberMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(pagenumberMenu.domNode,"lotusActionMenu");
	pagenumberMenu.domNode.style.display ='none';
	document.body.appendChild(pagenumberMenu.domNode);
	
	pagenumberMenu.addChild( new dijit.MenuItem(
			{
				id: 'D_i_PageNumberTop',
				commandID:'insertPageNumber',
				label:  nls.insertMenu_PageNumberTop,
		    	onClick: function()
		    	{
					pe.lotusEditor.execCommand( 'insertPageNumber',{position:"Top"} );
		    	},
	    			dir: dirAttr
			}));
	
	pagenumberMenu.addChild( new dijit.MenuItem(
			{
				id: 'D_i_PageNumberBottom',
				commandID:'insertPageNumber',
				label:  nls.insertMenu_PageNumberBottom,
		    	onClick: function()
		    	{
					pe.lotusEditor.execCommand( 'insertPageNumber',{position:"Bottom"} );
		    	},
	    			dir: dirAttr
			}));
	
	pagenumberMenu.addChild( new dijit.MenuItem(
			{
				id: 'D_i_PageNumberCurr',
				commandID:'insertPageNumber',
				label:  nls.insertMenu_PageNumberCurr,
		    	onClick: function()
		    	{
					pe.lotusEditor.execCommand( 'insertPageNumber',{position:"CurrentPosition"} );
		    	},
	    			dir: dirAttr
			}));
	
	var pagenumber = new dijit.PopupMenuItem(
	{
		id: 'D_i_PageNumber',
		label:  nls.insertMenu_PageNumber,
	    popup: pagenumberMenu,
	    	dir: dirAttr
	});
	dojo.style( pagenumber.arrowWrapper, 'visibility', '' );
	insertMenu.addChild( pagenumber );	

	
	//TOC 
	insertMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_TableofContents',
		commandID:'createTOC',
	    label: nls.insertMenu_TableOfContents,
	    onClick: function()
	    	{
				pe.lotusEditor.execCommand('createTOC');
	    	},
	    	dir: dirAttr
	}));				
	
	insertMenu.addChild(new dijit.MenuSeparator());
	var fieldsSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(fieldsSubMenu.domNode,"lotusActionMenu");
	fieldsSubMenu.domNode.style.display ='none';
	document.body.appendChild(fieldsSubMenu.domNode);

	
	fieldsSubMenu.addChild( new dijit.MenuItem(
			{
				id: 'D_i_TotalPageNumber',
				commandID:'insertTotalPageNumber',
				label:  nls.insertMenu_TotalPageNumber,
		    	onClick: function()
		    	{
					pe.lotusEditor.execCommand( 'insertTotalPageNumber' );
			    	},
		    		dir: dirAttr
			}));
						
	fieldsSubMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_Date',
		commandID:'insertDate',
		label:  nls.insertMenu_Date,
    	onClick: function()
    	{
			pe.lotusEditor.execCommand( 'insertDate' );
    	},
	    	dir: dirAttr
	}));
	fieldsSubMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_Time',
		commandID:'insertTime',
		label:  nls.insertMenu_Time,
    	onClick: function()
    	{
			pe.lotusEditor.execCommand( 'insertTime' );
	    	},
	    	dir: dirAttr
	}));
	
	
	var fields = new dijit.PopupMenuItem(
	{
		id: 'D_i_Fields',
		label:  nls.insertMenu_Fields,
	    popup: fieldsSubMenu,
	    	dir: dirAttr
	});
	dojo.style( fields.arrowWrapper, 'visibility', '' );
	insertMenu.addChild( fields );	
	
	menubar.addChild( new dijit.PopupMenuBarItem(
	{
		id: 'D_m_Insert',
		label: nls.insertMenu,
	    popup: insertMenu,
	    	dir: dirAttr
	}));
	
	var formatMenu = new writer.ui.menu.Menu( {dir: dirAttr} );
	dojo.addClass(formatMenu.domNode,"lotusActionMenu");
	formatMenu.domNode.style.display ='none';
	document.body.appendChild(formatMenu.domNode);
	
//	formatMenu.addChild( new dijit.MenuItem(
//	{
//		id: 'D_i_Template',
//		label: nls.formatMenu_Template + tempDisableStr,
//		disabled: true,
//		onClick: function()
//			{
//				pe.lotusEditor.execCommand('docTemplate',{filterType: 'document'});
//			}
//	}));
//	formatMenu.addChild( new dijit.MenuSeparator() );
		var textSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
		dojo.addClass(textSubMenu.domNode,"lotusActionMenu");
		textSubMenu.domNode.style.display ='none';
		document.body.appendChild(textSubMenu.domNode);
		
		textSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_Bold',
			label: nls.formatMenu_Bold,
			iconClass: 'menubarBoldIcon',
			accelKey:  macShortCuts ? nls["accel_formatMenu_Textprop_Bold"+ macShortCuts]  : nls.accel_formatMenu_Textprop_Bold, 
			checked: false,
			commandID:  'bold' ,
	    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'bold' );
	    	},
	    	dir: dirAttr
		}));
		textSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_Italic',
			label: nls.formatMenu_Italic,
			accelKey:  macShortCuts ? nls["accel_formatMenu_Textprop_Italic"+ macShortCuts]  : nls.accel_formatMenu_Textprop_Italic,
			iconClass: 'menubarItalicIcon',
			checked: false,
			commandID:  'italic' ,
	    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'italic' );
	    	},
	    	dir: dirAttr
		}));
		textSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_Underline',
			label: nls.formatMenu_Underline,
			accelKey:  macShortCuts ? nls["accel_formatMenu_Textprop_Underline"+ macShortCuts]  : nls.accel_formatMenu_Textprop_Underline, 
			iconClass: 'menubarUnderlineIcon',
			commandID:  'underline' ,
			checked: false,
	    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'underline' );
	    	},
	    	dir: dirAttr
		}));
		
		textSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_Strikethrough',
			label: nls.formatMenu_Strikethrough,
			iconClass: 'menubarStrikeIcon',
			commandID:  'strike' ,
			checked: false,
	    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'strike' );
	    	},
	    	dir: dirAttr
		}));
		
//		textSubMenu.addChild( new dijit.MenuSeparator() );
//		
//		
//		textSubMenu.addChild( new dijit.MenuItem(
//				{
//					id: 'D_i_IncreaseSize',
//					commandID: 'increasefont', 
//					disabled: true,
//					label: nls.formatMenu_IncreaseSize + tempDisableStr,
//					iconClass: 'menubarIncreaseFontIcon',
//			    	onClick: function()
//			    	{
////			    		pe.lotusEditor.execCommand( 'increasefont' );
//			    	}
//				}));
//		textSubMenu.addChild( new dijit.MenuItem(
//				{
//					id: 'D_i_DecreaseSize',
//					commandID: 'decreasefont', 
//					disabled: true,
//					label: nls.formatMenu_DecreaseSize+ tempDisableStr,
//					iconClass: 'menubarDecreaseFontIcon',
//			    	onClick: function()
//			    	{
////			    		pe.lotusEditor.execCommand( 'decreasefont' );
//			    	}
//				}));
	var textProp = new dijit.PopupMenuItem(
	{
		id: 'D_i_TextPro',
		label: nls.formatMenu_TextProperties,
	    popup: textSubMenu,
	    	dir: dirAttr
	});
	dojo.style( textProp.arrowWrapper, 'visibility', '' );
	formatMenu.addChild( textProp );
	
//	var imageSelected = function()
//	{
//		
//	};

		var paraSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
		dojo.addClass(paraSubMenu.domNode,"lotusActionMenu");
		paraSubMenu.domNode.style.display ='none';
		document.body.appendChild(paraSubMenu.domNode);
		
		paraSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_ParaPagebreak',
			label: nls.formatMenu_PageBreakBefore,
			checked: false,
			commandID:  'parapagebreak' ,
	    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'parapagebreak' );
	    	},
	    	dir: dirAttr
		}));
		paraSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_KeepLines',
			label: nls.formatMenu_KeepLines,
			checked: false,
			commandID:  'keeplines' ,
	    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'keeplines' );
	    	},
	    	dir: dirAttr
		}));
		paraSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_WidowControl',
			label: nls.formatMenu_WidowControl,
			commandID:  'widowcontrol' ,
			checked: true,
	    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'widowcontrol' );
	    	},
	    	dir: dirAttr
		}));
		
	var paraProp = new dijit.PopupMenuItem(
	{
		id: 'D_i_ParaProp',
		commandID:  'paraProp' ,
		label: nls.formatMenu_Pagination,
	    popup: paraSubMenu,
	    dir: dirAttr
	});
	dojo.style( paraProp.arrowWrapper, 'visibility', '' );
	formatMenu.addChild( paraProp );

	var imgPropItem;
	formatMenu.addChild( imgPropItem = new dijit.MenuItem(
	{
		id: 'D_i_ImgPro',
		label: nls.formatMenu_ImageProperties,
//	    disabled : !imageSelected(),
		commandID:  'imageProp' ,
    	onClick: function()
	    	{
				pe.lotusEditor.execCommand( 'imageProp' );
	    	},
	    	dir: dirAttr
	}));

	formatMenu.addChild( new dijit.MenuSeparator() );
	//heading options
	var headingSubMenu = new writer.ui.menu.Menu({commandID: 'headingFormat',dir: dirAttr});
	dojo.addClass(headingSubMenu.domNode,"lotusActionMenu");
	headingSubMenu.domNode.style.display ='none';
	document.body.appendChild(headingSubMenu.domNode);
	
	headingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_P',
		checked: false,
		label: nls.formatMenu_Normal,
		onClick: function()
		{
			pe.lotusEditor.execCommand( 'headingFormat','Normal' );
		},
	    	dir: dirAttr
	}));
	
	headingSubMenu.addChild( new dijit.CheckedMenuItem(
			{
				id: 'D_i_T',
				checked: false,
				label: nls.formatMenu_Title,				
				onClick: function()
				{
					pe.lotusEditor.execCommand( 'headingFormat','Title' );
				},
	    			dir: dirAttr
	}));
			
	headingSubMenu.addChild( new dijit.CheckedMenuItem(
			{
				id: 'D_i_ST',
				checked: false,
				label: nls.formatMenu_Subtitle,
				onClick: function()
				{
					pe.lotusEditor.execCommand( 'headingFormat','Subtitle' );
				},
	    			dir: dirAttr
	}));
			
	headingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_H1',
		checked: false,
		label: nls.formatMenu_Heading1,		
    	onClick: function()
    	{
    		pe.lotusEditor.execCommand( 'headingFormat','Heading1' );
    	},
	dir: dirAttr
	}));
	headingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_H2',
		checked: false,
		label: nls.formatMenu_Heading2,	
    	onClick: function()
    	{
    		pe.lotusEditor.execCommand( 'headingFormat','Heading2' );
    	},
	dir: dirAttr
	}));
	headingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_H3',
		checked: false,
		label: nls.formatMenu_Heading3,
    	onClick: function()
    	{
    		pe.lotusEditor.execCommand( 'headingFormat','Heading3' );
    	},
	dir: dirAttr
	}));
	headingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_H4',
		checked: false,
		label: nls.formatMenu_Heading4,
    	onClick: function()
    	{
    		pe.lotusEditor.execCommand( 'headingFormat','Heading4' );
    	},
	dir: dirAttr
	}));
	headingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_H5',
		checked: false,
		label: nls.formatMenu_Heading5,
		onClick: function()
		{
		    pe.lotusEditor.execCommand( 'headingFormat','Heading5'  );
		},
		dir: dirAttr
	}));
	headingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_H6',
		checked: false,
		label: nls.formatMenu_Heading6,
		onClick: function()
		{
		    pe.lotusEditor.execCommand( 'headingFormat','Heading6'  );
		},
		dir: dirAttr
	}));

var headingProp = new dijit.PopupMenuItem(
{
	commandID: 'headingFormat',
	id: 'D_i_Heading',
	label: nls.formatMenu_Heading,
    popup: headingSubMenu,
	dir: dirAttr
});
dojo.style( headingProp.arrowWrapper, 'visibility', '' );
formatMenu.addChild( headingProp );
	//bulleted lists
/*
// Shold change to a panel 
formatMenu.addChild( new dijit.MenuItem(
{
	id: 'D_i_Bullet',
	label: nls.formatMenu_BulletedList,
	iconClass: 'menubarBulletedListIcon',
	onClick: function()
	   {
	    	pe.lotusEditor.execCommand( 'bulletedlist' );
	   }
}));
formatMenu.addChild( new dijit.MenuItem(
{
	id: 'D_i_Number',
	label: nls.formatMenu_NumberedList,
	iconClass: 'menubarNumberedListIcon',
	onClick: function()
	    {
	    	pe.lotusEditor.execCommand( 'numberedlist' );
	    }
}));
*/
var muti = new writer.ui.widget.ListStyle({type:"multilevelList"});
var outline = new dijit.PopupMenuItem(
		{
			commandID: "multiLevelList",
			id: 'D_i_OutLine',
			label: nls.formatMenu_OutLine,
			popup:muti,
			dir: dirAttr
		});

formatMenu.addChild( outline );
formatMenu.addChild( new dijit.MenuSeparator() );

var m_super =  new dijit.CheckedMenuItem(
		{
			id: 'D_i_Superscript',
			label: nls.formatMenu_Superscript,
			checked: false,
			commandID: 'superscript',
//			accelKey: nls.accel_formatMenu_Superscript + macShortCuts,
			iconClass: 'menubarSuperscriptIcon',
			onClick: function()
				{
				    pe.lotusEditor.execCommand( 'superscript' );
				},
				dir: dirAttr
				});

formatMenu.addChild(m_super);

var m_subs =  new dijit.CheckedMenuItem(
		{
			id: 'D_i_subscript',
			checked: false,
			commandID: 'subscript',
			label: nls.formatMenu_Subscript,
//			accelKey: nls.accel_formatMenu_Subscript + macShortCuts,
			iconClass: 'menubarSubscriptIcon',
			onClick: function()
				{
				   	pe.lotusEditor.execCommand( 'subscript' );
				},
				dir: dirAttr
		});
formatMenu.addChild(m_subs);

formatMenu.addChild( new dijit.MenuSeparator() );
		var alignSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
		dojo.addClass(alignSubMenu.domNode,"lotusActionMenu");
		alignSubMenu.domNode.style.display ='none';
		document.body.appendChild(alignSubMenu.domNode);
		
		alignSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_AlignLeft',
			label: nls.formatMenu_Left,
			iconClass: 'menubarLeftAlignIcon',
			accelKey:  macShortCuts ? nls["accel_formatMenu_Left"+ macShortCuts]  : nls.accel_formatMenu_Left, 
			checked: false,
			commandID: 'justifyleft',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'justifyleft' );
		    	},
			dir: dirAttr
		}));
		alignSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_AlignRight',
			label: nls.formatMenu_Right,
			iconClass: 'menubarRightAlignIcon',
			accelKey:  macShortCuts ? nls["accel_formatMenu_Right"+ macShortCuts]  : nls.accel_formatMenu_Right, 
			checked: false,
			commandID: 'justifyright',
			onClick: function()
				{
				    pe.lotusEditor.execCommand( 'justifyright' );
				},
			dir: dirAttr
		}));
		alignSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_AlignCenter',
			label: nls.formatMenu_Center,
			iconClass: 'menubarCenterAlignIcon',
			accelKey:  macShortCuts ? nls["accel_formatMenu_Center"+ macShortCuts]  : nls.accel_formatMenu_Center, 
			checked: false,
			commandID: 'justifycenter',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'justifycenter' );
		    	},
			dir: dirAttr
		}));
		alignSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_AlignJustify',
			label: nls.formatMenu_Justify,
			iconClass: 'menubarJustifyAlignIcon',
			accelKey: macShortCuts ? nls["accel_formatMenu_Justify"+ macShortCuts]  : nls.accel_formatMenu_Justify, 
			checked: false,
			commandID: 'justifyblock',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'justifyblock' );
		    	},
			dir: dirAttr
		}));
	var formatAlign = new dijit.PopupMenuItem(
	{
		id: 'D_i_Align',
		label: nls.formatMenu_Align,
	    popup: alignSubMenu,
		dir: dirAttr
	});
	dojo.style( formatAlign.arrowWrapper, 'visibility', '' );
	formatMenu.addChild( formatAlign );
	if(BidiUtils.isBidiOn()){
		formatMenu.addChild( new dijit.MenuSeparator() );
		var directionSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
		dojo.addClass(alignSubMenu.domNode,"lotusActionMenu");
		directionSubMenu.domNode.style.display ='none';
		document.body.appendChild(directionSubMenu.domNode);
		
		directionSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_DirectionLtr',
			label: nls.formatMenu_Ltr,
			checked: false,
			commandID: 'bidiltr',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'bidiltr' );
		    	},
			dir: dirAttr
		}));
		directionSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: 'D_i_DirectionRtl',
			label: nls.formatMenu_Rtl,
			checked: false,
			commandID: 'bidirtl',
			onClick: function()
				{
				    pe.lotusEditor.execCommand( 'bidirtl' );
			},
			dir: dirAttr
		}));
		var formatDirection = new dijit.PopupMenuItem(
		{
			id: 'D_i_Direction',
			label: nls.formatMenu_Direction,
		    	popup: directionSubMenu,
			dir: dirAttr
		});
		dojo.style( formatDirection.arrowWrapper, 'visibility', '' );
		formatMenu.addChild( formatDirection );
	}
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
	var lineSpacingSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(lineSpacingSubMenu.domNode,"lotusActionMenu");
	lineSpacingSubMenu.domNode.style.display ='none';
	document.body.appendChild(lineSpacingSubMenu.domNode);
	
	lineSpacingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_LineSpacing1',
		label: nls.formatMenu_LineSpacing1,
		iconClass: 'menubarLeftAlignIcon',
//		accelKey: nls.accel_formatMenu_Left,
		checked: false,
		commandID: 'LineSpacing1',
    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'LineSpacing1' );
	    	},
		dir: dirAttr
	}));
	lineSpacingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_LineSpacing115',
		label: nls.formatMenu_LineSpacing115,
		iconClass: 'menubarRightAlignIcon',
//		accelKey: nls.accel_formatMenu_Right,
		checked: false,
		commandID: 'LineSpacing115',
		onClick: function()
			{
			    pe.lotusEditor.execCommand( 'LineSpacing115' );
			},
		dir: dirAttr
	}));
	lineSpacingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_LineSpacing15',
		label: nls.formatMenu_LineSpacing15,
		iconClass: 'menubarCenterAlignIcon',
//		accelKey: nls.accel_formatMenu_Center,
		checked: false,
		commandID: 'LineSpacing15',
    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'LineSpacing15' );
	    	},
		dir: dirAttr
	}));
	lineSpacingSubMenu.addChild( new dijit.CheckedMenuItem(
	{
		id: 'D_i_LineSpacing2',
		label: nls.formatMenu_LineSpacing2,
		iconClass: 'menubarJustifyAlignIcon',
//		accelKey: nls.accel_formatMenu_Justify,
		checked: false,
		commandID: 'LineSpacing2',
    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'LineSpacing2' );
	    	},
		dir: dirAttr
	}));
	lineSpacingSubMenu.addChild( new dijit.CheckedMenuItem(
			{
				id: 'D_i_LineSpacing25',
				label: nls.formatMenu_LineSpacing25,
				iconClass: 'menubarCenterAlignIcon',
//				accelKey: nls.accel_formatMenu_Center,
				checked: false,
				commandID: 'LineSpacing25',
		    	onClick: function()
			    	{
			    		pe.lotusEditor.execCommand( 'LineSpacing25' );
			    	},
				dir: dirAttr
			}));
			lineSpacingSubMenu.addChild( new dijit.CheckedMenuItem(
			{
				id: 'D_i_LineSpacing3',
				label: nls.formatMenu_LineSpacing3,
				iconClass: 'menubarJustifyAlignIcon',
//				accelKey: nls.accel_formatMenu_Justify,
				checked: false,
				commandID: 'LineSpacing3',
		    	onClick: function()
			    	{
			    		pe.lotusEditor.execCommand( 'LineSpacing3' );
			    	},
				dir: dirAttr
			}));
var formatLineSpacing = new dijit.PopupMenuItem(
{
	id: 'D_i_LineSpacing',
	label: nls.formatMenu_LineSpacing,
    popup: lineSpacingSubMenu,
	dir: dirAttr
});
dojo.style( formatLineSpacing.arrowWrapper, 'visibility', '' );
formatMenu.addChild( formatLineSpacing );
//////////////////////////////////////////////////////////////////////////////
	formatMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_Indent',
		commandID:'indent',
		label: nls.formatMenu_Indent,
	    iconClass: 'menubarIndentIcon',
	    accelKey:  macShortCuts ? nls["accel_formatMenu_Indent"+ macShortCuts]  : nls.accel_formatMenu_Indent,
    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'indent' );
	    	},
		dir: dirAttr
	}));
	formatMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_DecreaseIndent',
		commandID:'outdent',
		label: nls.formatMenu_DecreaseIndent,
	    iconClass: 'menubarOutdentIcon',
	    accelKey:  macShortCuts ? nls["accel_formatMenu_DecreaseIndent"+ macShortCuts]  : nls.accel_formatMenu_DecreaseIndent,
    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'outdent' );
	    	},
		dir: dirAttr
	}));
	
	formatMenu.addChild( new dijit.MenuSeparator() );
	
	formatMenu.addChild( new dijit.MenuItem(
			{
				id: 'D_i_ClearFormat',
				commandID:'clearFormat',
				label: nls.formatMenu_ClearFormat,
		    	onClick: function()
			    	{
			    		pe.lotusEditor.execCommand( 'clearFormat' );
			    	},
				dir: dirAttr
			}));
	
	
	menubar.addChild( new dijit.PopupMenuBarItem(
	{
		id: 'D_m_Format',
		label: nls.formatMenu,
	    popup: formatMenu,
		dir: dirAttr
	}));
	
	var tableMenu = new writer.ui.menu.Menu( {dir: dirAttr} );
	dojo.addClass(tableMenu.domNode,"lotusActionMenu");
	tableMenu.domNode.style.display ='none';
	document.body.appendChild(tableMenu.domNode);
	
	tableMenu.addChild( new dijit.PopupMenuItem(
			{
			    commandID:'TableTmplate',
				id: 'D_t_TableTmplate',
				label: nls.formatMenu_Template,
			    iconClass: 'menubarCreateTableIcon',
			    popup:new writer.ui.widget.TableTemplatePane(),
				dir: dirAttr
			}));
	
	tableMenu.addChild( new dijit.PopupMenuItem(
	{
	    commandID:'createTable',
		id: 'D_i_CreateST',
		label: nls.tableMenu_Create,
	    iconClass: 'menubarCreateTableIcon',
	    popup:new writer.ui.widget.TablePicker(),
		dir: dirAttr
//    	onClick: function()
//	    	{
//	    		pe.lotusEditor.execCommand( 'addST' );
//	    	}
	}));
//	tableMenu.addChild( new dijit.MenuItem(
//	{
//	    commandID:'stTemplate',
//		id: 'D_i_CreateSTTemp',
//		label: nls.tableMenu_CreateFromTemplate,
//    	onClick: function()
//	    	{
//	    		pe.lotusEditor.execCommand('stTemplate',{filterType: 'smartTable', stName: ''});
//	    	}
//	}));
//	tableMenu.addChild( new dijit.MenuSeparator() );
	tableMenu.addChild( new dijit.MenuItem(
	{
	    commandID:'deleteTable',
		id: 'D_i_DeleteST',
		label: nls.tableMenu_Delete,
    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'deleteTable' );
	    	},
		dir: dirAttr
	}));
	
	tableMenu.addChild( new dijit.MenuItem(
	{
	    commandID:'tableProperties',
		id: 'D_i_TableProperties',
		label: nls.tableMenu_TableProperties,
    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'tableProperties' );
	    	},
		dir: dirAttr
	}));
	
	tableMenu.addChild( new dijit.MenuSeparator() );
	var STRowSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(STRowSubMenu.domNode,"lotusActionMenu");
	STRowSubMenu.domNode.style.display ='none';
	document.body.appendChild(STRowSubMenu.domNode);
	
		STRowSubMenu.addChild( new dijit.MenuItem(
		{
			commandID:'insertRowAbove',
			id: 'D_i_InsRowAbove',
			label: nls.tableMenu_InsertRowAbove,
			iconClass: 'menubarInsertRowBeforeIcon',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'insertRowAbove' );
		    	},
			dir: dirAttr
		}));
		STRowSubMenu.addChild( new dijit.MenuItem(
		{
			commandID:'insertRowBelow',
			id: 'D_i_InsRowBelow',
			label: nls.tableMenu_InsertRowBelow,
			iconClass: 'menubarInsertRowAfterIcon',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'insertRowBelow' );
		    	},
			dir: dirAttr
		}));
//		STRowSubMenu.addChild( new dijit.MenuItem(
//		{
////			commandID:'moveRowAbove',
//			disabled: true,
//			id: 'D_i_MovRowAbove',
//			label: nls.tableMenu_MoveRowAbove + tempDisableStr,
//			iconClass: 'menubarMoveRowBeforeIcon',
//	    	onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'moveRowAbove' );
//		    	}
//		}));
//		STRowSubMenu.addChild( new dijit.MenuItem(
//		{
////			commandID:'moveRowBelow',
//			disabled: true,
//			id: 'D_i_MovRowBelow',
//			label: nls.tableMenu_MoveRowBelow + tempDisableStr,
//			iconClass: 'menubarMoveRowAfterIcon',
//	    	onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'moveRowBelow' );
//		    	}
//		}));
		STRowSubMenu.addChild( new dijit.MenuSeparator() );
		STRowSubMenu.addChild( new dijit.MenuItem(
		{
			commandID:'deleteRow',
			id: 'D_i_DeleteRow',
			label: nls.tableMenu_RowDelete,
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'deleteRow' );
		    	},
			dir: dirAttr
		}));

		STRowSubMenu.addChild( new dijit.MenuSeparator() );
		STRowSubMenu.addChild( new dijit.CheckedMenuItem(
		{
			commandID:'repeatHeader',
			id: 'D_i_RepeatHeader',
			label: nls.tableMenu_RowRepeat,
			checked:false,
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'repeatHeader' );
		    	},
			dir: dirAttr
		}));

	var STRow = new dijit.PopupMenuItem(
	{
	    commandID:'row',
		id: 'D_i_Row',
		label: nls.tableMenu_Row,
	    popup: STRowSubMenu,
		dir: dirAttr
	});
	dojo.style( STRow.arrowWrapper, 'visibility', '' );
	tableMenu.addChild( STRow );
	
	var STColumnSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(STColumnSubMenu.domNode,"lotusActionMenu");
	STColumnSubMenu.domNode.style.display ='none';
	document.body.appendChild(STColumnSubMenu.domNode);
	
		STColumnSubMenu.addChild( new dijit.MenuItem(
		{
			commandID:'insertColBfr',
			id: 'D_i_InsColBefore',
			label: nls.tableMenu_InsertColumnBefore,
			iconClass: 'menubarInsertColumnBeforeIcon',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'insertColBfr' );
		    	},
			dir: dirAttr
		}));
		STColumnSubMenu.addChild( new dijit.MenuItem(
		{
			commandID:'insertColAft',
			id: 'D_i_InsColAfter',
			label: nls.tableMenu_InsertColumnAfter,
			iconClass: 'menubarInsertColumnAfterIcon',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'insertColAft' );
		    	},
			dir: dirAttr
		}));
//		STColumnSubMenu.addChild( new dijit.MenuItem(
//		{
////			commandID:'moveColBfr',
//			disabled: true,
//			id: 'D_i_MovColBefore',
//			label: nls.tableMenu_MoveColumnBefore + tempDisableStr,
//			iconClass: 'menubarMoveColumnBeforeIcon',
//	    	onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'moveColBfr' );
//		    	}
//		}));
//		STColumnSubMenu.addChild( new dijit.MenuItem(
//		{
////			commandID:'moveColAft',
//			disabled: true,
//			id: 'D_i_MovColAfter',
//			label: nls.tableMenu_MoveColumnAfter + tempDisableStr,
//			iconClass: 'menubarMoveColumnAfterIcon',
//	    	onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'moveColAft' );
//		    	}
//		}));
//		
		STColumnSubMenu.addChild( new dijit.MenuSeparator() );

		/*STColumnSubMenu.addChild( new dijit.MenuItem(
		{
			id: 'D_i_MarkCategory',
			label: nls.tableMenu_MarkasCategory,
			onClick: function()
				{
				   	
				}
		}));*/
		STColumnSubMenu.addChild( new dijit.MenuItem(
		{
			commandID:'deleteCol',
			id: 'D_i_DeleteCol',
			label: nls.tableMenu_ColumnDelete,
			onClick: function()
				{
				    pe.lotusEditor.execCommand( 'deleteCol' );
				},
			dir: dirAttr
		}));
		/*
		STColumnSubMenu.addChild( new dijit.MenuSeparator() );
		
		
		STColumnSubMenu.addChild( new dijit.MenuItem(
		{
			commandID:'sortSTColAsc',
			id: 'D_i_ColSortAsc',
			label: nls.tableMenu_ColumnSortAscending,
			iconClass: 'menubarSortColumnAscIcon',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'sortSTColAsc' );
		    	}
		}));
		STColumnSubMenu.addChild( new dijit.MenuItem(
		{
			commandID:'sortSTColDesc',
			id: 'D_i_ColSortDesc',
			label: nls.tableMenu_ColumnSortDescending,
			iconClass: 'menubarSortColumnDescIcon',
	    	onClick: function()
		    	{
		    		pe.lotusEditor.execCommand( 'sortSTColDesc' );
		    	}
		}));
		*/
	var STColumn = new dijit.PopupMenuItem(
	{
		commandID:'column',
		id: 'D_i_Column',
		label: nls.tableMenu_Column,
	    popup: STColumnSubMenu,
			dir: dirAttr
	});
	dojo.style( STColumn.arrowWrapper, 'visibility', '' );
	tableMenu.addChild( STColumn );
	var STCellSubMenu = new writer.ui.menu.Menu({dir: dirAttr});
	dojo.addClass(STCellSubMenu.domNode,"lotusActionMenu");
	STCellSubMenu.domNode.style.display ='none';
	document.body.appendChild(STCellSubMenu.domNode);
	
	
	var palette = new writer.ui.widget.ColorPalette({id:"D_m_BackgroundColor",colorType:"BackColor",palette:"7x10",onOpen:function(val){
		if(pe.lotusEditor){
			var plugin = pe.lotusEditor.getPlugin && pe.lotusEditor.getPlugin("Table");
			if(plugin){
				var color = plugin.getColor();							
				var colorPallete = this;
				this.focus();
				this._currentColor = color.toUpperCase();
				if("autoColor" == color || color == "auto"){
					if(colorPallete._selectedCell >= 0){
						dojo.removeClass(colorPallete._cells[colorPallete._selectedCell].node, "dijitPaletteCellSelected");
					}
					colorPallete._selectedCell = -1;
					colorPallete.autoNode.focus();
					this.focusSection ="autonode";
				}else{
					var index = colorPallete.colorMap[color.toUpperCase()];
					if(index != undefined){
						if(colorPallete._selectedCell >= 0){
							dojo.removeClass(colorPallete._cells[colorPallete._selectedCell].node, "dijitPaletteCellSelected");
						}
						colorPallete._selectedCell = -1;
						colorPallete.setFocus(colorPallete._cells[index].node);
						colorPallete.focus();
					}else{
						if(colorPallete._selectedCell >= 0){
							dojo.removeClass(colorPallete._cells[colorPallete._selectedCell].node, "dijitPaletteCellSelected");
						}
						colorPallete._selectedCell = -1;
						colorPallete.setFocus(colorPallete._cells[0].node);
						colorPallete.focus();
					}
					this.focusSection ="gridnode";
				}						
			}
		}
	},onChange:function(val){
		if(val == 'autoColor'){
			if(this._selectedCell >= 0)
			{
				dojo.removeClass(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
				this._selectedCell = -1; 
			}
		}
		else
			this._antoColorNode && dojo.style(this._antoColorNode, 'border','');
		setTimeout(function(){ pe.lotusEditor.execCommand("setTableColor",val); }, 10);
	}});
	STCellSubMenu.addChild( new dijit.PopupMenuItem(	{
			    commandID:'setTableColor',
				id: 'D_i_SetTableColor',
				label: nls.tableMenu_SetTableColor,
		    	popup:palette,
			dir: dirAttr
			}));
	STCellSubMenu.addChild( new dijit.MenuSeparator() );
	STCellSubMenu.addChild( new dijit.MenuItem(
			{
				id: 'D_i_CellMC',
				commandID:'mergeCells',
				label: nls.tableMenu_CellMergeCells,
		    	onClick: function()
			    	{
			    		pe.lotusEditor.execCommand( 'mergeCells' );
			    	},
				dir: dirAttr
			}));
	STCellSubMenu.addChild( new dijit.MenuItem(
			{
				id: 'D_i_CellSC',
				commandID:'showSplitCellDlg',
				label: nls.ctxMenuSplitCells,
		    	onClick: function()
			    	{
			    		pe.lotusEditor.execCommand( 'showSplitCellDlg' );
			    	},
				dir: dirAttr
			}));
	STCellSubMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_CellProperties',
		commandID:'cellProperties',
		label: nls.tableMenu_CellProperties,
    	onClick: function(){
	    	pe.lotusEditor.execCommand( 'cellProperties' );
	    },
		dir: dirAttr
	}));
//	STCellSubMenu.addChild( new dijit.MenuItem(
//			{
//				id: 'D_i_CellMD',
//				commandID:'cellMergeDown',
//				label: nls.ctxMenuMergeDown,
//		    	onClick: function()
//			    	{
//			    		pe.lotusEditor.execCommand( 'cellMergeDown' );
//			    	}
//			}));
//	STCellSubMenu.addChild( new dijit.MenuItem(
//			{
//				id: 'D_i_CellVS',
//				commandID:'splitV',
//				label: nls.ctxMenuVerSplit,
//		    	onClick: function()
//			    	{
//			    		pe.lotusEditor.execCommand( 'splitV' );
//			    	}
//			}));
//	STCellSubMenu.addChild( new dijit.MenuItem(
//			{
//				id: 'D_i_CellHS',
//				commandID:'splitH',
//				label: nls.ctxMenuHorSplit,
//		    	onClick: function()
//			    	{
//			    		pe.lotusEditor.execCommand( 'splitH' );
//			    	}
//			}));
//	
//		STCellSubMenu.addChild( new dijit.MenuItem(
//		{
//			id: 'D_i_CellAL',
//			label: nls.tableMenu_CellAlignLeft,
//	    	onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'leftAlignSTCellContent' );
//		    	}
//		}));
//		STCellSubMenu.addChild( new dijit.MenuItem(
//		{
//			id: 'D_i_CellAR',
//			label: nls.tableMenu_CellAlignRight,
//	    	onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'rightAlignSTCellContent' );
//		    	}
//		}));
//		STCellSubMenu.addChild( new dijit.MenuItem(
//		{
//			id: 'D_i_CellAC',
//			label: nls.tableMenu_CellAlignCenter,
//	    	onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'centerAlignSTCellContent' );
//		    	}
//		}));
//		STCellSubMenu.addChild( new dijit.MenuItem(
//		{
//			id: 'D_i_ClearCell',
//			label: nls.tableMenu_CellClearContents,
//	    	onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'clearSTCellContent' );
//		    	}
//		}));
		
	var STCell = new dijit.PopupMenuItem(
	{
	    commandID:'Cell',
		id: 'D_i_Cell',
		label: nls.tableMenu_Cell,
	    popup: STCellSubMenu,
		dir: dirAttr
	});
	dojo.style( STCell.arrowWrapper, 'visibility', '' );
	tableMenu.addChild( STCell );
	
//	tableMenu.addChild( new dijit.MenuSeparator() );
//	tableMenu.addChild( new dijit.MenuItem(
//	{
//		commandID:'setTableProperties',
//		id: 'D_i_STPro',
//		label: nls.tableMenu_TableProperties,
//	 	onClick: function()
//		{
//	 		pe.lotusEditor.execCommand( 'setTableProperties' );
//	 	}
//	}));
	
	menubar.addChild( new dijit.PopupMenuBarItem(
	{
		id: 'D_m_Table',
		label: nls.tableMenu,
	    popup: tableMenu,
		dir: dirAttr
	}));
				
	var teamMenu = new writer.ui.menu.Menu( {dir: dirAttr} );
	dojo.addClass(teamMenu.domNode,"lotusActionMenu");
	teamMenu.domNode.style.display ='none';
	document.body.appendChild(teamMenu.domNode);
	
	teamMenu.addChild( new dijit.MenuItem(
	{
		commandID:'toggleCommentsCmd',
		id: 'D_i_AddComment',
		label: nls.teamMenu_AddComment,
//		accelKey: nls.accel_teamMenu_AddComment,
		onClick: function()
		{
			pe.scene.toggleCommentsCmd();
		},
		dir: dirAttr
	}));
	
	if (enableAssignment)
	{
		teamMenu.addChild( new dijit.MenuSeparator() );					
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'assignTask',
			id: 'D_i_AssignSec',
			label: nls.teamMenu_AssignSection,
			iconClass: 'menubarAssignSectionIcon',
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'assignTask' );		
			},
			dir: dirAttr
		}));

		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'editAssignment',
			id: 'D_i_EditAssignment',
			label: nls.teamMenu_EditAssignment,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'editAssignment' );		
			},
			dir: dirAttr
		}));
		var teamNls = dojo.i18n.getLocalization("concord.task", "AbstractTaskHandler");
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'reopenAssignment',
			id: 'D_i_ReopenAssignment',
			label: teamNls.dlgTaskReopenTitle,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'reopenAssignment' );		
			},
			dir: dirAttr
		}));
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'reassignAssignment',
			id: 'D_i_ReassignAssignment',
			label: teamNls.dlgTaskReassignTitle,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'reassignAssignment' );		
			},
			dir: dirAttr
		}));
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'markAssignComplete',
			id: 'D_i_MarkAssignComplete',
			label: nls.teamMenu_MarkSectionComplete,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'markAssignComplete' );				
			},
			dir: dirAttr
		}));
	/*
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'workPrivate',
			id: 'D_i_WorkPri',
			label: nls.teamMenu_WorkPrivatelyOnSection,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'workPrivate' );					
			}
		}));
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'cancelPrivate',
			id: 'D_i_CancelPri',
			label: nls.teamMenu_CancelPrivateWork,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'cancelPrivate' );					
			}
		}));
	*/	
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'approveSection',
			id: 'D_i_ApproveSec',
			label: nls.teamMenu_ApproveSection,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'approveSection' );							
			},
			dir: dirAttr
		}));
		teamMenu.addChild( new dijit.MenuSeparator() );
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'returnSection',
			id: 'D_i_ReturnSection',
			label: nls.teamMenu_ReturnSectionForRework,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'returnSection' );						
			},
			dir: dirAttr
		}));
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'removeSectionAssign',
			id: 'D_i_RemoveSection',
			label: nls.teamMenu_RemoveSectionAssignment,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'removeSectionAssign' );						
			},
			dir: dirAttr
		}));
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'removeCompletedAssign',
			id: 'D_i_RemoveCompleteAssign',
			label: nls.teamMenu_RemoveCompletedAssignments,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'removeCompletedAssign' );									
			},
			dir: dirAttr
		}));
		teamMenu.addChild( new dijit.MenuSeparator() );
		teamMenu.addChild( new dijit.MenuItem(
		{
			commandID:'about',
			id: 'D_i_AboutSec',
			label: nls.teamMenu_AboutThisSection,
			onClick: function()
			{
				pe.lotusEditor.execCommand( 'about' );									
			},
			dir: dirAttr
		}));
	}
	
	menubar.addChild( new dijit.PopupMenuBarItem(
	{
		id: 'D_m_Team',
		label: nls.teamMenu,
		popup: teamMenu,
		dir: dirAttr
	}));

	var toolsMenu = new writer.ui.menu.Menu( {dir: dirAttr} );
	dojo.addClass(toolsMenu.domNode,"lotusActionMenu");
	document.body.appendChild(toolsMenu.domNode);
	
	/*toolsMenu.addChild( new dijit.MenuItem(
	{
	    label: editor.lang.menubar.spellcheck,
    	onClick: function()
	    	{
	    		pe.lotusEditor.execCommand( 'checkspell' );
	    	}
	}));
	*/
//		var taskToolsSubMenu = new dijit.Menu();
//		taskToolsSubMenu.addChild( new dijit.MenuItem(
//		{
//			label: editor.lang.menubar.assigntask,
//			iconClass: 'menubarAssignSectionIcon',
//			onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'assignTask' );
//		    	}
//		}));
//		taskToolsSubMenu.addChild( new dijit.MenuItem(
//		{
//			label: editor.lang.menubar.deletetask,
//			onClick: function()
//		    	{
//		    		pe.lotusEditor.execCommand( 'taskDelete' );
//		    	}
//		}));
//	var taskToolbar = new dijit.PopupMenuItem(
//	{
//	    label: editor.lang.menubar.task,
//	    popup: taskToolsSubMenu
//	});
//	dojo.style( taskToolbar.arrowWrapper, 'visibility', '' );
//	toolsMenu.addChild( taskToolbar );

//	pe.spellcheckMenu = new dijit.MenuItem(
//	{
//		//label: editor.lang.concordscayt.concordscaytLable,
//		id: 'D_i_SpellCheck',
//		label: nls.toolsMenu_SpellCheck,
//		disable: false,
//		onClick: function()
//		{
//		    if(spellcheckerManager)
//		    {					    	
//		    	if(pe.spellcheckMenu)
//		    		pe.spellcheckMenu.setDisabled(true);
//		    	if(pe.autoSpellCheckMenu)
//		    		pe.autoSpellCheckMenu.attr('checked', true);
//				setTimeout(function(){									
//						spellcheckerManager.enableAutoScayt(true);									
//						if(pe && pe.settings)
//						  pe.settings.setAutoSpellCheck(true);
//				}, 0);					    	
//		    }
//		}
//	});
//	
//	toolsMenu.addChild(pe.spellcheckMenu);
	
	var scLangSubMenu = new writer.ui.menu.Menu({	    
		dir: dirAttr,
		baseClass: "concordMenuStyle"
	});
	dojo.addClass(scLangSubMenu.domNode,"lotusActionMenu");
	scLangSubMenu.domNode.style.display ='none';
	document.body.appendChild(scLangSubMenu.domNode);	
	pe.dicMenus = new Array();		
	spellcheckerManager = window.spellcheckerManager;
	if(spellcheckerManager )
	{
		for(var i=0; i<spellcheckerManager.supportedLang.length; i++)
		{
			var dic = spellcheckerManager.supportedLang[i];
			var newDic = dic.replace(/-/,'_');
			var id = 'D_i_'+dic;
			var label_id = 'toolsMenu_Dictionary'+'_'+newDic;
			var label = nls[label_id];
			var acc = dic.substr(0, 2).toUpperCase() + '.';
			pe.dicMenus[dic] =  new dijit.CheckedMenuItem(
			{
				id: id,
				label: acc + label,	
				title: acc + label,
				checked: false,
				//accelKey: label,
				onChange: function(checked)
				{								
					if(spellcheckerManager)
					{
						var myDic = this.id.replace(/D_i_/,'');
						var language = checked? myDic:'';
						setTimeout(function(){
							spellcheckerManager.setLanguage(language);
						}, 0);									
					}
				},
				dir: dirAttr
			});
		}
	}				
	for(var dic_locale in pe.dicMenus)
	{
		scLangSubMenu.addChild( pe.dicMenus[dic_locale] );	
	}								
	var scLangDics = new dijit.PopupMenuItem(
	{
		id: 'D_i_SelectDic',
		label: nls.toolsMenu_SelectDictionary,
	    popup: scLangSubMenu,	
		dir: dirAttr
	});
	dojo.style( scLangDics.arrowWrapper, 'visibility', '' );
	toolsMenu.addChild( scLangDics );			
	
    pe.autoSpellCheckMenu = new dijit.CheckedMenuItem(
			{
						id: "D_i_AutoSpellCheck",
						label: nls.viewMenu_AutomaticSpellCheck,
						checked: false,
						onChange: function(checked)
						{
							//pe.spellcheckMenu.setDisabled(checked);
							if(spellcheckerManager)
							{
								setTimeout(function(){
									var enable = !spellcheckerManager.isAutoScaytEnabled();
									spellcheckerManager.enableAutoScayt(enable);									
									if(pe && pe.settings)
									  pe.settings.setAutoSpellCheck(enable);
								}, 0);
								pe.lotusEditor.focus();
							}
						},
						dir: dirAttr
			});
    toolsMenu.addChild(pe.autoSpellCheckMenu);
	
    if(dojo.isSafari && dojo.isSafari < 5.1) {
    	pe.autoSpellCheckMenu.setDisabled(true);
    }
    
    if(pe.scene.showPreferences())
    {
	    var scPreferences = new dijit.MenuItem(
		        {
		        	id: 'D_i_Preferences',
		        	label: nls.toolsMenu_Preferences,
		            onClick: function() {			    	
		        		pe.scene.showPreferencesDailog();
		            },
				dir: dirAttr	
		        });
		toolsMenu.addChild(scPreferences);
    }
	        
	menubar.addChild( new dijit.PopupMenuBarItem(
	{
		id: 'D_m_Tools',
		label: nls.toolsMenu,
	    popup: toolsMenu,
		dir: dirAttr
	}));

	var helpMenu = new writer.ui.menu.Menu( {dir: dirAttr} );
	dojo.addClass(helpMenu.domNode,"lotusActionMenu");
	helpMenu.domNode.style.display ='none';
	document.body.appendChild(helpMenu.domNode);
	
	/*
	helpMenu.addChild( new dijit.MenuItem(
	{
	    label: editor.lang.menubar.helpcontent,
    	onClick: function()
	    	{
	    		//pe.lotusEditor.execCommand( '' );
	    	}
	}));
	helpMenu.addChild( new dijit.MenuItem(
	{
	    label: editor.lang.menubar.gettingstarted,
    	onClick: function()
	    	{
	    		//pe.lotusEditor.execCommand( '' );
	    	}
	}));
	*/
	helpMenu.addChild( new dijit.MenuItem(
	{
		id: 'D_i_Overview',
		label: nls.helpMenu_Overview,
	    iconClass: 'menubarAboutConcordIcon',
    	onClick: function()
	    	{
    			var helpWin = window.open( concord.main.App.TEXT_HELP_URL, "helpWindow", "width=800, height=800" );
    			helpWin.focus();
	    	},
		dir: dirAttr
	}));
//	gIs_cloud =true;
	!gIs_cloud&&helpMenu.addChild( new dijit.MenuItem(
			{
				id: 'D_i_HelpAbout',
				label: nls.helpMenu_About,		// NLS
		    	onClick: function()
			    	{
			    		pe.scene.aboutConcord();
			    	},
				dir: dirAttr
			}));
	
	var newFatureM = new dijit.MenuItem(
			{
				id: 'D_i_HelpNewFeatures',
				label: nls.helpMenu_NewFeatures,		// NLS
		    	onClick: function()
			    	{
			    		pe.scene.showNewFeatures();
			    	},
				dir: dirAttr
			})
	helpMenu.addChild( newFatureM );
	newFatureM.setDisabled(true);

	helpMenu.addChild( new dijit.MenuItem(
			{
				id: 'D_i_HelpTour',
				label: nls.helpMenu_Tour,		// NLS
		    	onClick: function()
			    	{
			    		pe.scene.showNewUserTour();
			    	},
				dir: dirAttr
			}));
	
	menubar.addChild( new dijit.PopupMenuBarItem(
	{
		id: 'D_m_Help',
		label: nls.helpMenu,
	    popup: helpMenu,
		dir: dirAttr
	}));
	
	// init menu bar status
	if(pe.settings)    
	{
//	  if( pe.settings.getSidebar() == pe.settings.SIDEBAR_COLLAPSE )
//	  {    	 
//		  pe.sidebarMenuItem.attr("checked", false);
//	  }
	  
	  //init toolbar
	  if( pe.settings.getToolbar() == pe.settings.TOOLBAR_NONE )
	  {    	 
		  pe.toolbarMenuItem.attr("checked", false);
	  }
	  
	  //init assignment
	  if (enableAssignment)
	  {
		  if( pe.settings.getAssignment() == false )
		  {    	 
			  pe.assignmentMenuItem.attr("checked", false);
		  }
	  }  
	  if (enableCoedit)
	  {
		  //init co-editing
		  if( pe.settings.getIndicator() == false )
		  {    	 
			  pe.coedtingMenuItem.attr("checked", false);
		  }
	  }
	  
	  // init dictionaries menu
	  for(var dic_locale in pe.dicMenus)
	  {
		  if(spellcheckerManager && spellcheckerManager.lang == dic_locale)
			  pe.dicMenus[dic_locale].attr("checked", true);  
		  else
			  pe.dicMenus[dic_locale].attr("checked", false);
	  }	

	  // per defect 44587, docx won't read autospellcheck setting, it is off by default
	  /*
	  if( !(dojo.isSafari && dojo.isSafari < 5.1) && pe.settings.getAutoSpellCheck() )
	  {
		  pe.autoSpellCheckMenu.attr("checked", true);
		  //pe.spellcheckMenu.setDisabled(true);					  
		  if(spellcheckerManager)
		  {
			  spellcheckerManager.setAutoScayt(true);
		  }					
	  }	*/					  
	  
	}
	
	menubar.placeAt(node);
	menubar.startup();
	

}