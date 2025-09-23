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

dojo.provide("writer.ui.widget.CellBorderType");
dojo.require("dijit.form.DropDownButton");
dojo.require("writer.util.CellBorderTools");
dojo.requireLocalization("writer.ui.widget","CellBorder");

dojo.declare("writer.ui.widget.CellBorderType", [dijit.form.DropDownButton], {

	baseClass: "dijitDropDownButton cellBorderType",
	iconClass: "solid",

	constructor: function()
	{
		this.inherited(arguments);
		var constant = writer.util.CellBorderTools.Constant.BORDER_STYLE;
		var nls = dojo.i18n.getLocalization("writer.ui.widget","CellBorder");
		this._children = [
			{icon:"solid",value:constant.SOLID,label:nls.border_type_solid},
			{icon:"dashed",value:constant.DASHED,label:nls.border_type_dashed},
			{icon:"dotted",value:constant.DOTTED,label:nls.border_type_dotted},
			{icon:"double",value:constant.DOUBLE,label:nls.border_type_double}];
	},
	_getNextTypeValue:function(value)
	{ 
		var i=0;
		while(i < this._children.length)
		{
			if(this._children[i].value === value)
				break;
			++i;
		}
		if(i == this._children.length)
			throw new Error("value not found");
		return this._children[(i+1)%this._children.length].value;
	},
	_getPreTypeValue:function(value)
	{
		var i=0;
		while(i < this._children.length)
		{
			if(this._children[i].value === value)
				break;
			++i;
		}
		if(i == this._children.length)
			throw new Error("value not found");
		return this._children[(i+this._children.length - 1)%this._children.length].value;
	},
	createDropDown :function()
	{	
		var menu = new dijit.Menu({
			id: this.id + "_popup",
			dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
		});
		dojo.addClass(menu.domNode, "lotusActionMenu toolbarMenu cellBorderType");
		var me = this;
		if (this._children)
		{
			for ( var i = 0; i < this._children.length; ++i)
			{
				var c = this._children[i];
				var value = c.value || c.icon;
				var iconClass = "dijitToolbarIcon " + c.icon;
				var _mItem = new dijit.MenuItem({
					iconClass: iconClass,
					value: value,
					cmd: me.cmd,
					title:c.label,
					onMouseDown: function()
					{
						//pe.scene.slideEditor.borderStylePanelShow = true;
						me._onMouseDown(this);
					},
					dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
				});
				menu.addChild(_mItem);
				dojo.query(".dijitMenuItemLabel,.dijitMenuItemAccelKey,.dijitMenuArrowCell",
						_mItem.domNode)
					.forEach(function(dom){dojo.destroy(dom);});
				dijit.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
			}
		}
		dojo.connect(menu, "onClose", this, function()
		{
			this.dropDownClosed();
		});
		return menu;
	},

	_onMouseDown: function(item){
		if (item.disabled)
			return;
		if(item.value)
		{
			this.value = this.valueNode.value = item.value;
			this.selectNode(this.value);
			this.focusChild = item;
		}
	},

	_getValueAttr: function()
	{
		return this.value;
	},

	_setValueAttr: function(value)
	{
		this.valueNode.value = this.value = value;
		this.selectNode(value);
	},

	dropDownClosed: function()
	{
		var v = this.attr("value");
		if (v !== this._origValue)
		{
			this._origValue = v;
			this.onChange && this.onChange();
		}
		// pe.scene.slideEditor.borderStylePanelShow = false;
	},

	selectNode: function(nodevalue)
	{
		this.set("iconClass","dijitToolbarIcon " + nodevalue);
		this.iconNode.innerHTML = "";
		var me = this;
		dojo.forEach(this.dropDown.getChildren(), (function(item)
		{
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
				this.focusNode && this.focusNode.focus();
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
	_onKey: function(e)
	{
		if(this._opened && e && e.keyCode == dojo.keys.ESCAPE){
			this.set("value", this._origValue);
			this.valueNode.focus();
		}
		this.inherited(arguments);
	},
	postCreate: function()
	{
		this.inherited(arguments);
		// this.containerNode.remove();
		this.dropDown = this.createDropDown();
		this.valueNode.value = this.value = this._children[0].value;
		this.selectNode(this.valueNode.value);
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
					var dashValue = this._getNextTypeValue(cur_value); 
					if (dashValue != cur_value)
						this.set('value',dashValue);
				}
				if (keyCode == keys.UP_ARROW)
				{
					var dashValue = this._getPreTypeValue(cur_value);
					if (dashValue != cur_value)
						this.set('value',dashValue);
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