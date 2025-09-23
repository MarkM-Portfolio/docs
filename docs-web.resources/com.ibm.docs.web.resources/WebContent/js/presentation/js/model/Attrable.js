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

dojo.provide("pres.model.Attrable");
dojo.declare("pres.model.Attrable", null, {

	str2array: function(s, separator)
	{
		var spaces = separator || (/\s+/);
		if (dojo.isString(s))
		{
			if (!separator && s.indexOf(" ") < 0)
			{
				return [s];
			}
			else
			{
				return s.split(spaces);
			}
		}
		// assumed to be an array
		return s || "";
	},

	array2str: function(arr, separator)
	{
		var css = "";
		dojo.forEach(arr, function(a)
		{
			css += a + (separator || " ");
		});
		return dojo.trim(css);
	},

	hasClass: function(name)
	{
		var arr = this.str2array(this.attr("class") || "");
		return dojo.indexOf(arr, name) > -1;
	},

	addClass: function(name)
	{
		var arr = this.str2array(this.attr("class") || "");
		if (dojo.indexOf(arr, name) == -1)
		{
			arr.push(name);
			this.attr("class", this.array2str(arr));
			return true;
		}
	},

	removeClass: function(name)
	{
		var arr = this.str2array(this.attr("class") || "");
		var index = dojo.indexOf(arr, name);
		if (index > -1)
		{
			arr.splice(index, 1);
			this.attr("class", this.array2str(arr));
			return true;
		}
	},

	removeAttr: function(k)
	{
		this.attrs && delete this.attrs[k];
	},

	attr: function()
	{
		if (arguments.length == 1)
		{
			var key = arguments[0];
			if (key == "id")
				return this.id;
			else if (this.attrs)
				return this.attrs[key];
		}
		if (arguments.length == 2)
		{
			var key = arguments[0];
			var value = arguments[1];
			if (key == "id")
				this.id = value;
			else if (this.attrs)
				this.attrs[key] = value;
		}
	}
});