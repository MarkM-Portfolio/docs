dojo.provide("pres.widget.toolbar.FontSize");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");
dojo.require("pres.utils.fontSizeUtil");
dojo.requireLocalization("pres", "pres");
dojo.requireLocalization("concord.widgets", "toolbar");

dojo.declare("pres.widget.toolbar.FontSize", [pres.widget.toolbar.DropDownButton], {

	templateString: dojo.cache("pres", "templates/FontSize.html"),

	__onClick: function()
	{
		if(this._opened)
			return;
		this.inherited(arguments);
	},
	
	_onInputMouseDown: function(e)
	{
		if (this.disabled)
			dojo.stopEvent(e);
	},
	
	_onInputChange: function(evt)
	{
		var inputValue = this.inputNode.value;
		var attrValue = this.attr("value");
		if (BidiUtils.isArabicLocale()) {
			inputValue = BidiUtils.convertHindiToArabic(inputValue + "");
			attrValue = BidiUtils.convertHindiToArabic(attrValue + "");
		}
		var v = parseInt(inputValue);
		if (!v || v <= 0)
			return
		if (v != attrValue)
		{
			this.set("value", v);
		}
	},

	_onInputKeyDown: function(evt)
	{
		var keyCode = evt.keyCode;
		var keys = dojo.keys;
		var value = this.inputNode.value;
		if (BidiUtils.isArabicLocale())
			value = BidiUtils.convertHindiToArabic(value + "");

		if (keyCode == keys.RIGHT_ARROW || keyCode == keys.LEFT_ARROW)
		{
			evt.stopPropagation();
		}
		else if (keyCode == keys.DOWN_ARROW || keyCode == keys.UP_ARROW)
		{
			var v = parseInt(value);
			if (!v || v <= 0)
				v = 0;
			evt.stopPropagation();
			if (keyCode == keys.DOWN_ARROW)
			{
				var fontSize = pres.utils.fontSizeUtil.getNext(v, true);
				if (fontSize == v)
					fontSize = pres.utils.fontSizeUtil.getFirst(true);
				if (fontSize != v)
					this.set("value", fontSize);
				
				setTimeout(dojo.hitch(this, function()
				{
					this.inputNode.select();
				}), 0);
			}
			if (keyCode == keys.UP_ARROW)
			{
				var fontSize = pres.utils.fontSizeUtil.getPrev(v, true);
				if (fontSize == v)
					fontSize = pres.utils.fontSizeUtil.getLast(true);
				if (fontSize != v)
					this.set("value", fontSize);
				setTimeout(dojo.hitch(this, function()
				{
					this.inputNode.select();
				}), 0);
			}
		}
		else if (keyCode == keys.ESCAPE)
		{
			this.set("value", this._origValue);

			this.inputNode.blur();
			this.focusNode.focus();
		}
		else if (keyCode == keys.ENTER && this._opened)
		{
			var v = parseInt(value);
			if (isNaN(v))
				return;
			var first = pres.utils.fontSizeUtil.getFirst();
			var last = pres.utils.fontSizeUtil.getLast();

			if (v < first)
				v = first;

			if (v > last)
				v = last;

			this.set("value", v);

			this.inputNode.blur();
			this.focusNode.focus();
			this.closeDropDown();
		}
	},

	_onButtonKeyDown: function(/* Event */evt)
	{
		// summary:
		// Handler for right arrow key when focus is on left part of button
		if (evt.keyCode == dojo.keys[this.isLeftToRight() ? "RIGHT_ARROW" : "LEFT_ARROW"])
		{

			var handled = false;
			if (!this.fontSizeUpDisabled)
			{
				this.fontSizeUpWrapper.focus();
				handled = true;
			}
			else if (!this.fontSizeDownDisabled)
			{
				this.fontSizeDownWrapper.focus();
				handled = true;
			}

			if (handled)
				dojo.stopEvent(evt);
		}
	},
	
	_onDropDownMouseDown: function()
	{
		if (this._opened)
			return;
		this.inherited(arguments);
	},

	_onDropDownMouseUp: function()
	{
		this.inherited(arguments);
		if (this._focusDropDownTimer)
			this._focusDropDownTimer.remove();
	},

	dropDownClosed: function()
	{
		setTimeout(dojo.hitch(this, function()
		{
			var v = this.attr("value");
			if (BidiUtils.isArabicLocale())
				v = BidiUtils.convertHindiToArabic(v + "");

			var setted = false;
			if (v !== this._origValue)
			{
				var first = pres.utils.fontSizeUtil.getFirst();
				var last = pres.utils.fontSizeUtil.getLast();
				
				if (v < first)
					v = first;
				
				if (v > last)
					v = last;
				
				setted = true;
				this.set("value", v);
				this.handler();
			}
			
			if(!setted)
				this.set("value", this.attr("value"));
			
			this._origValue = 0;
		}), 0);
	},

	dropDownOpened: function()
	{
		var value = this.inputNode.value;
		if (BidiUtils.isArabicLocale())
			value = BidiUtils.convertHindiToArabic(value + "");

		this._origValue = parseInt(value) || 0;

		setTimeout(dojo.hitch(this, function()
		{
			if (this._opened)
			{
				this.inputNode.focus();
				this.inputNode.select();
			}
		}), 200);
	},

	focus: function(pos)
	{
		if (pos == "end")
		{
			var handled = false;
			if (!this.fontSizeUpDisabled)
			{
				this.fontSizeUpWrapper.focus();
				handled = true;
			}
			else if (!this.fontSizeDownDisabled)
			{
				this.fontSizeDownWrapper.focus();
				handled = true;
			}
			if (!handled)
				this.focusNode.focus();
		}
		else
			this.focusNode.focus();
	},

	_onUpArrowKeyDown: function(/* Event */evt)
	{
		// summary:
		// Handler for left arrow key when focus is on right part of button
		if (evt.keyCode == dojo.keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"])
		{
			dijit.focus(this.focusNode);
			dojo.stopEvent(evt);
		}
		if (evt.keyCode == dojo.keys.DOWN_ARROW)
		{
			if (!this.fontSizeDownDisabled)
			{
				this.fontSizeDownWrapper.focus();
				dojo.stopEvent(evt);
			}
		}
	},

	_onDownArrowKeyDown: function(/* Event */evt)
	{
		// summary:
		// Handler for left arrow key when focus is on right part of button
		if (evt.keyCode == dojo.keys[this.isLeftToRight() ? "LEFT_ARROW" : "RIGHT_ARROW"])
		{
			dijit.focus(this.titleNode);
			dojo.stopEvent(evt);
		}
		if (evt.keyCode == dojo.keys.UP_ARROW)
		{
			if (!this.fontSizeUpDisabled)
			{
				this.fontSizeUpWrapper.focus();
				dojo.stopEvent(evt);
			}
		}
	},

	checkStatus: function()
	{
		var v = this.attr("value");
		if (BidiUtils.isArabicLocale())
			v = BidiUtils.convertHindiToArabic(v + "");

		var value = parseFloat(v);

		var first = pres.utils.fontSizeUtil.getFirst();
		var last = pres.utils.fontSizeUtil.getLast();

		this.fontSizeUpDisabled = false;
		this.fontSizeDownDisabled = false;

		if (!value)
		{
			// may select multiple font size area.
			this.fontSizeUpDisabled = false;
			this.fontSizeDownDisabled = false;
		}
		else
		{
			if (value <= first)
				this.fontSizeDownDisabled = true;
			if (value >= last)
				this.fontSizeUpDisabled = true;
		}
		dojo.toggleClass(this.fontSizeUpWrapper, "dijitDisabled", this.fontSizeUpDisabled);
		dojo.toggleClass(this.fontSizeDownWrapper, "dijitDisabled", this.fontSizeDownDisabled);
	},

	_setValueAttr: function(v)
	{
		if (BidiUtils.isArabicLocale())
			v = BidiUtils.convertArabicToHindi(v + "");

		this.inherited(arguments);
		this.checkStatus();
	},

	_setLabelAttr: function(content)
	{
		if (BidiUtils.isArabicLocale())
			content = BidiUtils.convertArabicToHindi(content + "");

		this.inherited(arguments);
		this.containerNode.innerHTML = "";
		this.containerNode.value = content;
		this.checkStatus();
	},

	up: function()
	{
		if (this.fontSizeUpDisabled)
			return;
		if (this.disabled)
			return;

		dojo.publish("/command/exec", pres.constants.CMD_FONT_SIZE_INCREASE);
	},

	down: function()
	{
		if (this.fontSizeDownDisabled)
			return;
		if (this.disabled)
			return;

		dojo.publish("/command/exec", pres.constants.CMD_FONT_SIZE_DECREASE);
	},

	postCreate: function()
	{
		this.inherited(arguments);

		this.connect(this.fontSizeUpDown, "onmousedown", function(e)
		{
			dojo.stopEvent(e);
		});
		this.connect(this.fontSizeUpDown, "onclick", function(e)
		{
			dojo.stopEvent(e);
		});
		
		this.connect(this.fontSizeUpWrapper, "onkeydown", function(e)
		{
			if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE)
			{
				dojo.stopEvent(e);
				this.up();
			}
		});

		this.connect(this.fontSizeDownWrapper, "onkeydown", function(e)
		{
			if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE)
			{
				dojo.stopEvent(e);
				this.down();
			}
		});

		dijit.typematic.addMouseListener(this.fontSizeUpWrapper, this, function(count)
		{
			if (count >= 0)
			{
				this.fontSizeUpTip._onUnHover();
				this.up();
			}
		}, 0.9, 500);

		dijit.typematic.addMouseListener(this.fontSizeDownWrapper, this, function(count)
		{
			if (count >= 0)
			{
				this.fontSizeDownTip._onUnHover();
				this.down();
			}
		}, 0.9, 500);

		this.nls = dojo.i18n.getLocalization("concord.widgets", "toolbar");

		dojo.attr(this.fontSizeUpWrapper, {
			"aria-label": this.nls.increaseFontSizeTip,
			"role": "button"
		});

		dojo.attr(this.fontSizeDownWrapper, {
			"aria-label": this.nls.decreaseFontSizeTip,
			"role": "button"
		});

		this.fontSizeUpTip = new pres.widget.MenuTooltip({
			node: this.fontSizeUpWrapper,
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager
		});
		this.fontSizeUpTip.setTitleAck(this.nls.increaseFontSizeTip);

		this.fontSizeDownTip = new pres.widget.MenuTooltip({
			node: this.fontSizeDownWrapper,
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager
		});
		this.fontSizeDownTip.setTitleAck(this.nls.decreaseFontSizeTip);

		this.dropDown.autoFocus = false;

	}

});