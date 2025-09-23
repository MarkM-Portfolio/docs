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

dojo.provide("pres.widget.common.ShapePalette");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("pres.constants");
dojo.require("concord.util.BidiUtils");

dojo.declare("pres.widget.common.ShapePalette", [dijit._Widget, dijit._Templated], {
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

	_paletteCoords: {
		"leftOffset": 0,
		"topOffset": 0,
		"cWidth": 24,
		"cHeight": 24
	},

	templateString: dojo.cache("pres", "templates/ShapePalette.html"),

	postMixInProperties: function()
	{
		this.dir = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.inherited(arguments);
	},

	postCreate: function()
	{
		var baseUrl = contextPath + window.staticRootPath + "/styles/css/presentation2/images/shapes/";
		this.inherited(arguments);
		this.domNode.style.position = "relative";
		this._cellNodes = [];
		this.colorNames = dojo.i18n.getLocalization("dojo", "colors", this.lang);

		var SHAPETYPES = pres.constants.SHAPE_TYPES;
		var shapeStrs = dojo.i18n.getLocalization("concord.widgets", "shapeGallery");
		var lineTypes = [[{
			title: shapeStrs.line,
			icon: 'line'
		}, {
			title: shapeStrs.arrow,
			icon: 'arrow'
		}, {
			title: shapeStrs.doublearrow,
			icon: 'doublearrow'
		}]];

		var basicTypes = [[{
			title: shapeStrs.rectangle,
			icon: 'rectangle'
		}, {
			title: shapeStrs.roundedrectangle,
			icon: 'roundedrectangle'
		}, {
			title: shapeStrs.diamond,
			icon: 'diamond'
		}, {
			title: shapeStrs.hexagon,
			icon: 'hexagon'
		}], [{
			title: shapeStrs.isoscelestriangle,
			icon: 'isoscelestriangle'
		}, {
			title: shapeStrs.rttriangle,
			icon: 'rttriangle'
		}, {
			title: shapeStrs.ellipse,
			icon: 'ellipse'
		}, {
			title: shapeStrs.trapezoid,
			icon: 'trapezoid'
		}], [{
			title: shapeStrs.rightarrow,
			icon: 'rightarrow'
		}, {
			title: shapeStrs.leftrightarrow,
			icon: 'leftrightarrow'
		}, {
			title: shapeStrs.chevron,
			icon: 'chevron'
		}, {
			title: shapeStrs.fivepointedstar,
			icon: 'fivepointedstar'
		}], [{
			title: shapeStrs.rectangularcallout,
			icon: 'rectangularcallout'
		}, {
			title: shapeStrs.wedgeellipsecallout,
			icon: 'wedgeellipsecallout'
		}, {
			title: shapeStrs.cube,
			icon: 'cube'
		}, {
			title: shapeStrs.flowchartmagneticdisk,
			icon: 'flowchartmagneticdisk'
		}]];

		var choices = [lineTypes, basicTypes];

		var url = this._blankGif, coords = this._paletteCoords;
		var rowCount = 0;
		for ( var group = 0; group < choices.length; group++)
		{
			if (group > 0)
			{
				var sep = dojo.create("div", {
					className: "shapeSep"
				}, this.divNode);
			}

			var groupNode = dojo.create("div", {
				role: "grid",
				className: "shapeGroup"
			}, this.divNode);
			dijit.setWaiState(groupNode, "label", "shape group " + (group + 1));

			for ( var row = 0; row < choices[group].length; row++)
			{
				var rowNode = dojo.create("div", {
					role: "row",
					className: "shapeRow"
				}, groupNode);

				for ( var col = 0; col < choices[group][row].length; col++)
				{
					var obj = choices[group][row][col];
					var cellNode = dojo.create("a", {
						"class": "dijitPaletteCell",
						tabIndex: "-1",
						title: obj.title,
						alt: name,
						style: {
							position: "static",
							display: "inline-block"
						}
					});
					var colorSpanNode = dojo.create("span", {
						"class": "dijitPaletteShapeSpan " + obj.icon,
						alt: name,
						style: {
							"float": "left"
						}
					}, cellNode);

					this.connect(cellNode, "ondijitclick", "_onCellDijitclick");
					dojo.place(cellNode, rowNode);

					dijit.setWaiRole(cellNode, "gridcell");
					cellNode.index = this._cellNodes.length;
					dojo.attr(cellNode, "shape", obj.icon);
					dojo.attr(cellNode, "row", rowCount);
					dojo.attr(cellNode, "col", col);
					this._cellNodes.push(cellNode);
				}
				rowCount++;
			}
		}

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
					this._navigateByKey(increment, count);
				};
			}(), this.timeoutChangeRate, this.defaultTimeout));
		}
	},

	focusChild: function(c)
	{
		if (!c)
			return;
		var clazz = "dijitPaletteCellSelectedHighlight";
		dojo.query("a.dijitPaletteCell", this.domNode).forEach(function(t)
		{
			t.tabIndex = "-1";
			dojo.removeClass(t, clazz);
		});

		c.tabIndex = "0";
		dojo.addClass(c, clazz);
		c.focus();

		this._currentFocus = c;
	},

	getValue: function()
	{
		return this.value;
	},

	setValue: function(shape)
	{
		this.value = shape;
		var node = dojo.filter(dojo.query("a.dijitPaletteCell", this.domNode), function(cell)
		{
			return dojo.attr(cell, "shape") == shape;
		})[0];
		if (node)
		{
			this.focusChild(node);
		}
	},

	focusFirstChild: function()
	{
		this.focusChild(this._cellNodes[0]);
	},

	focus: function()
	{
		var shape = this.value;
		if (shape)
		{
			var node = dojo.filter(dojo.query("a.dijitPaletteCell", this.domNode), function(cell)
			{
				return dojo.attr(cell, "shape") == shape;
			})[0];
			if (node)
			{
				this.focusChild(node);
				return;
			}
		}
		this.focusFirstChild();
	},

	_onCellDijitclick: function(/* Event */evt)
	{
		// summary:
		// Handler for click, enter key & space key. Selects the color.
		// evt:
		// The event.
		// tags:
		// private
		var target = evt.currentTarget;
		this.value = dojo.attr(target, "shape");
		this.focusChild(target);
		dojo.stopEvent(evt);
		this.selectedChild = target;
		this.delegator && this.delegator.closeDropDown(this);
		this.onChange(this.value);
	},

	onChange: function()
	{
		dojo.publish("/command/exec", [this.cmd, this.value]);
		this.value = "line";
		this.focus();
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
		var row = dojo.attr(this._currentFocus, "row");
		var col = dojo.attr(this._currentFocus, "col");
		var _increment = 1;
		switch (increment)
		{
			case "UP":
				_increment = row == 1 ? (col == 3 ? -4 : -3) : -4;
				break;
			case "DOWN":
				_increment = row == 0 ? 3 : 4;
				break;
			default:
				_increment = increment;
		}
		var newFocusIndex = this._currentFocus.index + _increment;
		if (newFocusIndex >= this._cellNodes.length)
			newFocusIndex = this._cellNodes.length - 1;
		if (newFocusIndex <= -1)
			newFocusIndex = 0;
		var focusNode = this._cellNodes[newFocusIndex];
		this.focusChild(focusNode);
		// Actually focus the node, for the benefit of screen readers.
		// Use setTimeout because IE doesn't like changing focus inside of an
		// event handler
		setTimeout(dojo.hitch(dijit, "focus", focusNode), 0);
	}
});