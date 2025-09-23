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

dojo.provide("pres.model.Commands");
dojo.require("dojo.Stateful");

/* used by toolbar,menubar */

dojo.declare("pres.model.Commands", null, {

	// shared by all instance
	itemsMap: {},

	getItems: function()
	{
		return this.items;
	},
	
	getModel: function(id)
	{
		return this.itemsMap[id];
	},

	setEnabled: function(ids, enable)
	{
		var arr = ids;
		if (!dojo.isArray(ids))
			arr = [ids];
		dojo.forEach(arr, dojo.hitch(this, function(id)
		{
			var item = this.itemsMap[id];
			if (item)
			{
				item.set("disabled", !enable);
			}
		}));
	},

	setChecked: function(ids, checked)
	{
		var arr = ids;
		if (!dojo.isArray(ids))
			arr = [ids];
		dojo.forEach(arr, dojo.hitch(this, function(id)
		{
			var item = this.itemsMap[id];
			if (item)
				item.set("checked", checked);
		}));
	},

	setValue: function(id, value)
	{
		var item = this.itemsMap[id];
		if (!item)
			return;
		if (value === true || value === false || value === null)
			item.set("checked", value);
		else
			item.set("value", value);
	},
	
	setLabel: function(id, label)
	{
		var item = this.itemsMap[id];
		if (!item)
			return;
		item.set("label", label);
	},

	setIconLabel: function(id, icon, label)
	{
		var item = this.itemsMap[id];
		if (!item)
			return;
		item.set("icon", icon);
		item.set("label", label);
		item.set("value", label);
	},
	
	setAttrs: function(id, map)
	{
		var item = this.itemsMap[id];
		if (!item)
			return;
		for(var x in map)
		{
			item.set(x, map[x]);
		}
	},

	_checkChildren: function(item, obj)
	{
		if (item.children)
		{
			obj.children = [];
			dojo.forEach(item.children, dojo.hitch(this, function(child)
			{
				var id = child.cmd || child.id;
				var stateful = null;
				if (id)
				{
					if (this.itemsMap[id])
					{
						stateful = this.itemsMap[id];
					}
					else
					{
						stateful = new dojo.Stateful(child);
						this.itemsMap[id] = stateful;
					}
				}

				var cObj = {
					item: child,
					model: stateful
				};
				obj.children.push(cObj);
				this._checkChildren(child, cObj);
			}));
		}
	},

	constructor: function(config)
	{
		this.items = [];
		dojo.forEach(config, dojo.hitch(this, function(item)
		{
			var id = item.cmd || item.id;
			var stateful = null;
			if (id)
			{
				if (this.itemsMap[id])
				{
					stateful = this.itemsMap[id];
				}
				else
				{
					stateful = new dojo.Stateful(item);
					this.itemsMap[id] = stateful;
				}
			}

			var obj = {
				item: item,
				model: stateful
			};
			this.items.push(obj);
			this._checkChildren(item, obj);
		}));
	}

});