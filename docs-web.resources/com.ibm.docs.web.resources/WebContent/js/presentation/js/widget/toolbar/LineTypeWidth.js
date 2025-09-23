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

dojo.provide("pres.widget.toolbar.LineTypeWidth");

dojo.require("pres.utils.lineWidthUtil");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.requireLocalization("pres", "pres");

dojo.declare("pres.widget.toolbar.LineTypeWidth", [dijit.form.DropDownButton, pres.widget.toolbar.ButtonMixin], {

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
		var v = parseInt(this.inputNode.value);
		if (!v || v <= 0)
			return
		if (v != this.attr("value"))
		{
			this.set("value", v);
		}
	},

	_onInputKeyDown: function(evt)
	{
		var keyCode = evt.keyCode;
		var keys = dojo.keys;

		if (keyCode == keys.RIGHT_ARROW || keyCode == keys.LEFT_ARROW)
		{
			evt.stopPropagation();
		}
		else if (keyCode == keys.DOWN_ARROW || keyCode == keys.UP_ARROW)
		{
			var v = parseFloat(this.inputNode.value);
			if (!v || v <= 0)
				v = 0;
			evt.stopPropagation();
			if (keyCode == keys.DOWN_ARROW)
			{
				var fontSize = pres.utils.lineWidthUtil.getNext(v, true);
				if (fontSize == v)
					fontSize = pres.utils.lineWidthUtil.getFirst(true);
				if (fontSize != v)
					this.set("value", fontSize);
				
				setTimeout(dojo.hitch(this, function()
				{
					this.inputNode.select();
				}), 0);
			}
			if (keyCode == keys.UP_ARROW)
			{
				var fontSize = pres.utils.lineWidthUtil.getPrev(v, true);
				if (fontSize == v)
					fontSize = pres.utils.lineWidthUtil.getLast(true);
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
			var v = parseFloat(this.inputNode.value);
			if (isNaN(v))
				return;
			var first = pres.utils.lineWidthUtil.getFirst();
			var last = pres.utils.lineWidthUtil.getLast();

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

	openDropDown: function()
	{
		dojo.removeClass(this.domNode, "lineTypeBtnFocus");	
		if (this.dropDown && !this.dropDown.onOpenConnected)
		{
			this.dropDown.onOpenConnected = true;
			dojo.connect(this.dropDown, "onOpen", this, function()
			{
				var dom = this.dropDown._popupWrapper;
				if (dom)
				{
					if (!dojo.hasClass(dom, "toolbarPopup"))
						dojo.addClass(dom, "toolbarPopup");
					var t = dojo.style(dom, "top") ;
					var banner = dojo.byId("banner");
					t = t + dojo.contentBox(banner).h;
					dojo.style(dom, "top", t + "px");
				}
				this.dropDown.focusChild = function(){};
				this.dropDownOpened();
			});
		}
		this.inherited(arguments);
		
		var me = this;
		dojo.isIE && this.dropDown.domNode.parentNode.addEventListener("scroll", function(evt){
			pe.panelScrolling = true;
			pe.linePanelHasTimer && clearTimeout(pe.linePanelHasTimer);
			pe.linePanelHasTimer = setTimeout(dojo.hitch(this, function(){ me.focus();}),10);
		});
	},
	
	closeDropDown: function()
	{
		if(pe.panelScrolling)
		{
			pe.panelScrolling = false; 
			return;
		}
		else
		{
			this.inherited(arguments);
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
		var v = this.attr("value");
		var setted = false;
		if (v !== this._origValue)
		{
			var first = pres.utils.lineWidthUtil.getFirst();
			var last = pres.utils.lineWidthUtil.getLast();
			
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
		pe.scene.slideEditor.borderStylePanelShow = false;
	},
	
	dropDownOpened: function()
	{
		//tab focus on lineweight button, arrow_down focus on first child node, equal to focus lineweight dropdown,
		// then focus on inputNode , will cause lineweight dropdown's onBlur, call restoreIframe.
		this._origValue = parseInt(this.inputNode.value) || 0;
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
		var value = parseFloat(this.attr("value"));
		var first = pres.utils.lineWidthUtil.getFirst();
		var last = pres.utils.lineWidthUtil.getLast();

		this.fontSizeUpDisabled = false;
		this.fontSizeDownDisabled = false;

		if (!value)
		{
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

	_setDisabledAttr: function(d)
	{
		this.inherited(arguments);
		this.checkStatus();

		this.disabled = d;
		if(d)
			dojo.addClass(this.domNode,'opacityPanelcover');
		else
			dojo.removeClass(this.domNode,'opacityPanelcover');
	},

	_setLabelAttr: function(content)
	{
		this.inherited(arguments);
		this.containerNode.innerHTML = "";
		this.containerNode.value = content;
		this.checkStatus();
	},
	
	createDropDown: function()
	{
		var menu = new dijit.Menu({
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			id: this.id + "_popup",
			dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
		});
		dojo.addClass(menu.domNode, "lotusActionMenu toolbarMenu");
		var _mItem = null;
		var me = this;
		if (this.items)
		{
			for ( var i = 0; i < this.items.length; ++i)
			{
				var label = this.items[i] + "";
				var clazz = dojo.getObject(this.checkable ? "dijit.CheckedMenuItem" : "dijit.MenuItem");
				var click = function()
				{
					menu.getChildren().forEach(function(t)
					{
						t.set("checked", false);
						t.set("selected", false);
					});
					this.set("checked", true);
					me.set("label", this.label);
					menu.selectedChild = this;
					me.handler();
				};
				menu.addChild(_mItem = new clazz({
					label: label,
					ownerDocument: this.ownerDocument,
					_focusManager: this._focusManager,
					onMouseDown: function()
					{
						pe.scene.slideEditor.borderStylePanelShow = true;
						click.apply(this, arguments);
						me.inputNode.blur();
					},
					dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
				}));
				if (this.decorator)
					this.decorator(_mItem, i, label);
				dijit.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
			}
		}
		dojo.connect(menu, "onClose", this, function()
		{
			this.dropDownClosed();
		});
		return menu;
	},
	
	up: function()
	{
		if (this.fontSizeUpDisabled)
			return;
		if (this.disabled)
			return;
		var nextvalue = pres.utils.lineWidthUtil.getNextValue(this.inputNode.value, false, true);
		this._setValueAttr(nextvalue);
		dojo.publish("/command/exec", [pres.constants.CMD_LINE_WIDTH, nextvalue]);
	},

	down : function()
	{
		if (this.fontSizeDownDisabled)
			return;
		if (this.disabled)
			return;
		var nextvalue = pres.utils.lineWidthUtil.getNextValue(this.inputNode.value, false, false);
		this._setValueAttr(nextvalue);
		dojo.publish("/command/exec", [pres.constants.CMD_LINE_WIDTH, nextvalue]);
	},

	startup: function()
	{
		if (this._started)
			return;
		this.inherited(arguments);
		this.set("label", "");
	},

	_getValueAttr: function()
	{
		return this.label;
	},

	_setValueAttr: function(value)
	{
		this.set("label", value);
		if (this.dropDown)
		{
			dojo.forEach(this.dropDown.getChildren(), (function(item)
			{
				if (item.label == value)
				{
					item.set("checked", true);
					item.set("selected", true);
				}
				else
				{
					item.set("checked", false);
					item.set("selected", false);
				}
			}));
		}
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		this.dropDown = this.createDropDown();

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

		//change increace lineweight tooltip
		var nlsStr = dojo.i18n.getLocalization("pres", "pres");
		dojo.attr(this.fontSizeUpWrapper, {
			"title": nlsStr.increaseLineWidthTip,
			"role": "button"
		});
		dojo.attr(this.fontSizeDownWrapper, {
			"title": nlsStr.decreaseLineWidthTip,
			"role": "button"
		});
		this.fontSizeUpTip = new pres.widget.MenuTooltip({
			node: this.fontSizeUpWrapper,
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager
		});
		this.fontSizeDownTip = new pres.widget.MenuTooltip({
			node: this.fontSizeDownWrapper,
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager
		});
		this.dropDown.autoFocus = false;
	}	
});