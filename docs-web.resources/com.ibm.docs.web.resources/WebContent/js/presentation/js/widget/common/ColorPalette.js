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

dojo.provide("pres.widget.common.ColorPalette");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.colors");
dojo.require("dojo.i18n");
dojo.requireLocalization("dojo", "colors");
dojo.requireLocalization("pres", "pres");
dojo.requireLocalization("concord.widgets", "toolbar");
dojo.requireLocalization("concord.widgets", "templateDesignGallery");
dojo.require("pres.widget.common.OpacityPanel");
dojo.require("pres.widget.common.LineTypePanel");

dojo.declare("pres.widget.common.ColorPalette", [dijit._Widget, dijit._Templated], {
	defaultTimeout: 500,

	// timeoutChangeRate: Number
	// Fraction of time used to change the typematic timer between events
	// 1.0 means that each typematic event fires at defaultTimeout intervals
	// < 1.0 means that each typematic event fires at an increasing faster rate
	timeoutChangeRate: 0.90,

	// value: String
	// The value of the selected color.
	value: null,

	// _currentFocus: [private] DomNode
	// The currently focused or hovered color.
	// Different from value, which represents the selected (i.e. clicked) color.
	_currentFocus: 0,

	// _xDim: [protected] Integer
	// This is the number of colors horizontally across.
	_xDim: null,

	// _yDim: [protected] Integer
	// / This is the number of colors vertically down.
	_yDim: null,

	_palettes: [["black", "maroon", "saddlebrown", "darkslategray", "teal", "navy", "indigo", "dimgray"],
			["firebrick", "brown", "goldenrod", "darkgreen", "turquoise", "mediumblue", "purple", "gray"],
			["red", "darkorange", "gold", "green", "cyan", "blue", "violet", "darkgray"],
			["lightsalmon", "orange", "yellow", "lime", "paleturquoise", "lightblue", "plum", "lightgrey"],
			["lavenderblush", "antiquewhite", "lightyellow", "honeydew", "azure", "aliceblue", "lavender", "white"]],

	_paletteCoords: {
		"leftOffset": 0,
		"topOffset": 0,
		"cWidth": 24,
		"cHeight": 24
	},
	
	showButton: true,
	forBorder: false,
	forNoFill: false,

	//attr for opacity panel
	opValue: 100,
	transparencyPanel: null,
	lineTypePanel: null,
	
	templateString: dojo.cache("pres", "templates/ColorPalette.html"),

	// _paletteDims: [protected] Object
	// Size of the supported palettes for alignment purposes.
	_paletteDims: {
		"padding": "6px"
	},
	
	configButton: function(showButton, forNoFill)
	{
		this.button.style.display = showButton ? "" : "none";

		if (BidiUtils.isGuiRtl() && this.forBorder)
			dojo.attr(this.domNode, 'dir', 'rtl');
		
		if (forNoFill)
		{
			this.buttonValue = "transparent";
			var str = this.forBorder ? this.noBorderStr : this.noFillStr;
			this.buttonText.innerHTML = str;
			this.buttonIcon.style.display = "none";
			dojo.attr(this.buttonCell, "title", str);
		}
		else
		{
			this.buttonValue = "";
			this.buttonText.innerHTML = this.defaultStr;
			this.buttonIcon.style.display = "none";
			dojo.attr(this.buttonCell, "title", this.defaultStr);
		}
		
		dojo.attr(this.buttonCell, "hex", this.buttonValue);
	},
	
	buttonClick: function()
	{
		// a color rgb, or "transparent", or empty to remove inline style.
		this.value = this.buttonValue;
		this.onChange(this.value);
	},
	
	_setForNoFillAttr: function(value)
	{
		this.forNoFill = value;
		this.configButton(this.showButton, this.forNoFill);
	},

	_onCellKeyDown:function(evt)
	{
		if(evt.keyCode == dojo.keys.TAB)
		{
			this.resetFocus();
			// shift?
			if(this.lineTypePanel && !this.lineTypePanel.lineWidthButton.disabled)
			{
				dojo.addClass(this.lineTypePanel.lineWidthButton.domNode,"lineTypeBtnFocus");
				this.lineTypePanel.lineWidthButton.focus();
			}
			else if(this.lineTypePanel && this.lineTypePanel.lineWidthButton.disabled)
			{
				dojo.addClass(this.lineTypePanel.dashTypeButton.domNode,"lineTypeBtnFocus");
				this.lineTypePanel.dashTypeButton.focus();
			}
			else if(this.transparencyPanel && !this.transparencyPanel.disabled )
			{
				this.transparencyPanel.slideWidget.sliderHandle.focus();
			}
			dojo.stopEvent(evt);
		}
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		
		var presStrs = dojo.i18n.getLocalization("pres", "pres");
		var templateDesignStrs = dojo.i18n.getLocalization("concord.widgets", "templateDesignGallery");
		var toolbarStrs = dojo.i18n.getLocalization("concord.widgets", "toolbar");
		
		this.noFillStr = presStrs.color_nofill;
		this.noBorderStr = toolbarStrs.selectBorder_NoBorder;
		this.defaultStr = presStrs.color_default;
		
		this.connect(this.buttonCell, "ondijitclick", "_onCellDijitclick");
		this.configButton(this.showButton, this.forNoFill);
		this.connect(this.buttonCell, "onkeydown", "_onCellKeyDown");
		
		dojo.mixin(this.divNode.style, this._paletteDims);
		var choices = this._palettes;
		this.domNode.style.position = "relative";

		this._cellNodes = [];
		if (this.showButton)
		{
			this.buttonCell.index = 0;
			this._cellNodes.push(this.buttonCell);
		}
		this.colorNames = dojo.i18n.getLocalization("dojo", "colors", this.lang);
		var url = this._blankGif, colorObject = new dojo.Color(), coords = this._paletteCoords;
		for ( var row = 0; row < choices.length; row++)
		{
			var rowNode = dojo.create("div", {
				role: "row"
			}, this.divNode);
			for ( var col = 0; col < choices[row].length; col++)
			{
				var color = choices[row][col], colorValue = colorObject.setColor(dojo.Color.named[color]);
				var name = this.colorNames[color];
				if (!name)
					name = "";
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
				var colorSpanNode = dojo.create("span", {
					"class": "dijitPaletteColorSpan",
					alt: name,
					style: {
						"float": "left"
					}

				}, cellNode);

				var colorSpanStyle = colorSpanNode.style;
				if (null != colorValue)
				{
					colorSpanNode.color = colorValue.toHex();
					colorSpanStyle.color = colorSpanStyle.backgroundColor = colorSpanNode.color;
				}
				else
				{
					colorSpanNode.color = null;
					colorSpanStyle.color = null;
				}
				this.connect(cellNode, "ondijitclick", "_onCellDijitclick");
				dojo.place(cellNode, rowNode);
				this.connect(cellNode, "onkeydown", "_onCellKeyDown");

				dijit.setWaiRole(cellNode, "gridcell");
				cellNode.index = this._cellNodes.length;
				if (colorValue)
				{
					var hex = colorValue.toHex();
					dojo.attr(cellNode, "hex", hex);
				}
				this._cellNodes.push(cellNode);
			}
		}
		
		var extension = DOC_SCENE.extension;
		// when table cell menu create colorPalette(this.name = table_color_cell_popup ), will not add opacity panel.
		if (this.showButton && !this.forBorder && extension && extension.toLowerCase() == 'pptx' && !DOC_SCENE.isOdfDraft && !(/table_color_cell/.test(this.name)) )
		{
			dojo.addClass(this.opacityPanelContainer, 'opacityContainerCSS');
			dojo.addClass(this.seperatorDiv, 'opacitySeperatorCSS');
			var transparencyPanel = this.transparencyPanel = new pres.widget.common.OpacityPanel(presStrs.opacity_title, true);
			dojo.removeClass(transparencyPanel.domNode, "opacityPanel");
			transparencyPanel.configDivInColorPanel();
			this.opacityPanelContainer.appendChild(transparencyPanel.domNode);
			//Chorme and fireFox
			dojo.connect(transparencyPanel.slideWidget.sliderHandle , 'onfocus' , this , function(){
				if(!transparencyPanel.publishCMD)
					transparencyPanel.publishCMD = true ;
			});
			//IE and safari
			dojo.connect(transparencyPanel.slideWidget.sliderBarContainer , 'onmouseenter' , this , function(){
				if(!transparencyPanel.publishCMD)
					transparencyPanel.publishCMD = true ;
			});
			//acc
			dojo.connect(transparencyPanel.slideWidget.sliderHandle, 'onkeydown' , this , function(evt){
				if(evt.keyCode == dojo.keys.TAB )
				{
					this.focusFirstChild();
					dojo.stopEvent(evt);
				}
			});

		}
		
		if (this.showButton && this.forBorder && extension && extension.toLowerCase() == 'pptx' && !DOC_SCENE.isOdfDraft )
		{
			dojo.addClass(this.seperatorDiv, 'opacitySeperatorCSS');
			var lineTypePanel = this.lineTypePanel = new pres.widget.common.LineTypePanel();
			this.opacityPanelContainer.appendChild(lineTypePanel.domNode);
			this.connect(lineTypePanel.lineWidthButton.domNode, 'onkeydown', function(evt){
				if(evt.keyCode == dojo.keys.TAB )
				{
					dojo.removeClass(this.lineTypePanel.lineWidthButton.domNode,"lineTypeBtnFocus");
					dojo.addClass(this.lineTypePanel.dashTypeButton.domNode,"lineTypeBtnFocus");
					if(lineTypePanel.lineWidthButton.dropDown.activated)
						lineTypePanel.lineWidthButton.closeDropDown();
					lineTypePanel.dashTypeButton.focus();
					dojo.stopEvent(evt);
				}
			});

			this.connect(lineTypePanel.dashTypeButton.domNode, 'onkeydown', function(evt){
				if(evt.keyCode == dojo.keys.ENTER)
				{
					dojo.stopEvent(evt);
					return ;
				}
				else if(evt.keyCode == dojo.keys.TAB )
				{
					dojo.removeClass(this.lineTypePanel.dashTypeButton.domNode, "lineTypeBtnFocus");
					if(lineTypePanel.dashTypeButton.dropDown.activated)
						lineTypePanel.dashTypeButton.closeDropDown();
					if(lineTypePanel.endpointsButton.disabled)
					{
						this.focusFirstChild();
					}
					else
					{
						dojo.addClass(this.lineTypePanel.endpointsButton.domNode,"lineTypeBtnFocus");
						lineTypePanel.endpointsButton.focus();
					}
					dojo.stopEvent(evt);		
				}		
			});

			this.connect(lineTypePanel.endpointsButton.domNode, 'onkeydown', function(evt){

				if(evt.keyCode == dojo.keys.ENTER)
				{
					dojo.stopEvent(evt);
					return ;
				}
				else if(evt.keyCode == dojo.keys.TAB )
				{
					dojo.removeClass(this.lineTypePanel.endpointsButton.domNode, "lineTypeBtnFocus");
					if(lineTypePanel.endpointsButton.dropDown.activated)
						lineTypePanel.endpointsButton.closeDropDown();
					this.focusFirstChild();
					dojo.stopEvent(evt);
				}		
			});
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
		for ( var key in keyIncrementMap)
		{
			this._connects.push(dijit.typematic.addKeyListener(this.domNode, {
				charOrCode: dojo.keys[key],
				ctrlKey: false,
				altKey: false,
				shiftKey: false
			}, this, function()
			{
				var increment = keyIncrementMap[key];
				return function(count)
				{
					var ae = this.ownerDocument.activeElement;
					if (!ae || ae == this.domNode || ae == this.buttonCell || dojo.hasClass(ae, "dijitPaletteCell"))
						this._navigateByKey(increment, count);
				};
			}(), this.timeoutChangeRate, this.defaultTimeout));
		}
	},
	
	onKey: function(e)
	{
		var dk = dojo.keys;
		var hasFocus = this._currentFocus && this._currentFocus.index >= 0;
		var ae = this.ownerDocument.activeElement;
		if (!ae || ae == this.domNode || ae == this.buttonCell || dojo.hasClass(ae, "dijitPaletteCell"))
		{
			if (!hasFocus && (e.keyCode == dk.DOWN_ARROW || e.keyCode == dk.RIGHT_ARROW || e.keyCode == dk.TAB))
			{
				dojo.stopEvent(e);
				setTimeout(dojo.hitch(this, function(){this.focusFirstChild();}),1);
			}
		}
	},

	onBlur : function()
	{
		pe.scene.slideEditor.opcityPanelShow = false;
	},

	resetFocus: function()
	{
		var clazz = "dijitPaletteCellSelectedHighlight";
		dojo.query(".dijitPaletteCell", this.domNode).forEach(function(t)
		{
			t.tabIndex = "-1";
			dojo.removeClass(t, clazz);
		});
	},

	focusChild: function(c)
	{
		if (!c)
			return;
		this.resetFocus();
		var clazz = "dijitPaletteCellSelectedHighlight";
		c.tabIndex = "0";
		dojo.addClass(c, clazz);
		c.focus();

		this._currentFocus = c;
	},
	
	_setValueAttr: function()
	{
		this.setValue.apply(this, arguments);
	},
	
	_getValueAttr: function()
	{
		return this.getValue();
	},

	getValue: function()
	{
		return this.value;
	},

	setValue: function(hex)
	{
		//rollback Task 50628.remove codes related with Set Opacity.use global variables.
		this.value = hex;
		var node = dojo.filter(dojo.query(".dijitPaletteCell", this.domNode), function(cell)
		{
			return dojo.attr(cell, "hex") == hex;
		})[0];
		if (node)
		{
			this.focusChild(node);
		}
		else
		{
			this.focusDom();
		}

		//check value to widget for line style and opacity.
		if(this.lineTypePanel)
		{
			this.lineTypePanel._setDisabledAttr();
			this.lineTypePanel.setValue();
		}
		else if(this.transparencyPanel)
		{
			this.transparencyPanel.setValue();
			this.transparencyPanel._setDisabledAttr();
		}
	},

	focusDom: function()
	{
		this.resetFocus();
		this._currentFocus = null;
		this.domNode.focus();
	},

	focusFirstChild: function()
	{
		this.focusChild(this._cellNodes[0]);
	},

	focus: function()
	{
		pe.scene.slideEditor.opcityPanelShow = true;
		var hex = this.value;
		if (hex)
		{
			var node = dojo.filter(dojo.query(".dijitPaletteCell", this.domNode), function(cell)
			{
				return dojo.attr(cell, "hex") == hex;
			})[0];
			if (node)
			{
				this.focusChild(node);
				return;
			}
		}
		this.focusDom();
	},

	_onCellDijitclick: function(/* Event */evt)
	{
		// summary:
		// Handler for click, enter key & space key. Selects the color.
		// evt:
		// The event.
		// tags:
		// private
		//		
		var target = evt.currentTarget;
		this.value = dojo.attr(target, "hex");
		
		
		var slideEditor = pe.scene.slideEditor;
		var selectedBox = slideEditor.getSelectedBoxes();
		var opacityShouldEnable = true;
		if(selectedBox && selectedBox.length == 1 && selectedBox[0].element.family == "table") {
			opacityShouldEnable = false;
		}
		
		if(this.value != "transparent" && this.transparencyPanel )
		{
			if(opacityShouldEnable){
				dojo.removeClass(this.transparencyPanel.domNode,'opacityPanelcover');
				this.transparencyPanel.attr('disabled',false);	
			}
		}
		else if(this.value == "transparent" && this.transparencyPanel )
		{
			dojo.addClass(this.transparencyPanel.domNode,'opacityPanelcover');
			this.transparencyPanel.attr('disabled',true);
		}
		
		this.focusChild(target);
		dojo.stopEvent(evt);
		this.selectedChild = target;
		var extension = DOC_SCENE.extension;
		//opactiy enabled for shape and txtbox , use onChangeForBg() will keep popup until user close it.  the same rule for border color palette
		if ((this.showButton && !this.forBorder && extension && extension.toLowerCase() == 'pptx' && !DOC_SCENE.isOdfDraft && opacityShouldEnable)||(this.showButton && this.forBorder && extension && extension.toLowerCase() == 'pptx' && !DOC_SCENE.isOdfDraft))
		{
			this.onChangeForBg(this.value);
		}
		else
		{
			this.delegator && this.delegator.closeDropDown(this);
			this.onChange(this.value);
		}
	},

	onChangeForBg: function(value)
	{
		if(this.delegator && value)
		{
			this.delegator.attr("buttonValue", value);
			if (this.cmd)
			{
				dojo.publish("/command/exec", [this.cmd, value]);
			}
		}
	},
	
	onChange: function()
	{

	},

	_navigateByKey: function(increment, typeCount)
	{
		// summary:
		// This is the callback for typematic.
		// It changes the focus and the highlighed color.
		// increment:-- or key pressed "UP"/"DOWON"
		// How much the key is navigated.
		// typeCount:
		// How many times typematic has fired.
		// tags:
		// private

		// typecount == -1 means the key is released.
		if (typeCount == -1)
		{
			return;
		}
		var _increment = 1;
		switch (increment)
		{
			case "UP":
				_increment = -this._xDim;
				break;
			case "DOWN":
				_increment = this._xDim;
				break;
			default:
				_increment = increment;
		}
		
		if (this._currentFocus == this.buttonCell)
		{
			if (increment == "DOWN")
			{
				_increment = 1;
			}
		}
		
		var newFocusIndex = 0;
		//rollback 51345. use tab key to switch between widgets. up and down just switch between color cells.
		if (this._currentFocus)
		{
			var newFocusIndex = this._currentFocus.index + _increment;
			if (newFocusIndex >= this._cellNodes.length)
				newFocusIndex = this._cellNodes.length - 1;
			if (newFocusIndex <= -1)
				newFocusIndex = 0;
		}

		var focusNode = this._cellNodes[newFocusIndex];
		this.focusChild(focusNode);
		// Actually focus the node, for the benefit of screen readers.
		// Use setTimeout because IE doesn't like changing focus inside of an
		// event handler
		setTimeout(dojo.hitch(dijit, "focus", focusNode), 0);
		
	}
});