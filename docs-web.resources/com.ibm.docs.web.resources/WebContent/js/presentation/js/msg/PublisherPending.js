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

dojo.provide("pres.msg.PublisherPending");
dojo.require("pres.msg.PublisherUtils");

dojo.declare("pres.msg.PublisherPending", null, {

	constructor: function()
	{
		this._pending = null;
	},
	
	beforeSendPending: function()
	{
		// a stub for event connection.
		dojo.publish("/msg/before/send/pending", []);
	},

	checkPending: function(msg)
	{
		if (this._pending && this._pending.msg != msg)
		{
			this.sendPending();
		}
	},

	sendPending: function()
	{
		this.beforeSendPending();
		if (this._pending)
		{
			this.sendMessage(this._pending.msg, true);
			clearTimeout(this._pendingTimer);
			this._pending = null;
		}
	},

	_isArrSame: function(arr, arr2)
	{
		return arr.length == arr2.length && dojo.every(arr, function(item, index)
		{
			return item == arr2[index];
		});
	},

	addPending: function(type, msg, elements, time)
	{
		var merged = false;
		if (this._pending)
		{
			if (this._pending.type == type && this._isArrSame(this._pending.elements, elements))
			{
				merged = this.mergePending(type, msg, elements);
			}
			if (!merged)
			{
				this.sendPending();
				this._pending = {
					type: type,
					msg: msg,
					elements: elements
				};
			}
		}
		else
		{
			this._pending = {
				type: type,
				msg: msg,
				elements: elements
			};
		}
		var me = this;
		clearTimeout(this._pendingTimer);
		if (this._pending)
		{
			this._pendingTimer = setTimeout(function()
			{
				// console.warn("Pending msg time is up");
				me.sendPending();
			}, time ? time : 1200);
		}
	},

	mergePending: function(type, msg, elements)
	{
		var pmsg = this._pending.msg;
		pmsg[0].msg.updates = msg[0].msg.updates;
		return true;
	}

});