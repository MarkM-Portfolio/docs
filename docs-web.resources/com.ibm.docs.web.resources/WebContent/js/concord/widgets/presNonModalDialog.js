/**
 * Licensed Materials - Property of IBM.
 * @presentationDialog CKEditor Plugin
 * Copyright IBM Corporation 2010. All Rights Reserved.
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.presNonModalDialog");

dojo.require("dojox.layout.FloatingPane");
dojo.require("concord.widgets.LotusTextButton");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets","presNonModalDialog");


dojo.declare("concord.widgets.presNonModalDialog",  
		[dojox.layout.FloatingPane, dijit._DialogMixin ],{
	connectArray: [],
	DIALOGS:	'dialogs',
	_firstFocusItem: null,
	_lastFocusItem: null,
	nls:null,
	
    CLIPART_TAB_ID : "P_d_ClipArt_ContentDiv_tablist_P_d_ClipArt_galleryTab",
    FILE_TAB_ID : "P_d_ClipArt_ContentDiv_tablist_P_d_ClipArt_uploadTab",
    SEARCHBOX_ID: "searchBox_clipper_SearchBoxID_addImageDlg",
    RESULT_BOX: "clipPickerDialogResultBox",

	constructor: function(opts) {
		this.opts=opts;
		this.nls = dojo.i18n.getLocalization("concord.widgets", "presNonModalDialog");  
		//this.publishDialogInFocus();
		if(BidiUtils.isGuiRtl())
			this.dir = 'rtl';
	},
	
	startup: function(){		
		this.inherited(arguments);
		dojo.addClass(this.domNode,'presentationNonModalDialog');
	},
	
	updateDialogButtons: function(okCallBack, cancelCallBack){
		if ((this.okBtn!=null) && (okCallBack!=null)){
			//this.okBtn.onClick = dojo.hitch(this,this.closeDialog,okCallBack);
			for(var i=0; i<this.connectArray.length; i++){
				 dojo.disconnect(this.connectArray[i]);
			}			
			this.connectArray=[];			
			this.connectArray.push(dojo.connect(this.okBtn,"__onClick",this,okCallBack));
		}if ((this.cancelBtn!=null)&&(cancelCallBack!=null)){
			this.cancelBtn=cancelCallBack;
		}
	},
	
	resize: function(/* Object */dim){ 
		// summary: Size the FloatingPane and place accordingly
		dim = dim || this._naturalState;
		this._currentState = dim;

		// From the ResizeHandle we only get width and height information
		var dns = this.domNode.style;
		if("t" in dim){ dns.top = dim.t + "px"; }
		if("l" in dim){ dns.left = dim.l + "px"; }
		dns.width = dim.w + "px";
		if (dns.height != '80%')
			dns.height = dim.h + "px";

		// Now resize canvas
		var mbCanvas = { l: 0, t: 0, w: dim.w, h: (this.domNode.offsetHeight - (this.focusNode.offsetHeight + 14)) };
		dojo.marginBox(this.canvas, mbCanvas);

		// If the single child can resize, forward resize event to it so it can
		// fit itself properly into the content area
		this._checkIfSingleChild();
		if(this._singleChild && this._singleChild.resize){
			this._singleChild.resize(mbCanvas);
		}
	},
	
	close: function(){
		this.closeDialog();
	},
	
	// Overriding the show method to disable the resize method.
	// for some reason on each show, the height and width grows by 14px.
	// This is a known issue in the code
	// http://bugs.dojotoolkit.org/ticket/5849
	show: function(/* Function? */callback){
		// summary: Show the FloatingPane
		var anim = dojo.fadeIn({node:this.domNode, duration:this.duration,
			beforeBegin: dojo.hitch(this,function(){
				this.domNode.style.display = "";
				this.domNode.style.visibility = "visible";
				if (this.dockTo && this.dockable) { this.dockTo._positionDock(null); }
				if (typeof callback == "function") { callback(); }
				this._isDocked = false;
				if (this._dockNode) {
					this._dockNode.destroy();
					this._dockNode = null;
				}
			}),
			onEnd: dojo.hitch(this, function(){
				this._getFocusItems(this.domNode);
				//dijit.focus(this._firstFocusItem);
				this.publishDialogInFocus();
			})
		}).play();
		//this.resize(dojo.coords(this.domNode));
		this._onShow(); // lazy load trigger
	},
	
	addDialogButtons: function(){
		//{'label':'OK','action':dojo.hitch(this,function(){alert('ok');})},

		var btnArray = (this.opts.presDialogButtons)? (this.opts.presDialogButtons) :[];
		var buttonsForDialogDiv = null;
		 for (var i=0; i<btnArray.length; i++){
			if (i==0){
				buttonsForDialogDiv = this.presDialogButtonsSectionNode = document.createElement("div");
				dojo.addClass(buttonsForDialogDiv,'dijitDialogPaneActionBar');
	
				dojo.style(buttonsForDialogDiv, {
					'width': (dojo.isIE)? (this.domNode.clientWidth-50) +"px" :(this.domNode.offsetWidth - 58) +"px" // 50 is the total padding of the button section and 8 is total padding on this.domNode
				});	
				if(BidiUtils.isGuiRtl())
					dojo.style(buttonsForDialogDiv, "textAlign", "left");
				
				if (btnArray[i].id) {
					var okBtn = this.okBtn = new concord.widgets.LotusTextButton({
						label: btnArray[i].label,
						name: btnArray[i].label,
						id: btnArray[i].id,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1)
						//onClick:dojo.hitch(this,this.closeDialog,btnArray[i].action)
					});
				} else {
					var okBtn = this.okBtn = new concord.widgets.LotusTextButton({
						label: btnArray[i].label,
						name: btnArray[i].label,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1)
						//onClick:dojo.hitch(this,this.closeDialog,btnArray[i].action)
					});					
				}
				
				this.updateDialogButtons(dojo.hitch(this,this.checkOkBtnEnabledBeforeClose,btnArray[i].action));
				okBtn.placeAt(buttonsForDialogDiv);	// place in page
	
			} else if (i==1){
				var cancelSpan = document.createElement('div');
	
				if (btnArray[i].id) {
					var cancelBtnWidget =this.cancelBtn =  new concord.widgets.LotusTextButton({
						label: btnArray[i].label,
						name: btnArray[i].label,
						id: btnArray[i].id,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1),
						onClick:dojo.hitch(this,this.closeDialog,btnArray[i].action)
					});					
				} else {
					var cancelBtnWidget =this.cancelBtn =  new concord.widgets.LotusTextButton({
						label: btnArray[i].label,
						name: btnArray[i].label,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1),
						onClick:dojo.hitch(this,this.closeDialog,btnArray[i].action)
					});
				}
								
				cancelBtnWidget.placeAt(buttonsForDialogDiv);	// place in page
						
			}
		 }
		var contentNode = dojo.byId(this.opts.contentNodeId)
		if (contentNode){
			contentNode.appendChild(buttonsForDialogDiv);
		}
	
	},
	
	closeDialog: function(callback){
		this.closeDialogFocus(true,callback);
	},
	
	closeDialogFocus: function(callfocus,callback){
		//this.destroyToolTips();
		var keepDialogOpen = false;
		if (callback){
			keepDialogOpen = callback(); // if callback has an error message do not close the dialog and allow user to correct entries to resubmit
		}
		
		if (keepDialogOpen){
			return;			
		}else {
			if (this.opts.destroyOnClose){
				this.hide();				
				this.destroyRecursive();
			}
			else
				this.hide();
		}
		if (callfocus) {
			setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
		}
	},
	
	setFocusHere: function(e){
		if (this.domNode.style.display != 'none') {
			dijit.focus(((e) && (e.target))? e.target :this.domNode);
			
			this.publishDialogInFocus();
		}
	},

	
	publishDialogInFocus: function(){	
		this.domNode.style.zIndex=this.getMaxZindex()+1;		
 		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':this.DIALOGS, 'presModal':this.opts.presModal}];
 		concord.util.events.publish(concord.util.events.presentationFocus, eventData); 		
	},
	

	checkOkBtnEnabledBeforeClose: function(callback) {
		if (this.okBtn.disabled) {
			return false;
		} else {
			this.closeDialog(callback);
		}
	},
	
	onShow: function(){
		this.inherited(arguments);
		this.setFocusHere();
		//D14093 -- Need to set title pane to title
		this.titleNode.innerHTML = this.title;
		dojo.connect(this.domNode, "onkeyup", this, "handleKeyUp");
		dojo.connect(this.domNode, "onclick", this, "setFocusHere");
	},
	
	handleKeyUp: function(event){
		//console.log('presNonModalDialog:handleKeyUp '+event.keyCode);
       if(event.keyCode==dojo.keys.ESCAPE){	    	
    	   	this.closeDialog();
	   }		
	},
	
	getMaxZindex: function(){
		var dialogs = dojo.query('.dojoxFloatingPane');
		var max=0;
		for (var i=0; i<dialogs.length; i++){
			var zValue = parseInt(dialogs[i].style.zIndex);
			if (max <=zValue){
				max = zValue;
			}
		}
		return parseInt(max)+1;
	},
	
	_getFocusItems: function(domNode){
		// The tab order is seeminling incorrectly calculated by the dojo code.
		// Force the first/last order if necessary.
		this.inherited(arguments);
		if (this.id == 'P_d_ClipArt') {
			var tabWidget = dijit.byId("P_d_ClipArt_uploadTab");
			if (tabWidget.selected) {
				this._firstFocusItem = dojo.byId(this.FILE_TAB_ID);
			}
			else {
				this._firstFocusItem = dojo.byId(this.CLIPART_TAB_ID);
			}
			this._lastFocusItem = dojo.byId("clipArt_cancelButton");
		}
	},
	
	setNextFocusElement: function(node,reverse) {
		// The brower tabbing doesn't work for some elements. This routine
		// corrects that by forcing the focus in certain situations.
		if (this.id == 'P_d_ClipArt') {
			var tabWidget = dijit.byId("P_d_ClipArt_uploadTab");
			if (!tabWidget.selected) {
				return this.setNextGalleryFocusElement(node,reverse);
			}
			else {
				return this.setNextFiletabFocusElement(node,reverse);
			}
		}
		return false;
	},
	
	setNextGalleryFocusElement: function(node,reverse) {
		var box = dojo.byId(this.SEARCHBOX_ID);
		if (node == this._firstFocusItem && !reverse) {
			box.focus();
			return true;
		}
		else if (node == box && reverse) {
			this._firstFocusItem.focus();
			return true;
		}
		else{
			var tabindex = dojo.attr(node,'tabindex');
			if (!tabindex || tabindex == '-1'){
				if (dojo.hasClass(node.parentNode,this.RESULT_BOX)){
					// When we are focused on one of the items in the gallery, put the first child of the results 
					// in focus (the one that has tabindex), so tabbing to the "OK" or "Cancel" button will work as expected
					node.parentNode.firstChild.focus();  
					return false;  // we do want to return false - since we want the tab to focus on the NEXT node, not what we just put focus on
				}
			}
		}
		return false;
	},
	
	setNextFiletabFocusElement: function(node,reverse) {
		var browseButton = dojo.byId('uploadInputFile');
		if (node == this._firstFocusItem && !reverse) {
			browseButton.focus();
			return true;
		}
		else if (node == browseButton && reverse) {
			this._firstFocusItem.focus();
			return true;
		}
		return false;
	},
	
	postCreate: function(){
		this.inherited(arguments);

		 // sort of a hack so the hover title text doesn't show up on our images in the dialog
		if (this.canvas) {
			this.canvas.setAttribute('title', ' ');
		}		
		
		// need to add a text node with "x" for use in high contrast mode, since the close icon won't be shown
		if (this.closeNode) {
			var btnArray = (this.opts.presDialogButtons)? (this.opts.presDialogButtons) :[];
			var closeLabel = btnArray.length >0 ?btnArray[1].label:this.nls.cancelLabel; 
			dojo.attr(this.closeNode,"title",closeLabel);
			dojo.create("span", { className: 'floatingCloseText', innerHTML: 'x' }, this.closeNode);
		}		
		
		// fix up aria info that dojoxFloatingPane did not implement correctly
		if (this.domNode) {
			dijit.setWaiRole(this.domNode,'region');
			dijit.setWaiState(this.domNode,'label',this.title);
			var title = this.domNode.getAttribute('title');
			this.domNode.setAttribute('title','');
			this.focusNode.setAttribute('title',title);
		}	
		if (this.containerNode) {
			dijit.removeWaiRole(this.containerNode);  // dojox sets the role to "region", which we don't want
		}
		//
     //26178��There will be unknown icon in  dialog when focus on dialog
		//the title is used for tooltip
		//must set it to "",then the browser will give up the tooltip
		//and docs has its' own tooltip
		
		if( this && this.canvas && !dojo.isFF){
			var aCanvas = this.canvas;
			if( aCanvas && aCanvas.hasAttribute('title') && aCanvas.title.length > 0){
				aCanvas.title = "";
			}
		}		
			
		
		//
	}
});