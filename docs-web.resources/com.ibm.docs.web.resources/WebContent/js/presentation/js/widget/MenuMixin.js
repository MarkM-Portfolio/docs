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

dojo.provide("pres.widget.MenuMixin");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");
dojo.require("dijit.MenuBar");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.MenuItem");
dojo.require("dijit.PopupMenuItem");
dojo.require("dijit.MenuSeparator");
dojo.require("pres.utils.htmlHelper");
dojo.require("pres.widget.common.ColorPalette");
dojo.require("pres.widget.common.TableTemplatePalette");
dojo.require("pres.widget.common.TablePalette");
dojo.require("pres.widget.common.ShapePalette");
dojo.require("pres.widget.common.ListStyleBullet");
dojo.require("pres.widget.common.ListStyleNumber");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("pres", "pres");
dojo.require("pres.constants");

dojo.declare("pres.widget.MenuMixin", null, {
	model: null,

	rebuild: function()
	{
		this.attr("model", this.model);
	},

	_setModelAttr: function(m)
	{
		this.model = m;
		this.destroyDescendants();

		if (this._started)
			this.render();
	},

	_addMenuBarChild: function(item, parent, parentItem)
	{
		if(!BidiUtils.isBidiOn() && item.item.cmd == pres.constants.CMD_DIRECTION)
			return;

		var child = item.item;
		var isShow = true;
		if(dojo.hasClass(dojo.body(), "dijit_a11y")){
			if(child.showUnderHighContrast !== undefined)
			isShow = child.showUnderHighContrast;			
		}
		if(isShow == false)
			return;
		if(child.isShow === false)
			return;
		var attrs = {
			value: child.value,
			label: child.label,
			accelKey: child.accelKey ||"",
			decorator: child.decorator,
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			_setNameAttr: "domNode",
			dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
		};
		if (child.checked !== undefined)
			attrs.checked = child.checked;
		if (child.checkable !== undefined)
			attrs.checkable = child.checkable;
		if (child.disabled !== undefined)
			attrs.disabled = child.disabled;
		if (item.model && item.model.checked !== undefined)
			attrs.checked = item.model.checked;
		if (item.model && item.model.disabled !== undefined)
			attrs.disabled = item.model.disabled;
		
		var cmd = child.cmd || item.cmd;
		var variable = child.variable || item.variable;
		var widgetTag = child.tag || item.tag || cmd;
		
		attrs.name = widgetTag;
		
		var widget;
		var isSeparator = child.type == "separator";
		var p = parent;
		if (isSeparator)
		{
			widget = new dijit.MenuSeparator({
				ownerDocument: this.ownerDocument,
				_focusManager: this._focusManager
			});
		}
		else
		{
			var hasChildren = item.children && item.children.length > 0;
			var hasCheck = attrs.checked !== undefined && attrs.checkable !== false;
			var clazz = dojo.getObject(hasChildren || child.popup ? "dijit.PopupMenuItem" : hasCheck ? "dijit.CheckedMenuItem"
				: "dijit.MenuItem");
			widget = new clazz(attrs);

			if (hasChildren)
			{
				var menu = new dijit.Menu({
					ownerDocument: this.ownerDocument,
					_focusManager: this._focusManager,
					dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
				});
				widget.set("popup", menu);
				dojo.forEach(item.children, dojo.hitch(this, function(c)
				{
					this._addMenuBarChild(c, menu, child);
				}));
			}
			else
			{
				var cmd = child.cmd || item.cmd;
				var useParent = false;

				if (!cmd && parentItem)
				{
					cmd = parentItem.cmd;
					useParent = true;
				}
				if (cmd)
				{
					this.connect(widget.domNode, "onmousedown", function(e)
					{
						// not sure why, but chrome sometimes need this
						dojo.stopEvent(e);
					});
					this.connect(widget, "onClick", function()
					{
						if (useParent && hasCheck)
						{
							var all = widget.getParent().getChildren();
							dojo.forEach(all, function(menuItem)
							{
								if (menuItem != widget)
									menuItem.attr("checked", false);
								else
									menuItem.attr("checked", true);	
								if (menuItem.attr("value") === pres.constants.LINESPACE_CUSTOM_OPTION)
									menuItem.attr("checked", false);								
							});
						}
						this._onContainerFocus();
						var value = useParent ? widget.attr("value") : widget.attr("checked");
						if (!useParent && widget.attr("checkable") === false)
							value = true;
						dojo.publish("/command/exec", [cmd, value]);
					});
				}
				if (child.decorator)
				{
					child.decorator(widget, 0, child.label);
				}
				if (child.popup)
				{
					var dropDown = null;

					if (dojo.isString(child.popup))
					{
						var childPopupAttrs = {
							ownerDocument: this.ownerDocument,
							_focusManager: this._focusManager,
							_setNameAttr: "domNode",
							name: attrs.name + "_popup"
						};
						if (child.popup == "table")
						{
							dojo.mixin(childPopupAttrs, {
								onChange: function()
								{
									dojo.publish("/command/exec", [cmd, this.getValue()]);
								}
							});
							dropDown = new pres.widget.common.TablePalette(childPopupAttrs);
						}
						else if (child.popup == "recent")
						{
							dropDown = pe.scene.getRecentFilesMenu(this.ownerDocument, this._focusManager);
						}
						else if (child.popup == "download")
						{
							dropDown = pe.scene.getDownloadMenu(this.ownerDocument, this._focusManager);
						}							
						else if (child.popup == "tableTemplate")
						{
							dojo.mixin(childPopupAttrs, {
								onChange: function()
								{
									dojo.publish("/command/exec", [cmd, this.getValue()]);
								}
							});
							dropDown = new pres.widget.common.TableTemplatePalette(childPopupAttrs);
						}
						else if (child.popup == "shape")
						{
							dojo.mixin(childPopupAttrs, {
								cmd: cmd
							});
							dropDown = new pres.widget.common.ShapePalette(childPopupAttrs);
						}
						else if (child.popup == "color")
						{
							dojo.mixin(childPopupAttrs, {
								onChange: function()
								{
									dojo.publish("/command/exec", [cmd, this.getValue()]);
								}
							});
							dropDown = new pres.widget.common.ColorPalette(childPopupAttrs);
						}
						else if (child.popup == "bullet")
						{
							dojo.mixin(childPopupAttrs, {
								onChange: function()
								{
									dojo.publish("/command/exec", [cmd, this.getValue()]);
								}
							});
							dropDown = new pres.widget.common.ListStyleBullet(childPopupAttrs);
						}
						else if (child.popup == "number")
						{
							dojo.mixin(childPopupAttrs, {
								onChange: function()
								{
									dojo.publish("/command/exec", [cmd, this.getValue()]);
								}
							});
							dropDown = new pres.widget.common.ListStyleNumber(childPopupAttrs);
						}
					}
					else
					{
						dropDown = child.popup;
					}

					widget.set("popup", dropDown);
				}
			}
		}
		p.addChild(widget);
		if (variable)
			pe[variable] = widget;

		if (item.model)
		{
			item.model.watch("disabled", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (!widget._destroyed)
						widget.set("disabled", value);
				}
			});
			item.model.watch("label", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (!widget._destroyed)
						widget.set("label", value);
				}
			});
			item.model.watch("value", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (!widget._destroyed)
					{
						if (widget.popup)
						{
							if (widget.name != pres.constants.CMD_LINESPACING)
							{
								var children = widget.popup.getChildren();
								if (children && children.length)
								{
									dojo.forEach (children, function (child)
									{
										child.set("checked", false);
										if (child.label.toLowerCase() == value.toLowerCase())
											child.set("checked", true);
									});
								}
								else if (widget.popup.setValue)
								{
									widget.popup.setValue(value);
								}
							}
							else
							{
								var presStrs = dojo.i18n.getLocalization("pres", "pres");
								var children = widget.popup.getChildren();
								if (children && children.length)
								{									
									if (value === "1" || value === "2" || value === "1.5" || value === "1.15" || value === "2.5" || value === "3" || value === "" || value === undefined || value === null)
									{
										dojo.forEach(children, function(child)
										{
											var label = child.label;
											if (BidiUtils.isArabicLocale())
												label = BidiUtils.convertHindiToArabic(label + "");

											child.set("checked", false);
											if (child.label.toLowerCase() == value.toLowerCase())
												child.set("checked", true);	
											if (isNaN(parseFloat(label)))
											{
												child.set("label",presStrs.formatMenu_LineSpacing_Customize);//presStrs
											}
										});
									}else
									{
										dojo.forEach(children, function(child)
										{
											child.set("checked", false);
											var label = child.label;
											if (BidiUtils.isArabicLocale())
												label = BidiUtils.convertHindiToArabic(label + "");

											if (isNaN(parseFloat(label)))
											{	
												var v = value;
												if (BidiUtils.isArabicLocale())
													v = BidiUtils.convertArabicToHindi(v + "");

												var newMenuItem = dojo.string.substitute(presStrs.formatMenu_LineSpacing_CustomValue, [v]);	
												child.set("label",newMenuItem);
												child.set("checked",true);
											}
										});
									}
								}
							}
						}
					}
				}
			});
			
			item.model.watch("checked", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (!widget._destroyed)
						widget.set("checked", value);
				}
			});
		}
		
    if (child.tooltip)
    {
      if(BidiUtils.isGuiRtl() && child.tooltip.pos == 'after')
      	child.tooltip.pos = 'before';

      widget.tooltip = new pres.widget.MenuTooltip({
        widget: widget,
        ownerDocument: this.ownerDocument,
        _focusManager: this._focusManager,
        position: [child.tooltip.pos]
      });
      widget.connect(widget, "uninitialize", function()
      {
        this.tooltip && this.tooltip.destroy();
      });
      widget.tooltip.setTitleAck(child.tooltip.tip, "");
    }
    
		return widget;
	},

	_addMenuBarItem: function(item)
	{
		var child = item.item;
		var isShow = true;
		if(dojo.hasClass(dojo.body(), "dijit_a11y")){
			if(child.showUnderHighContrast !== undefined)
			isShow = child.showUnderHighContrast;			
		}
		if(isShow == false)
			return;
		var attrs = {
			value: child.value,
			label: child.label,
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			_setNameAttr: "domNode",
			dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
		};
		if (child.checked !== undefined)
			attrs.checked = child.checked;
		if (child.checkable !== undefined)
			attrs.checkable = child.checkable;
		if (item.model && item.model.checked !== undefined)
			attrs.checked = item.model.checked;
		if (item.model && item.model.disabled !== undefined)
			attrs.disabled = item.model.disabled;

		var cmd = child.cmd || item.cmd;
		var variable = child.variable || item.variable; 
		var widgetTag = child.tag || item.tag || cmd;
		
		if (widgetTag)
			attrs.name = widgetTag;
		
		var widget;
		var isSeparator = child.type == "separator";
		var p = this;

		if (isSeparator)
		{
			widget = new dijit.MenuSeparator({
				ownerDocument: this.ownerDocument,
				_focusManager: this._focusManager
			});
		}
		else
		{
			var hasChildren = item.children && item.children.length > 0;
			var popupClazz = this._isMenuBar ? "dijit.PopupMenuBarItem" : "dijit.PopupMenuItem";
			var normalClazz = this._isMenuBar ? "dijit.MenuBarItem" : "dijit.MenuItem";
			var clazz = dojo.getObject(hasChildren || child.popup ? popupClazz : normalClazz);
			var cmd = child.cmd || item.cmd || "";
			widget = new clazz(attrs);

			if (child.popup)
			{
				var dropDown = null;
				if (dojo.isString(child.popup))
				{
					var childPopupAttrs = {
						ownerDocument: this.ownerDocument,
						_focusManager: this._focusManager,
						_setNameAttr: "domNode",
						name: attrs.name + "_popup"
					};
					if (child.popup == "table")
					{
						dojo.mixin(childPopupAttrs, {
							onChange: function()
							{
								dojo.publish("/command/exec", [cmd, this.getValue()]);
							}
						});
						dropDown = new pres.widget.common.TablePalette(childPopupAttrs);
					}
					else if (child.popup == "tableTemplate")
					{
						dojo.mixin(childPopupAttrs, {
							onChange: function()
							{
								dojo.publish("/command/exec", [cmd, this.getValue()]);
							}
						});
						dropDown = new pres.widget.common.TableTemplatePalette(childPopupAttrs);
					}
					else if (child.popup == "shape")
					{
						dojo.mixin(childPopupAttrs, {
							cmd: cmd
						});
						dropDown = new pres.widget.common.ShapePalette(childPopupAttrs);
					}
					else if (child.popup == "color")
					{
						dojo.mixin(childPopupAttrs, {
							onChange: function()
							{
								dojo.publish("/command/exec", [cmd, this.getValue()]);
							}
						});
						dropDown = new pres.widget.common.ColorPalette(childPopupAttrs);
					}
					else if (child.popup == "bullet")
					{
						dojo.mixin(childPopupAttrs, {
							onChange: function()
							{
								dojo.publish("/command/exec", [cmd, this.getValue()]);
							}
						});
						dropDown = new pres.widget.common.ListStyleBullet(childPopupAttrs);
					}
					else if (child.popup == "number")
					{
						dojo.mixin(childPopupAttrs, {
							onChange: function()
							{
								dojo.publish("/command/exec", [cmd, this.getValue()]);
							}
						});
						dropDown = new pres.widget.common.ListStyleNumber(childPopupAttrs);
					}
				}
				else
				{
					dropDown = child.popup;
				}

				widget.set("popup", dropDown);

			}
			else if (hasChildren)
			{
				var menu = new dijit.Menu({
					ownerDocument: this.ownerDocument,
					_focusManager: this._focusManager,
					_setNameAttr: "domNode",
					name: attrs.name + "_popup",
					dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
				});
				widget.set("popup", menu);
				if (this._isMenuBar)
				{
					this.connect(menu, "onOpen", function()
					{
						dojo.publish("/header/dropdown/open", []);
					});

					this.connect(menu, "onClose", function()
					{
						setTimeout(dojo.hitch(this, function()
						{
							var popups = dojo.query(".dijitPopup", this.ownerDocument.body);
							if (dojo.every(popups, function(p)
							{
								return p.style.display == "none";
							}))
							{
								dojo.publish("/header/dropdown/close", []);
							}
						}), 500);
					});
				}
				dojo.forEach(item.children, dojo.hitch(this, function(c)
				{
					this._addMenuBarChild(c, menu, child);
				}));
			}
			else if (cmd)
			{
				this.connect(widget.domNode, "onmousedown", function(e)
				{
					// not sure why, but chrome sometimes need this
					dojo.stopEvent(e);
				});
				this.connect(widget, "onClick", function()
				{
					var value = widget.attr("checked");
					if (widget.attr("checkable") === false)
						value = true;
					dojo.publish("/command/exec", [cmd, value]);
				});
			}
		}
		p.addChild(widget);
		if (variable)
			pe[variable] = widget;
		if (item.model)
		{
			item.model.watch("disabled", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (!widget._destroyed)
						widget.set("disabled", value);
				}
			});
			item.model.watch("label", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (!widget._destroyed)
						widget.set("label", value);
				}
			});
			item.model.watch("checked", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (!widget._destroyed)
						widget.set("checked", value);
				}
			});
			if (widget.popup)
			{
				item.model.watch("value", function(name, oldValue, value)
				{
					if (oldValue != value)
					{
						if (oldValue == undefined && value == false)
							return;
						if (!widget._destroyed)
						{
							var children = widget.popup.getChildren();
							if (children && children.length)
							{
								dojo.forEach(children, function(child)
								{
									child.set("checked", false);
									if (child.label.toLowerCase() == value.toLowerCase())
										child.set("checked", true);
								});
							}
							else if (widget.popup.setValue)
							{
								widget.popup.setValue(value);
							}
						}
					}
				});
			}
		}
	},

	_onContainerFocus: function(evt)
	{
		if ((evt && evt.target !== this.domNode) || this.focusedChild)
		{
			return;
		}
		this.focus();
	},

	_onBlur: function()
	{
		this.inherited(arguments);
		this._cleanUp(true);
	},

	render: function()
	{
		if (!this.model)
			return;
		var items = this.model.getItems();
		var len = items.length;
		dojo.forEach(this.model.getItems(), dojo.hitch(this, function(item, index)
		{
			this._addMenuBarItem(item);
		}));
	},

	startup: function()
	{
		if (this._started)
			return;
		this.inherited(arguments);
		this.render();
	}
});
