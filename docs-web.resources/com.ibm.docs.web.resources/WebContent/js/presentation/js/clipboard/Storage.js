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

dojo.provide("pres.clipboard.Storage");
dojo.require("concord.beans.WebClipboard");
dojo.declare("pres.clipboard.Storage", null, {

	TYPE: "Presentation",

	constructor: function()
	{
		this._webClipboard = new concord.beans.WebClipboard();
		this._memClipboard = null;
	},

	clear: function()
	{
		this._webClipboard.emptyClipboard();
		this._memClipboard = null;
	},
	
	cloneData: function(data)
	{
		return JSON.parse(JSON.stringify(data));
	},

	getData: function()
	{
		var m = this._memClipboard;
		var w = this._webClipboard;

		if (this._forceUseMem)
			return this.cloneData(m);

		if (w.isWebStorage())
		{
			var t = w.getDataTimestamp();
			if (!t)
			{
				// no data stored before..
				return this.cloneData(m);
			}

			else if (m)
			{
				// ours is newer.
				if (m._timestamp && m._timestamp >= t)
					return this.cloneData(m);
			}
		}

		var json = w.getData();
		var data = JSON.parse(json);

		if (data._type !== this.TYPE)
			return this.cloneData(m);

		if (!m)
			return data;

		else
		{
			if (data._timestamp && m._timestamp)
			{
				if (data._timestamp < m._timestamp)
					return this.cloneData(m);
			}
		}

		return data;
	},

	setData: function(data)
	{
		if (!data)
			return;

		data._type = this.TYPE;
		data._timestamp = new Date().valueOf();

		this._memClipboard = data;
		this._forceUseMem = true;

		setTimeout(dojo.hitch(this, function()
		{
			// hold 2 seconds for performance, 2 seconds sounds reasonable for user switch to other browser page to paste.
			var json = JSON.stringify(data);
			if (json && json.length <= this._webClipboard.getMaxLength())
			{
				this._webClipboard.setData(json);
			}

			// make sure local mem clipboard is newer
			data._timestamp = new Date().valueOf();

			this._forceUseMem = false;

		}, 2000));

	}
});
