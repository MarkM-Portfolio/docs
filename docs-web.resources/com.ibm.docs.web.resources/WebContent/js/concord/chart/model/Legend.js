/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.model.Legend");
dojo.require("concord.chart.utils.Utils");

dojo.declare("concord.chart.model.Legend", null, {
	txPr : null,
	spPr : null,
	legendPos: null,
	
	utils : concord.chart.utils.Utils,
	
	toJson: function()
	{
		var json = {};
		json.legendPos = this.legendPos;
		if(this.txPr!=null)
			json["txPr"] = dojo.clone(this.txPr);
		return json;
	},
	
	loadFromJson: function(json)
	{
		this.legendPos = json.legendPos;
		this.txPr = json["txPr"];
	},
	
	set: function(json)
	{
		if("legendPos" in json)
			this.legendPos = json.legendPos;
		if("txPr" in json)
		{
			if(this.txPr==null)
				this.txPr = json.txPr;
			else
			{
				if(json.txPr==null)
					this.txPr = null;
				else
					dojo.mixin(this.txPr,json.txPr);
			}
		}
	},
	
	getReverseSettings: function(json)
	{
		var undoPro = {};
		if(json==null)
		{
			undoPro.legendPos = this.legendPos;
			if(this.txPr)
				undoPro.txPr = dojo.clone(this.txPr);
		}
		else
		{
			if("legendPos" in json)
				undoPro.legendPos = this.legendPos;
			
			if("txPr" in json)
			{
				if(this.txPr==null)
					undoPro.txPr = null;
				else
					undoPro.txPr = this.utils.reverseTxPr(json.txPr,this.txPr);
			}
		}
		return undoPro;
	}
});