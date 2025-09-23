dojo.provide("websheet.config.MenubarConfig");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","menubar");
dojo.requireLocalization("concord.widgets","toolbar");
dojo.requireLocalization("websheet","base");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.uri");
dojo.require("concord.util.strings");

var fontMenuArray = [];
var SpellCheckDicsArray = [];
customizeFontsMenu = function(scene, isSheetProtected){
	var isViewMode = scene.isViewMode();
	for(var i = 0; i < fontMenuArray.length; i++){			
		var menuitem = dijit.registry.byId(fontMenuArray[i]);	
		if(menuitem){
			if(isViewMode || isSheetProtected){
				menuitem.set('disabled', true);
			}else{
				menuitem.set('disabled', false);
			}
		}
	}
};
customizeSpellCheckDics = function(scene, isSheetProtected){
	var isViewMode = scene.isViewMode();
	for(var i = 0; i < SpellCheckDicsArray.length; i++){			
		var menuitem = dijit.registry.byId(SpellCheckDicsArray[i]);	
		if(menuitem){
			if(isViewMode || isSheetProtected){
				menuitem.set('disabled', true);
			}else{
				menuitem.set('disabled', false);
			}
		}
	}
};

getACLViewSettings = function(){
	var viewACL =  websheet.Utils.getLocalStorageItem(websheet.Constant.ACLViewPrefix,true,true);
	var bShow = true;
	if(viewACL)
	{
		bShow = viewACL == "true" ? true : false;
	}
	return bShow;
};
getMenubarConfig = function(/*SheetDocScene*/scene){
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var teamNls = dojo.i18n.getLocalization("websheet", "base");
	var bSocialAssignment = websheet.Utils.isSocialEnabled();
	var bShowDownloadMenu = pe.scene.showDownloadMenu();   // GK to disable download menu from docs UI
	var bSocialCoedit = websheet.Utils.isCoeditEnabled();
	var isViewMode = scene.isViewMode();
	var MODE = websheet.Constant.ModeVisible;
	var numberMenu_onOpen = function() {
		var numberSubMenu = window["pe"].numberSubMenu;
		if (!numberSubMenu.bPopulated) {
			var menuItems = populateNumberFormatMenuItems(scene, false, numberSubMenu);
			scene.editor.getToolbar()._connectFormat(false);
			numberSubMenu.bPopulated = true;
		}
    };   
    
    var hiddenSheets_onOpen = function() {
    	window["pe"].hiddenSheetsSubMenu.destroyDescendants();
    	var sheets = scene.editor.getDocumentObj().getSheets();
    	for (var s=0; s<sheets.length; s++){
    		var sheetName = websheet.Helper.escapeXml(sheets[s].getSheetName(), null, true);   
    		sheetName = sheetName.replace(/ /g,"&nbsp;");
    		var sheetId = sheets[s].getId();
    		var sheetVis = sheets[s].getSheetVisibility();
    		if (sheetVis == "hide") {
    			window["pe"].hiddenSheetsSubMenu.addChild(_mItem = new dijit.MenuItem({
        			label: sheetName,
        			dir:(BidiUtils.isBidiOn() ? BidiUtils.getResolvedTextDir(sheetName) : ""),
        			id: "S_i_HiddenSheet_" + sheetId,
        			sheet_id: sheetId,
        			onClick: function(){
        				var name = scene.editor.getDocumentObj().getSheetName(this.sheet_id);
                        scene.editor.execCommand(commandOperate.UNHIDESHEET, [name]);
        			}
        		}));
    		}    		
    	}    	
    };
    
    var file_onOpen = function() {
    	if(scene.editor.hasACLInDoc() || scene.coedit)
    		disableItems(["S_i_Discard"],true);
    	else
    		disableItems(["S_i_Discard"],false);
    };
    
    var disableItems = function(idArray, disable) {
    	if(!idArray) return;
    	idArray.forEach(function(id){
    		var item = dijit.registry.byId(id);
    		if(item)
    		{
    			pe.menuItemDisabled(item,disable);
    		}
    	});
    };
    
    var acl_onOpen = function(args){
    	
    	if(websheet.model.ModelHelper.isSheetProtected() || !scene.editor.hasACLHandler()) return;
    	
    	var menuType = args.menuType;
    	var bhChecker = scene.editor.getACLHandler()._behaviorCheckHandler;
    	var curGrid = scene.editor.getCurrentGrid();
    	var sheetName = curGrid.sheetName;
    	
    	var selector = curGrid.selection.selector();
    	var addr = selector.getSelectedRangeAddress();
    	var canEdit = bhChecker.canCurUserEditRange(addr);
    	var type = selector.getSelectType();
    	var constant = websheet.Constant;
    	
    	if(menuType == "edit")
    	{
    		disableItems(["S_i_Cut","S_i_Paste"],!canEdit);
    		
        	var canEditSheet = bhChecker.canEditSheet(sheetName);
        	disableItems(["S_i_DeleteSheet", "S_i_HideSheet", "S_i_RenameSheet", "S_i_MoveSheet"], !canEditSheet);
        	
        	if((type != constant.Row && type != constant.RowRange) || selector.selectingSheet())
        	{
    			var start = selector._startColIndex, end = selector._endColIndex;
        		var canDlt = canEdit && bhChecker.canCurUserDlt(sheetName,start,end);
        		disableItems(["S_i_DeleteColumn"], !canDlt);
        	}
        	else
        		disableItems(["S_i_DeleteColumn"],true);
        	
    		if (type != constant.Column && type != constant.ColumnRange)
    		{
    			var start = selector._startRowIndex + 1, end = selector._endRowIndex + 1;
        		var canDlt = canEdit && bhChecker.canCurUserDlt(sheetName,start,end, true);
        		disableItems(["S_i_DeleteRow"], !canDlt);
    		}
    		else
    			disableItems(["S_i_DeleteRow"],true);
    		
    		if(!canEdit) {
    			disableItems(["S_i_DeleteCellLeft", "S_i_DeleteCellUp"], true);
    		}else{
    			var addrUp = websheet.Utils.getImpactedRange4InsertOrDel(true, true, addr);
    			var addrLeft = websheet.Utils.getImpactedRange4InsertOrDel(true, false, addr);
    			disableItems(["S_i_DeleteCellUp"], !bhChecker.canCurUserEditRange(addrUp));
    			disableItems(["S_i_DeleteCellLeft"], !bhChecker.canCurUserEditRange(addrLeft));
    		}
    	}
    	else if(menuType == "insert")
    	{
    		disableItems(["S_i_Function","S_i_InsertImage","S_i_InsertChart"],!canEdit);
    		
    		var type = selector.getSelectType();
    		
    		if(type != constant.Row && type != constant.RowRange)
    		{
    			var start = selector._startColIndex,
    				end = selector._endColIndex;
    			var ret = bhChecker.canCurUserInsert(sheetName,start,end);
    			disableItems(["S_i_InsertColumnBefore"], !ret.canInsertBefore);
    			disableItems(["S_i_InsertColumnAfter"],  !ret.canInsertAfter);
    		}
    		else
    			disableItems(["S_i_InsertColumnBefore","S_i_InsertColumnAfter"], true);
    		
    		if (type != constant.Column && type != constant.ColumnRange)
    		{
    			var start = selector._startRowIndex + 1,
    			    end = selector._endRowIndex + 1;
    			var ret = bhChecker.canCurUserInsert(sheetName,start,end, true);
    			disableItems(["S_i_InsertRowAbove"], !ret.canInsertBefore);
    			disableItems(["S_i_InsertRowBelow"], !ret.canInsertAfter);
    		}
    		else
    			disableItems(["S_i_InsertRowAbove","S_i_InsertRowBelow"], true);

    		if(!canEdit) {
    			disableItems(["S_i_InsertCellRight", "S_i_InsertCellDown"], true);
    		}else{
    			var addrDown = websheet.Utils.getImpactedRange4InsertOrDel(false, true, addr);
    			var addrRight = websheet.Utils.getImpactedRange4InsertOrDel(false, false, addr);
    			disableItems(["S_i_InsertCellDown"], !bhChecker.canCurUserEditRange(addrDown));
    			disableItems(["S_i_InsertCellRight"], !bhChecker.canCurUserEditRange(addrRight));
    		}
    	}
    	else if(menuType == "format")
    	{
    		var configs = menus[4].sub; // format menu configs
    		var ids =[];
    		configs.forEach(function(config){
    			if(config.id && config.id != "S_i_ImageProperties" && !config.aclMODE)
    			{
    				if(config.pid) ids.push(config.pid);
    				else ids.push(config.id);
    			}
    		});
    		disableItems(ids,!canEdit);
    	}
    	else if(menuType == "data")
    	{
    		disableItems(["S_i_Sort","S_i_Validation","S_i_InstantFilter"],!canEdit);
    	}
    };
    
    var view_onOpen = function(){
    	var sheets = scene.editor.getDocumentObj().getSheets();
    	var enable_hidden_sheets = false;
    	for (var s=0; s<sheets.length; s++){    		
    		var sheetVis = sheets[s].getSheetVisibility();
    		//veryhide sheet should not be taken into account
    		if (sheetVis == "hide") {
    			enable_hidden_sheets = true;
    			break;
    		}    		
    	}	
    	var menuitem = dijit.registry.byId("S_i_HiddenSheet");
    	if (menuitem){
    		window["pe"].menuItemDisabled(menuitem,!enable_hidden_sheets);  			
    	}
    	
    	menuitem = window["pe"].gridOnOffItem;
    	if (menuitem){
    		var off = scene.editor.getCurrentGrid().getOffGridLines();
    		menuitem.attr("checked", !off); 
    	}
    	
    };

    var getFontsMenu = function(param)
    {
        var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
    	var fontNameSubMenu = new dijit.Menu({ id: param.id, autoFocus: false, dir: dirAttr});
    	fontNameSubMenu.focus= function(){
    		scene.editor.focusFontName(true);
    	};
        dijit.setWaiState(fontNameSubMenu.domNode, "label", param.label);
        dojo.addClass(fontNameSubMenu.domNode,"lotusActionMenu");        
        var fonts = concord.editor.PopularFonts.getLangSpecFontArray();
        for (var i = 0; i < fonts.length; ++i) {
            var label = fonts[i];           
            var id = "S_i_FONT_" + label.replace(/ /g,"_");
        	fontNameSubMenu.addChild(_mItem = new dijit.CheckedMenuItem({
                label: label,
                id: id,
                style: {fontFamily: label},
                onClick: function(){
                   scene.editor.execCommand(commandOperate.FONT, [this.label]);
                },
                dir: dirAttr
            }));
        	fontMenuArray.push(id);
        	dijit.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
        }
    	return fontNameSubMenu;
    };    
    
    var createSpellCheckDics = function(param){
	var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
    	var scLangSubMenu = new dijit.Menu({
    		id: param.id ,
    		dir: dirAttr,
    		baseClass: "concordMenuStyle"
    	});	
    	dojo.addClass(scLangSubMenu.domNode,"lotusActionMenu"); 
    	window["pe"].dicMenus = new Array();
    	// TODO need to make one submenu being 'instanstiated' when open.
    	// Make spell check engine as one extra function of spreadsheet, maintain one list of supported languages here,
    	// spell check code should be refactored later to keep the list in one configuration file.
    	// workaround here to get default language if spell check engine isn't loaded
    	var supportedLang = ['ca-CT','cs-CZ','da-DK','nl-NL','en-AU','en-GB','en-US','fi-FI','fr-FR','fr-CA','de-DE','de-CH','el-GR','it-IT','pl-PL','pt-BR','pt-PT','ru-RU','es-ES','sv-SE','nb-NO','nn-NO','he-IL'];
    	var lang = window.spellcheckerManager && window.spellcheckerManager.lang;
    	if (!lang) {
    		var language =  g_locale || navigator.userLanguage || navigator.language;
    		var l = language.substr(0, 2).toLowerCase();
    		var region = language.substr(3, 2).toUpperCase();
    		var normalizedLang = l + "-" + region;
    		for (var i = 0; i < supportedLang.length; ++i) {
    			if (supportedLang[i] == normalizedLang) {
    				lang = normalizedLang;
    				break;
    			}
    		}
    		if (!lang) lang = websheet.i18n.Number.Lang2Locale[l];
    		if (!lang) lang = websheet.i18n.Number.Lang2Locale["en"];
    	}
//    	if(spellcheckerManager)
    	{
//    		for(var i=0; i<spellcheckerManager.supportedLang.length; i++)
    		for(var i=0; i<supportedLang.length; i++)
    		{
//    			var dic = spellcheckerManager.supportedLang[i];
    			var dic = supportedLang[i];
    			var newDic = dic.replace(/-/,'_');
    			var id = 'S_i_'+dic;
    			var label_id = 'toolsMenu_Dictionary'+'_'+newDic;
    			var label = menuStrs[label_id];
    			var acc = dic.substr(0, 2).toUpperCase() + '.';
    			window["pe"].dicMenus[dic] =  new dijit.CheckedMenuItem(
    			{
    				id: id,
    				label: acc + label,
    				title: acc + label,
    				checked: false,
    				//accelKey: label,
    				onChange: function(checked)
    				{								
//    					if(spellcheckerManager)
    					{
    						var myDic = this.id.replace(/S_i_/,'');
    						var language = checked? myDic:'';
    						dojo["require"]("concord.concord_sheet_extras");
    						setTimeout(function(){
    							spellcheckerManager.setLanguage(language);
    							scene.editor.focus2Grid();
    						}, 0);
    					}
    				},
    				dir: dirAttr
    			});
    			SpellCheckDicsArray.push(id);
    		}
    	}
    	
    	var dicMenus = window["pe"].dicMenus;
    	for(var dic_locale in dicMenus)
    	{
    		scLangSubMenu.addChild( dicMenus[dic_locale] );	
    		if(lang == dic_locale)
    			dicMenus[dic_locale].attr("checked", true);  
    		else
    			dicMenus[dic_locale].attr("checked", false);
    	}
    	
    	return scLangSubMenu;
    };
	/**
	 * if no 'showMODE' property means this should show under every mode
	 * if no 'disable' property means should use value false
	 * if no 'isShow' property means should use value true
	 * varIsMenu is used for what value is setted to variable, if not use this, pe[variable]= popupMenuItem,if true, pe[variable]= popupMenu
	 * 
	 * There are two kinds of menu item, with property checkedMenuItem:true is CheckedMenuItem, else is MenuItem
	 * 
	 * There are two method to add sub menus to popup menu
	 * 1: add sub[] in configuration to add them recursively
	 * 2: add popupMethod in configuration, add sub menus with method
	 * 
	 * For accLabel
	 * 1: if type is POPUPMENUBAR or POPUPMENU, should always add label property, if not set this value, use label 
	 * 2: if type is MENUITEM, should remove labelby, and add label if set this value, else only add labelby property 	 
	 */
	var menus=
	[
	 // File Menu
		{
			id: "S_m_File" ,
			pid: "S_i_File",
			type: websheet.Constant.MenuBarType.POPUPMENUBAR,
			label: menuStrs.fileMenu,
			event:[{ eventName:'onOpen', eventFunc: file_onOpen}],
			sub:[
					{
						id: "S_i_Share",
						isShow: scene.showShareMenu(),
						type:websheet.Constant.MenuBarType.MENUITEM,
						label:menuStrs.fileMenu_ShareWith,
						showMODE: MODE.EDITMODEVISIBLE,
						command:commandOperate.SHAREWITH
//						,
//						tooltip:{tip:"This is a sample for tool tip on share menu item.", pos:"after"}
					},
					{
						type:websheet.Constant.MenuBarType.MENUSEPORATOR,
						showMODE: MODE.EDITMODEVISIBLE
					},
	 		     	{
	 		     		id: "S_m_New",
	 			 		pid: "S_i_New",
	 			 		isShow: scene.showNewMenu(),
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU, 
		 		     	label: menuStrs.fileMenu_New,
		 		     	showMODE: MODE.EDITMODEVISIBLE,		 		     	
		 		     	sub:[
		 	 		     	{
		 	 		     		id: "S_i_NewDocument",
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.fileMenu_NewDocument,
		 		 		     	command:commandOperate.NEWDOCUMENT
		 	 				},
		 	 				{
		 	 		     		id: "S_i_NewSpreadsheet",
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.fileMenu_NewSpreadsheet,
		 		 		     	command:commandOperate.NEWSPREADSHEET
		 	 				},
		 	 				{
		 	 		     		id: "S_i_NewPresentation",
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.fileMenu_NewPresentation,
		 		 		     	command:commandOperate.NEWPRESENTATION
		 	 				}
//		 	 				{
//			 		     		id: "S_m_New_fromTemplate",
//			 			 		pid: "S_i_NewFromTemplate",
//				 		     	type: websheet.Constant.MenuBarType.POPUPMENU,				 		     	
//				 		     	label: menuStrs.fileMenu_NewFromTemplate,
//				 		     	isShow: scene.showShareMenu(),
//				 		     	showMODE: MODE.EDITMODEVISIBLE,
//				 		     	sub:[
//				 	 		     	{
//				 	 		     		id: "S_i_NewDocumentTpl",		 	 			 		
//				 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,				 		 		     	
//				 		 		     	label:menuStrs.fileMenu_NewDocument,
//				 		 		     	command:commandOperate.NEWDOCUMENTTEMPLATE
//				 	 				},
//				 	 				{
//				 	 		     		id: "S_i_NewSpreadsheetTpl",
//				 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,				 		 		     	
//				 		 		     	label:menuStrs.fileMenu_NewSpreadsheet,
//				 		 		     	command:commandOperate.NEWSPREADSHEETFROMTEMPLATE
//									}
//								]
//							}
		 	 			]
					},
	 				{
	 			 		pid: "S_i_recentOpenFiles",
	 			 		isShow: scene.showRecentFilesMenu(),
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU,
		 		     	label: menuStrs.fileMenu_RecentFile,
		 		        popupMethod: scene.getRecentFilesMenu,
		 		        showMODE: MODE.EDITMODEVISIBLE,
		 		     	variable: "recentFileMenuItem"
	 				},
	 				{
 	 		     		id: "S_i_Import",
 	 		     		isShow: scene.showNewMenu(),
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
 		 		     	label:menuStrs.fileMenu_Import,
 		 		     	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
 		 		     	showMODE: MODE.EDITMODEVISIBLE,
 		 		     	command:commandOperate.IMPORT
 	 				},
	 				{
 	 		     		id: "S_i_ViewFileDetails",
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
 		 		     	label:menuStrs.fileMenu_ViewFileDetails,
 		 		     	showMODE: MODE.EDITMODEVISIBLE,
 		 		     	privatecommand:function()
 		 				{
 		 		     		scene.goBackToFileDetails();
 		 				},
 		 		     	isShow: scene.showFileDetailMenu()
 	 				},
 	 				
 	 				{
 	 		     		id: "S_i_Discard", 		
 	 		     		isShow: scene.showDiscardMenu(),
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,
 		 		     	label:menuStrs.fileMenu_Discard,
 		 		     	showMODE: MODE.EDITMODEVISIBLE,
 		 		     	command:commandOperate.DISCARDDRAFT,
 		 		     	variable: "discardMenuItem"
 	 				},
 	 				
 	 				{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR, 
		 		     	showMODE: MODE.EDITMODEVISIBLE
	 				},
	 				{
 	 		     		id: "S_i_Settings",
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,
 		 		     	label:menuStrs.fileMenu_SpreadsheetSettings,
 		 		     	command:commandOperate.SPREADSHEETSETTINGS
 	 				},
 	 				{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR		 		     		 		 		     
	 				},
	 				{
 	 		     		id: "S_i_Save",
 	 		     		isShow: DOC_SCENE.isPublishable && (concord.util.uri.isExternal() || concord.util.uri.isECMDocument()),
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,
 		 		     	label: (window.gTPRepoName != "") ? dojo.string.substitute(menuStrs.fileMenu_PublishVersion3,[window.gTPRepoName]): menuStrs.fileMenu_PublishVersion2,
 		 		     	showMODE: MODE.EDITMODEVISIBLE,
 		 		     	command: commandOperate.SAVEVERSION 		 		     	
 	 				},
 	 				{
 	 		     		id: "S_i_SaveAs",
 	 		     		isShow: scene.showSaveAsMenu(),
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
 		 		     	label:menuStrs.fileMenu_SaveAs,
 		 		     	showMODE: MODE.EDITMODEVISIBLE,
 		 		     	command:commandOperate.SAVEAS
 	 				},
	 				{
 	 		     		id: "S_i_Revision",		 	 			 		
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
 		 		     	label:menuStrs.filemenu_revisionhistory,
 		 		     	command:commandOperate.SHOWREVISION,
 		 		     	showMODE: g_revision_enabled ? MODE.EDITMODEVISIBLE : MODE.INVISIBLE
 	 				},
 	 		     		{
 	 		     		id: "S_i_AutoPublish",		
 	 		     		isShow: scene.showSetAutoPublishMenu(),
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
 		 		     	label:(concord.util.uri.isExternal() ? ((window.gTPRepoName != "") ? dojo.string.substitute(menuStrs.fileMenu_AutoPublish3,[window.gTPRepoName]): menuStrs.fileMenu_AutoPublish2) : pe.scene.showCheckinMenu()? menuStrs.fileMenu_AutoCheckIn:menuStrs.fileMenu_AutoPublish),
 		 		     	checkedMenuItem: true,
 		 		     	checked: pe.scene.autoPublishSet(),
 		 		     	disabled: !pe.scene.autoPublishFeature(),
 		 		     	showMODE: MODE.EDITMODEVISIBLE,	 		     	     
 		 		     	command:commandOperate.SETAUTOPUBLISH,
 		 		     	variable: "autoPublishMenuItem"
 		 		     	//tooltip: {tip: menuStrs.fileMenu_AutoPublish_Tips, pos: "after"}
 	 				}, 	 				
 	 				{
 	 		     		id: "S_i_Publish",		
 	 		     		isShow: DOC_SCENE.isPublishable && !concord.util.uri.isExternalREST(),
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
 		 		     	label: scene.showCheckinMenu() ? menuStrs.fileMenu_CheckinVersion : menuStrs.fileMenu_PublishVersion,
 		 		     	showMODE: MODE.EDITMODEVISIBLE,
 		 		     	command:commandOperate.PUBLISHDIALOG,
 		 		     	variable: "publishMenuItem",
 		 		     	disabled: scene.isNeedRenderSFR()
 	 				},
	 				{
	 		     		id: "S_m_Export",
	 		     		isShow: bShowDownloadMenu,
	 		     		pid: "S_i_Export",
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU,
		 		     	label: menuStrs.fileMenu_Download,
		 		     	showMODE: MODE.EDITMODEVISIBLE,
		 		     	sub:[
		 	 		     	{
		 	 		     		id: "S_i_ExportToCSV",
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.fileMenu_ExportToCSV,
		 		 		     	command:commandOperate.EXPORTTOCSV
		 	 				},
			 				{
		 	 		     		id: "S_i_ExportToPDF",
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
		 		 		     	label:concord.util.strings.getBidiRtlFormatStr(menuStrs.fileMenu_ExportToPDF),
		 		 		     	showMODE: MODE.EDITMODEVISIBLE | MODE.OBSERVERMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE | MODE.HTMLVIEWINVISIBLE,
		 		 		     	command:commandOperate.EXPORTTOPDF
		 	 				},
			 				{
		 	 		     		id: "S_i_ExportToDEFAULT",
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
		 		 		     	label: concord.util.strings.getDefaultFileFormatStr(menuStrs.fileMenu_ExportToMS, menuStrs.fileMenu_ExportToODF),
		 		 		     	showMODE: MODE.EDITMODEVISIBLE | MODE.OBSERVERMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE | MODE.HTMLVIEWINVISIBLE,
		 		 		     	command:commandOperate.EXPORTTODEFAULT,
		 		 		     	isShow: (concord.util.strings.getDefaultFileFormatStr(menuStrs.fileMenu_ExportToMS, menuStrs.fileMenu_ExportToODF) == "csv") ? false : true
		 	 				}		 	 		 	 				
		 	 		    ]
	 				}, 	 				
 	 				{
 	 		     		id: "S_i_SFR",		
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM, 	
 	 		     		isShow: true,	 		     	
 		 		     	label: menuStrs.fileMenu_SubmitForReview,
 		 		     	showMODE: MODE.EDITMODEVISIBLE,
 		 		     	command:commandOperate.SFRDIALOG,
 		 		     	variable: "reviewMenuItem",
 		 		     	disabled: !scene.isNeedRenderSFR()
 	 				},
 	 				{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR,
		 		     	isShow: bShowDownloadMenu,
		 		     	showMODE: MODE.EDITMODEVISIBLE
	 				},
	 				{
 	 		     		id: "S_i_PrintToPDF",
 	 		     		isShow: bShowDownloadMenu,
 		 		     	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
 		 		     	label:menuStrs.fileMenu_PrintToPDF,
 		 		     	showMODE: MODE.EDITMODEVISIBLE | MODE.OBSERVERMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE | MODE.HTMLVIEWINVISIBLE,
 		 		     	command:commandOperate.EXPORTTOPDF
 	 				} 	 				
	 		     ]
	 	},
	 	
	 	//Edit Menu
	 	{
	 		id: "S_m_Edit",
	 		pid: "S_i_Edit",
	 		type: websheet.Constant.MenuBarType.POPUPMENUBAR,
	 		label: menuStrs.editMenu,
	 		event:[{ eventName:'onOpen', eventFunc: acl_onOpen, eventArgs:{menuType:'edit'}}],
	     	sub:[
 		     	{
 		     		id: "S_i_Undo",		 	 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.editMenu_Undo,
	 		     	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
	 		     	accelKey: dojo.isMac? menuStrs.accel_editMenu_Undo_Mac : menuStrs.accel_editMenu_Undo,
	 		        accLabel: menuStrs.editMenu_Undo + " " + ( dojo.isMac? menuStrs.accel_editMenu_Undo_Mac : menuStrs.accel_editMenu_Undo),
	 		     	command:commandOperate.UNDO,
	 		     	variable: "sheetUndoMenuItem",
	 		     	disabled:true
 				},
 				{
 		     		id: "S_i_Redo",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.editMenu_Redo,
	 		     	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
	 		     	accelKey: dojo.isMac? menuStrs.accel_editMenu_Redo_Mac : menuStrs.accel_editMenu_Redo,
	 		        accLabel: menuStrs.editMenu_Redo  + " " + (dojo.isMac? menuStrs.accel_editMenu_Redo_Mac : menuStrs.accel_editMenu_Redo),
	 		     	command:commandOperate.REDO,
	 		     	variable: "sheetRedoMenuItem",
	 		     	disabled:true
 				},
 				{
	 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR, 
	 		     	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE
 				},
 				{
 					id: "S_i_Cut",
 					type:websheet.Constant.MenuBarType.MENUITEM,
 					label:menuStrs.editMenu_Cut,
 					showMODE: MODE.EDITMODEVISIBLE,
 					accelKey: dojo.isMac?  menuStrs.accel_editMenu_Cut_Mac : menuStrs.accel_editMenu_Cut,
 					accLabel: menuStrs.editMenu_Cut + " " + (dojo.isMac?  menuStrs.accel_editMenu_Cut_Mac : menuStrs.accel_editMenu_Cut),
 					command:commandOperate.CUT
				},
				{
			     	id: "S_i_Copy",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.editMenu_Copy,
	 		     	accelKey: dojo.isMac? menuStrs.accel_editMenu_Copy_Mac : menuStrs.accel_editMenu_Copy,
	 		        accLabel: menuStrs.editMenu_Copy  + " " + (dojo.isMac? menuStrs.accel_editMenu_Copy_Mac : menuStrs.accel_editMenu_Copy),
	 		     	command:commandOperate.COPY		     
				},
				{
			     	id: "S_i_Paste",		 	 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.editMenu_Paste,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	accelKey: dojo.isMac? menuStrs.accel_editMenu_Paste_Mac : menuStrs.accel_editMenu_Paste,
	 		        accLabel: menuStrs.editMenu_Paste  + " " + (dojo.isMac? menuStrs.accel_editMenu_Paste_Mac : menuStrs.accel_editMenu_Paste),
	 		     	command:commandOperate.PASTE
				},
				{
	 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR
 				},
 				{
 		     		id: "S_i_DeleteSheet",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.editMenu_DeleteSheet,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	command:commandOperate.DELETESHEET,
	 		     	variable: "deleteSheetItem"
 				},
				{
			     	id: "S_i_HideSheet",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.editMenu_HideSheet,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	command:commandOperate.HIDESHEET
				},
 				{
			     	id: "S_i_RenameSheet",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,
	 		     	label:menuStrs.editMenu_RenameSheet,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	command:commandOperate.RENAMESHEET		     
				},
				{
			     	id: "S_i_MoveSheet",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.editMenu_MoveSheet,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	command:commandOperate.MOVESHEET
				},
				{
	 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR, 
	 		     	showMODE: MODE.EDITMODEVISIBLE		 		 		     
 				},
				{
			     	id: "S_i_DeleteRow",		 	 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.editMenu_DeleteRow,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
	 		     	command:commandOperate.DELETEROW,
	 		     	variable: "deleteRowItem"
				},
				{
			     	id: "S_i_DeleteColumn",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.editMenu_DeleteColumn,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
	 		     	command:commandOperate.DELETECOLUMN,
	 		     	variable: "deleteColItem"
				},
				{
			     	id: "S_i_DeleteCellLeft",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,
	 		     	label:menuStrs.editMenu_DeleteCellLeft,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
	 		     	command:commandOperate.DELETECELL,
	 		     	variable: "deleteCellItem"
				},
				{
			     	id: "S_i_DeleteCellUp",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,
	 		     	label:menuStrs.editMenu_DeleteCellUp,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
	 		     	command:commandOperate.DELETECELLUP,
	 		     	variable: "deleteCellItem"
				},
				{
	 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR, 
	 		     	showMODE: MODE.EDITMODEVISIBLE		 		 		     
 				},
 				{
			     	id: "S_i_FindReplace",		 	 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:isViewMode ? menuStrs.editMenu_Find : menuStrs.editMenu_FindReplace, 	 		     	
	 		     	command:commandOperate.FIND,
	 		     	accelKey: dojo.isMac? menuStrs.accel_editMenu_Find_Mac : menuStrs.accel_editMenu_Find,
	 		 		accLabel: menuStrs.editMenu_FindReplace  + " " + (dojo.isMac? menuStrs.accel_editMenu_Find_Mac : menuStrs.accel_editMenu_Find)
				}
 			]
	 	},
	 	
	 	//View Menu
	 	{
	 		id: "S_m_View",
	 		pid: "S_i_View",
	 		type: websheet.Constant.MenuBarType.POPUPMENUBAR,
	 		label: menuStrs.viewMenu,
	 		event:[{ eventName:'onOpen', eventFunc: view_onOpen}],
	     	sub:[
 		     	{
 		     		id: "S_i_Toolbar",		 	 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.viewMenu_Toolbar,
	 		     	checkedMenuItem: true,
	 		     	checked: true,
	 		     	showMODE: MODE.EDITMODEVISIBLE,	 		     	     
	 		     	command:commandOperate.SHOWORHIDETOOLBAR,
	 		     	variable: "toolbarMenuItem"
 				},
// 				{
// 		     		id: "S_i_Sidebar",		 	 			 		
//	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
//	 		     	label:menuStrs.viewMenu_Sidebar,
//	 		     	checkedMenuItem: true,
//	 		     	checked: true,
//	 		     	command:commandOperate.SHOWORHIDESIDEBAR,
//	 		     	showMODE: MODE.EDITMODEVISIBLE | MODE.OBSERVERMODEVISIBLE,
//	 		     	variable: "sidebarMenuItem"
// 				},
 				{
 		     		id: "S_i_FormulaBar",		 	 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.viewMenu_Formulabar,
	 		     	checkedMenuItem: true,
	 		     	checked: true,
	 		     	command:commandOperate.SHOWORHIDEFORMULA,
	 		     	showMODE: MODE.EDITMODEVISIBLE | MODE.OBSERVERMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE | MODE.HTMLVIEWINVISIBLE,
	 		     	variable: "FormulaBarMenuItem"
 				},
// 				{
// 					id: "S_i_StatusBar",
// 					type:websheet.Constant.MenuBarType.MENUITEM,	
// 					label:menuStrs.viewMenu_Statusbar,
// 					showMODE: MODE.EDITMODEVISIBLE|MODE.VIEWDRAFTMODEVISIBLE
// 				},
 				{
 		     		id: "S_i_Navigator",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.viewMenu_Navigator,
	 		     	command:commandOperate.NAVIGATOR
 				},
 				{		 	 		     			 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR
 				},
 				{
 		     		id: "S_i_AssignmentsIndicator",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.viewMenu_Assignment,
	 		     	checkedMenuItem: true,
	 		     	isShow: bSocialAssignment,
	 		     	command:commandOperate.SHOWORHIDETASK,
	 		     	variable: "assignmentsMenuItem"
 				},
 				{
 		     		id: "S_i_CoeditingHighlights",		 	 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.viewMenu_Coediting,
	 		     	checkedMenuItem: true,
	 		     	checked: true,
	 		     	isShow: bSocialCoedit,
	 		     	command:commandOperate.UserIndicator,
	 		     	showMODE: MODE.EDITMODEVISIBLE | MODE.OBSERVERMODEVISIBLE,
	 		     	variable: "coeditingIndicatorMenuItem"
 				},
 				{		 	 		     			 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR, 
	 		     	isShow: bSocialAssignment || bSocialCoedit
 				},
 				{
 		     		id: "S_i_ShowUnsupportWarning",
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.viewMenu_UnsupportWarning,
	 		     	showMODE: MODE.EDITMODEVISIBLE,
	 		     	checkedMenuItem: true,
	 		     	checked: window["pe"].settings?window["pe"].settings.getShowUnsupportedFeature():true,		 		     
	 		     	command:commandOperate.SHOWUNSUPP,
	 		     	variable: "showUnsupportMenuItem"
 				},
 				{
	 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
 				},
 				{
 					id:"S_i_ViewACL",
 					type:websheet.Constant.MenuBarType.MENUITEM,
 					label:menuStrs.viewMenu_ACL,
 					checkedMenuItem: true,
 					isShow:g_enableACL,
 					checked: getACLViewSettings(),
 					showMODE: MODE.EDITMODEVISIBLE,
 					command:commandOperate.SHOWORHIDEACL
 				},
 				{
 					isShow:g_enableACL,
	 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
 				},
 				{
 					id: "S_m_HiddenSheet",
			 		pid: "S_i_HiddenSheet",
			 		type: websheet.Constant.MenuBarType.POPUPMENU,
			 		label: menuStrs.viewMenu_HiddenSheets,
			 		event:[{ eventName:'onOpen', eventFunc: hiddenSheets_onOpen}],
			 		showMODE: MODE.EDITMODEVISIBLE,
			 		variable: "hiddenSheetsSubMenu",
	 		     	varIsMenu:true
 				},
 				{
 					type:websheet.Constant.MenuBarType.MENUSEPORATOR
 				},
 				{
 		     		id: "S_m_FreezeRows",
 			 		pid: "S_i_FreezeRows",
	 		     	type: websheet.Constant.MenuBarType.POPUPMENU, 
	 		     	label: menuStrs.viewMenu_FreezeRows,
	 		     	showMODE: MODE.EDITMODEVISIBLE|MODE.VIEWDRAFTMODEVISIBLE,
	 		     	sub:[
	 		     	     {
	 		     	    	id: "S_i_NoFrozenRow",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:menuStrs.viewMenu_NoFrozenRows,
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:0}]);
					        }
	 		     	     },
	 		     	     {
	 		     	    	type:websheet.Constant.MenuBarType.MENUSEPORATOR
	 		     	     },
	 		     	     {
	 		     	    	id: "S_i_FreezeOneRow",		 	 			 		
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeOneRow, [1]),
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:1}]);
					        }
		 		     	  },
		 		     	  {
		 		     		id: "S_i_FreezeTwoRow",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [2]),
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:2}]);
					        }
		 		     	  },
		 		     	  {
		 		     		id: "S_i_FreezeThreeRow",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [3]),
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:3}]);
					        }
		 		     	  },
		 		     	  {
		 		     		id: "S_i_FreezeFourRow",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [4]),
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:4}]);
					        }
		 		     	  },
		 		     	  {
		 		     		id: "S_i_FreezeFiveRow",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [5]),
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:5}]);
					        }
		 		     	  },
		 		     	  {
		 		     		id: "S_i_FreezeSixRow",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [6]),
						   	privatecommand:function()
						   	{
					            scene.editor.freezeWindow({row:6});
					        }
		 		     	  },
		 		     	  {
		 		     		id: "S_i_FreezeSevenRows",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [7]),
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:7}]);
					        }
		 		     	  },
		 		     	  {
		 		     		id: "S_i_FreezeEightRow",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [8]),
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:8}]);
					        }
		 		     	  },
		 		     	  {
		 		     		id: "S_i_FreezeNineRow",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [9]),
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:9}]);
					        }
		 		     	  },
		 		     	  {
		 		     		id: "S_i_FreezeTenRow",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXRows, [10]),
						   	privatecommand:function()
						   	{
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{row:10}]);
					        }
		 		     	  }
	 		     	]
 				},
 				{
					id: "S_m_FreezeColumns",
					pid: "S_i_FreezeColumns",
				   	type:websheet.Constant.MenuBarType.POPUPMENU, 	
				   	label:menuStrs.viewMenu_FreezeColumns,
				   	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
				   	sub:[
				   	     {
				   	    	id: "S_i_NoFrozenColumn",		 	 			 		
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:menuStrs.viewmenu_NoFrozenColumns,
						   	privatecommand:	function(){
					            scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{col:0}]);
					        }
				   	     },
				   	     {
				   	    	type:websheet.Constant.MenuBarType.MENUSEPORATOR
				   	     },
				   	     {
				   	    	id: "S_i_FreezeOneColumn",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeOneColumn, [1]),
						   	privatecommand:	function(){
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{col:1}]);
					        }
				   	     },
				   	     {
				   	    	id: "S_i_FreezeTwoColumn",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXColumns, [2]),
						   	privatecommand:	function(){
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{col:2}]);
					        }
				   	     },
				   	     {
				   	    	id: "S_i_FreezeThreeColumn",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXColumns, [3]),
						   	privatecommand:	function(){
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{col:3}]);
					        }
				   	     },
				   	     {
				   	    	id: "S_i_FreezeFourColumn",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXColumns, [4]),
						   	privatecommand:	function(){
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{col:4}]);
					        }
				   	     },
				   	     {
				   	    	id: "S_i_FreezeFiveColumn",
						   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
						   	label:dojo.string.substitute(menuStrs.viewMenu_FreezeXColumns, [5]),
						   	privatecommand:	function(){
						   		scene.editor.execCommand(commandOperate.FREEZEWINDOW,[{col:5}]);
					        }
				   	     }
				   	 ]
				},
 				{		 	 		     			 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR
 				},				
 		     	{
 		     		id: "S_i_GridOnOff",		 	 			 		
	 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     	label:menuStrs.viewMenu_GridOnOff,
	 		     	checkedMenuItem: true,
	 		     	checked: true,
	 		     	showMODE: MODE.EDITMODEVISIBLE,	 		     	     
	 		     	command:commandOperate.SHOWORHIDEGRIDLINES,
	 		     	variable: "gridOnOffItem"
 				}				
 			]
	 	},
	 	// Insert Menu
	 	{
	 		id: "S_m_Insert",
	 		pid: "S_i_Insert",
	 		type: websheet.Constant.MenuBarType.POPUPMENUBAR,
	 		label: menuStrs.insertMenu,
	 		showMODE: MODE.EDITMODEVISIBLE,
	 		event:[{ eventName:'onOpen', eventFunc: acl_onOpen, eventArgs:{menuType:'insert'}}],
	 		sub:[
	 		     	{
						id: "S_i_InsertRowAbove",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.insertMenu_RowAbove,
					   	command:commandOperate.INSERTROW,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	variable: "insertRowItem"
					},
					{
						id: "S_i_InsertRowBelow",
						type:websheet.Constant.MenuBarType.MENUITEM,
						label:menuStrs.insertMenu_RowBelow,
						command:commandOperate.INSERTROWBELOW,
						protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
						variable: "insertRowItem"
					},
					{
						id: "S_i_InsertColumnBefore",
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.insertMenu_ColumnBefore,
					   	command:commandOperate.INSERTCOLUMN,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	variable: "insertColItem"
					},
					{
						id: "S_i_InsertColumnAfter",
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	label:menuStrs.insertMenu_ColumnAfter,
					   	command:commandOperate.INSERTCOLUMNAFTER,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	variable: "insertColItem"
					},
					{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
	 				},
	 				{
						id: "S_i_InsertCellRight",
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	label:menuStrs.insertMenu_CellRight,
					   	command:commandOperate.INSERTCELL,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	variable: "insertCellItem"
					},
					{
						id: "S_i_InsertCellDown",
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	label:menuStrs.insertMenu_CellDown,
					   	command:commandOperate.INSERTCELLDOWN,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	variable: "insertCellItem"
					},
					{
					  	type:websheet.Constant.MenuBarType.MENUSEPORATOR
					},
	 				{
						id: "S_i_InsertSheet",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.insertMenu_Sheet,
					   	command:commandOperate.INSERTSHEET,
					   	protectMODE: websheet.Constant.ProtectVisible.WORKBOOKPROTECTINVISIBLE,
					   	variable: "insertSheetItem"
					},
					{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
	 				},
	 		     	{
	 		     		id: "S_m_Function",
	 			 		pid: "S_i_Function",
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU, 
		 		     	label: menuStrs.insertMenu_Function,
		 		     	sub:[
								{
									id: "S_i_FunctionSum",
								   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
								   	label:websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[0]).toUpperCase(),
								   	command:commandOperate.SUMFORMULA,
								   	variable: "formulaSumItem"
								},
								{
									id: "S_i_FunctionAverage",		 	 			 		
								   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
								   	label:websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[1]).toUpperCase(),
								   	command:commandOperate.AVERAGEFORMULA,
								   	variable: "formulaAvgItem"
								},
								{
									id: "S_i_FunctionCount",		 	 			 		
								   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
								   	label:websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[2]).toUpperCase(),
								   	command:commandOperate.COUNTFORMULA,
								   	variable: "formulaCountItem"
								},
								{
									id: "S_i_FunctionMax",		 	 			 		
								   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
								   	label:websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[3]).toUpperCase(),
								   	command:commandOperate.MAXFORMULA,
								   	variable: "formulaMaxItem"
								},
								{
									id: "S_i_FunctionMin",		 	 			 		
								   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
								   	label:websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[4]).toUpperCase(),
								   	command:commandOperate.MINFORMULA,
								   	variable: "formulaMinItem"
								},
								{
									id: "S_i_FunctionMore",
								   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
								   	label:menuStrs.insertMenu_FunctionMore,
								   	command:commandOperate.ALLFORMULAS
								}
		 	 		      ]
	 				},
	 				{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
	 				},
	 				{
						id: "S_i_InsertImage",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.insertMenu_Image,
					   	command:commandOperate.INSERTIMAGE,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	variable: "insertImageItem"
					},
					{
						id: "S_i_InsertChart",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.insertMenu_Chart,
					   	command:commandOperate.INSERTCHART,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	variable: "insertChartItem"
					},
					{		 	 		     			 			 		
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
	 				},
	 		     	{
	 		     		id: "S_m_Named",
	 			 		pid: "S_i_Named",
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU, 
		 		     	label: menuStrs.insertMenu_NameRange,
		 		     	sub:[
								{
									id: "S_i_NamedRangeNew",
								   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
								   	label:menuStrs.insertMenu_NameRangeNew,
								   	command:commandOperate.NAMERANGE
								},
								{
									id: "S_i_NamedRangeManage",		 	 			 		
								   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
								   	label:menuStrs.insertMenu_NameRangeManage,
								   	command:commandOperate.MANAGERANGE
								}
		 	 		      ]
	 				}
	 		  ]
	 	},
	 	
	 //Format Menu
	 	{
	 		id: "S_m_Format",
	 		pid: "S_i_Format",
	 		type: websheet.Constant.MenuBarType.POPUPMENUBAR,
	 		label: menuStrs.formatMenu,
	 		showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
	 		protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
	 		event:[{ eventName:'onOpen', eventFunc: acl_onOpen, eventArgs:{menuType:'format'}}],
	 		sub:[
					{
						id: "S_i_ImageProperties",
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	showMODE: MODE.EDITMODEVISIBLE,
					   	disabled: true,
					   	label:menuStrs.formatMenu_Properties,						  
					   	command:commandOperate.IMAGEPROPERTIES
					},
	 				{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR,
		 		     	showMODE: MODE.EDITMODEVISIBLE
	 				},
	 		     	{
						id: "S_i_DefaultFormatting",
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:toolbarStrs.removeFormatTip,						  
					   	command:commandOperate.DEFAULTSTYLE,
					   	showMODE: MODE.EDITMODEVISIBLE,	
					   	variable: "defaultFormatting"
					},
	 		     	{
						id: "S_m_FontName",
				 		pid: "S_i_FontName",
				 		type: websheet.Constant.MenuBarType.POPUPMENU,
				 		label: menuStrs.formatMenu_FontName,
				 		popupMethod: getFontsMenu,
				 		showMODE: MODE.EDITMODEVISIBLE,	
				 		variable: "fontName"
	 				},
	 				{
	 		     		id: "S_m_TextProperties",
	 			 		pid: "S_i_TextProperties",
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU, 
		 		     	label: menuStrs.formatMenu_TextProperties,
		 		     	showMODE: MODE.EDITMODEVISIBLE,		 		     	
		 		     	sub:[
								{
									id: "S_i_Bold",
								   	type:websheet.Constant.MenuBarType.MENUITEM, 	
								   	accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Bold_Mac : menuStrs.accel_formatMenu_Textprop_Bold,
							 	    accLabel: menuStrs.formatMenu_Bold  + " " + (dojo.isMac? menuStrs.accel_formatMenu_Textprop_Bold_Mac : menuStrs.accel_formatMenu_Textprop_Bold),
								   	label:menuStrs.formatMenu_Bold,
								   	command:commandOperate.BOLD
								},
								{
									id: "S_i_Italic",		 	 			 		
								   	type:websheet.Constant.MenuBarType.MENUITEM, 	
								   	accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Italic_Mac : menuStrs.accel_formatMenu_Textprop_Italic,
							 	    accLabel: menuStrs.formatMenu_Italic  + " " + (dojo.isMac? menuStrs.accel_formatMenu_Textprop_Italic_Mac : menuStrs.accel_formatMenu_Textprop_Italic),
								   	label:menuStrs.formatMenu_Italic,
								   	command:commandOperate.ITALIC
								},
								{
									id: "S_i_Underline",		 	 			 		
								   	type:websheet.Constant.MenuBarType.MENUITEM, 	
								   	accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Underline_Mac : menuStrs.accel_formatMenu_Textprop_Underline,
							 	    accLabel: menuStrs.formatMenu_Underline  + " " + (dojo.isMac? menuStrs.accel_formatMenu_Textprop_Underline_Mac : menuStrs.accel_formatMenu_Textprop_Underline),
								   	label:menuStrs.formatMenu_Underline,						  
								   	command:commandOperate.UNDERLINE
								},
								{
									id: "S_i_Strikethrough",
								   	type:websheet.Constant.MenuBarType.MENUITEM, 								  
								   	label:menuStrs.formatMenu_Strikethrough,
								   	command:commandOperate.STRIKE
								}
		 	 		      ]
	 				},
	 				{
	 		     		id: "S_m_Align",
	 			 		pid: "S_i_Align",
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU,		 		     	
		 		     	label: menuStrs.formatMenu_Align,
		 		     	showMODE: MODE.EDITMODEVISIBLE,		 		     	
		 		     	sub:[
		 	 		     	{
		 	 		     		id: "S_i_AlignLeft",		 	 			 		
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.formatMenu_Left,
		 		 		     	command:commandOperate.ALIGNLEFT
		 	 				},
		 	 				{
		 	 		     		id: "S_i_AlignRight",		 	 			 		
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,	 		 		     	
		 		 		     	label:menuStrs.formatMenu_Right,
		 		 		     	command:commandOperate.ALIGNRIGHT
		 	 				},
		 	 				{
		 	 		     		id: "S_i_AlignCenter",
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.formatMenu_Center,
		 		 		     	command:commandOperate.ALIGNCENTER
		 	 				},
		 	 				{
		 	 		     		id: "S_i_AlignTop",		 	 			 		
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.formatMenu_Top,
		 		 		     	command:commandOperate.ALIGNTOP
		 	 				},
		 	 				{
		 	 		     		id: "S_i_AlignBottom",		 	 			 		
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,	 		 		     	
		 		 		     	label:menuStrs.formatMenu_Bottom,
		 		 		     	command:commandOperate.ALIGNBOTTOM
		 	 				},
		 	 				{
		 	 		     		id: "S_i_AlignMiddle",
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.formatMenu_Middle,
		 		 		     	command:commandOperate.ALIGNMIDDLE
		 	 				}
		 	 		    ]
	 				},
	 				{
						id: "S_i_WrapNoWrap",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
					   	label:menuStrs.formatMenu_WrapText,
					   	command:commandOperate.WRAPTEXT,
					   	variable: "wrapText"
					},
	 				{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR,
		 		     	showMODE: MODE.EDITMODEVISIBLE
	 				},
	 				{
	 		     		id: "S_m_Number",
	 			 		pid: "S_i_Number",
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU, 
		 		     	label: menuStrs.formatMenu_Number,
		 		     	showMODE: MODE.EDITMODEVISIBLE,	
		 		     	event:[{ eventName:'onOpen', eventFunc: numberMenu_onOpen}],		 		     		 		     	
		 		     	variable: "numberSubMenu",
		 		     	varIsMenu:true
	 				},
	 				{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR,
		 		     	showMODE: MODE.EDITMODEVISIBLE
	 				},
	 				{
						id: "S_i_HideRow",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
					   	label:menuStrs.formatMenu_HideRow,
					   	command:commandOperate.HIDEROW,
					   	aclMODE: websheet.Constant.ACLVisible
					},
					{
						id: "S_i_ShowRow",
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
					   	label:menuStrs.formatMenu_ShowRow,
					   	command:commandOperate.SHOWROW,
					   	aclMODE: websheet.Constant.ACLVisible
					},
					{
						id: "S_i_HideColumn",
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
					   	label:menuStrs.formatMenu_HideColumn,
					   	command:commandOperate.HIDECOLUMN,
					   	aclMODE: websheet.Constant.ACLVisible
					},
					{
						id: "S_i_ShowColumn",
					   	type:websheet.Constant.MenuBarType.MENUITEM,	
					   	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE,
					   	label:menuStrs.formatMenu_ShowColumn,
					   	command:commandOperate.SHOWCOLUMN,
					   	aclMODE: websheet.Constant.ACLVisible
					},
					{		 	 		     			 			 		
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
	 				},
	 				{		 	 		     			 			 		
	 		     		id: "S_m_Direction" ,
	 			 		pid: "S_i_Direction",
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU,		 		     	
		 		     	label: menuStrs.formatMenu_Direction,		 		     
		 		     	showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,		 		     	
		 		     	sub:[
		 	 		     		{
		 	 		     		id: "S_i_LtrDirection",		 	 			 		
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.formatMenu_Ltr,	
		 		 		     	command:commandOperate.LTRDIRECTION
		 	 				},
		 	 		     		{
		 	 		     		id: "S_i_RtlDirection",		 	 			 		
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.formatMenu_Rtl,	 		     	
		 		 		     	command:commandOperate.RTLDIRECTION
		 	 				},
		 	 		     		{
		 	 		     		id: "S_i_AutoDirection",		 	 			 		
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.formatMenu_Auto,	
		 		 		     	command:commandOperate.AUTODIRECTION
		 	 				}
		 	 		    ]		 	 			
	 				},
	 				{		 	 		     			 			 		
	 		     		id: "S_m_MirrorSheet" ,
	 			 		pid: "S_i_MirrorSheet",
		 		     	type: websheet.Constant.MenuBarType.POPUPMENU,		 		     	
		 		     	label: menuStrs.formatMenu_SheetDirection,		 		     
		 		     	showMODE: websheet.Constant.ModeVisible.EDITMODEVISIBLE,		 		     	
		 		     	sub:[
		 	 		     		{
		 	 		     		id: "S_i_LtrSheetDirection",		 	 			 		
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.formatMenu_SheetLtr,	
		 		 		     	command:commandOperate.LTRSHEETDIRECTION
		 	 				},
		 	 		     		{
		 	 		     		id: "S_i_RtlSheetDirection",		 	 			 		
		 		 		     	type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
		 		 		     	label:menuStrs.formatMenu_SheetRtl,	 		     	
		 		 		     	command:commandOperate.RTLSHEETDIRECTION
		 	 				}
		 	 		        ]		 	 			
	 				}
	 				
	 		  ]
	 	},
	 	// Data Menu
	 	{
	 		id: "S_m_Data",
	 		pid: "S_i_Data",
	 		type: websheet.Constant.MenuBarType.POPUPMENUBAR,
	 		label: menuStrs.dataMenu,
	 		showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE | MODE.HTMLVIEWINVISIBLE,
	 		event:[{ eventName:'onOpen', eventFunc: acl_onOpen, eventArgs:{menuType:'data'}}],
	 		sub:[
	 		     	{
						id: "S_i_Sort",
					   	type:websheet.Constant.MenuBarType.MENUITEM, 	
					   	label:menuStrs.dataMenu_Sort,
						showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE | MODE.HTMLVIEWINVISIBLE,
						protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	command:commandOperate.SORTRANGE	
					},
					{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR
	 				},
	 				{
						id: "S_i_Validation",
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	showMODE: MODE.EDITMODEVISIBLE,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	label:menuStrs.dataMenu_Validation,
					   	command:commandOperate.VALIDATION
					},
	 				{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR
	 				},
	 				{
	 					id: "S_i_ACL",
	 					type:websheet.Constant.MenuBarType.MENUITEM,
	 					isShow:g_enableACL,
					   	showMODE: MODE.EDITMODEVISIBLE,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
	 					label:menuStrs.dataMenu_ACL,
	 					command:commandOperate.ACCESSPERMISSION
	 				},
//	 				{
//	 					id:"S_i_ACL_DELETE",
//	 					type:websheet.Constant.MenuBarType.MENUITEM,
//	 					disable:!g_enableACL,
//					   	showMODE: MODE.EDITMODEVISIBLE,
//					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
//	 					label:menuStrs.dataMenu_ACL_DELETE,
//	 					command: commandOperate.DELETEACL
//	 				},
					{
	 					isShow:g_enableACL,
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR
	 				},
					{
						id: "S_i_InstantFilter",
					   	type:websheet.Constant.MenuBarType.MENUITEM, 	
					   	showMODE: MODE.EDITMODEVISIBLE | MODE.VIEWDRAFTMODEVISIBLE | MODE.HTMLVIEWINVISIBLE,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	checkedMenuItem: true,
					   	label:menuStrs.dataMenu_InstantFilter,
					   	command:commandOperate.INSTANTFILTER
					}
				]
	 	},

	 	//Team Menu
	 	{
	 		id: "S_m_Team",
	 		pid: "S_i_Team",
	 		type: websheet.Constant.MenuBarType.POPUPMENUBAR,
	 		label: menuStrs.teamMenu,
	 		showMODE: MODE.EDITMODEVISIBLE,
	 		sub:[
	 		     	{
						id: "S_i_AddComment",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM,
					   	label:menuStrs.teamMenu_AddComment,
					   	command:commandOperate.CREATECOMMENTS,
					   	variable: "addCommentMenuItem"
					},
					{
						isShow: bSocialAssignment,
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
	 				},
	 		     	{
						id: "S_i_AssignCells",
						isShow: bSocialAssignment,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.teamMenu_AssignCells,
					   	command:commandOperate.ASSIGNTASK,
					   	variable: "assignCellsMenuItem"
					},
					{
						id: "S_i_EditAssignment",
						isShow: bSocialAssignment,
						disabled: true,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.teamMenu_EditAssignment,
					   	command:commandOperate.EDITASSIGNMENT,
					   	variable: "editAssignmentMenuItem"
					},
					{
						id: "S_i_ReopenAssignment",
						isShow: bSocialAssignment,
						disabled: true,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:teamNls.dlgTaskReopenTitle,
					   	command:commandOperate.REOPENASSIGNMENT,
					   	variable: "reopenAssignmentMenuItem"
					},
					{
						id: "S_i_ReassignAssignment",
						isShow: bSocialAssignment,
						disabled: true,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:teamNls.dlgTaskReassignTitle,
					   	command:commandOperate.REASSIGNASSIGNMENT,
					   	variable: "reassignAssignmentMenuItem"
					},
					{
						id: "S_i_MarkAssignmentComplete",
						isShow: bSocialAssignment,
						disabled: true,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.teamMenu_MarkAssignmentComplete,					  
					   	command:commandOperate.MARKASSIGNCOMPLETE,
					   	variable: "markAssignmentCompleteMenuItem"
					},
					{
						id: "S_i_ApproveAssignment",
						isShow: bSocialAssignment,
						disabled: true,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.teamMenu_ApproveAssignment,
					   	command:commandOperate.APPROVEASSIGNMENT,
					   	variable: "approveAssignmentMenuItem"
					},
					{
						id: "S_i_ReturnAssignmentForRework",	
						isShow: bSocialAssignment,
						disabled: true,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.teamMenu_ReturnAssignmentForRework,					  
					   	command:commandOperate.RETURNASSIGNMENT,
					   	variable: "returnAssignmentMenuItem"
					},
					{
						id: "S_i_RemoveCellAssignment",
						isShow: bSocialAssignment,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.teamMenu_RemoveCellAssignment,					  
					   	command:commandOperate.DELETETASK,
					   	variable: "removeCellAssignmentMenuItem"
					},
					{
						id: "S_i_RemoveCompletedAssignments",
						isShow: bSocialAssignment,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.teamMenu_RemoveCompletedAssignments,					  
					   	command:commandOperate.REMOVECOMPLETEDASSIGN,
					   	variable: "removeCompletedAssignmentMenuItem"
					},
					{
						isShow: bSocialAssignment,
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
	 				},
	 				{
						id: "S_i_AboutAssignment",
						isShow: bSocialAssignment,	
						disabled: true,
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.teamMenu_AboutAssignment,
					   	command:commandOperate.ABOUTASSIGN,
					   	variable: "aboutAssignmentMenuItem"
					}
				]
	 	},
	 	
	 	//Tools Menu
	 	{
	 		id: "S_m_Tools",
	 		pid: "S_i_Tools",
	 		type: websheet.Constant.MenuBarType.POPUPMENUBAR,
	 		label: menuStrs.toolsMenu,
	 		showMODE: MODE.EDITMODEVISIBLE,
	 		sub:[	
	 				{
 		     			id: "S_i_AutoComplete",		 	 			 		
	 		     		type:websheet.Constant.MenuBarType.MENUITEM,		 		 		     	
	 		     		label:menuStrs.toolsMenu_AutoComplete,
	 		     		checkedMenuItem: true,
	 		     		checked: window["pe"].settings?window["pe"].settings.getAutoComplete():false,	
	 		     		showMODE: MODE.EDITMODEVISIBLE,	 		     	     
	 		     		command:commandOperate.AUTOCOMPLETE,
	 		     		variable: "autoCompleteMenuItem"
 					},
 					{
		 		     	type:websheet.Constant.MenuBarType.MENUSEPORATOR	 		     
	 				},
					{
					   id: "S_m_SelectDic",
					   pid: "S_i_SelectDic",
					   type: websheet.Constant.MenuBarType.POPUPMENU,
					   label: menuStrs.toolsMenu_SelectDictionary,
					   showMODE: MODE.EDITMODEVISIBLE,
					   protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   popupMethod:createSpellCheckDics 	 			
					},
	 		     	{
						id: "S_i_SpellCheck",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.toolsMenu_SpellCheck,
					   	command:commandOperate.SPELLCHECK,
					   	protectMODE: websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE,
					   	variable: "spellCheckMenuitem"
					},
	 		     	{
						id: "S_i_Preferences",		
						isShow: scene.showPreferences(),
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.toolsMenu_Preferences,
					   	command:commandOperate.PREFERENCES,
					   	variable: "preferencesMenuitem"
					}
	 		  ]
	 	},
	 	
	 	//Help Menu
	 	{
	 		id: "S_m_Help",
	 		pid: "S_i_Help",
	 		type: websheet.Constant.MenuBarType.POPUPMENUBAR,
	 		label: menuStrs.helpMenu,
	 		sub:[
	 		     	{
						id: "S_i_Overview",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM, 		 		     	
					   	label:menuStrs.helpMenu_Overview,
					   	iconClass: 'menubarAboutConcordIcon',
					   	privatecommand:	function(){
							var helpWin = window.open( concord.main.App.SHEET_HELP_URL, "helpWindow", "width=800, height=800" );
							helpWin.focus();							            
				        }
					},
					{
						id: "S_i_About",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM, 
					   	isShow: false,
					   	label:menuStrs.helpMenu_About,
						command:commandOperate.ABOUT
					},
					{
						id: "S_i_NewFeaturs",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM, 
					   	label:menuStrs.helpMenu_NewFeatures,
					   	disabled: !g_hasNewFeature,
						command:commandOperate.NEWFEATURES
					},
					{
						id: "S_i_UserTour",		 	 			 		
					   	type:websheet.Constant.MenuBarType.MENUITEM, 
					   	label:menuStrs.helpMenu_Tour,
						command:commandOperate.USERTOUR
					}						
	 		  ]
	 	}
	];
	return menus;	
};