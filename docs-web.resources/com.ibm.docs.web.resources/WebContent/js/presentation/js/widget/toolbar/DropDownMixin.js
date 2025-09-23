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

dojo.provide("pres.widget.toolbar.DropDownMixin");
dojo.require("dijit.Menu");
dojo.require("dijit.CheckedMenuItem");
dojo.require("concord.util.BidiUtils");

dojo.declare("pres.widget.toolbar.DropDownMixin", [], {

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
					onClick: function()
					{
						click.apply(this, arguments);
					},
					dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
				}));
				if (this.decorator)
					this.decorator(_mItem, i, label);
				dijit.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
			}
		}
		else if (this.children)
		{
			for ( var i = 0; i < this.children.length; ++i)
			{
				var c = this.children[i];
				var label = c.label;
				var iconClass = "dijitNoIcon";
				if (c.icon)
					iconClass = "dijitToolbarIcon " + c.icon;
				else
					iconClass = "dijitNoIcon";
				var _mItem = new dijit.MenuItem({
					label: label,
					iconClass: iconClass,
					cmd: c.cmd,
					ownerDocument: this.ownerDocument,
					_focusManager: this._focusManager,
					onClick: function()
					{
						if (this.disabled)
							return;
						if (this.cmd)
						{
							dojo.publish("/command/exec", [this.cmd]);
						}
					},
					dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
				});
				menu.addChild(_mItem);
				dijit.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
				if (c.cmd)
				{
					var commandsModel = pe.scene.hub.commandsModel;
					var model = commandsModel.getModel(c.cmd);
					if (model)
					{
						model.watch("disabled", dojo.hitch(_mItem, function(name, oldValue, value)
						{
							if (oldValue != value)
							{
								if (oldValue == undefined && value == false)
									return;
								if (!this._destroyed)
									this.set("disabled", value);
							}
						}));
					}
				}
			}
		}

		dojo.connect(menu, "onClose", this, function()
		{
			this.dropDownClosed();
		});

		return menu;
	},
	
	dropDownClosed: function()
	{
	},

	dropDownOpened: function()
	{
	},

	closeDropDown: function()
	{
		this.inherited(arguments);
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

		if(this.dropDown.lineTypePanel)
		{
			dojo.removeClass(this.dropDown.lineTypePanel.lineWidthButton.domNode, "lineTypeBtnFocus");
			dojo.removeClass(this.dropDown.lineTypePanel.endpointsButton.domNode, "lineTypeBtnFocus");
			dojo.removeClass(this.dropDown.lineTypePanel.dashTypeButton.domNode, "lineTypeBtnFocus");
		}
	},

	openDropDown: function()
	{
		if (this.dropDown && !this.dropDown.onOpenConnected)
		{
			this.dropDown.onOpenConnected = true;
			// better ux, make the top border of dropdown overlap the bottom
			// border of dropdown button.
			dojo.connect(this.dropDown, "onOpen", this, function()
			{
				var dom = this.dropDown._popupWrapper;
				if (dom)
				{
					if (!dojo.hasClass(dom, "toolbarPopup"))
						dojo.addClass(dom, "toolbarPopup");
					var t = dojo.style(dom, "top");
					dojo.style(dom, "top", t - 1 + "px");
				}

				var children = this.dropDown.getChildren();
				if (children && this.dropDown.autoFocus)
				{
					for ( var i = 0; i < children.length; i++)
					{
						var child = children[i];
						if (child.checked)
						{
							var fn = this.dropDown.focusChild;
							this.dropDown.focusChild = function()
							{
							};
							setTimeout(dojo.hitch(this, function()
							{
								fn(child);
								this.dropDown.selectedChild = child;
								this.dropDown.focusChild = fn;
							}), 100);
							break;
						}
					}
				}
				this.dropDownOpened();
			});
		}

		dojo.publish("/header/dropdown/open", []);
		this.inherited(arguments);
	}
});