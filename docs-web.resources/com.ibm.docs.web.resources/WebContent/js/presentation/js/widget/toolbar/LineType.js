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

dojo.provide("pres.widget.toolbar.LineType");
dojo.require("pres.widget.toolbar.DropDownButton");
dojo.require("dijit.form.DropDownButton");
dojo.requireLocalization("pres", "pres");

dojo.declare("pres.widget.toolbar.LineType", [dijit.form.DropDownButton], {

	createDropDown :function()
	{	
		var menu = new dijit.Menu({
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			isDash: this.isDash,
			id: this.id + "_popup",
			dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
		});
		dojo.addClass(menu.domNode, "lotusActionMenu toolbarMenu");
		var _mItem = null;
		var me = this;
		if (this.children)
		{
			for ( var i = 0; i < this.children.length; ++i)
			{
				var c = this.children[i];
				var value = c.value || c.icon;
				var iconClass = "dijitToolbarIcon " + c.icon;
				//var label = c.label;
				var _mItem = new dijit.MenuItem({
					iconClass: iconClass,
					value: value,
					cmd: me.cmd,
					title:c.label,
					ownerDocument: this.ownerDocument,
					_focusManager: this._focusManager,
					onMouseDown: function()
					{
						pe.scene.slideEditor.borderStylePanelShow = true;
						if (this.disabled)
							return;
						if (this.cmd && this.value)
						{
							me.value = me.valueNode.value = this.value;
							me.selectNode(pres.utils.lineWidthUtil.getTypeValueFromDash(me.value));
							me.focusChild = this;//execute command when closeDropdown: this.handler().
						}
					},
					dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
				});

				var nls = dojo.i18n.getLocalization("pres", "pres");
				if(iconClass == "dijitToolbarIcon head_none-tail_none")
					_mItem.iconNode.innerHTML = nls.line_endpoints_type1;

				menu.addChild(_mItem);
				dijit.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
			}
		}
		dojo.connect(menu, "onClose", this, function()
		{
			this.dropDownClosed();
		});
		return menu;
	},

	_getValueAttr: function()
	{
		return this.value;
	},

	//round cap and flat cap have different dasharray. 
	calcDashStyle: function(dashArray, flag)
	{
		var commandsModel = pe.scene.hub.commandsModel;
		var returnStrs = "none";
		var line_cap_value = pe.scene.hub.commandsModel.getModel(pres.constants.CMD_LINE_CAP).value;
		if(line_cap_value == pres.constants.LINE_CAP_ROUND || line_cap_value == pres.constants.LINE_CAP_SQUARE)
			var adjustFlag = true;
		if(!adjustFlag)
		{
			switch (dashArray.length)
			{
				case 2:
					if(flag > 0.8)
						returnStrs = "sysDot";
					else if(flag > 0.7)
						returnStrs = "dash";
					else if(flag > 0.35)
						returnStrs =  "lgDash";
					else 
						returnStrs = "sysDash";
					break;
				case 4:
					if(flag > 0.5)
						returnStrs = "dashDot";
					else
						returnStrs =  "lgDashDot";//_8, 3, 1, 3";
					break;
				case 6:
					returnStrs = "lgDashDotDot";//8, 3, 1, 3, 1, 3";
					break;
			}	
		}
		else
		{
			var line_width_value = pe.scene.hub.commandsModel.getModel(pres.constants.CMD_LINE_WIDTH).value;
			switch (dashArray.length)
			{
				case 2:
					if(flag == line_width_value * 2 )
						returnStrs = "sysDot";
					else if(flag == 1)
						returnStrs = "sysDash";
					else if(flag < 1 )
						returnStrs =  "lgDash";
					else 
						returnStrs = "dash";
					break;
				case 4:
					if(flag > 1)
						returnStrs = "dashDot";
					else
						returnStrs =  "lgDashDot";//_8, 3, 1, 3";
					break;
				case 6:
					returnStrs = "lgDashDotDot";//8, 3, 1, 3, 1, 3";
					break;
			}
		}
		return returnStrs;
	},

	//transform dashArray to dashtype for css class.
	checkDashStyle: function(dashStrs)
	{
		if(!dashStrs || (dashStrs && !/,/.test(dashStrs)))
		{
			//get value from element.attrs["dasharray-name"], like sysDot.
			if(dashStrs == "none")
				dashStrs = "solid";
			return dashStrs;
		}
		else
		{
			//get value from element.attrs["stroke-dasharray"], like "2, 6".
			var dashArray = dashStrs.replace(' ','').split(',');
			var flag = dashArray[1]/dashArray[0];
			if(!isNaN(parseFloat(flag)))
			{
				return this.calcDashStyle(dashArray, flag);
			}
			else
			{
				return "solid";
			}
		}
	},

	startup: function()
	{
		if (this._started)
			return;
		this.inherited(arguments);
		this.set("label", "");
	},
	
	_setValueAttr: function(value)
	{
		//set dashtype value, transform dasharray like 3, 1 to dashtype string like dashtype3.
		if(this.isDash)
		{
			this.value = value ;
			iconName =  this.checkDashStyle(value);
			this.valueNode.value = pres.utils.lineWidthUtil.getDashValueFromType(iconName);
		}
		else
		{
			this.valueNode.value = this.value = iconName = value;
		}

		this.selectNode(iconName);
	},

	_setDisabledAttr: function(d)
	{
		this.inherited(arguments);
		if(d)
			dojo.addClass(this.domNode,'opacityPanelcover');
		else
			dojo.removeClass(this.domNode,'opacityPanelcover');
	},

	dropDownClosed: function()
	{
		var v = this.attr("value");
		if (v !== this._origValue)
		{
			this.handler();
		}
		this._origValue = 0;
		pe.scene.slideEditor.borderStylePanelShow = false;
	},

	selectNode: function(nodevalue)
	{
		this.set("iconClass","dijitToolbarIcon " + nodevalue);
		if(nodevalue != "head_none-tail_none")
		{
			this.iconNode.innerHTML = "";
		}
		else
		{
			var nls = dojo.i18n.getLocalization("pres", "pres");
			this.iconNode.innerHTML = nls.line_endpoints_type1;
		}
		var me = this;
		dojo.forEach(this.dropDown.getChildren(), (function(item)
		{
			//dash value : 3,1   endpoints value : head_none-tail_none
			if (item.value == nodevalue ||(item.iconClass && item.iconClass.replace("dijitToolbarIcon ","").trim() == nodevalue))
			{
				item.set("selected", true);
				dojo.addClass(item.domNode, "dijitMenuItemSelected");
				me.focusChild = item;
			}
			else
			{
				item.set("selected", false);
				dojo.removeClass(item.domNode, "dijitMenuItemSelected");
			}
		}));

	},

	dropDownOpened: function()
	{
		this._origValue = this.value;
		//for up and down key control
		setTimeout(dojo.hitch(this, function()
		{
			if (this._opened)
			{
				this.focusNode.focus();
			}
		}), 200);
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
					var t = dojo.style(dom, "top");
					var banner = dojo.byId("banner");
					t = t + dojo.contentBox(banner).h;
					dojo.style(dom, "top", t + "px");
				}
				//prevent focusing on first child. Always focus on buttonNode.
				this.dropDown.focusChild = function(){};
				this.dropDownOpened();
			});
		}
		this.inherited(arguments);
		var me = this;
		dojo.isIE && this.dropDown.domNode.parentNode.addEventListener("scroll", function(evt){
			pe.panelScrolling = true;
			pe.linePanelHasTimer && clearTimeout(pe.linePanelHasTimer);
			pe.linePanelHasTimer = setTimeout(dojo.hitch(this, function(){ me.focus(); }),10);
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

	postCreate: function()
	{
		this.inherited(arguments);
		this.dropDown = this.createDropDown();

		// All key operation written on buttonNode. Only MouseDown() written on dropDown menuItem.
		this.connect(this._buttonNode, "onkeydown", function(evt){

			var keyCode = evt.keyCode;
			var keys = dojo.keys;
			
			if (keyCode == keys.RIGHT_ARROW || keyCode == keys.LEFT_ARROW)
			{
				evt.stopPropagation();
			}
			else if (keyCode == keys.DOWN_ARROW || keyCode == keys.UP_ARROW)
			{
				var cur_value = this.valueNode.value;
				evt.stopPropagation();
				if (keyCode == keys.DOWN_ARROW)
				{
					var dashValue = pres.utils.lineWidthUtil.getNextTypeValue(this.isDash, cur_value); 
					if (dashValue != cur_value && !this.isDash)
						this.selectNode(this.valueNode.value = dashValue);
					else if(dashValue != cur_value && this.isDash)
					{
						this.valueNode.value = dashValue[0];
						this.selectNode(dashValue[1]);
					}
				}
				if (keyCode == keys.UP_ARROW)
				{
					var dashValue = pres.utils.lineWidthUtil.getPreTypeValue(this.isDash, cur_value);
					if (dashValue != cur_value && !this.isDash)
						this.selectNode(this.valueNode.value = dashValue);
					else if(dashValue != cur_value && this.isDash)
					{
						this.valueNode.value = dashValue[0];
						this.selectNode(dashValue[1]); 
					}						
				}
			}
			else if (keyCode == keys.ESCAPE)
			{
				this.set("value", this._origValue);
				this.valueNode.focus();
			}
			else if (keyCode == keys.ENTER && this._opened)
			{
				this.value = this.valueNode.value;
				this.closeDropDown();
			}
		});
	}
});