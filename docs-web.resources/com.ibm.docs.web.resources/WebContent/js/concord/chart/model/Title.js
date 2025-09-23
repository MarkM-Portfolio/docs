/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.model.Title");
dojo.require("concord.chart.utils.Utils");

dojo.declare("concord.chart.model.Title", null, {
	text : null,
	
	textPro : null,
	graphicPro : null,
	utils : concord.chart.utils.Utils,
	
	toJson: function()
	{
		var json = {};
		if(this.text!=null)
			json["text"] = this.text;
		if(this.textPro!=null)
			json["txPr"] = dojo.clone(this.textPro);
		return json;
	},
	
	loadFromJson: function(json)
	{
		this.text = json["text"];
		this.textPro = json["txPr"];
	},
	
	set: function(json)
	{
		if("text" in json)
			this.text = json["text"];
		if("txPr" in json)
		{
			if(this.textPro==null)
				this.textPro = json.txPr;
			else
			{
				if(json.txPr==null)
					this.textPro = null;
				else
					dojo.mixin(this.textPro,json.txPr);
			}
		}
	},
	
	getReverseSettings: function(json)
	{
		var undoPro = {};
		if("text" in json)
			undoPro.text = this.text;
		
		if("txPr" in json)
		{
			if(this.textPro==null)
				undoPro.txPr = null;
			else
				undoPro.txPr = this.utils.reverseTxPr(json.txPr,this.textPro);
		}
		return undoPro;
	}
});