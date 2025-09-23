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

dojo.provide("websheet.ColorPalette");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.colors");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet", "base");
dojo.requireLocalization("dojo", "colors");
dojo.requireLocalization("websheet","ColorPalette");
dojo.declare("websheet.ColorPalette",
	[dijit._Widget, dijit._Templated],
	{
		defaultTimeout: 500,

	// timeoutChangeRate: Number
	//		Fraction of time used to change the typematic timer between events
	//		1.0 means that each typematic event fires at defaultTimeout intervals
	//		< 1.0 means that each typematic event fires at an increasing faster rate
	timeoutChangeRate: 0.90,

	// value: String
	//		The value of the selected color.
	value: null,

	// _currentFocus: [private] DomNode
	//		The currently focused or hovered color.
	//		Different from value, which represents the selected (i.e. clicked) color.
	_currentFocus: 0,

	// _xDim: [protected] Integer
	//		This is the number of colors horizontally across.
	_xDim: null,

	// _yDim: [protected] Integer
	///		This is the number of colors vertically down.
	_yDim: null,
	hex2NodeIndexMap:{},
	resetSelected:function(){
		if(this._selectedNode){
			dojo.removeClass(this._selectedNode, "dijitPaletteCellSelectedHighlight");
			this._selectedNode = null;
		}		
	},
	setSelected: function(HexColor){
		if(!HexColor){
			this._setSelectedNode(this._cellNodes[0]);
	    	return;
		}
		var key = HexColor.replace("#","C");
		var cellindex = this.hex2NodeIndexMap[key];
		if(cellindex != undefined){			
			this._setSelectedNode(this._cellNodes[cellindex]);
		}		
	},
	_selectedNode:null,
	_setSelectedNode: function(/*Node*/ node){		
		this.resetSelected();
		this._resetCurrent();
		this._currentFocus = node;
		this._selectedNode = node;
		dijit.focus(this._selectedNode);
		if(this._selectedNode){			
			dojo.addClass(this._selectedNode, "dijitPaletteCellSelectedHighlight");
		}
	},
	_palettes: [["black", "maroon", "saddlebrown", "darkslategray","teal", "navy", "indigo", "dimgray"],
					["firebrick", "brown", "goldenrod", "darkgreen", "turquoise", "mediumblue", "purple", "gray"],
					["red", "darkorange", "gold", "green", "cyan", "blue", "violet", "darkgray"],
					["lightsalmon", "orange", "yellow", "lime", "paleturquoise", "lightblue", "plum", "lightgrey"],
					["lavenderblush", "antiquewhite", "lightyellow", "honeydew", "azure", "aliceblue", "lavender", "white"]],
	
	_paletteCoords: {
		"leftOffset": 0, "topOffset": 0,
		"cWidth": 24, "cHeight": 24
	},
	templateString: dojo.cache("websheet", "templates/ColorPalette.html"),
	
	// _paletteDims: [protected] Object
	//		Size of the supported palettes for alignment purposes.
	_paletteDims: {},
	tabIndex: "0",
	buildRendering: function(){
		// Instantiate the template, which makes a skeleton into which we'll insert a bunch of
		// <img> nodes
		this.inherited(arguments);
		// A name has to be given to the colorMap, this needs to be unique per Palette.
		dojo.mixin(this.divNode.style, this._paletteDims);
		dijit.setWaiState(this.divNode, "label", dojo.i18n.getLocalization("websheet","base").ACC_BORDER_COLOR);
		var choices = this._palettes;
		var nls = dojo.i18n.getLocalization("websheet","ColorPalette");
		this.domNode.style.position = "relative";
	//	this.domNode.style.padding = "8px";
		
		this._cellNodes = [];
		this.colorNames = dojo.i18n.getLocalization("dojo", "colors", this.lang);
		var url = this._blankGif,
			colorObject = new dojo.Color(),
			coords = this._paletteCoords;
		for(var row=0; row < choices.length; row++){
			var rowNode = dojo.create("div", {
				role: "row"
			}, this.divNode);
			for(var col=0; col < choices[row].length; col++){
				var color = choices[row][col],
				colorValue = colorObject.setColor(dojo.Color.named[color]);	
				var name = this.colorNames[color];
				if(undefined==name)
					name = nls.auto;
				var cellNode = dojo.create("a", {
						"class": "dijitPaletteCell",
						tabIndex: "-1",
						title: name,
						alt: name,
						style: {
							position: "static",
							display: "inline-block"
						}
					});
				var colorSpanNode = dojo.create("span",{
					"class":"dijitPaletteColorSpan",						
					alt: name,
					style: {
						"float": "left"
					}
					
				}, cellNode);
			
				var colorSpanStyle = colorSpanNode.style;
				if(null!=colorValue){
					colorSpanNode.color = colorValue.toHex();
					colorSpanStyle.color = colorSpanStyle.backgroundColor = colorSpanNode.color;
				}else{
					colorSpanNode.color = null;
					colorSpanStyle.color = null;
				}
				dojo.forEach(["Dijitclick", "MouseEnter", "MouseLeave", "Focus"], function(handler){
					this.connect(cellNode, "on" + handler.toLowerCase(), "_onCell" + handler);
					}, this);
				dojo.place(cellNode, rowNode);

				dijit.setWaiRole(cellNode, "gridcell");
				cellNode.index = this._cellNodes.length;
				if(colorValue){
					var key = colorValue.toHex().replace("#","C");
					this.hex2NodeIndexMap[key] = cellNode.index;
				}					
				this._cellNodes.push(cellNode);
			}
		}
		this._xDim = choices[0].length;
		this._yDim = choices.length;

		// Now set all events
		// The palette itself is navigated to with the tab key on the keyboard
		// Keyboard navigation within the Palette is with the arrow keys
		// Spacebar selects the color.
		// For the up key the index is changed by negative the x dimension.

		var keyIncrementMap = {
			UP_ARROW: "UP",
			// The down key the index is increase by the x dimension.
			DOWN_ARROW: "DOWN",
			// Right and left move the index by 1.
			RIGHT_ARROW: 1,
			LEFT_ARROW: -1
		};
		for(var key in keyIncrementMap){
			this._connects.push(dijit.typematic.addKeyListener(this.domNode,
				{charOrCode:dojo.keys[key], ctrlKey:false, altKey:false, shiftKey:false},
				this,
				function(){
					var increment = keyIncrementMap[key];
					return function(count){ this._navigateByKey(increment, count); };
				}(),
				this.timeoutChangeRate, this.defaultTimeout));
		}
	},
	
	postCreate: function(){
		this.inherited(arguments);

		// Set initial navigable node.   At any point in time there's exactly one
		// cell with tabIndex != -1.   If focus is inside the ColorPalette then
		// focus is on that cell.
		// TODO: if we set aria info (for the current value) on the ColorPalette itself then can we avoid
		// having to focus each individual cell?
		this._currentFocus = this._cellNodes[0];
		dojo.attr(this._currentFocus, "tabIndex", this.tabIndex);
	},

	focus: function(){
		// summary:
		//		Focus this ColorPalette.  Puts focus on the most recently focused cell.

		// The cell already has tabIndex set, just need to set CSS and focus it
	
		dojo.addClass(this._currentFocus, "dijitPaletteCellSelectedHighlight");		
		dijit.focus(this._currentFocus);
	},

	onChange: function(color){
		// summary:
		//		Callback when a color is selected.
		// color: String
		//		Hex value corresponding to color.
//		console.debug("Color selected is: "+color);
	},

	_onFocus: function(){
		// summary:
		//		Handler for when the ColorPalette gets focus (because a cell inside
		//		the ColorPalette got focus)
		// tags:
		//		protected
		
		dojo.addClass(this._currentFocus, "dijitPaletteCellSelectedHighlight");		
		this.inherited(arguments);
	},

	_onBlur: function(){
		// summary:
		//		Handler for when the ColorPalette loses focus
		// tags:
		//		protected

		// Just to be the same as 1.3, when I am focused again go to first (0,0) cell rather than
		// currently focused node.
//		dojo.attr(this._currentFocus, "tabIndex", "-1");
//		
//			dojo.removeClass(this._currentFocus, "dijitPaletteCellSelectedHighlight");
//		
//		this._currentFocus = this._cellNodes[0];
//		dojo.attr(this._currentFocus, "tabIndex", this.tabIndex);

		this.inherited(arguments);
	},

	_onCellDijitclick: function(/*Event*/ evt){
		// summary:
		//		Handler for click, enter key & space key. Selects the color.
		// evt:
		//		The event.
		// tags:
		//		private

		var target = evt.currentTarget;
		this._selectColor(target);
		dojo.stopEvent(evt);
	},

	_onCellMouseEnter: function(/*Event*/ evt){
		// summary:
		//		Handler for onMouseEnter event on a cell. Put highlight on the color under the mouse.
		// evt:
		//		The mouse event.
		// tags:
		//		private

//		var target = evt.currentTarget;
//		this._setCurrent(target);
		this.inherited(arguments);
	},

	_onCellMouseLeave: function(/*Event*/ evt){
		// summary:
		//		Handler for onMouseLeave event on a cell. Remove highlight on the color under the mouse.
		// evt:
		//		The mouse event.
		// tags:
		//		private
		
//			dojo.removeClass(this._currentFocus, "dijitPaletteCellSelectedHighlight");
		this.inherited(arguments);
		
	},

	_onCellFocus: function(/*Event*/ evt){
		// summary:
		//		Handler for onFocus of a cell.
		// description:
		//		Removes highlight of the color that just lost focus, and highlights
		//		the new color.  Also moves the tabIndex setting to the new cell.
		//		
		// evt:
		//		The focus event.
		// tags:
		//		private

//		this._setCurrent(evt.currentTarget);
	},
	
	_resetCurrent: function(){
		if("_currentFocus" in this){
			// Remove highlight and tabIndex on old cell
			dojo.attr(this._currentFocus, "tabIndex", "-1");
			
			dojo.removeClass(this._currentFocus, "dijitPaletteCellSelectedHighlight");
			
		}
	},

	_setCurrent: function(/*Node*/ node){
		// summary:
		//		Called when a color is hovered or focused.
		// description:
		//		Removes highlight of the old color, and highlights
		//		the new color.  Also moves the tabIndex setting to the new cell.
		// tags:
		//		protected
		
		this._resetCurrent();
		// Set highlight and tabIndex of new cell
		this._currentFocus = node;
		if(node){
			dojo.attr(node, "tabIndex", this.tabIndex);
			dojo.addClass(this._currentFocus, "dijitPaletteCellSelectedHighlight");			
		}
	},

	_selectColor: function(selectNode){
		// summary:
		// 		This selects a color. It triggers the onChange event
		// area:
		//		The area node that covers the color being selected.
		// tags:
		//		private
		var img = selectNode.getElementsByTagName("span")[0];
		this.onChange(this.value = img.color);
	},

	_navigateByKey: function(increment, typeCount){
		// summary:
		// 	  	This is the callback for typematic.
		// 		It changes the focus and the highlighed color.
		// increment:-- or key pressed "UP"/"DOWON"
		// 		How much the key is navigated.
		// typeCount:
		//		How many times typematic has fired.
		// tags:
		//		private

		// typecount == -1 means the key is released.
		if(typeCount == -1){return;}
		var _increment = 1;
		switch(increment){
		case "UP":
			_increment = -this._xDim;
			break;
		case "DOWN":
			_increment = this._xDim;
			break;
		default:
			_increment = increment;
		}
		var newFocusIndex = this._currentFocus.index + _increment;
		if(newFocusIndex >= this._cellNodes.length) newFocusIndex = this._cellNodes.length - 1;
		if(newFocusIndex <= -1) newFocusIndex = 0;
		var focusNode = this._cellNodes[newFocusIndex];
		this._setCurrent(focusNode);
		// Actually focus the node, for the benefit of screen readers.
		// Use setTimeout because IE doesn't like changing focus inside of an event handler
		setTimeout(dojo.hitch(dijit, "focus", focusNode), 0);		
	}
});
dojo.declare("websheet.BorderColorPalette",	[websheet.ColorPalette],{
	onChange: function(color){
		// summary:
		//		Callback when a color is selected.
		// color: String
		//		Hex value corresponding to color.
//		console.debug("Color selected is: "+color);		
		this.setSelected(this.value);
		var toolbar = this.editor.getToolbar(); 
		if (toolbar) toolbar.BorderCustomizeColor();
	},
	
	_setCurrent: function(/*Node*/ node){
		this.inherited(arguments);
		if(node){			
			this._selectColor(node);
		}
	}
});