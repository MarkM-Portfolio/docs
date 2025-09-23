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

dojo.provide("pres.perf");
pres.perf = {
	names: [],
	times: [],
	map: {},
	clear: function()
	{
		this.names = [];
		this.times = [];
		this.map = {};
	},

	between: function(name1, name2)
	{
		var t = this.map[name1];
		var t2 = this.map[name2];
		if (t2 && t)
			return Math.abs(t2 - t);
		else
			return 0;
	},

	eclipsed: function(name)
	{
		if (this.times.length < 1)
			return 0;

		var lastTime = this.times[this.times.length - 1];
		var prevTime = this.times[0];
		if (name)
		{
			var index = this.names.indexOf(name);
			prevTime = this.times[index];
		}

		return lastTime - prevTime;
	},

	dump: function()
	{
		var me = this;
		var str = "";
		dojo.forEach(this.names, function(name, i)
		{
			str += ("\n" + name + " : " + me.times[i]);
		});
		return str;
	},

	isMarked: function(name)
	{
		return dojo.indexOf(this.names, name) > -1;
	},

	mark: function(name)
	{
		if (this.isMarked(name))
			return;

		var time = new Date().valueOf();
		this.names.push(name);
		this.times.push(time);
		this.map[name] = time;
		this.marked(name, time);
	},

	marked: function(name, time)
	{
		// console.warn("PERF: " + name + " : " + time);
	}
};