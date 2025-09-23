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

/*
 * @keypressHandler.js CAEditor component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.keypressHandler");
dojo.require("concord.util.events");

dojo.declare("concord.widgets.keypressHandler", null, {
	
	constructor: function() {
		this.init();
	},
	
	blockKeyPress	:		false,

	KEYPRESS		: 		concord.util.events.keypressHandlerEvents_eventName_keypressEvent,	
	// Events that we care for	
	CTRL_A 			:		concord.util.events.keypressHandlerEvents_eventAction_CTRL_A,
	CTRL_C 			:		concord.util.events.keypressHandlerEvents_eventAction_CTRL_C,
	CTRL_V 			:		concord.util.events.keypressHandlerEvents_eventAction_CTRL_V,
	CTRL_X 			:		concord.util.events.keypressHandlerEvents_eventAction_CTRL_X,
	CTRL_M 			:		concord.util.events.keypressHandlerEvents_eventAction_CTRL_M,
	DELETE			:		concord.util.events.keypressHandlerEvents_eventAction_DELETE,
	DOWN_ARROW		:		concord.util.events.keypressHandlerEvents_eventAction_DOWN_ARROW,
	END				:		concord.util.events.keypressHandlerEvents_eventAction_END,
	ENTER			:		concord.util.events.keypressHandlerEvents_eventAction_ENTER,
	ESC				:		concord.util.events.keypressHandlerEvents_eventAction_ESC,
	HOME 			:		concord.util.events.keypressHandlerEvents_eventAction_HOME,
	INSERT			:		concord.util.events.keypressHandlerEvents_eventAction_INSERT,
	LEFT_ARROW		:		concord.util.events.keypressHandlerEvents_eventAction_LEFT_ARROW,
	PAGE_DOWN		:		concord.util.events.keypressHandlerEvents_eventAction_PAGE_DOWN,
	PAGE_UP			:		concord.util.events.keypressHandlerEvents_eventAction_PAGE_UP,
	RIGHT_ARROW		:		concord.util.events.keypressHandlerEvents_eventAction_RIGHT_ARROW,
	UP_ARROW		:		concord.util.events.keypressHandlerEvents_eventAction_UP_ARROW,
	TAB				:		concord.util.events.keypressHandlerEvents_eventAction_TAB,
	CTRL_TAB		:		concord.util.events.keypressHandlerEvents_eventAction_CTRL_TAB,
	SHIFT_TAB		:		concord.util.events.keypressHandlerEvents_eventAction_SHIFT_TAB,
	BACKSPACE		:		concord.util.events.keypressHandlerEvents_eventAction_BACKSPACE,
	SAVE		    :		concord.util.events.keypressHandlerEvents_eventAction_SAVE,
	PRINT		    :		concord.util.events.keypressHandlerEvents_eventAction_PRINT,
	ALT_SHIFT_F		:		concord.util.events.keypressHandlerEvents_eventAction_ALT_SHIFT_F,
	ALT_F10			:		concord.util.events.keypressHandlerEvents_eventAction_ALT_F10,
	SHIFT_F10		:		concord.util.events.keypressHandlerEvents_eventAction_SHIFT_F10,
	SPACE			:		concord.util.events.keypressHandlerEvents_eventAction_SPACE,
	connectArray	:		[], //Adding connectArray for  D41464
	
	
	init: function(){
		//subscribe to slidesorter ready event, this is for the scene to wait to get the ckeditor toolbar height
		concord.util.events.subscribe(concord.util.events.slideSorterEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));			
		concord.util.events.subscribe(concord.util.events.genericEvents, null, dojo.hitch(this,this.handleCommonControlEvents));
	},	
	
	handleCommonControlEvents: function(data) {
		if ((data.eventName == concord.util.events.genericEvents_eventName_blockKeyPress)){
			console.log("Block key press event reveived");
			this.blockKeyPress = true;
		}
		else if (data.eventName == concord.util.events.genericEvents_eventName_unblockKeyPress) {
			console.log("Unblock key press event reveived");
			this.blockKeyPress = false;
		}
	},
	
	//
	// handles published messages from other components
	//
	handleSubscriptionEvents: function(data){	       		      
		if ((data.eventName=='slideSorterReady') && (this.connectArray.length==0)){ //JMT - D41464 We should note that slideSorterReady gets published again when template is applied by other user					
			if (dojo.isIE){
				document.body.onkeydown = dojo.hitch(this,this.handleKeypress);
				CKEDITOR.instances.editor1.document.$.body.onkeydown = dojo.hitch(this,this.handleKeypress);
			} else{
				this.connectArray.push(dojo.connect(window,'onkeydown',dojo.hitch(this,this.handleKeypress)));
				this.connectArray.push(dojo.connect(CKEDITOR.instances.editor1.document.$.body,'onkeydown',dojo.hitch(this,this.handleKeypress)));				
			}

			//Handles when user mouses out from slideeditor  
			if (!concord.util.browser.isMobile()) {  // do not need 'onmouseover' on iPad
			  var leftPanel = dojo.byId('leftPanel');
			  var toolbar = dojo.byId('toolbar');
			  var menubar = dojo.byId('menubar');
			  
			  this.connectArray.push(dojo.connect(leftPanel,'onmouseover',dojo.hitch(this,this.handleMouseOver)));
			  this.connectArray.push(dojo.connect(toolbar,'onmouseover',dojo.hitch(this,this.handleMouseOver)));
			  this.connectArray.push(dojo.connect(menubar,'onmouseover',dojo.hitch(this,this.handleMouseOver)));
			}
		}	
	},
	
	//
	//Need to clean up events 
	//
	disconnectEvents: function(){		
		for(var i=0; i<this.connectArray.length; i++){
			 dojo.disconnect(this.connectArray[i]);
		}
		this.connectArray = [];
	},
	
	// 
	// Handles when user mouses out from slideeditor  
	//
	handleMouseOver: function(e){
		if ((dojo.isIE) && (e == null)){
				e = window.event || CKEDITOR.instances.editor1.window.$.event;
		}
		 var eventData = [{'eventName':concord.util.events.keypressHandlerEvents_eventAction_OUTSIDE_EDITOR ,'e':e}]; 
		 concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);						
	},
	
	//
	// Handles when key events. Looking for 
	// 1) CTRL+c
	// 2) CTRL+v
	//
	handleKeypress: function(e){
		// to ignore keypress in loading or read-only mode or view draft mode
		var tempScene = window.pe.scene;
    	if (!tempScene.bLoadFinished || tempScene.bInReadOnlyMode ||
    			tempScene.isViewDraftMode()) {
			return;
		}
    	
		if (this.blockKeyPress) {
			console.log("KeyPress is blocked");
			return;
		}
		if (window.g_concordInDebugMode) console.log('handleKeypress '+e);		
		if (dojo.isIE){
			if (e == null) {
				e = window.event;
				if (e==null){ //try slidesorter window
					e = CKEDITOR.instances.editor1.window.$.event;
				}
			}
			if ((e) && ((e.srcElement.nodeName.toLowerCase() == 'input' || e.srcElement.nodeName.toLowerCase() == 'textarea'))){
				if ( !(e.keyCode == 9 && pe.scene.getFocusComponent() == 'dialogs')){
					return;		
				}
			}
		}else {
			var target;
			
			if (typeof e.originalTarget !=  'undefined'){
				target = e.originalTarget;
				try {
					target.nodeName.toLowerCase();
				}
				catch(ex) {
					target = e.target;
				}
			} else{
				target = e.target;
			}
			
			if(target.nodeName.toLowerCase() == 'input' || target.nodeName.toLowerCase() == 'textarea'){
				if ( !(e.keyCode == 9 && pe.scene.getFocusComponent() == 'dialogs')){
					return;		
				}
			}
		}
		
		var evtKeyCode = e.keyCode;
		var action = null;
		console.info("=======================keypressHandler handleKeypress keyCode:"+evtKeyCode);

		 if ((evtKeyCode == 67)) {
			 if (e.ctrlKey || e.metaKey){
				 console.log('=======================keypressHandler handleKeypress CTRL_C');
				 //call this code to clear the system clipboard before copying an element in the presentation editor.
				 //we do this so that when a user presses CTRL_V we make sure the internal clipboard takes
				 //precedence over the system clipboard.   Since we do not support copying elements from IBM Docs
				 //to other sources.
				 pe.scene.disableOnSelectStart();
				 var eventData = [{'eventName':concord.util.events.keypressHandlerEvents_eventName_keypressEvent ,
		               'e':e,
		               'eventAction':concord.util.events.keypressHandlerEvents_eventAction_CTRL_C}]; 
				 concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);
			     pe.scene.restoreOnSelectStart();
			 } else{
			 }			 
		 } else if((evtKeyCode == 80)) {
			 if (e.ctrlKey || e.metaKey) {				 
				 dojo.stopEvent(e);				 
				 // Interesting behavior in Safari in that you cannot do a callback and get 
				 // window.open to work reliably.  The callback is necessary in FF, IE, Chrome to 
				 // prevent the native browser print dialog from opening.
				 if (!dojo.isSafari) {
					 setTimeout(function(){					 
					    	var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_printHtml}];
							concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
					 },10);
				 } else {
				    	var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_printHtml}];
						concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);					 
				 }
				 
				 return;
			 }
		 } else if((evtKeyCode == 83)) {
			 if (e.ctrlKey || e.metaKey) {				 
				 dojo.stopEvent(e);		
				 
				 if(!pe.scene.supportSaveShortCut())
				 {
					 return;
				 }
				
				 //D14863 Problem with native browser save dialog appearing 
				 //calling save event in a timeout to fork and return and prevent native dialog.
				 setTimeout(dojo.hitch(this, function(){					 
					 var eventData = [{'eventName':concord.util.events.keypressHandlerEvents_eventName_keypressEvent ,
						               'e':null,
						               'eventAction':concord.util.events.keypressHandlerEvents_eventAction_SAVE}]; 
					 concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);
				 },0));				 
				 return;
			 }
		 }
		 else if((evtKeyCode == 8)) {
			 if (e.currentTarget == window)
				 e.preventDefault();	
			 	 dojo.stopEvent(e);
			 	action = this.BACKSPACE;			
		 }else if ((evtKeyCode == 86)) {
			 if (e.ctrlKey || e.metaKey){
				 console.log('=======================keypressHandler handleKeypress CTRL_V');
				 //CTRL_V - Paste
				 //the code below will prepare a hidden div to paste content from
				 //system clipboard and test the data to see if there is something to paste.
				 //If not it will publish the CTRL_V paste event as usual.
				 pe.scene.clipboard.paste(e);
			 } else{
			 }
		 }else if ((evtKeyCode == 88)) {
			 if (e.ctrlKey || e.metaKey){
				 console.log('=======================keypressHandler handleKeypress CTRL_X');
				 pe.scene.disableOnSelectStart();
				 action=this.CTRL_X;
			 } else{
			 }
		 } else if(evtKeyCode==46) { //Delete
			 //D31383: "ctrl+shft+del" is hooked if the focus is not in the address bar.
			 var pass = e.shiftKey && e.ctrlKey;
			 if(!pass){
				 dojo.stopEvent(e);		
			 	 action=this.DELETE;
			 }
		 } else if ((evtKeyCode == 65)){
			 if (e.ctrlKey || e.metaKey){
				 dojo.stopEvent(e);		
				 action=this.CTRL_A;
			 } else{
			 }
		 }else if ((evtKeyCode == 77)){
			 if (e.ctrlKey || e.metaKey){
				 dojo.stopEvent(e);		
				 action=this.CTRL_M;
			 } 
		 } else if (evtKeyCode == 37){ //left arrow	
			 //dojo.stopEvent(e);	
		 	 action = this.LEFT_ARROW;
		 } else if (evtKeyCode == 39){ //right arrow			 
			//dojo.stopEvent(e);	
		 	 action = this.RIGHT_ARROW;
		 } else if (evtKeyCode == 38){ //up arrow			 
			 //dojo.stopEvent(e);	
		 	 action = this.UP_ARROW;
		 } else if (evtKeyCode == 40){ //down arrow			 
			 //dojo.stopEvent(e);	
		 	 action = this.DOWN_ARROW;
		 }else if (evtKeyCode == 36){ //Home			 
			dojo.stopEvent(e);	
	 	 	action = this.HOME;
		 }else if (evtKeyCode == 35){ //End			 
			dojo.stopEvent(e);	
	 	 	action = this.END;
		 }else if (evtKeyCode == 32) { //Space
			 action = this.SPACE;
		 }else if (evtKeyCode == 33){ //Page Up			 
				dojo.stopEvent(e);	
	 	 	action = this.PAGE_UP;
		 }else if (evtKeyCode == 34){ //Page Down			 
			dojo.stopEvent(e);	
	 	 	action = this.PAGE_DOWN;
		 }else if (evtKeyCode == 90){ //undo
			 if(e.ctrlKey || e.metaKey){
				 PresCKUtil.runPending();
				 pe.scene.getEditor().execCommand( "undo" );
			 }
		 }else if (evtKeyCode == 89){ //redo
			 if(e.ctrlKey || e.metaKey){
				 PresCKUtil.runPending();
				 pe.scene.getEditor().execCommand( "redo" );
			 }
		 }else if (evtKeyCode == 27){ //escape -- JMT may not need to handle ESC here
			 //dojo.stopEvent(e);	
		 	 action = this.ESC;
		 }else if (evtKeyCode == 9){ //TAB key
//				dojo.stopEvent(e);	
			 	action = this.TAB;
				if (e.ctrlKey || e.metaKey){
					 action=this.CTRL_TAB;
				} if (e.shiftKey || e.metaKey){
					 action=this.SHIFT_TAB;
				}
		 }else if (evtKeyCode == 70 ) { // f
			 if (e.altKey && e.shiftKey) {
				 if (!dojo.isIE || !e.cancelBubble) {
					 dojo.stopEvent(e);
				 }
				 action=this.ALT_SHIFT_F;
			 }
		 }else if (evtKeyCode == 13){ //ENTER key -- JMT may not need to handle ESC here
			 	var focus = pe.scene.getFocusComponent();
			 	if ( focus != 'dialogs' && focus != "concord.widgets.presMenubar"){
			 		dojo.stopEvent(e);	
			 	}
		 		action = this.ENTER;
		 }else if (evtKeyCode == 113) { // F2
			 if (e.shiftKey) {
				 // special check - the event is different on IE when key presses occur within
				 // the content box. In this case the stopEvent causes an exception. Therefore
				 // steps are taken to avoid this call. The affected key sequences are shift+f2,
				 // shift+f7 and alt-shift-f.
				 if (!dojo.isIE || !e.cancelBubble)
				{
					dojo.stopEvent(e);
				}
				var curfocus = pe.scene.getFocusComponent(false);
				if (curfocus == concord.util.events.SLIDE_SORTER_COMPONENT)
				{
					pe.scene.focusMgr.publishNextFocusRegion(concord.util.events.SLIDE_EDITOR_COMPONENT);
				}
				else if (curfocus == concord.util.events.SLIDE_EDITOR_COMPONENT)
				{
					pe.scene.focusMgr.setFocusComponent(concord.util.events.SIDE_BAR_COMPONENT);
					var sidebar = pe.scene.sidebar;
					if (sidebar)
					{
						if (sidebar.isCollapsed())
						{
							pe.scene.toggleSideBarCmd();
						}
						else
						{
							sidebar.setSidebarFocus();
						}
					}
					else
					{
						pe.scene.toggleSideBarCmd();
					}
				}
				else
				{
					pe.scene.focusMgr.publishNextFocusRegion(concord.util.events.SLIDE_SORTER_COMPONENT);
					var eventData = [{
						eventName: concord.util.events.presSideBarEvents_eventName_concordOpenSlideSorter
					}];
					concord.util.events.publish(concord.util.events.sideBarEvents, eventData);
				}
			 }
		 }
		 else if (evtKeyCode == 118) { // F7
			 if (e.shiftKey) {
				 if (!dojo.isIE || !e.cancelBubble) {
					 dojo.stopEvent(e);
				 }
				 concord.util.events.publish(concord.util.events.slideEditorEvents_SetFocus, null);	                            	 			                            	 			
			 }
		 }
		 else if (evtKeyCode == 121) { // F10
			 if (e.altKey) {
				 dojo.stopEvent(e);
				 pe.scene.focusMgr.publishNextFocusRegion(concord.util.events.PRES_TOOLBAR_COMPONENT);
			 }
			 if (e.shiftKey && pe.scene.getFocusComponent() == 'concord.widgets.slideSorter') { // SHIFT+F10 for slidesorter (contextMenu)
				 dojo.stopEvent(e);
				 action=this.SHIFT_F10;
			 }
		 }
		 
		 //check to see if the scene is in view mode. Disable certain keyboard shortcuts
		 var publishAction = this.disableKeyStrokeOnViewMode(action);		 
		 var disableKeyAction = this.disableKeyActionForFocusElement(e, action);
		 if ( !disableKeyAction && this._isArrowKeyAction( action)){
			 dojo.stopEvent(e);
		 }
		 if( pe.scene.isModalDialogShown() && pe.scene.getFocusComponent() == 'concord.widgets.slideSorter'){
			 var n = dijit.Dialog._dialogStack.length;
			 if( n>0){
				 if(dijit.Dialog._dialogStack[n-1].dialog.id == 'C_d_CommentAlertDlg'){
					 dojo.stopEvent(e);
					 return;
				 }
				 
			 }
		 }
		//publish keypress event
		 if (action && publishAction && !disableKeyAction)
		 {
			 console.log(action);
			 if(action == this.PAGE_DOWN || action == this.PAGE_UP || this.DOWN_ARROW || this.UP_ARROW || this.LEFT_ARROW || this.RIGHT_ARROW){
				 window.pe.scene.slideEditor.clearSlideNavSetTimeout(action);
			 }
			 var eventData = [{'eventName':this.KEYPRESS ,'e':e,'eventAction':action}]; 
			 concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);	
			 
			 if(action == this.CTRL_X)
			 {
				 pe.scene.restoreOnSelectStart();
			 }
		}
		
		//console.log('keypressHandle:handleKeypress','Exit with e.ctrlKey '+e.ctrlKey);	
	},
	
	disableArrowKeyActionOnMenu: function( e , action){
		var node = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target;
		if ( pe.scene.getFocusComponent() == concord.util.events.PRES_MENUBAR_COMPONENT &&
				this._isArrowKeyAction( action) &&
				dojo.hasClass( node, 'dijitMenuItem')){
			return true;
		}
		return false;
	},
	
	disableArrowKeyActionOnDialog: function(action){
		if ( pe.scene.getFocusComponent() == 'dialogs' &&
				this._isArrowKeyAction( action)){
			return true;
		}
		return false;
	},
	
	disableKeyActionForFocusElement: function(e, action){
		if ( this.disableArrowKeyActionOnMenu( e, action) || 
				this.disableArrowKeyActionOnDialog(action)){
			return true;
		}
		return false;
	},
	
	disableKeyStrokeOnViewMode: function(action){
		if (action == this.CTRL_V && window.pe.scene.sceneInfo.mode == 'view'){
			return false;
		}
		
		return true;
	},	
	
	//
	// Destroy Key Handler
	//
	destroyKeypressHandler: function(){
		console.log('keypressHandle:destroyKeypressHandler','begin...');	
		// 1 disconnect events
		this.disconnectEvents();
		
		if (dojo.isIE){
			document.body.onkeydown = null;
			CKEDITOR.instances.editor1.document.$.body.onkeydown = null;
		}	
		
		//Nullify variables
		this.connectArray = null;
		
		console.log('keypressHandle:destroyKeypressHandler','end...');	
	},
	
	_isArrowKeyAction: function( action){
		if ( action == this.LEFT_ARROW || 
			 action == this.RIGHT_ARROW || 
			 action == this.UP_ARROW || 
			 action == this.DOWN_ARROW ){
			return true;
		}
		return false;
	}
	
});
