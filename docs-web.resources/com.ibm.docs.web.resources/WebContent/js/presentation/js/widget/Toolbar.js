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

dojo.provide("pres.widget.Toolbar");

dojo.require("dojo.Stateful");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");
dojo.require("dijit.Toolbar");
dojo.require("dijit.ToolbarSeparator");
dojo.require("pres.widget.toolbar.Button");
dojo.require("pres.widget.toolbar.DropDownButton");
dojo.require("pres.widget.toolbar.DropDownComboButton");
dojo.require("pres.widget.toolbar.FontSize");
dojo.require("pres.widget.toolbar.ToggleButton");
dojo.require("pres.widget.toolbar.ColorPicker");
dojo.require("pres.widget.toolbar.ZoomPicker");
dojo.require("pres.widget.toolbar.TablePicker");
dojo.require("pres.widget.toolbar.ShapePicker");
dojo.require("pres.widget.toolbar.ListStyleBulletPicker");
dojo.require("pres.widget.toolbar.ListStyleNumberPicker");
dojo.require("pres.widget.MenuTooltip");
dojo.require("concord.util.BidiUtils");
dojo.declare("pres.widget.Toolbar", [dijit.Toolbar], {

	model: null,
	
	_onContainerKeypress: function()
	{
		
	},
	
	_keyboardSearchCompare: function()
	{
		
	},
	
	_keyboardSearch: function()
	{
		
	},

	_setModelAttr: function(m)
	{
		this.model = m;
		if (this._started)
			this.render();
	},

	_addToolbarChild: function(item)
	{
		var child = item.item;
		var isShow = true;
		if(dojo.hasClass(dojo.body(), "dijit_a11y")){
			if(child.showUnderHighContrast !== undefined)
			isShow = child.showUnderHighContrast;			
		}
		if(isShow == false)
			return;
		
		var type = child.type;
		var isButton = !type || type == "button";
		var attr = {
			id: "toolbar_" + (child.cmd || new Date().valueOf())
		};

		dojo.safeMixin(attr, child);

		if (item.model && item.model.checked !== undefined)
			attr.checked = item.model.checked;
		if (item.model && item.model.disabled !== undefined)
			attr.disabled = item.model.disabled;

		delete attr.type;

		if (child.icon)
			attr.iconClass = "dijitToolbarIcon " + child.icon;
		else
			attr.iconClass = "dijitNoIcon";

		attr = JSON.parse(JSON.stringify(attr));
		attr.ownerDocument = this.ownerDocument;
		attr._focusManager = this._focusManager;
		attr.decorator = child.decorator;
		attr.cmd = child.cmd;
		attr.handler = function(e)
		{
			if (this.disabled)
				return;

			if (!this.getValue)
				dojo.publish("/command/exec", [child.cmd]);
			else
				dojo.publish("/command/exec", [child.cmd, this.getValue()]);
		};
		if (attr.label)
			attr.title = attr.label;

		// remove functions from mixin.
		var updateTitle = false;
		var widget;
		attr.dir = BidiUtils.isGuiRtl() ? 'rtl' : '';
		if (isButton)
		{
			attr.showLabel = false;
			attr.onClick = attr.handler;
			widget = new pres.widget.toolbar.Button(attr);
		}
		else
		{
			if (type == "dropdown")
			{
				if(!BidiUtils.isBidiOn() && item.item.cmd == pres.constants.CMD_DIRECTION)
					return;
				widget = new pres.widget.toolbar.DropDownButton(attr);
			}
			else if (type == "fontsize")
			{
				widget = new pres.widget.toolbar.FontSize(attr);
			}
			else if (type == "zoom")
			{
				widget = new pres.widget.toolbar.ZoomPicker(attr);
			}
			else if (type == "toggle")
			{
				attr.showLabel = false;
				attr.onClick = attr.handler;
				widget = new pres.widget.toolbar.ToggleButton(attr);
			}
			else if (type == "combo")
			{
				attr.showLabel = false;
				attr.onClick = attr.handler;
				widget = new pres.widget.toolbar.DropDownComboButton(attr);
			}
			else if (type == "color")
			{
				attr.showLabel = false;
				widget = new pres.widget.toolbar.ColorPicker(attr);
			}
			else if (type == "table")
			{
				updateTitle = true;
				attr.showLabel = false;
				widget = new pres.widget.toolbar.TablePicker(attr);
			}
			else if (type == "shape")
			{
				updateTitle = true;
				attr.showLabel = false;
				widget = new pres.widget.toolbar.ShapePicker(attr);
			}
			else if (type == "bullet")
			{
				attr.showLabel = false;
				widget = new pres.widget.toolbar.ListStyleBulletPicker(attr);
			}
			else if (type == "number")
			{
				attr.showLabel = false;
				widget = new pres.widget.toolbar.ListStyleNumberPicker(attr);
			}
			else
			{
				var clazz = dojo.getObject(type, true);
				widget = new clazz(attr);
			}
			if (widget.titleNode)
			{
				dijit.removeWaiState(widget.titleNode, "labelledby");
				dijit.setWaiState(widget.titleNode, "label", widget.title);
			}
			if (widget.focusNode)
			{
				dijit.removeWaiState(widget.focusNode, "labelledby");
				dijit.setWaiState(widget.focusNode, "label", widget.title);
			}
			if (widget.containerNode)
				widget.containerNode.innerHTML = widget.title;
		}
		this.connect(widget, "onClick", function(e)
		{
			this.focusChild(widget);
		});
		
		if (child.cmd == "formatpainter") {
			this.connect(widget, "onDblClick", function(e)
			{
				dojo.publish("/command/exec", [child.cmd, "onDblClick"]);
			});
		}
		
		this.addChild(widget);
		
		if (updateTitle && widget.containerNode)
			widget.containerNode.innerHTML = widget.title;
		
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
			item.model.watch("checked", function(name, oldValue, value)
			{
				if (!widget._destroyed && widget.attr("checked") != value)
					widget.set("checked", value);
			});
			item.model.watch("value", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (!widget._destroyed)
						widget.set("value", value);
				}
			});
			item.model.watch("icon", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (widget._destroyed)
						return;
					var iconClass = "dijitNoIcon";
					if (value)
						iconClass = "dijitToolbarIcon " + value;
					widget.set("iconClass", iconClass);
				}
			});
			item.model.watch("label", function(name, oldValue, value)
			{
				if (oldValue != value)
				{
					if (oldValue == undefined && value == false)
						return;
					if (!widget._destroyed)
					{
						widget.set("title", value);
						dijit.setWaiState(widget.titleNode, "label", value);
						dijit.setWaiState(widget.focusNode, "label", value);						
					}
				}
			});
			if (type == "color")
			{
				item.model.watch("forNoFill", function(name, oldValue, value)
				{
					if (oldValue != value)
					{
						if (oldValue == undefined && value == false)
							return;
						if (widget._destroyed)
							return;
						widget.set("forNoFill", value);
					}
				});
			}
		}
	},

	render: function(mode)
	{
		if (!this.model)
			return;
		var items = this.model.getItems();
		var len = items.length;
		dojo.forEach(this.model.getItems(), dojo.hitch(this, function(item, index)
		{
			if (!item.item.mode) 
				item.item.mode = pres.constants.ToolbarMode.ALL;
			if (item.item.type == "group")
			{
				if (item.item.mode & mode) {
					dojo.forEach(item.children, dojo.hitch(this, function(child)
						{
						    if (!child.item.mode) 
						    	child.item.mode = pres.constants.ToolbarMode.ALL;
							if (child.item.mode & mode)
								this._addToolbarChild(child);
						}));
					if (index != len - 1)
							this.addChild(new dijit.ToolbarSeparator());
				}				
			}
			else
			{ 
				if (item.item.mode & mode)
					this._addToolbarChild(item);
			}
		}));

		if(BidiUtils.isBidiOn() && BidiUtils.isGuiRtl())
			dojo.place(dijit.byId('toolbar_outdent').domNode, dijit.byId('toolbar_indent').domNode, "before");

		dojo.forEach(this.getChildren(), function(w)
		{
			dojo.connect(w, "focus", function()
			{
				// #30610
				var tb = dijit.getEnclosingWidget(this.domNode.parentNode);
				if (tb)
					tb._set("focusedChild", this);
			});
			if (w && w.titleNode)
			{
				var title = w.titleNode.title;
				if (title)
				{
					w.tooltip = new pres.widget.MenuTooltip({
						widget: w,
						ownerDocument: this.ownerDocument,
						_focusManager: this._focusManager
					});
					w.connect(w, "uninitialize", function()
					{
						this.tooltip && this.tooltip.destroy();
					});
					w._setTitleAttr = function(/* Boolean */value)
					{
						this._set("title", value);
					}, w.tooltip.setTitleAck(title, w.accelKey);
					w.titleNode.title = "";
					w.title = "";
					w.watch("title", function(name, oldValue, value)
					{
						if (this.tooltip && value)
						{
							this.tooltip.setTitleAck(value, this.accelKey);
						}
						setTimeout(dojo.hitch(this, function()
						{
							this.titleNode.title = "";
						}), 10);
					});
				}
			}
		});
	},

	startup: function(mode)
	{
		if (this._started)
			return;
		this.inherited(arguments);
		this.render(mode);
		this.domNode.style.outline = "none";
	}

});
