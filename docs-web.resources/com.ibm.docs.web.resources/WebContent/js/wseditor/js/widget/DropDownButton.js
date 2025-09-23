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

dojo.provide("websheet.widget.DropDownButton");

dojo.require("dijit._HasDropDown");
dojo.require("websheet.BorderPane");
dojo.require("websheet.ColorPalette");

dojo.declare("websheet.grid._HasDropDown", [dijit._HasDropDown], {
	methodName:null,
	focusMethod:null, //when drop down, focusMethod is used to set focus on the drop down widget
	
	postCreate: function(){
		this.inherited(arguments);
		if(this.focusMethod && this.toolbar){
			this.toolbar._connectFocusEvent(this, this.dropDown,this.focusMethod);
		}
	},
	
	// override this function for our special dropdown like fontColor
	destroy: function(){
		if(this.dropDown){
			// Destroy the drop down, unless it's already been destroyed.  This can happen because
			// the drop down is a direct child of <body> even though it's logically my child.
			if(!this.dropDown._destroyed && this.dropDown.destroyRecursive){
				this.dropDown.destroyRecursive();
			}
			delete this.dropDown;
		}
		this.inherited(arguments);
	},
	
	_onDropDownMouseDown: function(/*Event*/ e){
		// summary:
		//		Callback when the user mousedown/touchstart on the arrow icon.

		if(this.disabled || this.readOnly){
			return;
		}

		// Prevent default to stop things like text selection, but don't stop propagation, so that:
		//		1. TimeTextBox etc. can focus the <input> on mousedown
		//		2. dropDownButtonActive class applied by _CssStateMixin (on button depress)
		//		3. user defined onMouseDown handler fires
		//
		// Also, don't call preventDefault() on MSPointerDown event (on IE10) because that prevents the button
		// from getting focus, and then the focus manager doesn't know what's going on (#17262)
		if(e.type != "MSPointerDown" && e.type != "pointerdown"){
			e.preventDefault();
		}
		
		if(this._stopMouseDownEvents){
			e.stopPropagation();
			e.preventDefault();
		}
		this._docHandler = this.own(require("dojo/on")(this.ownerDocument, dojo.touch.release, dojo.hitch(this, "_onDropDownMouseUp")))[0];

		this.toggleDropDown();
	},
	
	_onDropDownMouse: function(/*Event*/ e){
		// summary:
		//		Callback when the user mouse clicks on the arrow icon, or presses the down
		//		arrow key, to open the drop down.

		// We handle mouse events using onmousedown in order to allow for selecting via
		// a mouseDown --> mouseMove --> mouseUp.  So, our click is already handled, unless
		// we are executed via keypress - in which case, this._seenKeydown
		// will be set to true.
		if(e.type == "click" && !this._seenKeydown){ return; }
		this._seenKeydown = false;

		//REMOVE ONMOUSEUP CONNECTION
		//does not trigger _onDropDownMouseup here
		//because it will window.setTimeout(dojo.hitch(dropDown, "focus"), 1);
		//for dijit.menu, focus method is used to focus on the first menu item
		// If we are a mouse event, set up the mouseup handler.  See _onDropDownMouse() for
		// details on this handler.
//		if(e.type == "mousedown"){
//			this._docHandler = this.connect(dojo.doc, "onmouseup", "_onDropDownMouseup");
//		}
		if(this.disabled || this.readOnly){ return; }
		if(this._stopClickEvents){
			dojo.stopEvent(e);
		}
		this.toggleDropDown();

		// If we are a click, then we'll pretend we did a mouse up
		if(e.type == "click" || e.type == "keypress"){
			this._onDropDownMouseup();
		}
	},

	//just for IE
	destroyDescendants: function(){
		if(dojo.isObject(this.dropDown)){
			this.inherited(arguments);
		}
	},
	
	getFocusCellColorHexStr: function(dropdown){
		// get focus cell style information
		var dropDown;
		var colorValue = null;
		var bObj=false;
		if(dojo.isString(dropdown)){
			dropDown = dropdown;
		}else{
			dropDown = dropdown.id;			
			bObj = true;
		}
		if (dropDown == "S_m_FontColor" ||
					dropDown == "S_m_BackgroundColor" ||
					dropDown == "S_m_BorderColor") {
			if(bObj)
				dropdown.resetSelected();
				
			if(dropDown == "S_m_FontColor"){
				colorValue =  websheet.Utils.getCellColorByType(null, websheet.Constant.Style.COLOR);					
			}else if(dropDown == "S_m_BackgroundColor"){					
				colorValue =  websheet.Utils.getCellColorByType(null, websheet.Constant.Style.BACKGROUND_COLOR);
			}else if(dropDown == "S_m_BorderColor"){					
				colorValue =  websheet.Utils.getCellColorByType(null, websheet.Constant.Style.BORDER_LEFT_COLOR);
			}
		}
		return colorValue;
	},
	
	closeDropDown: function(/*Boolean*/ focus){
		if (!this.editor) {
			this.editor = pe.lotusEditor;
		}
		var inlineEditor = this.editor.getController().getInlineEditor();
		if (inlineEditor) {
			inlineEditor.uncover();
		}
		this.inherited(arguments);
		if (this.domNode) {
			dijit.removeWaiState(this.domNode, "expanded");
			dojo.removeClass(this.domNode, "dropDownExpanded");
		}
		(!this._opened && this.focusNode)&& dijit.setWaiState(this.focusNode, "expanded", "false");
		try {
			if (!dijit.popup._stack || dijit.popup._stack.length == 0) {
				if (inlineEditor.isEditing()) {
					inlineEditor.focus();
				} else {
					inlineEditor.grid.focus();
				}
			}
		} catch (e) {}
	},
	
	openDropDown: function(){
		if (!this.editor) {
			this.editor = pe.lotusEditor;
		}
		var inlineEditor = this.editor.getController().getInlineEditor();
		if(inlineEditor && inlineEditor.isEditing() && !inlineEditor.isCovered())
			inlineEditor.cover();
		if(this.dropDown && this.toolbar && !this.dropDown.onOpenConnected)
		{
			this.dropDown.onOpenConnected = true;
			// better ux, make the top border of dropdown overlap the bottom border of dropdown button.
			dojo.connect(this.dropDown, "onOpen", this, function(){
				if (this.dropDown) {
					var dom = this.dropDown._popupWrapper;
					if (dom) {
						var t = dojo.style(dom, "top");
						dojo.style(dom, "top", t - 1 + "px");
					}
					
				}
			});
		}
		
		this.inherited(arguments);
		if(dojo.isIE >= 10 && ( this.dropDown instanceof websheet.ColorPalette || this.dropDown instanceof websheet.BorderPane))
		{
			var dom = this.dropDown._popupWrapper.firstChild;
			var width = dojo.style(dom, "width");
			width = parseFloat(width);
			var max = Math.ceil(width), min = Math.floor(width);
			if(max != min)
				dom.style.width = max + "px";
		}	
		dijit.removeWaiState(this.domNode, "expanded");
		this._opened && dijit.setWaiState(this.focusNode, "expanded", "true");
		dojo.removeClass(this.domNode, "dropDownExpanded");
		this._opened && dojo.addClass(this.domNode, "dropDownExpanded");
	},
	toggleDropDown: function(){
		// summary:
		//		Toggle the drop-down widget; if it is up, close it, if not, open it
		// tags:
		//		protected
		if(this.disabled || this.readOnly){ return; }
		this.focus();
		var dropDown = this.dropDown;
		var bFirstTimeShowBorderPane = false;
		var methodName = this.methodName;
		if (!this.editor) {
			this.editor = pe.lotusEditor;
		}
		var editor = this.editor;
		var toolbar = editor.getToolbar();
		if(dojo.isString(dropDown)){ 
			// color palette
			if (dropDown == "S_m_FontColor" ||
				dropDown == "S_m_BackgroundColor" ||
				dropDown == "S_m_BorderColor") {
				this.dropDown = new websheet.ColorPalette({
					id:dropDown
				});
				var colorValue;
				if(dropDown == "S_m_FontColor" || dropDown == "S_m_BackgroundColor")
					colorValue = this.getFocusCellColorHexStr(dropDown);
				else
					colorValue = toolbar && toolbar.editor.getBorderStyle().borderColor;
				if(colorValue){
					this.dropDown.setSelected(colorValue);
				}
				if (toolbar) toolbar._connectPallete(dropDown, methodName);
			}
			// border style
			else if (dropDown == "S_m_Border"){
				this.dropDown = new websheet.BorderPane({
					id:dropDown,
					editor: toolbar.editor
				});
				bFirstTimeShowBorderPane = true;
			}
		    // number format
			else if (dropDown == "S_m_NumberDropDown"){
				this.dropDown = createDropDown(editor.scene, "S_m_NumberDropDown");
				if (toolbar) toolbar._connectFormat(/* for dropdown menu */ true);
			}
			//quick formula
			else if(dropDown == "S_m_QuickFormula")
			{
				this.dropDown = createDropDown(editor.scene, "S_m_QuickFormula");
				if (toolbar) toolbar._connectQuickFormula();
			}
		}
		if(!this._opened){
			// If we aren't loaded, load it first so there isn't a flicker
			if(!this.isLoaded()){
				this.loadDropDown(dojo.hitch(this, "openDropDown"));
			}else{
				this.openDropDown();
			}
			if(this.dropDown.id=="S_m_Border" ){
				if(bFirstTimeShowBorderPane){//open the border pane only first time
					bFirstTimeShowBorderPane = false;
					dojo.byId("S_t_border").className = "borderToolbar";
					dojo.byId("S_t_BorderStyle").className = "borderStyleToolbar";
					if(toolbar && toolbar.editor.getBorderStyle().borderStyle)
						if (toolbar) toolbar.updateBorderStyleMenu(true);
					var colorValue = this.getFocusCellColorHexStr(dropDown);
					if(!colorValue){
						colorValue = toolbar && toolbar.editor.getBorderStyle().borderColor;
					}
					if(colorValue){						
						this.dropDown.setBorderColor(colorValue);
					}
				}else{//open the border opinion second or more times
					if (toolbar) {
						toolbar.editor.getBorderStyle().bordertype = null;
						toolbar.updateBorderTypeMenu();
					}
				}
				dijit.byId("S_t_border").focus();
				dijit.byId("S_t_ClearBorders").focus();
				//setTimeout( dojo.hitch(this,function(){dijit.byId("S_t_border").focus(); dijit.byId("S_t_AllBorders").focus();}), 50 );
			}else{
				var colorValue = this.getFocusCellColorHexStr(dropDown);
				if(colorValue){
					this.dropDown.setSelected(colorValue);
				}
			}
		}else{
			this.closeDropDown();
		}
	}
});

dojo.require("dijit.form.DropDownButton");
dojo.declare("websheet.widget.DropDownButton", [dijit.form.DropDownButton,websheet.grid._HasDropDown], {
	
	startup: function(){
		if(this._started){ return; }
	}

});