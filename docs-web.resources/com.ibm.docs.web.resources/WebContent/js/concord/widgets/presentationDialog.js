/**
 * Licensed Materials - Property of IBM.
 * @presentationDialog CKEditor Plugin
 * Copyright IBM Corporation 2010. All Rights Reserved.
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.presentationDialog");

dojo.require("dijit.Dialog");
dojo.require("concord.util.dialogs");
dojo.require("concord.util.events");
dojo.require("concord.util.BidiUtils");

dojo.declare("concord.widgets.presentationDialog", dijit.Dialog, {		
	constructor: function(opts) {
		this.opts=opts;
		if(BidiUtils.isGuiRtl())
			this.dir = 'rtl';
		
		// If document.onselectstart handler is set, text selection in the dialog will not work.
		// It is required that we save the old handler while the dialog is open, and restore it
		// to the previous value when the dialog closes.
		pe.scene.disableOnSelectStart();
		
		this.placeAt = dojo.hitch(this, function(top,left){
			dojo.style(this.domNode,{'top': top+'px', 'left':left+'px'});			
			this.positionLeft=left;
			this.positionTop = top;			
		});		
		
		if ((this.opts.presDialogTop) && (this.opts.presDialogLeft)){ 
			this._position = dojo.hitch(this, function(){
					 /*
					if(!dojo.hasClass(dojo.body(),"dojoMove")){
						var node = this.domNode,
							viewport = dijit.getViewport(),
							p = this._relativePosition,
							bb = p ? null : dojo._getBorderBox(node),
							l = Math.floor(viewport.l + (p ? p.x : (viewport.w - bb.w) / 2)),
							t = Math.floor(viewport.t + (p ? p.y : (viewport.h - bb.h) / 2))
						;
						dojo.style(node,{
							left: l + "px",
							top: t + "px"
						});
					}
					*/
				});
		}

	},
	
	DIALOGS:	'dialogs',
	presDialogBodyNode :null,
	presDialogButtonsSectionNode: null,
	savedOnSelectStartHandler: null,
	defaultWidth: '550',
	defaultHeight: '300',
	toolTipObjs: null,
	connectArray: [],
	show: function(){
			if (!this.presDialogBodyNode){
				// if this is a modal dialog..
				if (this.opts.presModal)
					dojo.addClass(this.domNode,'presentationDialog');
				
					/*
					if (CKEDITOR.env.ie){
				  		dojo.style(this.domNode,{
				  			'width': '680px',
				  			'height':'430px',
				  			//'background':'#eff0f1',
				  			'fontFamily':'arial',
							//'fontSize':'12',	
							'borderColor':'#cbcbcb',
							'borderStyle':'solid',
							'borderWidth':'1px'	  			
				  		});												
					}
					*/
					
			  		//Update title 
			  		var titleBar=dojo.query(".dijitDialogTitleBar",this.domNode)[0];
			  		//if (titleBar) dojo.addClass(titleBar,'presentationDialogTitleBar');
			  		
			  		var titleText = dojo.query(".dijitDialogTitle",this.domNode)[0];
			  		//if (titleText) dojo.addClass(titleText,"presentationDialogTitleText");
			  		
			  		
					// add new UI look and feel and remove dojo classes from the dojo dialog
			  		var closeText = dojo.query(".closeText",this.domNode)[0];
			  		if (closeText) closeText.parentNode.removeChild(closeText);
					//dojo.removeClass(this.domNode,'dijitDialog');
					//dojo.removeClass(this.domNode,'dijitContentPane');
			  		
					//if (titleBar) dojo.removeClass(titleBar,'dijitDialogTitleBar');
			  										  										  		
//			  		var closeBtn = dojo.query(".dijitDialogCloseIcon",this.domNode)[0];
//			  		if(closeBtn){
//			  			dojo.removeClass(closeBtn,"dijitDialogCloseIcon");	  		
//			  			dojo.addClass(closeBtn,"presentationDialogCloseBtn");
//			  		}
			  		//next two lines remove the hover effect on the dialog close icon
			  		this._onCloseEnter = function(){};
			  		this._onCloseLeave = function(){};
			  		var dialogBody = this.presDialogBodyNode  = (this.presDialogBodyNode) ? this.presDialogBodyNode : dojo.query(".dijitDialogPaneContent",this.domNode)[0];
//					dojo.removeClass(dialogBody,'dijitDialogPaneContent');
//					dojo.addClass(dialogBody,'presentationDialogBody');

					if (!this.opts.presModal){
						dojo.addClass(this.domNode,'presentationNonModalDialog');
						this._setup = dojo.hitch(this,  function(){
							// summary:
							//		Stuff we need to do before showing the Dialog for the first
							//		time (but we defer it until right beforehand, for
							//		performance reasons).
							// tags:
							//		private							
							var node = this.domNode;

							if(this.titleBar && this.draggable){
								this._moveable = (dojo.isIE == 6) ?
									new dojo.dnd.TimedMoveable(node, { handle: this.titleBar }) :	// prevent overload, see #5285
									new dojo.dnd.Moveable(node, { handle: this.titleBar, timeout: 0 });
								dojo.subscribe("/dnd/move/stop",this,"_endDrag");
							}else{
								dojo.addClass(node,"dijitDialogFixed");
							}

							this.underlayAttrs = {
								dialogId: this.id,
								"class": dojo.map(this["class"].split(/\s/), function(s){ return s+"_underlay"; }).join(" ")
							};

							this._fadeIn = dojo.fadeIn({
								node: node,
								duration: this.duration,
								beforeBegin: dojo.hitch(this, function(){
//									var underlay = dijit._underlay;
//									if(!underlay){
//										underlay = dijit._underlay = new dijit.DialogUnderlay(this.underlayAttrs);
//									}else{
//										underlay.attr(this.underlayAttrs);
//									}
//									var zIndex = 948 + dijit.Dialog._dialogStack.length*2;
//									dojo.style(dijit._underlay.domNode, 'zIndex', zIndex);
//									dojo.style(this.domNode, 'zIndex', zIndex + 1);
//									underlay.show();
//									underlay.hide();
								}),
								onEnd: dojo.hitch(this, function(){
									if(this.autofocus){
										// find focusable Items each time dialog is shown since if dialog contains a widget the
										// first focusable items can change
										this._getFocusItems(this.domNode);
										dijit.focus(this._firstFocusItem);
										this.publishDialogInFocus();
									}
								})
							 });

							this._fadeOut = dojo.fadeOut({
								node: node,
								duration: this.duration,
								onEnd: dojo.hitch(this, function(){
									node.style.display = "none";

									// Restore the previous dialog in the stack, or if this is the only dialog
									// then restore to original page
//									var ds = dijit.Dialog._dialogStack;
//									if(ds.length == 0){
//										dijit._underlay.hide();
//									}else{
//										dojo.style(dijit._underlay.domNode, 'zIndex', 948 + ds.length*2);
//										dijit._underlay.attr(ds[ds.length-1].underlayAttrs);
//									}

									// Restore focus to wherever it was before this dialog was displayed
//									if(this.refocus){
//										var focus = this._savedFocus;
//
										// If we are returning control to a previous dialog but for some reason
										// that dialog didn't have a focused field, set focus to first focusable item.
										// This situation could happen if two dialogs appeared at nearly the same time,
										// since a dialog doesn't set it's focus until the fade-in is finished.
//										if(ds.length > 0){
//											var pd = ds[ds.length-1];
//											if(!dojo.isDescendant(focus.node, pd.domNode)){
//												pd._getFocusItems(pd.domNode);
//												focus = pd._firstFocusItem;
//											}
//										}
//
//										dijit.focus(focus);
//									}
								})
							 });
						}); //end hitch
					}
				//avoid window resize in ie by setting the user properties first
				if (dojo.isIE) {					
					this.applyUserProperties();	
					this.inherited(arguments);
				} else {
					this.inherited(arguments);
					this.applyUserProperties();	
				}
				//D30375: <BHT6, UX>"Slides in Use" dialog displays ugly if the browser's width is narrow
				dojo.style(dialogBody,{
					'height': 'auto',
					'width': 'auto'
				});
				
				this.applyUserProperties();
				this.addDialogButtons();
				//Add events
				this._modalconnects.push(dojo.connect(this.domNode, "onkeyup", this, "handleKeyUp"));
				this._modalconnects.push(dojo.connect(this.domNode, "onclick", this, "setFocusHere"));
				this._modalconnects.push(dojo.connect(dojo.doc.parentWindow, "onresize",dojo.hitch(this, this.handleUnderLayResize)));
				
				// In some browsers the underlay may not be resized to the fit the browser window fully 
				var underlay = dijit._underlay;
				if (underlay)
					underlay.layout();

			}else {
				dojo.style(this.domNode,{'display':''});
			}			
			if (!this.opts.presModal)  // if not modal then do not add to the stack
				this.popOffDialogStack();
			
			// Fix issue with dijit not setting the color picker hex label correctly
			var selectedItems = dojo.query(".dojoxColorPickerHex",this.domNode);
			if (selectedItems && selectedItems.length > 0) {
				var hexNodeLabel = dojo.query("label", selectedItems[0]);
				if (hexNodeLabel && hexNodeLabel.length > 0) {
					var id = dojo.query("input", selectedItems[0])[0].id;
					dojo.attr(hexNodeLabel[0], 'for', id);
				}
			}

			// The default onmousedown handler can cause drag events within the dialog to fail
			pe.scene.disableDefaultMouseDownHandler();
			this.setFocusHere();
			// Remove underlay before launching if present and if this is non modal
			if(dijit._underlay && dijit._underlay.bgIframe && !this.opts.presModal){ //jmt for 44782
				dijit._underlay.hide();
			}
	},
	
	//
	// This function handles underlay resize when presModal is false
	//	
	handleUnderLayResize: function(){
		concord.util.dialogs.hideUnderlayIfNotActive();		
	},
	
	setFocusHere: function(e){
		if (this.domNode.style.display != 'none') {
			var currentObj = this;
			console.log('presentationDialog:setFocusHere');		
			dijit.focus(((e) && (e.target))? e.target :this.domNode);
			
			this.publishDialogInFocus();
		}
	},
	
	getMaxZindex: function(){
		var dialogs = dojo.query('.dijitDialog');
		var max=0;
		for (var i=0; i<dialogs.length; i++){
			var zValue = parseInt(dialogs[i].style.zIndex);
			if (max <=zValue){
				max = zValue;
			}
		}
		return parseInt(max)+1;
	},
	
	handleKeyUp: function(event){
		console.log('presentationDialog:handleKeyUp '+event.keyCode);
	       if(event.keyCode==dojo.keys.ESCAPE){	    	
	    	   	this.closeDialog();
		   }		
	},
	
	applyUserProperties: function(){		
		//Apply user specified width
		dojo.style(this.domNode,{
			'height': (this.opts.presDialogHeight) ? this.opts.presDialogHeight+this.opts.heightUnit : this.defaultHeight+this.opts.heightUnit,
			'width': (this.opts.presDialogWidth) ? this.opts.presDialogWidth+"px" : this.defaultWidth+"px"
		});

		if ((this.opts.presDialogTop) && (this.opts.presDialogLeft)){
			this.placeAt(this.opts.presDialogTop,this.opts.presDialogLeft);
		}

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
	
	addDialogButtons: function(){
		//{'label':'OK','action':dojo.hitch(this,function(){alert('ok');})},
		var btnArray = (this.opts.presDialogButtons)? (this.opts.presDialogButtons) :[];
		var buttonsForDialogDiv = null;
		 for (var i=0; i<btnArray.length; i++){
			if (i==0){
				if(this.presDialogButtonsSectionNode){
					dojo.destroy(this.presDialogButtonsSectionNode);
					this.presDialogButtonsSectionNode = null;
				}
				buttonsForDialogDiv = this.presDialogButtonsSectionNode = dojo.doc.createElement("div");
				dojo.addClass(buttonsForDialogDiv,'dijitDialogPaneActionBar');
				this.presDialogBodyNode.appendChild(buttonsForDialogDiv);				
				dojo.style(buttonsForDialogDiv, {
					'width': (dojo.isIE)? (this.domNode.clientWidth-50) +"px" :(this.domNode.offsetWidth - 58) +"px" // 50 is the total padding of the button section and 8 is total padding on this.domNode
				});	
				
				if(this.okBtn){
					this.okBtn.destroyRecursive();
					this.okBtn = null;
				}
				
				if (btnArray[i].id) {
					var okBtn = this.okBtn = new dijit.form.Button({
						label: btnArray[i].label,
						title: btnArray[i].label,
						name: btnArray[i].label,
						id: btnArray[i].id,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1)
						//onClick:dojo.hitch(this,this.closeDialog,btnArray[i].action)
					});
				} else {
					var okBtn = this.okBtn = new dijit.form.Button({
						label: btnArray[i].label,
						title: btnArray[i].label,
						name: btnArray[i].label,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1)
						//onClick:dojo.hitch(this,this.closeDialog,btnArray[i].action)
					});					
				}
				
				this.updateDialogButtons(dojo.hitch(this,this.checkOkBtnEnabledBeforeClose,btnArray[i].action));
				okBtn.placeAt(buttonsForDialogDiv);	// place in page

//				var okSpan = dojo.doc.createElement('div');
//				buttonsForDialogDiv.appendChild(okSpan);
//				var okBtn = dojo.doc.createElement('div');			
//				dojo.addClass(okBtn,'presentationDialogButton');
//				okSpan.appendChild(okBtn);
//				okBtn.appendChild(dojo.doc.createTextNode(btnArray[i].label));
//				dojo.connect(okBtn,'onmouseover',dojo.hitch(this,this.btnMouseOver,okBtn));
//				dojo.connect(okBtn,'onmouseout',dojo.hitch(this,this.btnMouseOut,okBtn));
//				dojo.connect(okBtn,'onclick',dojo.hitch(this,this.closeDialog,btnArray[i].action));
			} else if (i==1){
				var cancelSpan = dojo.doc.createElement('div');
				
				if(this.cancelBtn){
					this.cancelBtn.destroyRecursive();
					this.cancelBtn = null;
				}

				if (btnArray[i].id) {
					var cancelBtnWidget =this.cancelBtn =  new dijit.form.Button({
						label: btnArray[i].label,
						title: btnArray[i].label,
						name: btnArray[i].label,
						id: btnArray[i].id,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1),
						onClick:dojo.hitch(this,this.closeDialog,btnArray[i].action)
					});					
				} else {
					var cancelBtnWidget =this.cancelBtn =  new dijit.form.Button({
						label: btnArray[i].label,
						title: btnArray[i].label,
						name: btnArray[i].label,
						tabIndex: this.opts.numElements ? (this.opts.numElements + i + 1) : (i + 1),
						onClick:dojo.hitch(this,this.closeDialog,btnArray[i].action)
					});
				}
								
				cancelBtnWidget.placeAt(buttonsForDialogDiv);	// place in page
				
				
//				buttonsForDialogDiv.appendChild(cancelSpan);
//				dojo.style(cancelSpan, {
//					'position':'relative',
//					'top':'-29px',
//					'left': (dojo.isIE)? '39px': '59px'
//				});
//				
//				var cancelBtn = dojo.doc.createElement('div');			
//				dojo.addClass(cancelBtn,'presentationDialogButton cancelButton');
//
//				cancelSpan.appendChild(cancelBtn);
//				cancelBtn.appendChild(dojo.doc.createTextNode(btnArray[i].label));
//				
//				dojo.connect(cancelBtn,'onmouseover',dojo.hitch(this,this.btnMouseOver,cancelBtn));
//				dojo.connect(cancelBtn,'onmouseout',dojo.hitch(this,this.btnMouseOut,cancelBtn));
//				
//				dojo.connect(cancelBtn,'onclick',dojo.hitch(this,this.closeDialog,btnArray[i].action));		
			}
		 }
	},

	checkOkBtnEnabledBeforeClose: function(callback) {
		if (this.okBtn.disabled) {
			return false;
		} else {
			this.closeDialog(callback);
		}
	},
	
	btnMouseOver: function(btn){
		dojo.style( btn, {
			'background':'#C6D2DA url(../images/buttonEnabled.png) repeat-x scroll left bottom'				
		});		
	},
	
	btnMouseOut: function(btn){
		dojo.style( btn, {
			'background':''				
		});		
	},		
	
	closeDialog: function(callback){
		this.destroyToolTips();
		var keepDialogOpen = false;
		if (callback){
			keepDialogOpen = callback(); // if callback has an error message do not close the dialog and allow user to correct entries to resubmit
		}
		if(((typeof(keepDialogOpen) == "boolean") && keepDialogOpen) 
				|| ((typeof(keepDialogOpen) == "object") && keepDialogOpen.paraIncorrect)){
			return;			
		}else {
			if (this.opts.destroyOnClose){
				this.hide();
				this.uninitializePresDialog();
				try{
					this.destroyRecursive();
				}catch(e){}
			}
			else
				this.hide();
		}
		setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
	},
	
	uninitializePresDialog: function(){
		this.presDialogBodyNode = null,
		this.presDialogButtonsSectionNode = null,
	    this.savedOnSelectStartHandler = null;
		for(var i=0; i< this.connectArray.length; i++){
			dojo.disconnect(this.connectArray[i]);
		}
	},
	
	destroyToolTips: function(){
		//Let's make sure no tooltips are left behind hanging on the canvas when dialog has gone
		if (this.toolTipObjs!=null){
			var tooltips = this.toolTipObjs;
			for (var i=0; i< tooltips.length; i++){
				var dijitObj = tooltips[i];			
				try {
					//dijitObj.close();
					dijitObj.destroyRecursive();
				} catch(e){}
			}
		}
	},	
		
	hide: function(){
		pe.scene.restoreOnSelectStart();
		pe.scene.enableDefaultMouseDownHandler();
		
		if (this.domNode){
			dojo.style(this.domNode,{'display':'none'});
		}
		
		if(dijit._underlay && dijit._underlay.bgIframe) {
			dijit._underlay.hide();
		}
		
		var ds = dijit.Dialog._dialogStack;
		
		// need to iterat all the element of the dialog stack because this is a modeless dialog
		for(var i = 0; i<ds.length; i++) {
			if(this == ds[i]) {
				ds.splice(i, 1);  // remove the dialog from dialog statck defect 32660
			}
		}
	},
	
	popOffDialogStack: function(){
		var ds = dijit.Dialog._dialogStack;		
		// need to iterat all the element of the dialog stack because this is a modeless dialog
		for(var i = 0; i<ds.length; i++) {
			if(this == ds[i]) {
				ds.splice(i, 1);  // remove the dialog from dialog statck defect 32660
			}
		}		
	},
	
	onCancel: function(){
		//alert('cancelling');
		this.closeDialog();
	},
	
	uninitialize: function(){
		var wasPlaying = false;
		if(this._fadeIn && this._fadeIn.status() == "playing"){
			wasPlaying = true;
			this._fadeIn.stop();
		}
		if(this._fadeOut && this._fadeOut.status() == "playing"){
			wasPlaying = true;
			this._fadeOut.stop();
		}
		
		// Hide the underlay, unless the underlay widget has already been destroyed
		// because we are being called during page unload (when all widgets are destroyed)
//		if((this.open || wasPlaying) && !dijit._underlay._destroyed){
//			dijit._underlay.hide();
//		}
		if(this._moveable){
			this._moveable.destroy();
		}
		//this.inherited(arguments);
		
		if(this._beingDestroyed){
			this.cancel();
		}
		return false;
	},
	_endDrag: function(e){
		// summary:
		// Called after dragging the Dialog. Saves the position of the dialog in the viewport.
		// tags:
		// private
		// JMT - Added this function for D34503
		if(e && e.node && e.node === this.domNode){ 
			var pos = dojo.position(e.node);
			if (pos.y<0){
				dojo.style(this.domNode,{'top':'0px'});
				pos = dojo.position(e.node);
			}
			this._relativePosition = pos;
		}
		
		concord.util.dialogs.hideUnderlayIfNotActive();
	}, 
	
	publishDialogInFocus: function(){	
		this.domNode.style.zIndex=this.getMaxZindex();		
 		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':this.DIALOGS, 'presModal':this.opts.presModal}];
 		concord.util.events.publish(concord.util.events.presentationFocus, eventData); 		
	},
	
	_getFocusItems: function(domNode){
		
		this.inherited(arguments);
		
		if (this.opts.lastTabNodeId) {
			this._lastFocusItem = dojo.byId(this.opts.lastTabNodeId);
		}
		if (this.id == 'presColorPickerDialog') {
			var selectedItems = dojo.query(".dojoxColorPickerPoint",domNode);
			if (selectedItems.length > 0) {
				this._firstFocusItem = selectedItems[0];
			}
		}
	},
	
	setNextFocusElement: function(node,reverse) {
		if (this.id == 'presColorPickerDialog') {
			var hexNode = null;
			var selectedItems = dojo.query(".dojoxColorPickerHexCode",this.domNode);
			if (selectedItems.length > 0) {
				hexNode = selectedItems[0];
			}
			var okButton = dojo.byId('presColorPickerDialog_okButton');
			if (hexNode == null || okButton == null) {
				return false;
			}
			if (!reverse && node == hexNode) {
				okButton.focus();
				return true;
			}
			if (reverse && node == okButton) {
				hexNode.focus();
				return true;
			}
		}
		return false;
	},
	
    postCreate: function() {
    	this.inherited(arguments);
    	if (this.containerNode && this.id){
    		this.containerNode.id = this.id + "_containerNode";  // since dijit doesn't set an id=, lets use our own "convention" to set the id
    	}
    }

});
