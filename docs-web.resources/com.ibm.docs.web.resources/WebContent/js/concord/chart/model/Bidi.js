/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.model.Bidi");
dojo.require("concord.chart.model.ModelFactory");
dojo.require("concord.chart.config.DefaultSettings");
dojo.require("concord.chart.utils.Utils");

dojo.declare("concord.chart.model.Bidi", null,{
	
	dir: null,
	textDir: null,

	set: function(settings)
	{
		if("dir" in settings)
			this.dir = settings["dir"];

		if("textDir" in settings)
			this.textDir = settings["textDir"];
	},
	toJson: function()
	{
		var json = {};
		if(this.dir!=null)
			json["dir"] = this.dir;
		if(this.textDir!=null)
			json["textDir"] = this.textDir;
		return json;
	},
	loadFromJson: function(json)
	{
		this.dir = json.dir;
		this.textDir = json.textDir;
	}
});