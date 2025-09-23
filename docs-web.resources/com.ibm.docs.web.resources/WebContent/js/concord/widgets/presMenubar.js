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

dojo.provide("concord.widgets.presMenubar");

dojo.require("dijit.MenuBar");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.PopupMenuItem");
dojo.require("dojo.i18n");
dojo.require("concord.widgets.presTablePropertiesDlg");
dojo.require("concord.util.events");
dojo.require("concord.task.TaskUtil");
dojo.require("concord.util.user");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.uri");
dojo.require("concord.util.strings");
dojo.require("concord.main.Settings");
dojo.require("concord.main.App");
dojo.require("concord.spellcheck.scaytservice");

dojo.requireLocalization("concord.widgets","menubar");
dojo.requireLocalization("concord.widgets","CKResource");
dojo.requireLocalization("concord.widgets","presPropertyDlg");
dojo.requireLocalization("concord.widgets","ImagePropDlg");

dojo.declare("concord.widgets.presMenubar", null, {
	
	currScene: null,
	ssEditor: null,
	parentDiv: null,
	webclipboardEnabled: null,
	connectArray	: [], //D38660
	
	constructor: function(parentDiv, currScene) {
		this.currScene = currScene;
		this.parentDiv = parentDiv;
		this.webclipboardEnabled = true;
		this.nls = dojo.i18n.getLocalization("concord.widgets","menubar");
		this.presnls = dojo.i18n.getLocalization("concord.widgets","presMenubar");
		this.subscribeToEvents();
	},
	
	subscribeToEvents: function(){
		dojo.subscribe(concord.util.events.presSceneEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
		
		dojo.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
		dojo.subscribe(concord.util.events.slideSorterEvents_Focus, null, dojo.hitch(this,this.handleSubscriptionEvents_SlideSorter_Focus));

		dojo.subscribe(concord.util.events.slideEditorEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
		dojo.subscribe(concord.util.events.slideEditorEvents_Focus, null, dojo.hitch(this,this.handleSubscriptionEvents_NonSlideSorter_Focus));
		
		dojo.subscribe(concord.util.events.keypressHandlerEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
		dojo.subscribe(concord.util.events.presMenubarEvents_SetFocus, null, dojo.hitch(this,this.handleSubscriptionForFocusEvent));

		dojo.subscribe(concord.util.events.presToolbarEvents, null, dojo.hitch(this,this.handleSubscriptionForToolbarEvents));
		dojo.subscribe(concord.util.events.presToolbarEvents_Focus, null, dojo.hitch(this,this.handleSubscriptionEvents_NonSlideSorter_Focus));
		dojo.subscribe(concord.util.events.taskEvents_eventName_taskSelected, null, dojo.hitch(this,this.handleTaskMenuState));
		this.connectArray.push(dojo.connect(this.parentDiv,'onmouseup',this,this.publishPresMenuBarInFocus));
	},
	
	handleSubscriptionForToolbarEvents: function(data){
		if(data.eventName==concord.util.events.presToolbarEvents_eventName_concordPresSave){
			this.savePresDraft();
		}else if (data.eventName==concord.util.events.presToolbarEvents_eventName_concordPresPrint){
		   this.printPres();
		}
	},
	updateEditMenu: function(sorterInFocus) {
		if (sorterInFocus) {
			if (dijit.byId('P_i_DeleteSlide')) {
				if (window.pe.scene.slideSorter.multiSelectedSlides.length == window.pe.scene.slideSorter.slides.length) {
					dijit.byId('P_i_DeleteSlide').setDisabled(true);
					dijit.byId('P_i_Cut').setDisabled(true);
				} else {
					dijit.byId('P_i_DeleteSlide').setDisabled(false);
					dijit.byId('P_i_Cut').setDisabled(false);
					dijit.byId('P_i_Copy').setDisabled(false);//D9495
				}
			}
		} else {
			if (dijit.byId('P_i_DeleteSlide')) {
				dijit.byId('P_i_DeleteSlide').setDisabled(true);
				dijit.byId('P_i_Cut').setDisabled(false);	
				dijit.byId('P_i_Copy').setDisabled(false); //D9495
			}
		}
	},
	handleSubscriptionEvents_SlideSorter_Focus: function(data){
	    this.updateEditMenu(true);
	},

	handleSubscriptionEvents_NonSlideSorter_Focus: function(data){
	    this.updateEditMenu(false);
	},
	
	handleSubscriptionEvents: function(data){
		if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableTableEditingMenuItems){
			this.enableTableEditingMenuItems(data);
		} else if ( data.eventName==concord.util.events.keypressHandlerEvents_eventName_keypressEvent ) {
			//var focusComp =  pe.scene.focusMgr.getFocusComponent(false);
			if (data.eventAction==concord.util.events.keypressHandlerEvents_eventAction_ALT_SHIFT_F) {
				this.publishPresMenuBarInFocus();
				if(this.fileMenuPopupObj.popup.isShowingNow)
					return;
				this.menubar.onItemClick(this.fileMenuPopupObj,data);
			}
		} else if (data.eventName==concord.util.events.slideEditorEvents_eventName_cutCopyPasteDialog) {
			this.showClipboardInfoMsg(data['dialogType']);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableTableEditingMenuItems){
			this.disableTableEditingMenuItems();	
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableStrikeThroughMenuItems){
			this.enableStrikethroughMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableStrikeThroughMenuItems){
			this.disableStrikethroughMenuItem();
			this.toggleStrikethroughMenu(false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableTextStyleMenuItems){
			this.enableSubSuperScriptMenuItems();
			this.enableStrikethroughMenuItem();
			this.enableHorizontalAlignMenuItem();
			if(BidiUtils.isBidiOn()){
				this.enableTextDirectionMenuItem();
			}
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableTextStyleMenuItems){
			this.disableSubSuperScriptMenuItems();
			// When disable sup/sub menu item, toggle them off
			this.toggleSuperscriptMenu(false);
			this.toggleSubscriptMenu(false);
			this.disableStrikethroughMenuItem();
			this.disableHorizontalAlignMenuItem();
			if(BidiUtils.isBidiOn()){
				this.disableTextDirectionMenuItem();
			}
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_superscriptCheckedMenuOn){
			this.toggleSuperscriptMenu(true);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_superscriptCheckedMenuOff){
			this.toggleSuperscriptMenu(false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_subscriptCheckedMenuOn){
			this.toggleSubscriptMenu(true);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_subscriptCheckedMenuOff){
			this.toggleSubscriptMenu(false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOn){
			this.toggleStrikethroughMenu(true);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_strikethroughCheckedMenuOff){
			this.toggleStrikethroughMenu(false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOn){
			this.toggleBoldMenu(true);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_boldCheckedMenuOff){
			this.toggleBoldMenu(false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOn){
			this.toggleItalicMenu(true);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_italicCheckedMenuOff){
			this.toggleItalicMenu(false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOn){
			this.toggleUnderlineMenu(true);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_underlineCheckedMenuOff){
			this.toggleUnderlineMenu(false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_inFocus){
			//if (data.componentName == "concord.widgets.slideSorter") {
			//	this.updateEditMenu(true);
			//} else {
				this.updateEditMenu(false);
			//}
		} else if (data.eventName==concord.util.events.slideSorterEvents_eventName_updateContextMenuOptions){
			this.updateEditMenu(true);	
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_changeTableEditingMenuItems){
			this.changeTableEditingMenuItems(data);
		}		
		//else if (data.eventName== concord.util.events.slideSorterEvents_eventName_slideSorterReady) {
		else if (data.eventName== concord.util.events.slideSorterEvents_eventName_onCKEInstanceReady){
			this.ssEditor = CKEDITOR.instances[data.editorName];
			if(this.currScene.sceneInfo.mode == 'edit'){
				this.renderEditMode(this.parentDiv);
			}else{
				this.renderViewMode(this.parentDiv);
			}
			this.setupCommonEventHandlers();
		}else if (data.eventName==concord.util.events.slideEditorEvents_eventName_enableBringToFrontMenuItems){
			this.enableBringToFrontMenuItems();
		}else if (data.eventName==concord.util.events.slideEditorEvents_eventName_disableBringToFrontMenuItems){
			this.disableBringToFrontMenuItems();
		}else if (data.eventName==concord.util.events.slideEditorEvents_eventName_enableSendToBackMenuItems){
			this.enableSendToBackMenuItems();
		}else if (data.eventName==concord.util.events.slideEditorEvents_eventName_disableSendToBackMenuItems){
			this.disableSendToBackMenuItems();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableTextSelectionMenuItems){
			this.enableTextSelectionMenuItems();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableTextSelectionMenuItems){
			this.disableTextSelectionMenuItems();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableTableSelectionMenuItems){
			this.enableTableSelectionMenuItems();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableTableSelectionMenuItems){
			this.disableTableSelectionMenuItems();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableUndoMenuItem){
			this.enableUndoMenuItem();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableUndoMenuItem){
			this.disableUndoMenuItem();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableRedoMenuItem){
			this.enableRedoMenuItem();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableRedoMenuItem){
			this.disableRedoMenuItem();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableWebClipboardMenuItem){
			this.webclipboardEnabled = true;
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableWebClipboardMenuItem){
			this.webclipboardEnabled = false;
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableEditMenuItems){
			this.disableEditMenuItems();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableDiscardMenuItem){
			this.enableDiscardMenuItem();
		}else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableDiscardMenuItem){
			this.disableDiscardMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableImagePropertyMenuItems){
			this.enableImagePropertyMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableImagePropertyMenuItems){
			this.disableImagePropertyMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableTableCellPropertyMenuItems){
			this.enableTableCellPropertyMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableTableCellPropertyMenuItems){
			this.disableTableCellPropertyMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enablePropertyMenuItems){
			this.enablePropertyMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disablePropertyMenuItems){
			this.disablePropertyMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableTextPropertyMenuItems){
			this.enableTextPropertyMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableTextPropertyMenuItems){
			this.disableTextPropertyMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableTextFontPropertyMenuItems){
			this.enableTextFontPropertyMenuItems();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableTextFontPropertyMenuItems){
			this.disableTextFontPropertyMenuItems();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableCopyCutMenuItems){
			this.enableCopyCutMenuItems();
			
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableCopyCutMenuItems){
			this.disableCopyCutMenuItems();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_verticalAlignOptionOn){
			this.toggleVerticalAlignMenuOption( null, false);
			this.toggleVerticalAlignMenuOption( data.verticalAlign, true );			
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_verticalAlignOptionAllOff){
			this.toggleVerticalAlignMenuOption( null, false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_speakerNotesOptionOff){
			this.toggleSpeakerNotesMenuOption(false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_slideSorterOptionOff){
			this.toggleSlideSorterMenuOption(false);
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableIncreaseIndentMenuItems){
			this.enableIncreaseIndentMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableIncreaseIndentMenuItems){
			this.disableIncreaseIndentMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_enableDecreaseIndentMenuItems){
			this.enableDecreaseIndentMenuItem();
		} else if (data.eventName==concord.util.events.crossComponentEvents_eventName_disableDecreaseIndentMenuItems){
			this.disableDecreaseIndentMenuItem();
		} else if(data.eventName==concord.util.events.crossComponentEvents_eventName_disableIncreaseFontSizeMenuItems){
			this.disableIncreaseFontSizeMenuItem();
		}else if(data.eventName==concord.util.events.crossComponentEvents_eventName_enableIncreaseFontSizeMenuItems){
			this.enableIncreaseFontSizeMenuItem();
		}else if(data.eventName==concord.util.events.crossComponentEvents_eventName_disableDecreaseFontSizeMenuItems){
			this.disableDecreaseFontSizeMenuItem();
		}else if(data.eventName==concord.util.events.crossComponentEvents_eventName_enableDecreaseFontSizeMenuItems){
			this.enableDecreaseFontSizeMenuItem();
		}	
	},
	
	handleTaskMenuState: function(data){
		var isSingleSelection = data.isSingleSelection;	
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");	
  		var menuItem = dijit.byId("P_i_TeamAssignSlides");
  		if(menuItem){
  			menuItem.setDisabled(!data.isCreateAssignment);
  			var _label = isSingleSelection ? menuStrs.teamMenu_AssignSlide : menuStrs.teamMenu_AssignSlides
  			menuItem.setLabel(_label);	  				
  		}
 		menuItem = dijit.byId("P_i_TeamEditSlide");
  		if(menuItem){
  			menuItem.setDisabled(!data.isEditAssignment);
  		} 
  		menuItem = dijit.byId("P_i_TeamReopenAssignedSlides");
  		if(menuItem){
  			menuItem.setDisabled(!data.isReopenAssignmen);
  			var _label = isSingleSelection ? menuStrs.teamMenu_ReopenSlideAssignment : menuStrs.teamMenu_ReopenSlideAssignments
  			menuItem.setLabel(_label);	  			
  		} 
 		menuItem = dijit.byId("P_i_TeamReassignSlides");
  		if(menuItem){
  			menuItem.setDisabled(!data.isReassignAssignment);
  			var _label = isSingleSelection ? menuStrs.teamMenu_ReassignSlide : menuStrs.teamMenu_ReassignSlides
  			menuItem.setLabel(_label);	  			
  		} 
  		menuItem = dijit.byId("P_i_TeamMarkSComplete");
  		if(menuItem){
  			menuItem.setDisabled(!data.isMarkAssignComplete);
  			var _label = isSingleSelection ? menuStrs.teamMenu_MarkSlidesComplete : menuStrs.teamMenu_MarkSlidesCompletes
  			menuItem.setLabel(_label);	  			
  		}
 		menuItem = dijit.byId("P_i_teamApproveSlides");
  		if(menuItem){
  			menuItem.setDisabled(!data.isApproveSection);
  			var _label = isSingleSelection ? menuStrs.teamMenu_ApproveSlide : menuStrs.teamMenu_ApproveSlides
  			menuItem.setLabel(_label);	  			
  		} 
  		menuItem = dijit.byId("P_i_TeamReturnForRework");
  		if(menuItem){
  			menuItem.setDisabled(!data.isReturnSection);
  			var _label = isSingleSelection ? menuStrs.teamMenu_ReturnForRework : menuStrs.teamMenu_ReturnForReworks
  			menuItem.setLabel(_label);	  			
  		}
 		menuItem = dijit.byId("P_i_TeamDeleteAssignment");
  		if(menuItem){
  			menuItem.setDisabled(!data.isRemoveSectionAssign);
  		} 
  		menuItem = dijit.byId("P_i_teamAboutSlide");
  		if(menuItem){
  			menuItem.setDisabled(!data.isAbout);
  		}		
	},
	
	setupCommonEventHandlers: function() {
		if (this.menubar) {
			this.connectArray.push(dojo.connect(this.menubar,'onKeyDown',this,function(evt){
				if (evt.keyCode != 9) {
					dojo.stopEvent(evt);
				}
				if (evt.keyCode == 27) {
					if (pe.scene.getEditor().name == 'editor1') {
						pe.scene.focusMgr.publishNextFocusRegion(concord.util.events.SLIDE_SORTER_COMPONENT);
						var eventData = [{eventName: concord.util.events.presSideBarEvents_eventName_concordOpenSlideSorter}];
						concord.util.events.publish(concord.util.events.sideBarEvents, eventData);	
					}
					else {
						pe.scene.setFocus();
					}
				}
			}));
		}
	},
	
	handleSubscriptionForFocusEvent: function(data){
		this.menubar.focusFirstChild();
		this.publishPresMenuBarInFocus();
	},	
	
	publishPresMenuBarInFocus: function(){		
 		dojo.publish(concord.util.events.presMenubarEvents_Focus, null);
	},		
	
	toggleBold: function() {
		var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_bold}];
		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);		
	},
	
	toggleBoldMenu: function(checked) {
		var menuItem = dijit.byId('P_i_Bold');
		// change the checked state without triggering another style change event
		menuItem.onChange = undefined;
		menuItem.attr("checked", checked);
		menuItem.onChange = this.toggleBold;
		menuItem.onClick = function (){
			pe.scene.setFocus();
		};
	},
	
	toggleItalic: function() {
		console.log("toggling Italic");
		var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_italic}];
		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);		
	},
	
	toggleItalicMenu: function(checked) {
		var menuItem = dijit.byId('P_i_Italic');
		// change the checked state without triggering another style change event
		menuItem.onChange = undefined;
		menuItem.attr("checked", checked);
		menuItem.onChange = this.toggleItalic;
		menuItem.onClick = function (){
			pe.scene.setFocus();
		};
	},

	toggleUnderline: function() {
		var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_underline}];
		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);		
	},
	
	toggleUnderlineMenu: function(checked) {
		var menuItem = dijit.byId('P_i_Underline');
		// change the checked state without triggering another style change event
		menuItem.onChange = undefined;
		menuItem.attr("checked", checked);
		menuItem.onChange = this.toggleUnderline;
		menuItem.onClick = function (){
			pe.scene.setFocus();
		};
	},


	toggleStrikethrough: function() {
		var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_strikethrough}];
		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);		
	},
	
	toggleStrikethroughMenu: function(checked) {
		var menuItem = dijit.byId('P_i_Strikethrough');
		// change the checked state without triggering another style change event
		menuItem.onChange = undefined;
		menuItem.attr("checked", checked);
		menuItem.onChange = this.toggleStrikethrough;
		menuItem.onClick = function (){
			pe.scene.setFocus();
		};
	},
	
	toggleSuperscript: function() {
		var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_superscript}];
		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);		
	},
	
	toggleSuperscriptMenu: function(checked) {
		var menuItem = dijit.byId('P_i_Superscript');
		// change the checked state without triggering another style change event
		menuItem.onChange = undefined;
		menuItem.attr("checked", checked);
		menuItem.onChange = this.toggleSuperscript;
		menuItem.onClick = function (){
			pe.scene.setFocus();
		};
	},

	toggleSubscript: function() {
		var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_subscript}];
		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);		
	},
	
	toggleSubscriptMenu: function(checked) {
		var menuItem = dijit.byId('P_i_Subscript');
		// change the checked state without triggering another style change event
		menuItem.onChange = undefined;
		menuItem.attr("checked", checked);
		menuItem.onChange = this.toggleSubscript;
		menuItem.onClick = function (){
			pe.scene.setFocus();
		};
	},
	
	toggleVerticalAlignMenuOption: function( verticalAlign, checked){
		var toggleVerticalAlignment = function( menuItem, checked){
			if( checked ){
				menuItem.attr("checked", checked);
			} else {
				menuItem.attr("checked", false);
			}
		};
		
		if ( verticalAlign){
			if ( verticalAlign == 'top'){
				toggleVerticalAlignment(dijit.byId('P_i_Top'),checked);
			}
			if ( verticalAlign == 'middle'){
				toggleVerticalAlignment(dijit.byId('P_i_Middle'),checked);
			}
			if ( verticalAlign == 'bottom'){
				toggleVerticalAlignment(dijit.byId('P_i_Bottom'),checked);
			}
		} else {
			toggleVerticalAlignment(dijit.byId('P_i_Top'),checked);
			toggleVerticalAlignment(dijit.byId('P_i_Middle'), checked);
			toggleVerticalAlignment(dijit.byId('P_i_Bottom'), checked);
		}
	},
	
	toggleSpeakerNotesMenuOption: function(checked){		
		var menuItem = dijit.byId('P_i_SpeakerNotes');
		menuItem.attr("checked", checked);
	},
	
	toggleSlideSorterMenuOption: function(checked){		
		var menuItem = dijit.byId('P_i_SlideSorter');
		menuItem.attr("checked", checked);
	},
	
	enableIncreaseIndentMenuItem: function(){
		dijit.byId('P_i_Indent').setDisabled(false);
	},
	
	disableIncreaseIndentMenuItem: function(){
		dijit.byId('P_i_Indent').setDisabled(true);
	},
	
	enableDecreaseIndentMenuItem: function(){
		dijit.byId('P_i_DecreaseIndent').setDisabled(false);
	},
	
	disableDecreaseIndentMenuItem: function(){
		dijit.byId('P_i_DecreaseIndent').setDisabled(true);
	},
	
	enableIncreaseFontSizeMenuItem: function(){
		dijit.byId('P_i_IncreaseFontSize').setDisabled(false);
	},
	
	disableIncreaseFontSizeMenuItem: function(){
		dijit.byId('P_i_IncreaseFontSize').setDisabled(true);
	},
	
	enableDecreaseFontSizeMenuItem: function(){
		dijit.byId('P_i_DecreaseFontSize').setDisabled(false);
	},
	
	disableDecreaseFontSizeMenuItem: function(){
		dijit.byId('P_i_DecreaseFontSize').setDisabled(true);
	},
	
	refreshMenuItem:function(data, menuItem)
	{
		var myMenuItem = menuItem;
		var paramObj = data.paramObj;
		if(myMenuItem !=null && paramObj!=null){
			for(keyParam in paramObj){
				if(keyParam =="popup"){
					//destroy the old popup
					if(myMenuItem.popup!=null){
						myMenuItem.popup.destroy();
					}
				}
				myMenuItem[keyParam]= paramObj[keyParam];
				if(keyParam == "disabled"){
					myMenuItem.setDisabled(paramObj[keyParam]);
				}
			}
			myMenuItem.startup();
		}
	},

	savePres: function(){
		PresCKUtil.runPending();
		var bookmark = null;
		var editor = pe.scene.getEditor();
		if (dojo.isIE && editor.name != window.pe.scene.slideSorter.ckeditorInstanceName){
			bookmark = PresCKUtil.getBookmarkForCurrentRange( editor);
		}
		this.ssEditor.execCommand( 'saveDialog',{myFiles: 'true'} );		
		PresCKUtil.moveRangeToBookmark( bookmark, editor);
	},
	
	savePresDraft: function(){
		PresCKUtil.runPending();
		this.ssEditor.execCommand( 'saveDraft',{myFiles: 'true'} ); 
	},
	
	publishPres: function(){
		PresCKUtil.runPending();
		this.ssEditor.execCommand( 'publishDialog',{myFiles: 'true'} ); 
	},
	
	reviewPres: function(){
		PresCKUtil.runPending();
		this.ssEditor.execCommand( 'SFRDialog',{myFiles: 'true'} ); 
	},
	
	printPresHtml: function(){
		if(this.currScene.sceneInfo.mode !="view"){
			this.currScene.session.save(true);
		}
		console.log("Preparing to print HTML");
		pe.scene.viewPresForPrint(pe.lotusEditor);
	},
	
	printPres: function(){
		PresCKUtil.runPending();
		//D19641: It's better to trigger hb when click 'ok' button in PDF page setup dialog but not when click 'print to PDF'
		pe.scene.exportPresToPdf(pe.lotusEditor);
	},
	
	renderViewMode: function(parent){
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		var currScene = this.currScene;
		var ssEditor = this.ssEditor;
		var tmstamp = new Date().getTime();
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var menubar = this.menubarObserver = new dijit.MenuBar( {'id':'menubarObserver', dir: dirAttr} );
		if(BidiUtils.isGuiRtl()) //placeholder to offset first dropdown
			menubar.addChild( new dijit.MenuBarItem({disabled: true}));
		
		var fileMenu = this.fileMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(fileMenu.domNode,"lotusActionMenu");
		fileMenu.domNode.style.display ='none';
		document.body.appendChild(fileMenu.domNode);
		
		var downloadSubMenu = new dijit.Menu();
		dojo.addClass(downloadSubMenu.domNode,"lotusActionMenu");
		downloadSubMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_PDF_'+tmstamp,
		    label: menuStrs.fileMenu_ExportAsPDF,
		    menuBar: this,
		    onClick: function(){
				this.menubarObserver.printPres();
			},
			dir: dirAttr
		}));
		
		var downloadAs = new dijit.PopupMenuItem(
		{
			id: 'P_i_DownloadAs_'+tmstamp,
		    label: menuStrs.fileMenu_DownloadAs,
		    popup: downloadSubMenu,
		    dir: dirAttr
		});
		dojo.style( downloadAs.arrowWrapper, 'visibility', '' );
		fileMenu.addChild( downloadAs );
		
		fileMenu.addChild( new dijit.MenuSeparator() );
		
		fileMenu.addChild( new dijit.MenuItem(
				{
					id: 'P_i_Print_'+tmstamp,
					label: menuStrs.fileMenu_Print,
					disabled:false,
				    accelKey: dojo.isMac? menuStrs.accel_fileMenu_Print_Mac : menuStrs.accel_fileMenu_Print,
					menuBar: this,
				    onClick: function(){
						this.menubarObserver.printPresHtml();
					},
					dir: dirAttr
				}));
		
//		fileMenu.addChild( new dijit.MenuItem(
//				{
//					id: "P_i_Close",
//				    label: menuStrs.fileMenu_Close,
//				    onClick: function()
//					{	
//						if (window.opener)
//							window.close();
//						else if (pe.homePage)
//							window.location.href=pe.homePage;
//					}
//				}));
		
		this.fileMenuPopupObj = new dijit.PopupMenuBarItem(
				{
					id: 'P_m_File_'+tmstamp,
				    label: menuStrs.fileMenu,
				    popup: fileMenu
				});
		menubar.addChild( this.fileMenuPopupObj );	
		
		// Adding view
		
		var viewMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(viewMenu.domNode,"lotusActionMenu");
		viewMenu.domNode.style.display ='none';
		document.body.appendChild(viewMenu.domNode);
		
//		viewMenu.addChild(new dijit.CheckedMenuItem(
//		{
//			id: "P_i_Sidebar_"+tmstamp,
//			label: menuStrs.viewMenu_Sidebar,
//			checked: 'true',
//			onClick: function()
//			{
//				pe.scene.toggleSideBar();
//			},
//			dir: dirAttr
//		}));

		if(window.pe.scene.bCoedit == true){
			var mIndicator =  new dijit.CheckedMenuItem(
					{
						id:'P_i_CoeditingHighlights_'+tmstamp,
						label: menuStrs.viewMenu_Coediting,
					    checked: 'true',
					    onClick: function()
					    	{
								var eventData = [{eventName: concord.util.events.slideEditorEvents_eventName_showHideCoeditingIndicators}];
								concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);						
					    	},
					    	dir: dirAttr
					});
					viewMenu.addChild(mIndicator);
					
					// init Menubar according to global settings.    
					if(pe.settings && !pe.settings.getIndicator() ){
					    mIndicator.attr('checked', false);     
					}	
					
		}
		var speakerNotesIndicator =  new dijit.CheckedMenuItem(
		{
			id:'P_i_SpeakerNotes_'+tmstamp,
			label: menuStrs.viewMenu_SpeakerNotes,
			checked: 'true',
			onClick: function()
			{
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_showHideSpeakerNotes}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);						
			},
			dir: dirAttr
		});
		var slideSorterIndicator =  new dijit.CheckedMenuItem(
				{
					id:'P_i_SlideSorter_'+tmstamp,
					label: menuStrs.viewMenu_SlideSorter,
					checked: 'true',
					onClick: function()
					{
						var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_showHideSlideSorter}];
						concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);						
					},
					dir: dirAttr
		});
				
		viewMenu.addChild(slideSorterIndicator);
		viewMenu.addChild(speakerNotesIndicator);
		
//		//Observer Mode 
//		var observerMenu =this.observerMenu =  new dijit.CheckedMenuItem({
//					id: "P_i_ObserverMenu_"+tmstamp,
//					label: menuStrs.viewMenu_ObserverMode,
//					checked: 'true',
//					onClick: function()
//					{
//						pe.scene.handleObserverMenuToggle();
//					}	
//				});
//		
//		viewMenu.addChild(observerMenu);		
		
		//show unsupported feature warning menuitem
		viewMenu.addChild( new dijit.MenuSeparator() );
		pe.showUnsupportMenuItem = new dijit.CheckedMenuItem(
		{
			id: "P_i_ShowUnsupportWarning_"+tmstamp,
			label: menuStrs.viewMenu_UnsupportWarning,
			checked: pe.settings?pe.settings.getShowUnsupportedFeature():true,
			onChange: function(checked)
				{
					pe.settings.setShowUnsupportedFeature(checked);
				},
				dir: dirAttr
		});
		viewMenu.addChild(pe.showUnsupportMenuItem);
		
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
			id: "P_m_View_"+tmstamp,
		    label: menuStrs.viewMenu,
			popup: viewMenu
		}));
						
		// End adding view
		
		
		var prezMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(prezMenu.domNode,"lotusActionMenu");
		prezMenu.addChild( new dijit.MenuItem(
		{
		    id: "P_i_SlideShow_"+tmstamp,
			label: menuStrs.presentationMenu_SlideShow,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_slideShow}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
		}));

		prezMenu.addChild( new dijit.MenuItem(
		{
		    id: "P_i_SlideShowWithCoview_"+tmstamp,
			label: menuStrs.presentationMenu_SlideShowWithCoview,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_slideShow, coView:true}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
 		}));

		
		prezMenu.addChild( new dijit.MenuItem(
		{
			id: "P_i_SlideShowFromCurrent_"+tmstamp,
			label: menuStrs.presentationMenu_SlideShowFromCurrent,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_slideShow,fromCurrSlide: true}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
		}));
		
		this.presentationMainMenuItem = new dijit.PopupMenuBarItem(
				{
				    id: "P_m_Presentation_"+tmstamp,
					label: menuStrs.presentationMenu,
					popup: prezMenu
				});
		
		menubar.addChild(this.presentationMainMenuItem);
		
		var helpMenu = new dijit.Menu( {dir: dirAttr} );
		//			helpMenu.domNode.style.display ='none';
		//			document.body.appendChild(helpMenu.domNode);
		
		dojo.addClass(helpMenu.domNode,"lotusActionMenu");
		helpMenu.addChild( new dijit.MenuItem(
		{
			id: "P_i_HelpContents_"+tmstamp,
		    label: menuStrs.helpMenu_Overview,
		    onClick: function(){
				var helpWin = window.open( concord.main.App.PRES_HELP_URL, "helpWindow", "width=800, height=800" );
				helpWin.focus();					        
		    },
		    dir: dirAttr
		}));
		
		if(!gIs_cloud){
			helpMenu.addChild( new dijit.MenuItem(
			{
				id: "P_i_HelpAbout_"+tmstamp,
				label: menuStrs.helpMenu_About,
				currScene: this.currScene,
				onClick: function(){
					this.currScene.aboutConcord();
          		},
          		dir: dirAttr
			}));			
		}
		
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
			id: "P_m_Help_"+tmstamp,
		    label: menuStrs.helpMenu,
			popup: helpMenu
		}));
		
		menubar.placeAt(parent.id);
		menubar.startup();
//		menubar.containerNode.style.border = '0';
//		menubar.domNode.style.borderBottom="1px solid ##CCCCCC";
		
	},
	
	renderEditMode: function(parent)
	{
		var presMenubar = this;
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		var currScene = this.currScene;
		var ssEditor = this.ssEditor;
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var menubar = this.menubar = new dijit.MenuBar( {dir: dirAttr} );
		if(BidiUtils.isGuiRtl()) //placeholder to offset first dropdown
			menubar.addChild( new dijit.MenuBarItem({disabled: true}));

		dojo.addClass(menubar.domNode,"lotusActionMenu");
		this.connectArray.push(	dojo.connect(menubar, 'onMouseUp', function() { pe.scene.setFocusToPresMenubar(); }));
		
		//Defect 11717
		if(dojo.isIE < 9)
		{
			dojo.connect(menubar, 'onMouseDown', function() {
				pe.scene.validResize = false;
			});
		}
		
		var fileMenu = this.fileMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(fileMenu.domNode,"lotusActionMenu");
		fileMenu.domNode.style.display ='none';
		document.body.appendChild(fileMenu.domNode);

		//D13853 -- Same actions to fileMenu as was done in D11717
		if(dojo.isIE < 9){
			dojo.connect(fileMenu, 'onMouseEnter', function() {
				pe.scene.validResize = false;
			});
			
			dojo.connect(fileMenu, 'onMouseLeave', function() {
				pe.scene.validResize = true;
			});
		}		

		if(!concord.util.uri.isICNDocument())
		{
			var fileSubMenu = new dijit.Menu({dir: dirAttr});
			dojo.addClass(fileSubMenu.domNode,"lotusActionMenu");
			fileSubMenu.domNode.style.display ='none';
			document.body.appendChild(fileSubMenu.domNode);
			
			fileSubMenu.addChild( new dijit.MenuItem(
			{
				id: "P_i_NewDoc",
				label: menuStrs.fileMenu_NewDocument,
				ssEditor: this.ssEditor,
				currScene: this.currScene,
				onClick: function()	//wj
				{
					pe.scene.validResize = false;
					this.currScene.createTextDoc(this.ssEditor, false);
					pe.scene.setFocusToDialog();
					pe.scene.validResize = true;
				},
				dir: dirAttr
			
			}));
			
			/*
			fileSubMenu.addChild( new dijit.MenuItem(
			{
				label: menuStrs.fileMenu_NewPresentationfromTemplate
			}));
			*/
			fileSubMenu.addChild( new dijit.MenuItem(
			{
				id: "P_i_NewSheet",
				label: menuStrs.fileMenu_NewSpreadsheet,
				ssEditor: this.ssEditor,
				currScene: this.currScene,
				onClick: function()	//wj
				{
					pe.scene.validResize = false;
					this.currScene.createSheetDoc(this.ssEditor);
					pe.scene.setFocusToDialog();
					pe.scene.validResize = true;
				},
				dir: dirAttr
			}));
			fileSubMenu.addChild( new dijit.MenuItem(
					{
						id: "P_i_NewPres",
						label: menuStrs.fileMenu_NewPresentation,
						ssEditor: this.ssEditor,
						currScene: this.currScene,
						onClick: function()	//wj
						{
					//					this.ssEditor.execCommand('newPres');
							pe.scene.validResize = false;
							this.currScene.createPresDoc(this.ssEditor);
							pe.scene.setFocusToDialog();
							pe.scene.validResize = true;
						},
						dir: dirAttr
			}));
			/*S44348: Remove 'New from template' menu items in Presentation
			if(!concord.util.uri.isECMDocument())
			{
				var fromTemplateSubMenu = new dijit.Menu();
				dojo.addClass(fromTemplateSubMenu.domNode,"lotusActionMenu");
				fromTemplateSubMenu.domNode.style.display = 'none';
				document.body.appendChild(fromTemplateSubMenu.domNode);
				fromTemplateSubMenu.addChild( new dijit.MenuItem(
				{
					id: "P_i_NewDocFromTemp",
					label: menuStrs.fileMenu_NewDocument,
					onClick: function()
						{
							pe.scene.createTextDoc(this, true);
							pe.scene.setFocusToDialog();
							pe.scene.validResize = true;
						},
						dir: dirAttr
				}));
				
				fromTemplateSubMenu.addChild( new dijit.MenuItem(
				{
					id: "P_i_NewSheetFromTemp",
					label: menuStrs.fileMenu_NewSpreadsheet,
					onClick: function ()
						{
							pe.scene.createSheetDocFromTemplate(this);
						},
						dir: dirAttr
				}));
				
				var fromTemplate = new dijit.PopupMenuItem(
				{
					id: 'P_i_NewFromTemplate',
					label:  menuStrs.fileMenu_NewFromTemplate,
					popup: fromTemplateSubMenu,
					dir: dirAttr
				});
				dojo.style( fromTemplate.arrowWrapper, 'visibility', '' );
				
				//D13853 -- Same actions to fromTemplate as was done in D11717
				if(dojo.isIE < 9){
					dojo.connect(fromTemplate, 'onMouseEnter', function() {
						pe.scene.validResize = false;
					});
					
					dojo.connect(fromTemplate, 'onMouseLeave', function() {
						pe.scene.validResize = true;
					});
				}		
		
				fileSubMenu.addChild( fromTemplate );
			}
			
			*/
			/*
			fileSubMenu.addChild( new dijit.MenuItem(
			{
				id: "P_i_NewDocFromTemp",
				label: menuStrs.fileMenu_NewDocumentfromTemplate,
				ssEditor: this.ssEditor,
				currScene: this.currScene,
				onClick: function()	//wj
				{
					pe.scene.validResize = false;
					this.currScene.createTextDoc(this.ssEditor, true);
					pe.scene.setFocusToDialog();
					pe.scene.validResize = true;
				}
			}));
			*/
			/*
			fileSubMenu.addChild( new dijit.MenuItem(
			{
				id: "P_i_NewPresFromTemp",
				label: menuStrs.fileMenu_NewPresentationfromTemplate,
				ssEditor: this.ssEditor,
				currScene: this.currScene,
				onClick: function()	//zw
				{
					//TODO:
				}
			}));
			*/
			/*
			fileSubMenu.addChild( new dijit.MenuItem(
			{
				id: "P_i_NewSheetFromTemp",
				label: menuStrs.fileMenu_NewSpreadsheetFromTemplate,
				ssEditor: this.ssEditor,
				currScene: this.currScene,
				onClick: function()	
				{
					pe.scene.validResize = false;
					this.currScene.createSheetDocFromTemplate(this.ssEditor);
					pe.scene.setFocusToDialog();
					pe.scene.validResize = true;
				}
			}));
			*/
			
			var fileNew = new dijit.PopupMenuItem(
			{
				id:'P_i_New',
			    label: menuStrs.fileMenu_New,
			    popup: fileSubMenu,
			    dir: dirAttr
			});
	
			dojo.style( fileNew.arrowWrapper, 'visibility', '' );
			fileMenu.addChild( fileNew );
		}
		
//		fileMenu.addChild( new dijit.MenuItem(
//		{
//			id: "P_i_Close",
//		    label: menuStrs.fileMenu_Close,
//		    onClick: function()
//			{	
//				if (window.opener)
//					window.close();
//				else if (pe.homePage)
//					window.location.href=pe.homePage;
//			}
//		}));
		
		if(pe.scene.showDiscardMenu())
		{
			pe.discardMenuItem = new dijit.MenuItem(
					{
						id: "P_i_Discard",
						label: menuStrs.fileMenu_Discard,
						currScene: this.currScene,
						ssEditor: this.ssEditor,
						onClick: function()
						{
							pe.scene.validResize = false;
							this.ssEditor.execCommand( 'discardDraft' );
							pe.scene.setFocusToDialog();
							pe.scene.validResize = true;
						},
						dir: dirAttr
					});
			
			fileMenu.addChild( pe.discardMenuItem );
			fileMenu.addChild(new dijit.MenuSeparator());
			fileMenu.addChild( new dijit.MenuItem(
					{
						id: "P_i_Save",
					    label: menuStrs.fileMenu_Save,
					    accelKey: dojo.isMac? menuStrs.accel_fileMenu_Save_Mac : menuStrs.accel_fileMenu_Save,
					    disabled: false,
					    menuBar: this,
						onClick: function(){
							pe.scene.validResize = false;
							this.menuBar.savePresDraft();
							pe.scene.setFocusToDialog();
							pe.scene.validResize = true;
						},
						dir: dirAttr
					 }));			
		}
		else if(DOC_SCENE.isPublishable)
		{
			fileMenu.addChild( new dijit.MenuItem(
					{
						id: "P_i_Save",
					    label: menuStrs.fileMenu_Save,
					    disabled: false,
					    menuBar: this,
						onClick: function(){
							pe.scene.validResize = false;
							this.menuBar.savePresDraft();
							pe.scene.setFocusToDialog();
							pe.scene.validResize = true;
						},
						dir: dirAttr
					 }));	
		}

		// Issue with JAWS and multiple aria-labelledby tags which should work.
		// Remove the labelledby for now until this is resolved by JAWS.
		dijit.removeWaiState(dojo.byId("P_i_Save"), "labelledby");
		if(pe.scene.showSaveAsMenu())
		{
			fileMenu.addChild( new dijit.MenuItem(
			{
				id:'P_i_SaveAs',
			    label: menuStrs.fileMenu_SaveAs,
			    currScene: this.currScene,
				ssEditor: this.ssEditor,
				onClick: function(){
					PresCKUtil.runPending();
					pe.scene.validResize = false;
					this.currScene.saveAsPresentation(this.ssEditor);
					pe.scene.setFocusToDialog();
					pe.scene.validResize = true;
				},
				dir: dirAttr
			}));
		}
		
		if(g_revision_enabled) {
			fileMenu.addChild( new dijit.MenuItem(
			{
				id: 'P_i_Revision',
				label: menuStrs.filemenu_revisionhistory,			
				disabled:false,
				menuBar: this,
			    onClick: function(){
			    	setTimeout(function(){
			    		window.pe.scene.viewRevision();
			    	}, 0);
				},  
				dir: dirAttr
			}));						
		}
		
		if(DOC_SCENE.isPublishable)
		{
			var publishLable = pe.scene.showCheckinMenu() ? menuStrs.fileMenu_CheckinVersion : menuStrs.fileMenu_PublishVersion;
			pe.publishMenuItem = new dijit.MenuItem(
					{
						id:'P_i_Publish',
						label: publishLable,
						disabled: pe.scene.isNeedRenderSFR(),
					    menuBar: this,
						onClick: function(){
							pe.scene.validResize = false;
							this.menuBar.publishPres();
							pe.scene.setFocusToDialog();
							pe.scene.validResize = true;
						},
						dir: dirAttr
					});
			
			fileMenu.addChild(pe.publishMenuItem);	
		}
		
		// Download -> PDF, MS, ODF etc...
		var downloadSubMenu = new dijit.Menu({dir: dirAttr});
		dojo.addClass(downloadSubMenu.domNode,"lotusActionMenu");
		downloadSubMenu.domNode.style.display ='none';
		document.body.appendChild(downloadSubMenu.domNode);
		
		downloadSubMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_ExportToPDF',
			label: menuStrs.fileMenu_ExportToPDF,
			disabled:false,
		    menuBar: this,
		    onClick: function(){					
				this.menuBar.printPres();					
			},
			dir: dirAttr
		
		}));
		
		downloadSubMenu.addChild( new dijit.MenuItem(
				{
					id: 'P_i_ExportToDefault',
					label: concord.util.strings.getDefaultFileFormatStr(menuStrs.fileMenu_ExportToMS, menuStrs.fileMenu_ExportToODF), 
					disabled:false,
				    menuBar: this,
				    onClick: function(){					
						pe.scene.exportToDefault();					
					},
					dir: dirAttr
		}));

		var fileDownload = new dijit.PopupMenuItem(
		{
			id:'P_i_Dowload',
		    label: menuStrs.fileMenu_Download,
		    popup: downloadSubMenu,
		    dir: dirAttr
		});

		dojo.style( fileDownload.arrowWrapper, 'visibility', '' );
		fileMenu.addChild( fileDownload );
		
		// Submit for Review ...		
		if (concord.util.uri.isCCMDocument())
		{
			pe.reviewMenuItem = new dijit.MenuItem(
					{
						id:'P_i_SFR',
						label: menuStrs.fileMenu_SubmitForReview,
						disabled: !pe.scene.isNeedRenderSFR(),
					    menuBar: this,
						onClick: function(){
							pe.scene.validResize = false;
							this.menuBar.reviewPres();
							pe.scene.setFocusToDialog();
							pe.scene.validResize = true;
						},
						dir: dirAttr
					});
			
			fileMenu.addChild(pe.reviewMenuItem);	
		}
		
		if(pe.scene.showShareMenu())
		{
			pe.shareWithMenuItem = new dijit.MenuItem(
			{
				id:'P_i_Share',
			    label: menuStrs.fileMenu_ShareWith,
				disabled: (pe.scene.session && pe.scene.session.bean) ? !pe.scene.session.bean.getIsSharable() : false,
				ssEditor: this.ssEditor,
				currScene: this.currScene,
				onClick: function(){
					pe.scene.validResize = false;
					this.currScene.shareWith(this.ssEditor);
					pe.scene.setFocusToDialog();
					pe.scene.validResize = true;
				},
				dir: dirAttr			    
			});
			fileMenu.addChild(pe.shareWithMenuItem);
		}
		/*
		fileMenu.addChild(new dijit.MenuSeparator());
		
		fileMenu.addChild( new dijit.MenuItem(
		{
			id: "P_i_Unlock",
			label: menuStrs.fileMenu_Unlock,
			onClick: function()
			{
				//TODO:
			}
		}));
		*/
		//fileMenu.addChild( new dijit.MenuSeparator() );
		/*
		var downloadSubMenu = new dijit.Menu();
		downloadSubMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_PDF',
		    label: menuStrs.fileMenu_ExportAsPDF,
		    menuBar: this,
		    onClick: function(){
		    	 pe.scene.validResize = false;
				 this.menuBar.printPres();
				 pe.scene.setFocusToDialog();
				 pe.scene.validResize = true;
			}
		}));
		*/
		/*		
		downloadSubMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_ODF',
			label: menuStrs.fileMenu_ExportAsODF,
			menuBar: this,
			onClick: function(){
				//TODO:
			}
		}));
		downloadSubMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_MsPPT',
			label: menuStrs.fileMenu_ExportAsPPT,
			menuBar: this,
			onClick: function(){
				 //TODO:
				}
		}));
		*/
		/*
		var downloadAs = new dijit.PopupMenuItem(
		{
			id: 'P_i_DownloadAs',
		    label: menuStrs.fileMenu_DownloadAs,
		    popup: downloadSubMenu
		});
		
		dojo.style( downloadAs.arrowWrapper, 'visibility', '' );
		fileMenu.addChild( downloadAs );
		
		fileMenu.addChild( new dijit.MenuSeparator() );
*/
		//			fileMenu.addChild( new dijit.MenuItem(
		//			{
		//			    id:'P_i_WebPreview',
		//			    label: menuStrs.fileMenu_WebPreview,
		//			    id:'webPreview',
		//			    onClick: function(){
		//					//this.ssEditor.execCommand('odpprintpdf');
		//					var viewModeUrl = concord.util.uri.getDocViewModeUri();
		//					window.open(viewModeUrl); 
		//				}
		//			}));
		
		if(pe.scene.getFileDetailsURL() !=null){
			fileMenu.addChild( new dijit.MenuItem(
			{
				id: "P_i_ViewFileDetails",
				label:  menuStrs.fileMenu_ViewFileDetails,
				disabled: false,
				menuBar: this,
				onClick: function()
				{
					window.pe.scene.slideEditor.mainNode.focus();				
					pe.scene.goBackToFileDetails();			
				},
				dir: dirAttr
			}));
		    fileMenu.addChild(new dijit.MenuSeparator());
		}
		if(pe.scene.showRecentFilesMenu())
		{
			fileMenu.addChild( new dijit.MenuSeparator() );
			var recentFilePopMenu = pe.scene.getRecentFilesMenu();
			pe.recentFileMenuItem = new dijit.PopupMenuItem(
			{
						id: "P_i_recentOpenFiles",
						label: menuStrs.fileMenu_RecentFile,
					    popup: recentFilePopMenu,
					    dir: dirAttr
			});
			dojo.style( pe.recentFileMenuItem.arrowWrapper, 'visibility', '' );
			pe.recentFileMenuItem.set('dir', dirAttr);
			fileMenu.addChild( pe.recentFileMenuItem );
			fileMenu.addChild( new dijit.MenuSeparator() );
		}
							
//		fileMenu.addChild( new dijit.MenuItem(
//				{
//					id: 'P_i_PrintToPDF',
//					label: menuStrs.fileMenu_PrintToPDF,
//					disabled:false,
//				    menuBar: this,
//				    onClick: function(){					
//						this.menuBar.printPres();					
//					},
//					dir: dirAttr
//				}));
		
		fileMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Print',
			label: menuStrs.fileMenu_Print,
		    accelKey: dojo.isMac? menuStrs.accel_fileMenu_Print_Mac : menuStrs.accel_fileMenu_Print,
			disabled:false,
			menuBar: this,
		    onClick: function(){
		    	var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_printHtml}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		// Issue with JAWS and multiple aria-labelledby tags which should work.
		// Remove the labelledby for now until this is resolved by JAWS.
		dijit.removeWaiState(dojo.byId("P_i_Print"), "labelledby");
		
		this.fileMenuPopupObj = new dijit.PopupMenuBarItem(
				{
					id: 'P_m_File',
				    label: menuStrs.fileMenu,
				    popup: fileMenu
				});
		menubar.addChild( this.fileMenuPopupObj );
		
		var editMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(editMenu.domNode,"lotusActionMenu");
		editMenu.domNode.style.display ='none';
		document.body.appendChild(editMenu.domNode);
		
		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Undo',
		    label: menuStrs.editMenu_Undo,
		    accelKey: dojo.isMac? menuStrs.accel_editMenu_Undo_Mac : menuStrs.accel_editMenu_Undo,
		    accLabel: menuStrs.editMenu_Undo + dojo.isMac? menuStrs.accel_editMenu_Undo_Mac : menuStrs.accel_editMenu_Undo,
		    disabled:true,
		    onClick: function(){
		    	pe.scene.getEditor().execCommand( "undo" );
			},
			dir: dirAttr
		}));
		// Issue with JAWS and multiple aria-labelledby tags which should work.
		// Remove the labelledby for now until this is resolved by JAWS.
		dijit.removeWaiState(dojo.byId("P_i_Undo"), "labelledby");

		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Redo',
		    label: menuStrs.editMenu_Redo,
		    accelKey: dojo.isMac? menuStrs.accel_editMenu_Redo_Mac : menuStrs.accel_editMenu_Redo,
		 	accLabel: menuStrs.editMenu_Redo + dojo.isMac? menuStrs.accel_editMenu_Redo_Mac : menuStrs.accel_editMenu_Redo,
		    disabled:true,
		    onClick: function(){
		    	pe.scene.getEditor().execCommand( "redo" );
			},
			dir: dirAttr
		}));
		// Issue with JAWS and multiple aria-labelledby tags which should work.
		// Remove the labelledby for now until this is resolved by JAWS.
		dijit.removeWaiState(dojo.byId("P_i_Redo"), "labelledby");

		editMenu.addChild( new dijit.MenuSeparator() );
		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Cut',
		    label: menuStrs.editMenu_Cut,
		    accelKey: dojo.isMac?  menuStrs.accel_editMenu_Cut_Mac : menuStrs.accel_editMenu_Cut,
		 	accLabel: menuStrs.editMenu_Cut + dojo.isMac?  menuStrs.accel_editMenu_Cut_Mac : menuStrs.accel_editMenu_Cut,
		    currScene: this.currScene,
		    menuBarObj: this,
			onClick:this.performCutAction,
			dir: dirAttr
		}));
		// Issue with JAWS and multiple aria-labelledby tags which should work.
		// Remove the labelledby for now until this is resolved by JAWS.
		dijit.removeWaiState(dojo.byId("P_i_Cut"), "labelledby");

		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Copy',
		    label: menuStrs.editMenu_Copy,
		    accelKey: dojo.isMac? menuStrs.accel_editMenu_Copy_Mac : menuStrs.accel_editMenu_Copy,
		    accLabel: menuStrs.editMenu_Copy + dojo.isMac? menuStrs.accel_editMenu_Copy_Mac : menuStrs.accel_editMenu_Copy,
		    currScene: this.currScene,
		    menuBarObj: this,
			onClick:this.performCopyAction,
			dir: dirAttr
		}));
		// Issue with JAWS and multiple aria-labelledby tags which should work.
		// Remove the labelledby for now until this is resolved by JAWS.
		dijit.removeWaiState(dojo.byId("P_i_Copy"), "labelledby");

		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Paste',
		 	label: menuStrs.editMenu_Paste,
		    accelKey: dojo.isMac? menuStrs.accel_editMenu_Paste_Mac : menuStrs.accel_editMenu_Paste,
		    accLabel: menuStrs.editMenu_Paste + dojo.isMac? menuStrs.accel_editMenu_Paste_Mac : menuStrs.accel_editMenu_Paste,
			currScene: this.currScene,
			menuBarObj: this,
			onClick:this.performPasteAction,
			dir: dirAttr
			}));
		// Issue with JAWS and multiple aria-labelledby tags which should work.
		// Remove the labelledby for now until this is resolved by JAWS.
		dijit.removeWaiState(dojo.byId("P_i_Paste"), "labelledby");

		editMenu.addChild( new dijit.MenuSeparator() );
		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_SelectAll',
			label: menuStrs.editMenu_SelectAll,
			accelKey: menuStrs.accel_editMenu_SelectAll,
		    accelKey: dojo.isMac? menuStrs.accel_editMenu_SelectAll_Mac : menuStrs.accel_editMenu_SelectAll,
		    accLabel: menuStrs.editMenu_Redo + dojo.isMac? menuStrs.accel_editMenu_SelectAll_Mac : menuStrs.accel_editMenu_SelectAll,
			onClick: function() {
		      // unfortunately, each of the components that support "select all" functionality
		      // go about being triggered in different ways.
		      var editor = window.pe.scene.getEditor();
		      editor && console.debug( editor.name );
		      // 'editor1' is the default editor when no other editor is chosen. ignore.
		      if (editor && editor.name != 'editor1' ) {
		      	// refocus on the editor
		        // (since it got lost when clicking on the menu bar)
		    	  editor.focus();
		    	  PresCKUtil.simulateCtrlA(editor.document.$);
		      } else {
		        // slide editor...
		        if (window.pe.scene.getFocusComponent(true) == concord.util.events.SLIDE_EDITOR_COMPONENT) {
		          var eventData = [ {
		            eventName: concord.util.events.keypressHandlerEvents_eventName_keypressEvent,
		            eventAction: concord.util.events.keypressHandlerEvents_eventAction_CTRL_A
		          } ];
		          concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);
		        } else {
		          // slide sorter...
		          var eventData = [ { eventName: 'selectAllSlides' } ];
		          concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		        }
		      }
		},
		dir: dirAttr
		}));
		// Issue with JAWS and multiple aria-labelledby tags which should work.
		// Remove the labelledby for now until this is resolved by JAWS.
		dijit.removeWaiState(dojo.byId("P_i_SelectAll"), "labelledby");

		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_DeleteSlide',
			label: menuStrs.editMenu_DeleteSlide,
			currScene: this.currScene,
			onClick: function() 
			{			    	
				//if (currScene.componentInFocus == 'concord.scenes.SlideSorter')
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_deleteSlides}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		editMenu.addChild( new dijit.MenuSeparator() );
		/*
		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Find',
			label: menuStrs.editMenu_Find,
			currScene: this.currScene,
			onClick: function() 
			{
				//TODO:
		    }
		}));
		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Replace',
			label: menuStrs.editMenu_Replace,
			currScene: this.currScene,
			onClick: function() 
			{
				//TODO:
		    }
		}));
		editMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_EditLink',
			label: menuStrs.editMenu_EditLink,
			currScene: this.currScene,
			onClick: function() 
			{
				//TODO:
		    }
		}));
		*/
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
		    id: "P_m_Edit",
		    label: menuStrs.editMenu,
		    popup: editMenu,
		    dir: dirAttr
		}));
		
		// Let's disable this for now 
		//this.connectArray.push(dojo.connect(editMenu,'onOpen',dojo.hitch(window.pe.scene.slideEditor,'chkIfPlaceHolderSelected',true))); //D9495
		
		//T15714 Let's disable paste option if pasting content from another document
		this.connectArray.push(dojo.connect(editMenu,'onOpen',this,'chckPasteFromOtherDoc')); 		

		var viewMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(viewMenu.domNode,"lotusActionMenu");
		viewMenu.domNode.style.display ='none';
		document.body.appendChild(viewMenu.domNode);
		
		/*
		viewMenu.addChild( new dijit.MenuItem(
		{
		    label: menuStrs.viewMenu_Master
		}));
		
		viewMenu.addChild( new dijit.MenuItem(
		{
		    label: menuStrs.viewMenu_Notifications
		}));
		*/
		
		//var show = pe.settings? pe.settings.getIndicator() : true;
		/*
		viewMenu.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_Toolbar",
			label: menuStrs.viewMenu_Toolbar,
			checked: 'true',
			onClick: function()
			{
				//TODO:
			}	
		}));
		*/
		/*
		pe.sidebarMenuItem = new dijit.CheckedMenuItem(
				{
					id: "P_i_Sidebar",
					label: menuStrs.viewMenu_Sidebar,
					checked: 'true',
					onClick: function()
					{
						pe.scene.toggleSideBar();
					},
					dir: dirAttr	
				});
		viewMenu.addChild(pe.sidebarMenuItem);
		*/
		/*
		viewMenu.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_Rulers",
			label: menuStrs.viewMenu_Rulers,
			onChange: function(checked)
			{
				var slideEditor = pe.scene.slideEditor;
				if (slideEditor)
					slideEditor.setRulersVisible(checked);
			}	
		}));
		*/
		/*
		viewMenu.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_AssignmentIndicators",
			label: menuStrs.viewMenu_Assignment,
			checked: 'true',
			onClick: function()
			{
				//TODO:
			}	
		}));
		*/
		if(window.pe.scene.bCoedit == true){
			var mIndicator =  new dijit.CheckedMenuItem(
					{
						id:'P_i_CoeditingHighlights',
						label: menuStrs.viewMenu_Coediting,
					    checked: 'true',
					    onClick: function()
					    	{
								var eventData = [{eventName: concord.util.events.slideEditorEvents_eventName_showHideCoeditingIndicators}];
								concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);						
					    	},
					    	dir: dirAttr
					});
					viewMenu.addChild(mIndicator);
					
					// init Menubar according to global settings.    
					if(pe.settings && !pe.settings.getIndicator() ){
					    mIndicator.attr('checked', false);     
					}	
					
		}
		var speakerNotesIndicator =  new dijit.CheckedMenuItem(
		{
			id:'P_i_SpeakerNotes',
			label: menuStrs.viewMenu_SpeakerNotes,
			checked: 'true',
			onClick: function()
			{
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_showHideSpeakerNotes}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);						
			},
			dir: dirAttr
		});
		
		var slideSorterIndicator =  new dijit.CheckedMenuItem(
				{
					id:'P_i_SlideSorter',
					label: menuStrs.viewMenu_SlideSorter,
					checked: 'true',
					onClick: function()
					{
						var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_showHideSlideSorter}];
						concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);						
					},
					dir: dirAttr
		});
		
		viewMenu.addChild(slideSorterIndicator);
		viewMenu.addChild(speakerNotesIndicator);
//		//Observer Mode 
//		var observerMenu =this.observerMenuEditor =  new dijit.CheckedMenuItem({
//					id: "P_i_ObserverMenu",
//					label: menuStrs.viewMenu_ObserverMode,
//					checked: 'true',
//					onClick: function()
//					{
//						pe.scene.handleObserverMenuToggle();
//					}	
//				});
//		
//		viewMenu.addChild(observerMenu);		
		
		
		
		//show unsupported feature warning menuitem
		viewMenu.addChild( new dijit.MenuSeparator() );
		pe.showUnsupportMenuItem = new dijit.CheckedMenuItem(
		{
			id: "P_i_ShowUnsupportWarning",
			label: menuStrs.viewMenu_UnsupportWarning,
			checked: pe.settings?pe.settings.getShowUnsupportedFeature():true,
			onChange: function(checked)
				{
					pe.settings.setShowUnsupportedFeature(checked);
				},
				dir: dirAttr
		});
		viewMenu.addChild(pe.showUnsupportMenuItem);
		/*
		viewMenu.addChild( new dijit.MenuSeparator() );
		viewMenu.addChild( new dijit.CheckedMenuItem(
		{
			id: "P_i_AutomaticSpellCheck",
			label: menuStrs.viewMenu_AutomaticSpellCheck,
			checked: 'true',
			onClick: function()
			{
				//TODO:
			}	
		}));
		*/	
		/*					
					viewMenu.addChild(new dijit.MenuItem(
							{
							    label: menuStrs.viewMenu_SpeakerNotes,
							    onClick: function()
							    	{
										var eventData = [{eventName: concord.util.events.speakerNotesEvents_eventName_showHide}];
										concord.util.events.publish(concord.util.events.speakerNotesEvents, eventData);						
							    	}
							}));
		*/
		
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
			id: "P_m_View",
		    label: menuStrs.viewMenu,
			popup: viewMenu
		}));
		
		
		var createMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(createMenu.domNode,"lotusActionMenu");
		createMenu.domNode.style.display ='none';
		document.body.appendChild(createMenu.domNode);
		
		
		createMenu.addChild( new dijit.MenuItem(
		{
			id: "P_i_NewSlide",
		    label: menuStrs.createMenu_NewSlide,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_createNewSlide}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
		}));
		
		createMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_DupSlide',
			    label: menuStrs.createMenu_DuplicateSlide,
			    onClick: function() {
					var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_duplicateSlides}];
					concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			    },
			    dir: dirAttr
			}));
		createMenu.addChild( new dijit.MenuSeparator() );
		createMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_Img',
			label: menuStrs.insertMenu_Image,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_launchImageDialog}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
		}));
		
		createMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_TextBox',
		    label: menuStrs.createMenu_TextBox,
		    onClick: function() {	
		        window.pe.scene.lockPark = true;
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_createDefaultTextBox}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
			}));
		/*
		createMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_Link',
			label: menuStrs.insertMenu_WebLink,
			onClick: function() {			    	
				//TODO
			}
		}));
		
		createMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_SpecialCharacter',
			label: menuStrs.insertMenu_SpecialCharacter,
			onClick: function() {			    	
				//TODO:
		    }
		}));
		*/
		//	createMenu.addChild( new dijit.MenuItem(
		//	{
		//		label: menuStrs.createMenu_Comments,
		//	onClick: function() {			    	
		//		CKEDITOR.instances.editor1.execCommand('insertCommentCmd');	
		//	}
		//	}));
		
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
			id: "P_m_Insert",
		    label: menuStrs.createMenu,
			popup: createMenu
		}));
		
		var layoutMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(layoutMenu.domNode,"lotusActionMenu");
		layoutMenu.domNode.style.display ='none';
		document.body.appendChild(layoutMenu.domNode);
		
//		layoutMenu.addChild( new dijit.MenuItem(
//		{
//		    id: "P_i_SlideDesign",
//			label: menuStrs.layoutMenu_SlideDesign,
//		    onClick: function() {			    	
//				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_launchSlideDesignDialog}];
//				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
//		    }
//		}));
			
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_SlideLayout',
		    label: menuStrs.layoutMenu_SlideLayout,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_launchSlideLayoutDialog}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
		}));
		
		var formatTextProperties = new dijit.Menu({dir: dirAttr});
		dojo.addClass(formatTextProperties.domNode,"lotusActionMenu");
		var layoutProps = new dijit.PopupMenuItem(
		{
		    id: "P_i_TextProperties",
			label: menuStrs.formatMenu_TextProperties,
			disabled: true,
			popup: formatTextProperties,
			dir: dirAttr
		});
		dojo.style( layoutProps.arrowWrapper, 'visibility', '' );
		layoutMenu.addChild(layoutProps);
				
		formatTextProperties.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_Bold",
			label: menuStrs.layoutMenu_Textprop_Bold,
			accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Bold_Mac : menuStrs.accel_formatMenu_Textprop_Bold,
			accLabel: menuStrs.formatMenu_Bold + dojo.isMac? menuStrs.accel_formatMenu_Textprop_Bold_Mac : menuStrs.accel_formatMenu_Textprop_Bold,
			dir: dirAttr
		}));
		formatTextProperties.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_Italic",
			label: menuStrs.layoutMenu_Textprop_Italic,
			accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Italic_Mac : menuStrs.accel_formatMenu_Textprop_Italic,
			accLabel: menuStrs.formatMenu_Italic + dojo.isMac? menuStrs.accel_formatMenu_Textprop_Italic_Mac : menuStrs.accel_formatMenu_Textprop_Italic,
			dir: dirAttr
		}));
		formatTextProperties.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_Underline",
			label: menuStrs.layoutMenu_Textprop_Underline,
			accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Underline_Mac : menuStrs.accel_formatMenu_Textprop_Underline,
			accLabel: menuStrs.formatMenu_Underline + dojo.isMac? menuStrs.accel_formatMenu_Textprop_Underline_Mac : menuStrs.accel_formatMenu_Textprop_Underline,
			dir: dirAttr
		}));
		formatTextProperties.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_Strikethrough",
			label: menuStrs.layoutMenu_Textprop_Strikethrough,
			onChange: this.toggleStrikethrough,
			dir: dirAttr
		}));
		
		formatTextProperties.addChild( new dijit.MenuSeparator() );

		formatTextProperties.addChild(new dijit.MenuItem(
		{
			id: "P_i_IncreaseFontSize",
			label: menuStrs.formatMenu_IncreaseSize,
			onClick: function(){
				var editor = window.pe.scene.getEditor();
	            editor.execCommand('increasefont');
			},
			dir: dirAttr
		}));
		formatTextProperties.addChild(new dijit.MenuItem(
		{
			id: "P_i_DecreaseFontSize",
			label: menuStrs.formatMenu_DecreaseSize,
			onClick: function(){
				var editor = window.pe.scene.getEditor();
	            editor.execCommand('decreasefont');
			},
			dir: dirAttr
		}));

		layoutMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Properties',
		    label: menuStrs.formatMenu_Properties,
		    disabled: true,
		    onClick: function() {	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_launchPropertyDlg}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		layoutMenu.addChild( new dijit.MenuSeparator() );
		
		layoutMenu.addChild( new dijit.CheckedMenuItem(
		{
			id:'P_i_Superscript',
			label: menuStrs.formatMenu_Superscript,
			disabled: true,
			onChange: this.toggleSuperscript,
			dir: dirAttr
		}));
		
		layoutMenu.addChild( new dijit.CheckedMenuItem(
		{
			id:'P_i_Subscript',
			label: menuStrs.formatMenu_Subscript,
			disabled: true,
			onChange: this.toggleSubscript,
			dir: dirAttr
		}));
		
		layoutMenu.addChild( new dijit.MenuSeparator() );
		
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_BringToFront',
		    label: dojo.i18n.getLocalization("concord.widgets","contentBox").ctxMenu_bringToFront,
		    disabled: true,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_bringToFront}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
		}));
		
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_SendToBack',
		    label: dojo.i18n.getLocalization("concord.widgets","contentBox").ctxMenu_sendToBack,
		    disabled: true,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_sendToBack}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
		}));
		
		/*
		layoutMenu.addChild( new dijit.MenuSeparator() );
		
		var formatSubMenu = new dijit.Menu();
		formatSubMenu.addChild(new dijit.MenuItem(
		{
			id: "P_i_Bold",
			label: menuStrs.layoutMenu_Textprop_Bold,
			accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Bold_Mac : menuStrs.accel_formatMenu_Textprop_Bold,
			accLabel: menuStrs.formatMenu_Bold + dojo.isMac? menuStrs.accel_formatMenu_Textprop_Bold_Mac : menuStrs.accel_formatMenu_Textprop_Bold,
			onClick: function(){
				//TODO
			}
		}));
		formatSubMenu.addChild(new dijit.MenuItem(
		{
			id: "P_i_Italic",
			label: menuStrs.layoutMenu_Textprop_Italic,
			accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Italic_Mac : menuStrs.accel_formatMenu_Textprop_Italic,
			accLabel: menuStrs.formatMenu_Italic + dojo.isMac? menuStrs.accel_formatMenu_Textprop_Italic_Mac : menuStrs.accel_formatMenu_Textprop_Italic,
			onClick: function(){
				//TODO
			}
		}));
		formatSubMenu.addChild(new dijit.MenuItem(
		{
			id: "P_i_Underline",
			label: menuStrs.layoutMenu_Textprop_Underline,
			accelKey: dojo.isMac? menuStrs.accel_formatMenu_Textprop_Underline_Mac : menuStrs.accel_formatMenu_Textprop_Underline,
			accLabel: menuStrs.formatMenu_Underline + dojo.isMac? menuStrs.accel_formatMenu_Textprop_Underline_Mac : menuStrs.accel_formatMenu_Textprop_Underline,
			onClick: function(){
				//TODO
			}
		}));
		formatSubMenu.addChild(new dijit.MenuItem(
		{
			id: "P_i_IncreaseSize",
			label: menuStrs.formatMenu_IncreaseSize,
			onClick: function(){
				//TODO
			}
		}));
		formatSubMenu.addChild(new dijit.MenuItem(
		{
			id: "P_i_DecreaseSize",
			label: menuStrs.formatMenu_DecreaseSize,
			onClick: function(){
				//TODO
			}
		}));
		var layoutTextProp =  new dijit.PopupMenuItem(
		{
		    id: "P_m_TextProp",
			label: menuStrs.formatMenu_TextProperties,
			popup: formatSubMenu
		});
		dojo.style( layoutTextProp.arrowWrapper, 'visibility', '' );
		layoutMenu.addChild(layoutTextProp);
		
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_ImageProp',
			label: menuStrs.formatMenu_ImageProperties,
			onClick: function() {			    	
				//TODO:
			}
		}));
		layoutMenu.addChild( new dijit.MenuSeparator() );
		
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_BulletedList',
			label: menuStrs.formatMenu_BulletedList,
			onClick: function() {			    	
				//TODO:
			}
		}));
		
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_NumberedList',
			label: menuStrs.formatMenu_NumberedList,
			onClick: function() {			    	
				//TODO:
			}
		}));
		
		layoutMenu.addChild( new dijit.MenuSeparator() );
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_Superscript',
			label: menuStrs.formatMenu_Superscript,
			onClick: function() {			    	
				//TODO:
			}
		}));
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_Subscript',
			label: menuStrs.formatMenu_Subscript,
			onClick: function() {			    	
				//TODO:
			}
		}));
		
		*/
		
		layoutMenu.addChild( new dijit.MenuSeparator() );
		
		if(BidiUtils.isBidiOn())
		{
			var formatSubMenuTextDirection = new dijit.Menu();
			dojo.addClass(formatSubMenuTextDirection.domNode,"lotusActionMenu");
			var layoutTextDirection =  new dijit.PopupMenuItem(
					{
					    id: "P_i_Text_Direction",
						label: this.presnls.formatMenu_Text_Direction,
						disabled: true,
						popup: formatSubMenuTextDirection,
						dir: dirAttr
					});
			dojo.style(layoutTextDirection.arrowWrapper, 'visibility', '' );
			layoutMenu.addChild(layoutTextDirection);
			
			formatSubMenuTextDirection.addChild(new dijit.MenuItem(
			{
				id: "P_i_LeftToRight",
				label: menuStrs.formatMenu_Ltr,
				onClick: function(){
					pe.scene.getEditor().execCommand('presLeftToRight');
				},
				dir: dirAttr
			}));
	
			formatSubMenuTextDirection.addChild(new dijit.MenuItem(
			{
				id: "P_i_RightToLeft",
				label: menuStrs.formatMenu_Rtl,
				onClick: function(){
					pe.scene.getEditor().execCommand('presRightToLeft');
				},
				dir: dirAttr
			}));
		}
		var formatSubMenuAlign = new dijit.Menu();
		dojo.addClass(formatSubMenuAlign.domNode,"lotusActionMenu");
		var layoutAlign =  new dijit.PopupMenuItem(
				{
				    id: "P_i_Horizontal_Align",
					label: this.presnls.formatMenu_Horizontal_Align,
					disabled: true,
					popup: formatSubMenuAlign,
					dir: dirAttr
				});
		dojo.style( layoutAlign.arrowWrapper, 'visibility', '' );
		layoutMenu.addChild(layoutAlign);
				
		formatSubMenuAlign.addChild(new dijit.MenuItem(
		{
			id: "P_i_Left",
			label: menuStrs.formatMenu_Left,
			onClick: function(){
				pe.scene.getEditor().execCommand('presAlignLeft');
			},
			dir: dirAttr
		}));
		formatSubMenuAlign.addChild(new dijit.MenuItem(
		{
			id: "P_i_Right",
			label: menuStrs.formatMenu_Right,
			onClick: function(){
				pe.scene.getEditor().execCommand('presAlignRight');
			},
			dir: dirAttr
		}));
		formatSubMenuAlign.addChild(new dijit.MenuItem(
		{
			id: "P_i_Center",
			label: menuStrs.formatMenu_Center,
			onClick: function(){
				pe.scene.getEditor().execCommand('presAlignCenter');
			},
			dir: dirAttr
		}));
		formatSubMenuAlign.addChild(new dijit.MenuItem(
		{
			id: "P_i_Justify",
			label: menuStrs.formatMenu_Justify,
			onClick: function(){
				pe.scene.getEditor().execCommand('presJustify');
			},
			dir: dirAttr
		}));
		
		var formatSubMenuVerticalAlign = new dijit.Menu({dir: dirAttr});
		dojo.addClass(formatSubMenuVerticalAlign.domNode,"lotusActionMenu");
		var presMenuBar = this;
		formatSubMenuVerticalAlign.onOpen = function (){
			var alignment = null;
			if (!pe.scene.getEditor().isTable){
				alignment = pe.scene.slideEditor.getVerticalAlignOnSelectedBoxes();
			} else if ( pe.scene.getEditor().contentBox) {
				alignment = pe.scene.getEditor().contentBox.getVerticalAlignment(true);
			}
			presMenuBar.toggleVerticalAlignMenuOption( null, false);
			if ( alignment){
				presMenuBar.toggleVerticalAlignMenuOption( alignment, true );
			}
		};
		var layoutAlign =  new dijit.PopupMenuItem(
				{
				    id: "P_i_Vertical_Align",
					label: this.presnls.formatMenu_Vertical_Align,
					disabled: true,
					popup: formatSubMenuVerticalAlign,
					dir: dirAttr
				});
		dojo.style( layoutAlign.arrowWrapper, 'visibility', '' );
		layoutMenu.addChild(layoutAlign);
				
		formatSubMenuVerticalAlign.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_Top",
			label: this.presnls.formatMenu_Align_Top,
			onClick: function(){
				var eventData = [{'eventName': concord.util.events.presToolbarEvents_eventName_verticalAlign, 'verticalAlign': 'top' }];
				concord.util.events.publish(concord.util.events.presToolbarEvents, eventData);
			},
			dir: dirAttr
		}));
		formatSubMenuVerticalAlign.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_Middle",
			label: this.presnls.formatMenu_Align_Middle,
			onClick: function(){
				var eventData = [{'eventName': concord.util.events.presToolbarEvents_eventName_verticalAlign, 'verticalAlign': 'middle' }];
				concord.util.events.publish(concord.util.events.presToolbarEvents, eventData);
			},
			dir: dirAttr
		}));
		formatSubMenuVerticalAlign.addChild(new dijit.CheckedMenuItem(
		{
			id: "P_i_Bottom",
			label: this.presnls.formatMenu_Align_Bottom,
			onClick: function(){
				var eventData = [{'eventName': concord.util.events.presToolbarEvents_eventName_verticalAlign, 'verticalAlign': 'bottom' }];
				concord.util.events.publish(concord.util.events.presToolbarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_Indent',
			label: menuStrs.formatMenu_Indent,
			disabled: true,
		    accelKey: dojo.isMac? menuStrs.accel_formatMenu_Indent_Mac : menuStrs.accel_formatMenu_Indent,
			onClick: function() {			    	
				var editor = window.pe.scene.getEditor();
	            editor.execCommand('indent');
			},
			dir: dirAttr
		}));
		
		layoutMenu.addChild( new dijit.MenuItem(
		{
			id:'P_i_DecreaseIndent',
			label: menuStrs.formatMenu_DecreaseIndent,
			disabled: true,
		    accelKey: dojo.isMac? menuStrs.accel_formatMenu_DecreaseIndent_Mac : menuStrs.accel_formatMenu_DecreaseIndent,
			onClick: function() {			    	
				var editor = window.pe.scene.getEditor();
	            editor.execCommand('outdent');
			},
			dir: dirAttr
		}));
		
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
		    id: "P_m_Format",
			label: menuStrs.formatMenu,
			popup: layoutMenu,
			dir: dirAttr
		}));
		
			
		var tableMenu = new dijit.Menu( {dir: dirAttr} );

		dojo.addClass(tableMenu.domNode,"lotusActionMenu");
		tableMenu.domNode.style.display ='none';
		document.body.appendChild(tableMenu.domNode);
		
		
		tableMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_Create',
		    label: menuStrs.tableMenu_Create,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_createTableBox}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		/*
		tableMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_CreateFromTemplate',
			label: menuStrs.tableMenu_CreateFromTemplate,
			onClick: function() {			    	
				//TODO:
			}			    
		}));
		*/			
		tableMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_DeleteTable',
		    label: menuStrs.tableMenu_Delete,
		    disabled: true,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_deleteTableBox}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
					
		tableMenu.addChild( new dijit.MenuSeparator() );
		
		var tableRowSubMenu = new dijit.Menu({dir: dirAttr});
		dojo.addClass(tableRowSubMenu.domNode,"lotusActionMenu");
		tableRowSubMenu.domNode.style.display ='none';
		document.body.appendChild(tableRowSubMenu.domNode);
		
		tableRowSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableInsertRow',
			label: menuStrs.tableMenu_RowInsertRow,
			disabled: true,
			onClick: function()
			{
				var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_launchTableRowDialog,
				insertBeforeEnabled:window.pe.scene.getEditor().getCommand('insertRowBefore').state ? true : false}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
								
		tableRowSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableDeleteRow',
			label: menuStrs.tableMenu_RowDelete,
			disabled: true,
		    onClick: function() {			    	
				var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_DelSTRow}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
		}));
		
		var tableRow = new dijit.PopupMenuItem(
		{
			id:'P_i_TableRow',
		    label: menuStrs.tableMenu_Row,
		    disabled: true,
		    popup: tableRowSubMenu,
		    dir: dirAttr
		});
		dojo.style( tableRow.arrowWrapper, 'visibility', '' );
		
		//D13853 -- Same actions to tableRow as was done in D11717
		if(dojo.isIE < 9){
			dojo.connect(tableRow, 'onMouseEnter', function() {
				pe.scene.validResize = false;
			});
			
			dojo.connect(tableRow, 'onMouseLeave', function() {
				pe.scene.validResize = true;
			});
		}		

		tableMenu.addChild( tableRow );
		
		var tableColSubMenu = new dijit.Menu({dir: dirAttr});
		dojo.addClass(tableColSubMenu.domNode,"lotusActionMenu");
		tableColSubMenu.domNode.style.display ='none';
		document.body.appendChild(tableColSubMenu.domNode);
		
		tableColSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableInsertCol',
			label: menuStrs.tableMenu_ColumnInsertColumn,
			disabled: true,
		    onClick: function() {			    	
				var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_launchTableColDialog,
				insertBeforeEnabled:window.pe.scene.getEditor().getCommand('insertColBefore').state ? true : false}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    },
		    dir: dirAttr
		}));
		
		/*
		tableColSubMenu.addChild( new dijit.MenuSeparator() );
		tableColSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableResizeCol',
			label: window.g_presentationMode ? menuStrs.tableMenu_ResizeColumns : menuStrs.tableMenu_ResizeColumn,
			disabled: true,
			onClick: function() {			    	
				var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_ResizeSTCol}];
					concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    }																
		}));
		*/
		
		/*
		tableColSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableColMarkasCategory',
			label: menuStrs.tableMenu_MarkasCategory,
			disabled: true,
			onClick: function() {			    	
				//TODO:
		    }																
		}));
		*/	
	
		/* column sort disabled since it doesn't work well with Japanese
		tableColSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableSortColAsc',
			label: menuStrs.tableMenu_ColumnSortAscending,
			disabled: true,
		    onClick: function() {			    	
				var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_sortSTColAsc}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    }																				
		}));
		
		tableColSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableSortColDesc',
			label: menuStrs.tableMenu_ColumnSortDescending,
			disabled: true,
		    onClick: function() {			    	
				var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_sortSTColDesc}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		    }																								
		}));
		*/
		
		tableColSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableDeleteCol',
			label: menuStrs.tableMenu_ColumnDelete,
			disabled: true,
			onClick: function() {			    	
				var eventData = [{'eventName': concord.util.events.presMenubarEvents_eventName_DelSTCol}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		var tableCol = new dijit.PopupMenuItem(
		{
			id:'P_i_TableCol',
		    label: menuStrs.tableMenu_Column,
		    disabled: true,
		    popup: tableColSubMenu,
		    dir: dirAttr
		});
		dojo.style( tableCol.arrowWrapper, 'visibility', '' );
		
		//D13853 -- Same actions to tableCol as was done in D11717
		if(dojo.isIE < 9){
			dojo.connect(tableCol, 'onMouseEnter', function() {
				pe.scene.validResize = false;
			});
			
			dojo.connect(tableCol, 'onMouseLeave', function() {
				pe.scene.validResize = true;
			});
		}		

		tableMenu.addChild( tableCol );
		
		var tableCellSubMenu = new dijit.Menu();
		dojo.addClass(tableCellSubMenu.domNode,"lotusActionMenu");
		tableCellSubMenu.domNode.style.display ='none';
		document.body.appendChild(tableCellSubMenu.domNode);
		
		tableCellSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableCellAlignLeft',
			label: menuStrs.tableMenu_CellAlignLeft,
			disabled: true,
		    onClick: function() {
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_leftAlignCellContent}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		tableCellSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableCellAlignCenter',
			label: menuStrs.tableMenu_CellAlignCenter,
			disabled: true,
		    onClick: function() {
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_centerAlignCellContent}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		tableCellSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableCellAlignRight',
			label: menuStrs.tableMenu_CellAlignRight,
			disabled: true,
		    onClick: function() {
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_rightAlignCellContent}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		tableCellSubMenu.addChild(new dijit.MenuItem(
		{
			id:'P_i_TableCellClrContent',
			label: menuStrs.tableMenu_CellClearContents,
			disabled: true,
		    onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_clearCellContent}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		var tableCell = new dijit.PopupMenuItem(
		{
			id:'P_i_TableCell',
		    label: menuStrs.tableMenu_Cell,
		    disabled: true,
		    popup: tableCellSubMenu,
		    dir: dirAttr
		});
		dojo.style( tableCell.arrowWrapper, 'visibility', '' );
		
		//D13853 -- Same actions to tableCell as was done in D11717
		if(dojo.isIE < 9){
			dojo.connect(tableCell, 'onMouseEnter', function() {
				pe.scene.validResize = false;
			});
			
			dojo.connect(tableCell, 'onMouseLeave', function() {
				pe.scene.validResize = true;
			});
		}		

		tableMenu.addChild( tableCell );
		
		tableMenu.addChild( new dijit.MenuSeparator() );

		tableMenu.addChild( new dijit.MenuItem(
		{
			id: 'P_i_TableCellProperties',
		    label: dojo.i18n.getLocalization("concord.widgets","CKResource").smarttables.ctxMenuTableCellProperties,
		    disabled: true,
		    onClick: function() {	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_launchCellPropertyDlg}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
			id: "P_m_Table",
		    label: menuStrs.tableMenu,
			popup: tableMenu
		}));
		
		
		/* add assignment menu here */
		var taskMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(taskMenu.domNode,"lotusActionMenu");
		taskMenu.domNode.style.display ='none';
		document.body.appendChild(taskMenu.domNode);
		
		taskMenu.addChild(new dijit.MenuItem(
		{
			id: "P_i_TeamAddComment",
			label: menuStrs.teamMenu_AddComment,
			onClick: function(){
				pe.scene.toggleCommentsCmd();
			},
			dir: dirAttr
		}));
		if(window.pe.scene.bAssignment){
			
			taskMenu.addChild( new dijit.MenuSeparator() );	
			
			var assignMItem = new dijit.MenuItem(
			{
				id:'P_i_TeamAssignSlides',
				label: menuStrs.teamMenu_AssignSlides,
				onClick: concord.task.TaskUtil.publishAssignSlides,
				disabled:false,
				dir: dirAttr
			});
			taskMenu.addChild( assignMItem );
			
			var editAssignMItem = new dijit.MenuItem(
			{
				id:'P_i_TeamEditSlide',
				label: menuStrs.teamMenu_EditSlide,
				onClick: concord.task.TaskUtil.publishEditAssignSlide,
				disabled:false,
				dir: dirAttr
			});
			taskMenu.addChild( editAssignMItem );
			
			var reopenActionMItem = new dijit.MenuItem(
			{
				id:'P_i_TeamReopenAssignedSlides',
				label: menuStrs.teamMenu_ReopenSlideAssignment,
				onClick: concord.task.TaskUtil.publishReopenAssignSlides,
				disabled:false,
				dir: dirAttr
			});
			taskMenu.addChild( reopenActionMItem );
			
			var reassignMItem = new dijit.MenuItem(
			{
				id:'P_i_TeamReassignSlides',
				label: menuStrs.teamMenu_ReassignSlide,
				onClick: concord.task.TaskUtil.publishReassignSlides,
				disabled:false,
				dir: dirAttr
			});
			taskMenu.addChild( reassignMItem );	
						
			var markSlidesCompeleteMenu = new dijit.MenuItem(
			{
				id:'P_i_TeamMarkSComplete',
				label: menuStrs.teamMenu_MarkSlidesComplete,
				onClick: concord.task.TaskUtil.publishMarkDone,
				disabled:false,
				dir: dirAttr
			});
			this.markSlidesCompeleteMenu = markSlidesCompeleteMenu;
			taskMenu.addChild( markSlidesCompeleteMenu );
			
			var approveMItem = new dijit.MenuItem({
				id:"P_i_teamApproveSlides",
				label: menuStrs.teamMenu_ApproveSlides,
				onClick: concord.task.TaskUtil.publishApprove,
				disabled:false,
				dir: dirAttr
			});
			taskMenu.addChild(approveMItem);	
			
			taskMenu.addChild( new dijit.MenuSeparator() );	
			
			var returnForReworkMenu = new dijit.MenuItem(
			{
				id:'P_i_TeamReturnForRework',
				label: menuStrs.teamMenu_ReturnForRework,
				onClick: concord.task.TaskUtil.publishReject,
				disabled:false,
				dir: dirAttr
			});
			this.returnForReworkMenu = returnForReworkMenu;
			taskMenu.addChild( returnForReworkMenu );	
			
			var unassignMenu = new dijit.MenuItem(
			{
				id:'P_i_TeamDeleteAssignment',
				label: menuStrs.teamMenu_RemoveAssignment,
				disabled: false,
				onClick: concord.task.TaskUtil.publishUnassign,
				dir: dirAttr
			});
			//dojo.style( unassignMenu.arrowWrapper, 'visibility', '' );
			this.unassignMenu = unassignMenu;
			taskMenu.addChild(unassignMenu );
			
			var removeComplAssignmentMenu = new dijit.MenuItem(
			{
				id:'P_i_TeamRemoveCompletedSlides',
				label: menuStrs.teamMenu_RemoveCompletedAssignments,
				onClick: concord.task.TaskUtil.publishRemoveCompletedTask,
				disabled: false,
				dir: dirAttr
			});
			//dojo.style( removeComplAssignmentMenu.arrowWrapper, 'visibility', '' );
			this.removeComplAssignmentMenu = removeComplAssignmentMenu;
			taskMenu.addChild(removeComplAssignmentMenu );
			
			taskMenu.addChild(new dijit.MenuSeparator());	
		
			var aboutMItem = new dijit.MenuItem({
				id:"P_i_teamAboutSlide",
				label: menuStrs.teamMenu_AboutThisSlide,
				onClick: concord.task.TaskUtil.publishAboutSlideAssignment,
				disabled:false,
				dir: dirAttr
			});
			taskMenu.addChild(aboutMItem);			
			
		}
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
		    id: "P_m_Team",
			label: menuStrs.teamMenu,
			popup: taskMenu,
			dir: dirAttr
		}));
		
		var toolMenu = new dijit.Menu( {dir: dirAttr} );

		dojo.addClass(toolMenu.domNode,"lotusActionMenu");
		
		var scLangSubMenu = new dijit.Menu({
			dir: dirAttr,
			baseClass: "concordMenuStyle"
		});	
		dojo.addClass(scLangSubMenu.domNode,"lotusActionMenu");
		scLangSubMenu.domNode.style.display ='none';
		document.body.appendChild(scLangSubMenu.domNode);	
		pe.dicMenus = new Array();		
		if(spellcheckerManager)
		{
			for(var i=0; i<spellcheckerManager.supportedLang.length; i++)
			{
				var dic = spellcheckerManager.supportedLang[i];
				var newDic = dic.replace(/-/,'_');
				var id = 'P_i_'+dic;
				var label_id = 'toolsMenu_Dictionary'+'_'+newDic;
				var label = menuStrs[label_id];
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
							var myDic = this.id.replace(/P_i_/,'');
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
			id: 'P_i_SelectDic',
			label: menuStrs.toolsMenu_SelectDictionary,
		    popup: scLangSubMenu,
		    dir: dirAttr
		});
		dojo.style( scLangDics.arrowWrapper, 'visibility', '' );
		toolMenu.addChild( scLangDics );			
		
		pe.autoSpellCheckMenu = new dijit.CheckedMenuItem(
				{
				    id: "P_i_AutoSpellCheck",
					label: menuStrs.viewMenu_AutomaticSpellCheck,
					checked: false,
					onChange: function(checked) {			    	
						//pe.spellcheckMenu.setDisabled(checked);
						if(spellcheckerManager)
						{
							setTimeout(function(){
								var enable = !spellcheckerManager.isAutoScaytEnabled();
								spellcheckerManager.enableAutoScayt(enable);									
								if(pe && pe.settings)
								  pe.settings.setAutoSpellCheck(enable);
							}, 0);
						}
				    },
				    dir: dirAttr
				});
		toolMenu.addChild( pe.autoSpellCheckMenu );
		
		var scPreferences = new dijit.MenuItem(
		{
			id: 'P_i_Preferences',
			label: menuStrs.toolsMenu_Preferences,
		    onClick: function() {			    	
				pe.scene.showPreferencesDailog();
		    },
		    dir: dirAttr
		});
		toolMenu.addChild(scPreferences);	
		
		//D13853 -- Same actions to toolMenu as was done in D11717
		if(dojo.isIE < 9){
			dojo.connect(toolMenu, 'onMouseEnter', function() {
				pe.scene.validResize = false;
			});
			
			dojo.connect(toolMenu, 'onMouseLeave', function() {
				pe.scene.validResize = true;
			});
		}		

		if(dojo.isSafari && dojo.isSafari < 5.1)
			pe.autoSpellCheckMenu.setDisabled(true);
		
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
			id: "P_m_Tools",
			label: menuStrs.toolsMenu,
			popup: toolMenu
		}));
		
		// init dictionaries menu
		for(var dic_locale in pe.dicMenus)
		{
			if(spellcheckerManager && spellcheckerManager.lang == dic_locale)
				pe.dicMenus[dic_locale].attr("checked", true);  
			else
				pe.dicMenus[dic_locale].attr("checked", false);
		}	
		
	 	if(!(dojo.isSafari && dojo.isSafari < 5.1) && pe.settings && pe.settings.getAutoSpellCheck() )
		{
			  pe.autoSpellCheckMenu.attr("checked", true);
			  //pe.spellcheckMenu.setDisabled(true);	
			  if(spellcheckerManager)
			  {
				  spellcheckerManager.setAutoScayt(true);
			  }					
		}		
		
		var prezMenu = new dijit.Menu( {dir: dirAttr} );
		dojo.addClass(prezMenu.domNode,"lotusActionMenu");
		
		 this.ssMenuItem =  new dijit.MenuItem(
					{
					    id: "P_i_SlideShow",
						label: menuStrs.presentationMenu_SlideShow,
					    onClick: function() {			    	
							var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_slideShow}];
							concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
					    },
					    dir: dirAttr
					});
		prezMenu.addChild( this.ssMenuItem );
		
		
		 this.ssCoviewMenuItem = new dijit.MenuItem(
					{
					    id: "P_i_SlideShowWithCoview_",
						label: menuStrs.presentationMenu_SlideShowWithCoview,
					    onClick: function() {			    	
							var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_slideShow, coView:true}];
							concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
					    },
					    dir: dirAttr
			 		});
		 
		prezMenu.addChild(this.ssCoviewMenuItem );
		
		
		 this.ssFromCurrentMenuItem = new dijit.MenuItem(
					{
						id: "P_i_SlideShowFromCurrent",
						label: menuStrs.presentationMenu_SlideShowFromCurrent,
					    onClick: function() {			    	
							var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_slideShow,fromCurrSlide: true}];
							concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
					    },
					    dir: dirAttr
					});
		prezMenu.addChild( this.ssFromCurrentMenuItem);
		
		prezMenu.addChild( new dijit.MenuItem(
		{
			id: "P_i_SlideTransitions",
			label: menuStrs.presentationMenu_SlideTransitions,
			onClick: function() {			    	
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_launchSlideTransitionDialog}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
			},
			dir: dirAttr
		}));
		
		
		prezMenu.addChild( new dijit.MenuSeparator() );
		
		
		
		var coviewInvitesMenu = new dijit.Menu(
				{
					id: "P_i_coviewInvitesMenuList"	,
					dir: dirAttr				
				});
		dojo.addClass(coviewInvitesMenu.domNode,"lotusActionMenu");
		document.body.appendChild(coviewInvitesMenu.domNode);
		coviewInvitesMenu.attr('disabled',true);
		
		this.coviewInvitesPopMenu = new dijit.PopupMenuItem(
		{
					id: "P_i_coviewInvitesPopMenu",
					label: menuStrs.presentationMenu_CoviewInvites,	
					popup: coviewInvitesMenu,
					dir: dirAttr
		});
		
		if(dojo.isIE < 9){
			dojo.connect(this.coviewInvitesPopMenu, 'onMouseEnter', function() {
				pe.scene.validResize = false;
			});
			
			dojo.connect(this.coviewInvitesPopMenu, 'onMouseLeave', function() {
				pe.scene.validResize = true;
			});
		}		
		
		dojo.style( this.coviewInvitesPopMenu.arrowWrapper, 'visibility', '' );
		prezMenu.addChild( this.coviewInvitesPopMenu );
		
		
		prezMenu.addChild( new dijit.MenuSeparator() );		
		
		this.connectArray.push(dojo.connect(prezMenu,'onOpen',dojo.hitch(window.pe.scene,'updateCoViewInviteMenu',this.coviewInvitesPopMenu,menuStrs.presentationMenu_EmptyCoviewInvites))); 		
		
		this.presentationMainMenuItem = new dijit.PopupMenuBarItem(
				{
				    id: "P_m_Presentation",
					label: menuStrs.presentationMenu,
					onBlur: function(){
						
					},
					popup: prezMenu
				});
		
		menubar.addChild(this.presentationMainMenuItem);

		
		var helpMenu = new dijit.Menu( {dir: dirAttr} );
		
		dojo.addClass(helpMenu.domNode,"lotusActionMenu");
		helpMenu.addChild( new dijit.MenuItem(
		{
			id: "P_i_HelpContents",
		    label: menuStrs.helpMenu_Overview,
		    onClick: function(){
				var helpWin = window.open( concord.main.App.PRES_HELP_URL, "helpWindow", "width=800, height=800" );
				helpWin.focus();					        
		    },
		    dir: dirAttr
		}));
		
		if(!gIs_cloud){
			helpMenu.addChild( new dijit.MenuItem(
			{
				id: "P_i_HelpAbout",
				label: menuStrs.helpMenu_About,
				currScene: this.currScene,
				onClick: function(){
					pe.scene.validResize = false;
					this.currScene.aboutConcord();
					pe.scene.setFocusToDialog();
					pe.scene.validResize = true;
				},
				dir: dirAttr
			}));			
		}
		
		menubar.addChild( new dijit.PopupMenuBarItem(
		{
			id: "P_m_Help",
		    label: menuStrs.helpMenu,
			popup: helpMenu
		}));
		
		menubar.placeAt(parent.id);
		menubar.startup();
		menubar.containerNode.style.border = '0';

		// Defect 11717
		if(dojo.isIE < 9){
			dojo.connect(menubar, 'onMouseEnter', function() {
				pe.scene.validResize = false;
			});
			
			dojo.connect(menubar, 'onMouseLeave', function() {
				pe.scene.validResize = true;
			});
		}		
		
		if( pe.settings && !pe.settings.getMenubar() )
			parent.style.display = "none";
	},	
	
	// T15714
	// Disables context menus paste if clipboard content is from other document
	//
	chckPasteFromOtherDoc: function(){
		var pasteMenuItem = dijit.byId('P_i_Paste');
		if (!pasteMenuItem){
			return;
		}
		pasteMenuItem.attr('disabled',false);
	},	
	performCutAction: function(){
		if (this.menuBarObj.webclipboardEnabled){
			window.pe.scene.showMenusErrorMsg('cut');
		}else{
			var editor = window.pe.scene.getEditor();
            editor.execCommand('cut');
		}
	},

	performCopyAction: function(ev){
		if (this.menuBarObj.webclipboardEnabled){
			window.pe.scene.showMenusErrorMsg('copy');
		}else{
			var editor = window.pe.scene.getEditor();
            editor.execCommand('copy');
		}
	},

	performPasteAction: function(){
		if (this.menuBarObj.webclipboardEnabled){
			window.pe.scene.showMenusErrorMsg('paste');
		}else{
			var editor = window.pe.scene.getEditor();
            editor.execCommand('paste');
		}
	},
	
	showClipboardInfoMsg: function(msgType){
		var infoMsg = "";
		
		if (msgType == "cut"){
			infoMsg = this.nls.webClipboardInfoCutMsg;
		}else if (msgType == "copy"){
			infoMsg = this.nls.webClipboardInfoCopyMsg;
		}else if (msgType == "paste"){
			infoMsg = this.nls.webClipboardInfoPasteMsg;
		}
		
		var width = 550;
		var height = 175;
		var topPos = window.innerHeight/2 - height/2;
		var leftPos = window.innerWidth/2 - width/2;
		this.clipboardDialog = new concord.widgets.presentationDialog({
		      id: "clipboardDialog",
		      title: this.nls.webClipboardInfoTitle,
		      content: "<div id='dialogContentDiv' style='padding-left:20px;padding-left:10px;'>" + infoMsg + "</div>",		     
		      'presDialogHeight': height,
		      'presDialogWidth' : width,
		      'presDialogTop'   : topPos,
		      'presDialogLeft'   :leftPos,	
		      'heightUnit':'px',	      
		      'presModal': false,
		      'destroyOnClose':true,
		      'presDialogButtons' : [{'label':this.nls.webClipboardInfoOKBtn,'action':dojo.hitch(this,function(){})}]
			});
		this.clipboardDialog.startup();
		this.clipboardDialog.show();
	},

	enableBringToFrontMenuItems: function(){
		//D17817 make sure the widget exists
		if (dijit.byId('P_i_BringToFront')) {
			dijit.byId('P_i_BringToFront').setDisabled(false);
		}
	},

	disableBringToFrontMenuItems: function(){
		dijit.byId('P_i_BringToFront').setDisabled(true);
	},
	
	enableSendToBackMenuItems: function(){
		//D17817 make sure the widget exists
		if (dijit.byId('P_i_SendToBack')) {
			dijit.byId('P_i_SendToBack').setDisabled(false);
		}
	},

	disableSendToBackMenuItems: function(){
		dijit.byId('P_i_SendToBack').setDisabled(true);
	},
	
	enableSubSuperScriptMenuItems: function(){
		dijit.byId('P_i_Superscript').setDisabled(false);
		dijit.byId('P_i_Subscript').setDisabled(false);
	},
	
	disableSubSuperScriptMenuItems: function(){
		dijit.byId('P_i_Superscript').setDisabled(true);
		dijit.byId('P_i_Subscript').setDisabled(true);
	},
	
	enableStrikethroughMenuItem: function(){
		dijit.byId('P_i_Strikethrough').setDisabled(false);
	},
	
	disableStrikethroughMenuItem: function(){
		dijit.byId('P_i_Strikethrough').setDisabled(true);
	},
	
	enableHorizontalAlignMenuItem: function(){
		dijit.byId('P_i_Horizontal_Align').setDisabled(false);
	},
	
	disableHorizontalAlignMenuItem: function(){
		dijit.byId('P_i_Horizontal_Align').setDisabled(true);
	},

	enableTextDirectionMenuItem: function(){
		dijit.byId('P_i_Text_Direction').setDisabled(false);
	},

	disableTextDirectionMenuItem: function(){
		dijit.byId('P_i_Text_Direction').setDisabled(true);
	},
	
	enableImagePropertyMenuItem: function(){
		dijit.byId('P_i_ImageProperties').setDisabled(false);
	},
	
	disableImagePropertyMenuItem: function(){
		dijit.byId('P_i_ImageProperties').setDisabled(true);
	},
	
	enableTablePropertyMenuItem: function(){
		dijit.byId('P_i_TableProperties').setDisabled(false);
	},
	
	disableTablePropertyMenuItem: function(){
		dijit.byId('P_i_TableProperties').setDisabled(true);
	},
	
	enableTableCellPropertyMenuItem: function(){
		dijit.byId('P_i_TableCellProperties').setDisabled(false);
	},
	
	disableTableCellPropertyMenuItem: function(){
		dijit.byId('P_i_TableCellProperties').setDisabled(true);
	},
	
	enablePropertyMenuItem: function(){
		dijit.byId('P_i_Properties').setDisabled(false);
	},
	
	disablePropertyMenuItem: function(){
		dijit.byId('P_i_Properties').setDisabled(true);
	},
	
	enableTextPropertyMenuItem: function(){
		dijit.byId('P_i_TextProperties').setDisabled(false);
	},
	
	disableTextPropertyMenuItem: function(){
		dijit.byId('P_i_TextProperties').setDisabled(true);
	},
	
	enableTextFontPropertyMenuItems: function(){
		dijit.byId('P_i_IncreaseFontSize').setDisabled(false);
		dijit.byId('P_i_DecreaseFontSize').setDisabled(false);
	},
	
	disableTextFontPropertyMenuItems: function(){
		dijit.byId('P_i_IncreaseFontSize').setDisabled(true);
		dijit.byId('P_i_DecreaseFontSize').setDisabled(true);
	},

	getTableEditingMenuItems: function(){
		var tblMenuItems = [ 'P_i_TableCellAlignLeft', 'P_i_TableCellAlignCenter',
								'P_i_TableCellAlignRight', 'P_i_TableCellClrContent',
								'P_i_TableRow', 'P_i_TableInsertRow', 'P_i_TableDeleteRow',
								'P_i_TableCol', 'P_i_TableInsertCol', 'P_i_TableDeleteCol',
								// sort disabled due to issues sorting japanese characters
								//'P_i_TableSortColAsc', 'P_i_TableSortColDesc', 								
								'P_i_TableCell', 'P_i_TableCellProperties'
							];
		return tblMenuItems;
	},
	
	
	enableCopyCutMenuItems: function(data){
		dijit.byId('P_i_Copy').setDisabled(false);	
		dijit.byId('P_i_Cut').setDisabled(false);
	},
	
	
	disableCopyCutMenuItems: function(data){
		dijit.byId('P_i_Copy').setDisabled(true);	
		dijit.byId('P_i_Cut').setDisabled(true);		
	},
	
	enableTableEditingMenuItems: function(data){
		var tblMenuItems = this.getTableEditingMenuItems();
		
		for (var i=0; i<tblMenuItems.length; i++){
			var menuItem = dijit.byId(tblMenuItems[i]);
			// do not allow to delete a row or a column if there is only one row or column left
			if (tblMenuItems[i] == 'P_i_TableDeleteRow' && data.numRows <= 1) {
				menuItem.setDisabled(true);
			} else if (tblMenuItems[i] == 'P_i_TableDeleteCol' && data.numCols <= 1) {
				menuItem.setDisabled(true);
			} else {
				// enable all other menu items
				menuItem.setDisabled(false);
			}
			menuItem = null;
		}
		tblMenuItems = null;
	},

	disableTableEditingMenuItems: function(){
		console.log("call method disableTableEditingMenuItems");
		var tblMenuItems = this.getTableEditingMenuItems();
		
		for (var i=0; i<tblMenuItems.length; i++){
			var tmp=dijit.byId(tblMenuItems[i]);
			if(tmp){
				tmp.setDisabled(true);
			}
			tmp = null;
		}
		tblMenuItems = null;
	},
	
	enableTextSelectionMenuItems: function(){
		dijit.byId('P_i_Vertical_Align').setDisabled(false);
	},

	disableTextSelectionMenuItems: function(){
		dijit.byId('P_i_Vertical_Align').setDisabled(true);
	},
	
	enableTableSelectionMenuItems: function(){
		dijit.byId('P_i_DeleteTable').setDisabled(false);
		dijit.byId('P_i_Vertical_Align').setDisabled(false);
		dijit.byId('P_i_Horizontal_Align').setDisabled(false);
		if(BidiUtils.isBidiOn()){
			dijit.byId('P_i_Text_Direction').setDisabled(true);
		}
	},

	disableTableSelectionMenuItems: function(){
		dijit.byId('P_i_DeleteTable').setDisabled(true);
		dijit.byId('P_i_Vertical_Align').setDisabled(true);
		dijit.byId('P_i_Horizontal_Align').setDisabled(true);
	},

	enableUndoMenuItem: function(){
		var menuItem =dijit.byId('P_i_Undo'); 
		if(menuItem){
			menuItem.setDisabled(false);
		}
	},

	disableUndoMenuItem: function(){
		var menuItem =dijit.byId('P_i_Undo'); 
		if(menuItem){
			menuItem.setDisabled(true);
		}
	},

	enableRedoMenuItem: function(){
		var menuItem =dijit.byId('P_i_Redo'); 
		if(menuItem){
			menuItem.setDisabled(false);
		}
	},

	disableRedoMenuItem: function(){
		var menuItem =dijit.byId('P_i_Redo'); 
		if(menuItem){
			menuItem.setDisabled(true);
		}
	},
	
	enableDiscardMenuItem: function(){
		var menuItem =dijit.byId('P_i_Discard'); 
		if(menuItem){
			menuItem.setDisabled(false);
		}
	},

	disableDiscardMenuItem: function(){
		var menuItem =dijit.byId('P_i_Discard'); 
		if(menuItem){
			menuItem.setDisabled(true);
		}
	},
	
	/**
	 * Changes the table items in the table menubar.
	 * Currently this checks to see if multiple cells are selected and disables
	 * the Row and Column items including resize. 
	 * @param data
	 */
	changeTableEditingMenuItems: function(data){		
		var tblMenuItems = this.getTableEditingMenuItems();
		
		if (data.containsMergedCell) {
			dijit.byId('P_i_TableRow').setDisabled(true);
			dijit.byId('P_i_TableCol').setDisabled(true);			
		} else {
			for (var i=0; i<tblMenuItems.length; i++){
				var menuItem = dijit.byId(tblMenuItems[i]);
				// If multiple cells are selected, don't allow row or column manipulation
				// Note that delete is not currently disabled.
				if ( (tblMenuItems[i] == 'P_i_TableInsertRow' || tblMenuItems[i] == 'P_i_TableInsertCol'
															  || tblMenuItems[i] == 'P_i_TableCellProperties')
						&& !data.isInCell ) {
					menuItem.setDisabled(true);
				} else if  ( tblMenuItems[i] == 'P_i_TableInsertRow' && data.hasMaxRows ) {
					menuItem.setDisabled(true);
				} else if  ( tblMenuItems[i] == 'P_i_TableInsertCol' && data.hasMaxCols ) {
					menuItem.setDisabled(true);
				} else if  ( tblMenuItems[i] == 'P_i_TableCellClrContent' && !data.selectionHasText){
					menuItem.setDisabled(true);
				} else {
					// enable all other menu items
					menuItem.setDisabled(false);
					dijit.byId('P_i_TableRow').setDisabled(false);
					dijit.byId('P_i_TableCol').setDisabled(false);
				}
				menuItem = null;
			}
		}
		tblMenuItems = null;
	},

	getEditMenuItems: function(){
		var editMenuItems = [ 'P_i_New','P_i_Discard','P_i_Save','P_i_SaveAs','P_i_Share','P_i_PrintPreview',
		                      'P_i_Undo', 'P_i_Redo','P_i_Cut','P_i_Copy', 'P_i_Paste', 'P_i_DeleteSlide', 'P_i_SelectAll',
		                      'P_i_CoeditingHighlights', 'P_i_Sidebar','P_i_ShowUnsupportWarning',
		                      'P_i_NewSlide', 'P_i_DupSlide','P_i_Img','P_i_TextBox',
		                      'P_i_SlideLayout','P_i_SlideDesign','P_i_ImageProperties','P_i_Superscript','P_i_Subscript','P_i_BringToFront','P_i_SendToBack',
		                      'P_i_Horizontal_Align','P_i_TextProperties',
		                      'P_i_Create','P_i_DeleteTable',
		                      'P_i_TableCell','P_i_TableRow','P_i_TableCol', 'P_i_TableCellProperties',
		                      'P_i_TableCellAlignLeft','P_i_TableCellAlignCenter','P_i_TableCellAlignRight','P_i_TableCellClrContent',
		                      'P_i_TableInsertRow','P_i_TableInsertCol','P_i_TableDeleteRow','P_i_TableDeleteCol',
		                      'P_i_TableSortColAsc','P_i_TableSortColDesc',
		                      'P_i_TeamAssignToWrite','P_i_TeamAssignToReview','P_i_TeamDeleteAssignment','P_i_TeamMarkSlidesComplete',
		                      'P_i_SpellCheck','P_i_AutoSpellCheck'
		                      ];

		if(BidiUtils.isBidiOn()){
			editMenuItems.push('P_i_Text_Direction');
		}
		return editMenuItems;
	},
	disableEditMenuItems: function(){
		var editMenuItems = this.getEditMenuItems();
		
		for (var i=0; i<editMenuItems.length; i++){
			var menuItem = dijit.byId(editMenuItems[i]);
			if(menuItem!=null){
				menuItem.setDisabled(true);
			}
		}		
	},
	//
	//Nullifies all essential variables
	//
	nullifyVariables: function(){
		this.currScene=null;
		this.ssEditor=null;
		this.parentDiv=null;
		this.webclipboardEnabled=null;
		this.connectArray=null;
		this.okButtonKeyupConnect=null;
		this.cancelButtonKeyupConnect=null;
	},
	
	destroyPresMenubar: function(){
		
		//1- Remove event connection
		for(var i=0; i<this.connectArray.length; i++){
			 dojo.disconnect(this.connectArray[i]);		
		}	
		
		//2-  Destroy  dijit.menu and other objects
		if( this.menubar ) this.menubar.destroyRecursive(false);	
		if (this.menubarObserver) this.menubarObserver.destroyRecursive(false);
		
		//3- Nullify variables
		this.nullifyVariables();		
	}
});
