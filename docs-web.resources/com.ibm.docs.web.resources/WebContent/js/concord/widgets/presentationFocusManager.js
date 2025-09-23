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
 * presentationFocusManager.js component of Lotus Symphony Live
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.presentationFocusManager");
dojo.require("concord.util.events");
dojo.require("concord.util.dialogs");

dojo.declare("concord.widgets.presentationFocusManager", null, {
	
	constructor: function(opts) {
		this.regionsArr = (opts.regions)? opts.regions :[];
		this.componentsArr = (opts.componentsArr)? opts.componentsArr :[];
		this.componentInFocus = 'concord.scenes.SlideSorter';
		this.prevComponentInFocus = 'concord.scenes.SlideSorter';
		this.subscribeToEvents();
		this.init();
	},
	regionsArr: null,
	
	componentsArr: [],
	
	tabOrderHash : [],
	dialogFocusHash : [],
	DIALOGS	: 'dialogs',
	setupUnsupDiag : false,
	
	subscribeToEvents: function(){
		concord.util.events.subscribe(concord.util.events.keypressHandlerEvents, null, dojo.hitch(this,this.handleSubscriptionEventsForKeyPress));
		concord.util.events.subscribe(concord.util.events.presSceneEvents_Render, null, dojo.hitch(this,this.handleSubscriptionEventsForPresDocScene));

		concord.util.events.subscribe(concord.util.events.presToolbarEvents_SetFocus, null, concord.util.presToolbarMgr.handleSubscriptionForSetFocusEvent);
		concord.util.events.subscribe(concord.util.events.presMenubarEvents_SetFocus, null, concord.util.presToolbarMgr.handleSubscriptionForLostFocusEvent);
		concord.util.events.subscribe(concord.util.events.slideSorterEvents_SetFocus, null, concord.util.presToolbarMgr.handleSubscriptionForLostFocusEvent);
		concord.util.events.subscribe(concord.util.events.slideEditorEvents_SetFocus, null, concord.util.presToolbarMgr.handleSubscriptionForLostFocusEvent);
		concord.util.events.subscribe(concord.util.events.presentationFocus, null, concord.util.presToolbarMgr.handleSubscriptionForLostFocusEvent);

		concord.util.events.subscribe(concord.util.events.slideSorterEvents_Focus,null, dojo.hitch(this,this.handleSlideSorterEvents));
	},
			
	init: function(){
		//Add tabindex to all specified regions
		for(var i=0; i< this.regionsArr.length; i++){
			var focusElement = dojo.byId(this.regionsArr[i]);
			dojo.attr(focusElement,'tabindex',0);
//			if (dojo.attr(focusElement,'aria-label')==null)
//				dojo.attr(focusElement,'aria-label','This is title for Lotus Live Symphony');
		}
		
		//init tab order hash
		for(var i=0; i< this.componentsArr.length; i++){
			this.tabOrderHash[this.componentsArr[i]] = i;
		}
	},
	
	handleSlideSorterEvents: function(evt) {
		var welcome = dijit.byId("C_d_Welcome");
		var unsupport = dijit.byId("C_d_UnsupportFeature");
		if (welcome && welcome.open) {
			var button = dojo.byId("C_d_WelcomeOKButton");
			if (button) {
				button.focus();
				this.setFocusComponent(this.DIALOGS);
				this.publishDialogInFocus();
			}
		} else if (unsupport && unsupport.open) {
				var okb = dojo.byId("C_d_UnsupportFeatureOKButton");
				if (okb) {
					okb.focus();
					this.setFocusComponent(this.DIALOGS);
					this.publishDialogInFocus();
				}
		}
		if (unsupport && !this.setupUnsupDiag) {
			dojo.connect(unsupport, "onHide", dojo.hitch(this,function(){
				this.setFocusToSlideSorter();
			}));
			this.setupUnsupDiag = true;
		}
	},
	
	getDialogs: function(){
//		var dialogArrays = dojo.query(".presentationDialog");
//		var nonModalDialogArray = dojo.query(".presentationNonModalDialog");
//		dialogArrays = dialogArrays.concat( nonModalDialogArray );
		var dialogArrays = dojo.query(".dijitDialog, .presentationNonModalDialog");
		if (dialogArrays.length ==0)
			return null;
		var dialogFocusHash =[];		
		for (var i=0; i< dialogArrays.length; i++){	
			if (dojo.style(dialogArrays[i],'display')!='none')
				dialogFocusHash[dialogArrays[i].id]=false;
		}
		return dialogFocusHash;
		
	},
	
	
	getNextDialogTofocus: function(){		
	  this.dialogFocusHash = this.getDialogs( );
    	for(var nodeId in this.dialogFocusHash) {
    		if (!this.dialogFocusHash[nodeId]){ // get first false entry. false mean not yet focussed
    			this.dialogFocusHash[nodeId]=true;
    			return nodeId;
    		}
    	}
		return null; //all are true now.
	},
	
	//
	// 1- The eventName_setComponentFocus is subscribed to by all components. When received it tells the affected component to focus itself.
	// 2- The affected component focuses it self then publishes a component-in-focus message (crossComponentEvents_eventName_inFocus)
	// 3- This crossComponentEvents_eventName_inFocus message is subscribed to by the scene which then sets the official componentInFocus variable.
	//
	publishNextFocusRegion: function(nextFocusRegion){	
		if ( nextFocusRegion == concord.util.events.SLIDE_SORTER_COMPONENT ){
			concord.util.presToolbarMgr.setFocusSorterTb();

			var slideSorterContainer = dojo.byId( pe.scene.slideSorterContainerId);
			if ( slideSorterContainer && dojo.style( slideSorterContainer, 'visibility') != 'hidden' ){
				if(dojo.isSafari && !concord.util.browser.isMobile())
					pe.scene.clipboard.focusClipboardContainer();
				else
					slideSorterContainer.focus();
			}
			dojo.publish(concord.util.events.slideSorterEvents_SetFocus, null);
		} else if ( nextFocusRegion == concord.util.events.SLIDE_EDITOR_COMPONENT ){
			dojo.publish(concord.util.events.slideEditorEvents_SetFocus, null);			
		} else if ( nextFocusRegion == concord.util.events.PRES_MENUBAR_COMPONENT ){
			dojo.publish(concord.util.events.presMenubarEvents_SetFocus, null);			
		} else if ( nextFocusRegion == concord.util.events.PRES_TOOLBAR_COMPONENT ){
			dojo.publish(concord.util.events.presToolbarEvents_SetFocus, null);			
		} else {
			var eventData = [{'eventName': concord.util.events.presentationFocus_eventName_setComponentFocus, 'nextFocusRegion':nextFocusRegion}];
	 		dojo.publish(concord.util.events.presentationFocus, eventData);
		}
	},
	
	publishDialogInFocus: function(){		
 		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':this.DIALOGS}];
 		concord.util.events.publish(concord.util.events.presentationFocus, eventData);
	},	
	
	handleTabKeyPress: function( e){
		var currentFocusRegion = window.pe.scene.getFocusComponent();
		if (currentFocusRegion==this.DIALOGS){
			var node = (typeof( window.event ) != "undefined" ) ? e.srcElement : e.target;
			var dialog = this._getDialogFromFocusedNode( node);
			if (dialog) {
				dialog._getFocusItems(dialog.domNode);
			}

			if (this.inverse && this._handledFirstFocusNode(node,dialog)) {
				dojo.stopEvent(e);
			}
			else if (!this.inverse && this._handledLastFocusNode(node,dialog)) {
				dojo.stopEvent(e);
			}
			else if (dialog){
				if (dialog.id == "P_d_MasterStyles" || dialog.id == "P_d_Layout") {
					// we're in an unknown tab position, or in the case of these
					// two dialogs, a non-tab position. Since we know there's only
					// two valid positions, reset the tab position to the top.
					
					if (node != dialog._firstFocusItem && node != dialog._lastFocusItem) {
						if (dialog._firstFocusItem) {
							dialog._firstFocusItem.focus();
							dojo.stopEvent(e);
						}
					}
				}
				else if (this._handledProblemNode(node,dialog)) {
					// in some of the dialogs there are certain nodes that misbehave and
					// cause the focus to jump unexpectedly. Make explicit checks here
					// to control tabing to/from these problem nodes.
					dojo.stopEvent(e);
				}
			}

			return;
		} else {
			dojo.stopEvent(e);
		}
		
		var nextFocusRegion = this.getNextFocusComponent(currentFocusRegion);
		if (nextFocusRegion)
			this.publishNextFocusRegion(nextFocusRegion);
	},
	
	handleFocusDialogs: function( e ){
		// We have some dialogs opened lets focus them
		var dialogIdToFocus = this.getNextDialogTofocus();
		if  (dialogIdToFocus){// We have an id that has not yet been focussed.
			//lets see if this is a digit
			var dialog = dijit.byId(dialogIdToFocus);
			if (dialog && dialog.setFocusHere){
				console.log('dialog being focused is '+dialogIdToFocus);
				dialog._getFocusItems(dialog.domNode);
				dijit.focus(dialog._firstFocusItem);	
				dialog.publishDialogInFocus();
			}
			else{
				var dialog = dojo.byId(dialogIdToFocus);
				dialog.focus();
			}	
			this.publishDialogInFocus();
			return dialogIdToFocus;
		}
		//if code gets here then all dialogs have already been focussed let's pop out
		return null;
			
	},
	
	getNextFocusComponent: function(focusComp_p){	
		
		var focusComp = focusComp_p;
		if (concord.util.presToolbarMgr.hasKBFocus())
		{
			// this is needed for when the user hit ALT+F10 from inside the slide editor.
			// In that situation in order for the right toolbar to render, we cannot publish
			// a focus event for the toolbar so this hasKBFocus flag can be used to detect when
			// the focus is on the toolbar in this situation.
			focusComp = concord.util.events.PRES_TOOLBAR_COMPONENT;
		}
		
		var nextComp = this.componentsArr[this.getNextIndex(focusComp)];
		console.log('Next focus component is '+nextComp);
		if (nextComp=="dialogs"){//let's get dialogs
			this.dialogFocusHash = this.getDialogs();
			if (!this.dialogFocusHash){
				nextComp =null;
			} else{ // We have some dialogs opened lets focus them
				if (this.handleFocusDialogs()) //we have focused a dialog with an id let's return
					return;
				else  // we have finished focusing all dialogs let's continue focus on other components
					nextComp =null;
			}
		}		
		nextComp = (nextComp)? nextComp : (this.inverse)? concord.util.events.PRES_MENUBAR_COMPONENT  : concord.util.events.SLIDE_SORTER_COMPONENT;
		console.log('Next focus component is '+nextComp);
		return nextComp ;
	},
	
	getNextIndex: function(focusComp){
		var curInd = this.tabOrderHash[focusComp];
		var nextInd = null;
		if (!this.inverse){
			nextInd = (curInd+1)%(this.componentsArr.length);
			
		} else {
			nextInd = ((curInd -1) <0)?  (this.componentsArr.length -1): curInd -1;
		}
		console.log("===== > Component Focus index ix " + nextInd);
		return nextInd;
	},
	
	handleSubscriptionEventsForKeyPress: function(data){
		if (data.eventAction==concord.util.events.keypressHandlerEvents_eventAction_TAB 
				&& this.componentInFocus!=concord.util.events.SLIDE_SORTER_COMPONENT
				&& this.componentInFocus!=concord.util.events.SLIDE_EDITOR_COMPONENT){
			this.inverse = false;			
			this.handleTabKeyPress(data.e);
		} else if (data.eventAction==concord.util.events.keypressHandlerEvents_eventAction_SHIFT_TAB 
				&& this.componentInFocus!=concord.util.events.SLIDE_SORTER_COMPONENT
				&& this.componentInFocus!=concord.util.events.SLIDE_EDITOR_COMPONENT){
			this.inverse = true;
			this.handleTabKeyPress(data.e);
		}	
	},
	
	//
	// Handle events from pub/sub model from Slide PresDocScene
	//
	handleSubscriptionEventsForPresDocScene: function(data){
		var nextFocusRegion = concord.util.events.SLIDE_SORTER_COMPONENT;
		this.publishNextFocusRegion(nextFocusRegion);
	},
	
	//
	// get Focus component
	//  - ignoreMenuOrToolBar - flag to specify whether the requester wants to ignore the
	//                          menubar component since some situations warrant using the
	//                          focused component *before* the menu or toolbar was clicked
	getFocusComponent : function( ignoreMenuOrToolBar ) {
		return ignoreMenuOrToolBar &&
		       (this.componentInFocus == concord.util.events.PRES_MENUBAR_COMPONENT ||
		       this.componentInFocus == concord.util.events.PRES_TOOLBAR_COMPONENT)
		     ? this.prevComponentInFocus : this.componentInFocus;
	},
	
	setFocusComponent : function(component) {
		  // if focused component is the menubar or the toolbar, ignore it for
		  // previously focused component
		  if (this.componentInFocus != concord.util.events.PRES_MENUBAR_COMPONENT && this.componentInFocus != concord.util.events.PRES_TOOLBAR_COMPONENT){
		    this.prevComponentInFocus = this.componentInFocus;
		  }
		  this.componentInFocus = component;
		  
		  concord.util.dialogs.hideUnderlayIfNotActive();
	},	
	
	setFocusToPresMenubar: function(){
		dojo.byId('menubar').focus();
        concord.util.events.publish(concord.util.events.presMenubarEvents_Focus, null);
	},
	
	setFocusToPresToolbar: function(){
		dojo.byId('toolbar').focus();
        concord.util.events.publish(concord.util.events.presToolbarEvents_Focus, null);
	},
	
	setFocusToSlideSorter: function(){
		concord.util.presToolbarMgr.setFocusSorterTb();
		CKEDITOR.instances.editor1.focus();
		if (CKEDITOR.env.safari) {
			//D28983,set focus in chrome will make current slide layout
			//in slide sorter go mess
			CKEDITOR.instances.editor1.window.focus();
		}
        concord.util.events.publish(concord.util.events.slideSorterEvents_Focus, null);
	},
	
	setFocusToSlideEditor: function(){
		pe.scene.slideEditor.mainNode.focus();
		this.publishSlideEditorInFocus();
	},
	
	setFocusToDialog: function( dialog){
		if ( dialog){
			dojo.style(dialog.domNode,{'zIndex':this.getMaxZindex()});
		}
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs'}];
		dojo.publish(concord.util.events.presentationFocus, eventData); 
	},
	
	publishSlideEditorInFocus: function(){
        dojo.publish(concord.util.events.slideEditorEvents_Focus, null);
	},
	
	_getDialogFromFocusedNode: function( node){
		while ( node && node.nodeName.toLowerCase() != 'body' && node.nodeName.toLowerCase() != 'iframe'){
			node = node.parentNode;
			if ( node && (dojo.hasClass( node, 'dijitDialog') || 
					dojo.hasClass( node, 'presentationNonModalDialog'))){
				return dijit.byId(node.id);				
			}
		}
		return;
	},
	
	_isLastFocusedItemOnNonModalDialog: function ( node){
		var dialog = this._getDialogFromFocusedNode( node);
		if ( dialog){
			dialog._getFocusItems(dialog.domNode);
			if ( dojo.hasClass( dialog.domNode, 'presentationNonModalDialog') && node == dialog._lastFocusItem){
				return true;
			}
		}
		return false;	
	},
	
	_isFirstFocusedItemOnNonModalDialog: function ( node){
		var dialog = this._getDialogFromFocusedNode( node);
		if ( dialog){
			dialog._getFocusItems(dialog.domNode);
			if ( dojo.hasClass( dialog.domNode, 'presentationNonModalDialog') && node == dialog._firstFocusItem){
				return true;
			}
		}
		return false;	
	},
	
	_handledFirstFocusNode: function (node,dialog) {
		if ( dialog){
			if (node == dialog._firstFocusItem){
				if (dialog._lastFocusItem) {
					dialog._lastFocusItem.focus();
					return true;
				}
			}
		}
		return false;	
	},
	
	_handledLastFocusNode: function (node,dialog) {
		if ( dialog){
			if (node == dialog._lastFocusItem){
				if (dialog._firstFocusItem) {
					dialog._firstFocusItem.focus();
					return true;
				}
			}
		}
		return false;	
	},
	
	_handledProblemNode: function (node,dialog) {
		if (dialog) {
			if (dialog.setNextFocusElement) {
				return dialog.setNextFocusElement(node,this.inverse);
			}
		}
		return false;
	}
});
