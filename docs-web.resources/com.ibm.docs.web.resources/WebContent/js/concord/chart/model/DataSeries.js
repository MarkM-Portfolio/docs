/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.model.DataSeries");
dojo.require("concord.chart.utils.Utils");
dojo.declare("concord.chart.model.DataSeries", null,{
	
	/**
	 * data is a map, its keyset maybe: category, label, x, y, bubbleSize, stock?
	 * the value is DataSequence
	 */
	data: null,
	parent: null,
	_chart: null,
	
	graphPro: null,
	dataPoints: null,
	seriesId: null,
	marker: null,
	smooth: null,
	hide: false,
	/*
	 * a number, each bit represent a changed item
	 * 0: 0x01, value change
	 * 1: 0x02, series name change 
	 */
	changes: 0,
	utils : concord.chart.utils.Utils,
		
	_roles: ["label","xVal","yVal", "val", "bubbleSize"],
	
	constructor: function(plot)
	{
		if(plot!=null)
		{
			this.setParent(plot);
		}
		this.data = {};
	},
	
	setParent: function(plot)
	{
		this.parent = plot;
		this._chart = plot._chart;
	},
	
	getType: function()
	{
		return this.parent.type;
	},
	
	putDataSequence: function(key, seq)
	{
		this.data[key] = seq;
		seq.setParent(this);
		seq.setProperty("role",key);
	},
	
	getDataSequence: function(key)
	{
		return this.data[key];
	},
	
	getRoleInfo: function(role,bMSFmt,separator, bDlg)
	{
		var seq = this.data[role];
		if(seq==null)
			return null;
		var addr = seq.getAddress(bMSFmt,separator, bDlg);
		if(addr){
			if(addr == "#MULT")
				return "";
			return addr;
		}
		return seq.getData();
	},
	
	isNameDirty: function()
	{
		if(this.changes & 0x02)
			return true;
		var seq = this.data["label"];
		if(seq!=null)
			return seq.isDirty();
		return false;
	},
	
	getName: function()
	{
		var seq = this.data["label"];
		if(seq!=null)
		{
			var data = seq.getData();
			if(dojo.isArray(data)){
				var arr = data.length > 50 ? data.slice(0,50) : data;
				data = arr.join(" ");
			}
			return data;
		}
		return null;
	},
	
	isDataDirty: function()
	{
		if(this.changes & 0x01)
			return true;
		for(var role in this.data)
		{
			if(role=="label" || role=="cat")
				continue;
			var seq = this.data[role];
			if(seq.isDirty())
				return true;
		}
		return false;
	},
	
	toJson: function(noData)
	{
		var json = {};
		json["id"] = this.seriesId;
		for(var role in this.data)
		{
			var seq = this.data[role];
			if(seq!=null)
			{
				var rojson = {};
				
				var ref = seq.getAddress();
				if(ref && ref.length > 0)
					rojson.ref = ref;
				
				var data =  seq.getData();
				if(data!=null)
				{
					if(role != "label")
					{
						rojson.cache = {};
						rojson.cache.ptCount = data.length;
						if(!noData || !rojson.ref){
							if(role == "yVal" || role == "xVal")
							{
								//change null to 0 because excel doesn't support null in independent data
								rojson.cache.pts = [];
								for(var i = 0; i < rojson.cache.ptCount; i++)
								{
									if(data[i] == null)
										rojson.cache.pts.push(0);
									else
										rojson.cache.pts.push(data[i]);
								}
							}
							else
								rojson.cache.pts = data;
						}
					}else if(!noData || !rojson.ref){
						var v = data.join(" ");
						if(v.length > 0)
							rojson.v = v;
					}
				}
				
				var exRef = seq.getExRef();
				if(exRef && exRef.length > 0)
					rojson.exRef = exRef;
				json[role] = rojson;
			}
		}
		
		if(this.dataPoints!=null)
			json["dPt"] = dojo.clone(this.dataPoints);
		if(this.graphPro!=null)
			json["spPr"] = dojo.clone(this.graphPro);
		if(this.marker != null)
			json["marker"] = this.marker;
		if(this.smooth !=null)
			json["smooth"] = this.smooth;
		return json;
	},
	
	loadFromJson: function(content,dataProvider)
	{
		this.seriesId = content["id"];
		
		for(var i=0;i<this._roles.length;i++)
		{
			var role = this._roles[i];
			var json = content[role];
			if(json != null){
				var pts = null;
				if(json.cache)
					pts = json.cache.pts;
				var exRef = json.exRef;
				
				if(role == "label" && "v" in json){
					pts = [];
					pts.push(json.v);
				}
				var seq = dataProvider.createDataSequence({ref: json.ref, "role" : role, "pts" : pts, "exRef" : exRef});
				this.putDataSequence(role,seq);
			}
		}
		
		this.dataPoints = content["dPt"];
		this.graphPro = content["spPr"];
		this.marker = content.marker;
		this.smooth = content.smooth;
	},
	
	set: function(pro)
	{
		if(pro==null)
			return;
		
		var dataProvider = this._chart._dataProvider;
		for(var role in pro.data)
		{
			this._chart.controller.checkData = true;
			var json = pro.data[role];
			if(role=="label")
				this.changes |= 0x02;
			else
				this.changes |= 0x01;
			var old = this.data[role];
			if(old!=null)
				old.destroy();
			if(!json)
				delete this.data[role];
			else
			{
				var pts = null;
				if(json.cache)
					pts = json.cache.pts;
				
				if(role == "label" && "v" in json)
				{
					pts = [];
					pts.push(json.v);
				}
				var seq = dataProvider.createDataSequence({ref:json.ref, "role" : role, "pts" : pts});
				this.putDataSequence(role,seq);
			}
		}
		
		if("spPr" in pro)
		{
			if(pro.spPr==null)
				this.graphPro = null;
			else
			{
				if(this.graphPro==null)
					this.graphPro = pro.spPr;
				else
					this.utils.mergeSpPr(this.graphPro,pro.spPr);
			}
		}
		
		if("marker" in pro)
			this.marker = pro.marker;
		
		if("smooth" in pro)
			this.smooth = pro.smooth;
		
		if("dPt" in pro)
		{
			if(this.dataPoints==null)
				this.dataPoints = pro.dPt;
			else
			{
				var dpt = pro.dPt;
				if(dpt==null)
					this.dataPoints = null;
				else
				{
					for(var idx in dpt)
					{
						var dp = dpt[idx];
						if(dp==null)
							delete this.dataPoints[idx];
						else
						{
							var old_dp = this.dataPoints[idx];
							if(old_dp==null)
								this.dataPoints[idx] = dp;
							else
							{
								var old_spPr = old_dp.spPr;
								var spPr = dp.spPr;
								this.utils.mergeSpPr(old_spPr,spPr);
							}
						}
					}
				}
			}
		}
	},
	
	getReverseSettings: function(settings)
	{
		var undoPro = {};
		var data = settings.data;
		if(data!=null)
			undoPro.data = {};
		for(var role in data)
		{
			var seq = this.getDataSequence(role);
			if(seq==null)
			{
				undoPro.data[role] = "";
			}
			else
			{
				var address = seq.getAddress();
				if(address)
					undoPro.data[role] = {ref:address};
				else
				{
					var data = seq.getData();
					if(role=="label")
						undoPro.data[role] = {v:data.join(" ")};
					else
						undoPro.data[role] = {cache:{pts:data}};
				}
			}
		}
		
		if("marker" in settings)
			undoPro.marker = this.marker;
		
		if("smooth" in settings)
			undoPro.smooth = this.smooth;
		
		if("spPr" in settings)
		{
			if(this.graphPro==null)
				undoPro.spPr = null;
			else
				undoPro.spPr = this.utils.reverseSpPr(settings.spPr,this.graphPro);
		}
		if("dPt" in settings)
		{
			if(this.dataPoints==null)
				undoPro.dPt = null;
			else
			{
				var dpt = settings.dPt;
				if(dpt==null)
					undoPro.dPt = dojo.clone(this.dataPoints);
				else
				{
					undoPro.dPt = {};
					for(var idx in dpt)
					{
						var old_dp = this.dataPoints[idx];
						if(old_dp==null)
							undoPro.dPt[idx] = null;
						else
						{
							if(dpt[idx]==null || dpt[idx].spPr==null)
								undoPro.dPt[idx] = old_dp;
							else
								undoPro.dPt[idx] = {spPr: this.utils.reverseSpPr(dpt[idx].spPr,old_dp.spPr)};
						}
					}
				}
			}
		}
		return undoPro;
	}
	
});