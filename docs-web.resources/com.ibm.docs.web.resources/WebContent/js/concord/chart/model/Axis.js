/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.chart.model.Axis");
dojo.require("concord.chart.model.Title");
dojo.require("concord.chart.utils.Utils");

dojo.declare("concord.chart.model.Axis", null,{	
	id: null,
	type: null,
	position: null, //left, right, top, bottom
	invisible : null, 
	tickLblPos: null,   //label position, if none, then the label will not show
	textRotation: 0,
	
	//scaling
	logBase : -1,      //10 ....
	max : null,
	min : null,
	majorUnit : null,
	minorUnit : null,
	
	//grid properties
	majorGrid : null,     //GraphicPro
	minorGrid : null,     //GraphicPro
	
	//number format
	format : null,
	sourceLinked : 1,
	preserveCode : null,
	
	//axis title
	title : null,
	
	spPr : null,
	textPro : null,
	
	categorySeq : null,   //DataSequence
	
	changes: 0,
	utils : concord.chart.utils.Utils,
	
	constructor: function(chart)
	{
		this._chart = chart;
	},
	
	toJson: function(noData)
	{
		var json = {};
		json["axId"] = this.id;
		if(this.type)
			json["type"] = this.type;
		json["delete"] = this.invisible ? 1:0;
		json["axPos"] = this.position;
		
		if(this.tickLblPos!=null)
			json["tickLblPos"] = this.tickLblPos;
		
		var scaling = {};
		if(this.logBase>0)
			scaling["logBase"] = this.logBase;
		if(this.max!=null)
			scaling["max"] = this.max;
		if(this.min!=null)
			scaling["min"] = this.min;
		json["scaling"] = scaling;
		
		if(this.majorUnit>0)
			json["majorUnit"] = this.majorUnit;
		if(this.minorUnit>0)
			json["minorUnit"] = this.minorUnit;
		
		if(this.textRotation != 0)
			json["txRot"] = this.textRotation;
			
		if(this.majorGrid!=null)
			json["majorGridlines"] = this.majorGrid;
		if(this.minorGrid!=null)
			json["minorGridlines"] = this.minorGrid;
		if(this.format!=null)
		{
			var numFmt = {};
			numFmt["format"] = this.format;
			numFmt["sourceLinked"] = this.sourceLinked;
			if(this.preserveCode)
				numFmt["pCode"] = this.preserveCode;
			json["numFmt"] = numFmt;
		}
		
		if(this.title!=null)
			json["title"]  = this.title.toJson();
		if(this.spPr!=null)
			json["spPr"] = dojo.clone(this.spPr);
		if(this.textPro!=null)
			json["txPr"] = dojo.clone(this.textPro);
		
		if(this.categorySeq!=null)
		{
			var category = {};
			var ref = this.categorySeq.getAddress();
			if(ref && ref.length > 0)
				category.ref = this.categorySeq.getAddress();
			var data =  this.categorySeq.getData();
			if(data != null){
				category.cache = {};
				category.cache.ptCount = data.length;
				if(!noData || !category.ref)
					category.cache.pts = data;
			}
			var exRef = this.categorySeq.getExRef();
			if(exRef && exRef.length > 0)
				category.exRef = exRef;
			json["cat"] = category;
		}
		return json;
	},
	
	loadFromJson: function(json)
	{
		this.id = json["axId"];
		this.type = json["type"];
		this.invisible = json["delete"];
		this.position = json["axPos"];
		this.tickLblPos = json["tickLblPos"];
		
		var scaling = json["scaling"];
		if(scaling!=null)
		{
			if(scaling["logBase"]!=null)
				this.logBase = scaling["logBase"];
			if(scaling.max!=null)
				this.max = scaling.max;
			if(scaling.min!=null)
				this.min = scaling.min;
		}
		
		if(json["majorUnit"]!=null)
			this.majorUnit = json["majorUnit"];
		if(json["minorUnit"]!=null)
			this.minorUnit = json["minorUnit"];
		
		var rot = json["txRot"];
		if(rot!=null)
			this.textRotation = rot;
		
		this.majorGrid = json["majorGridlines"];
		this.minorGrid = json["minorGridlines"];
		
		var numFmt = json["numFmt"];
		if(numFmt!=null)
		{
			this.format = numFmt["format"];
			if(numFmt["sourceLinked"]!=null)
				this.sourceLinked = numFmt["sourceLinked"];
			this.preserveCode = numFmt["pCode"];
		}
		
		var titleJson = json["title"];
		if(titleJson!=null)
		{
			this.title = new concord.chart.model.Title();
			this.title.loadFromJson(titleJson);
		}
		
		this.spPr = json["spPr"];
		this.textPro = json["txPr"];
		
		var categoriesJson = json["cat"];
		if(categoriesJson!=null)
		{
			var pts = null;
			if(categoriesJson.cache)
				pts = categoriesJson.cache.pts;
			var exRef = categoriesJson.exRef;
			this.categorySeq = this._chart._dataProvider.createDataSequence({ref:categoriesJson.ref, "role" : "cat", "pts" : pts, "exRef" : exRef});
			this.categorySeq.setProperty("role", "cat");
			this.categorySeq.setParent(this);
		}
	},
	
	/*
	 * def: formatted by dojo;
	 * value: original value;
	 */
	formatting: function(def, value, precision)
	{
		dojo.require("concord.chart.i18n.Number");
		
		if (typeof value == "number" && (!this.format || this.format.cat == "text")) {
			def = concord.chart.i18n.Number.roundFloat(value);
		}

		if(!this.format || this.format.cat == "boolean" || this.format.cat == "text")
			return def;

		if(concord.chart.i18n.Number.isDefaultFormat(this.format))
			return def;

		return concord.chart.i18n.Number.format(value, this.format);
	},
	
	set: function(json)
	{
		if("cat" in json)
		{
			if(this.categorySeq!=null)
				this.categorySeq.destroy();
			this.categorySeq = null;
			this.changes |= 0x01;
			
			this._chart.controller.checkData = true;
			var catJson = json["cat"];
			if(catJson)
			{
				var pts = null;
				if(catJson.cache)
					pts = catJson.cache.pts;
				
				var dataProvider = this._chart._dataProvider;
				this.categorySeq = dataProvider.createDataSequence({ref: catJson.ref, "role" : "cat", "pts" : pts});
			
				this.categorySeq.setProperty("role", "cat");
				this.categorySeq.setParent(this);
			}
		}
		
		if("spPr" in json)
		{
			if(this.spPr==null)
				this.spPr = json["spPr"];
			else
			{
				if(json["spPr"]==null)
					this.spPr = null;
				else
					this.utils.mergeSpPr(this.spPr,json["spPr"]);
			}
		}
		
		if("scaling" in json)
		{
			var scaling = json["scaling"];
			if(!scaling)
			{
				this.max = null;
				this.min = null;
			}
			else
			{
				if("min" in scaling)
					this.min = scaling["min"];
				if("max" in scaling)
					this.max = scaling["max"];
			}
		}
		if("majorUnit" in json)
			this.majorUnit = json["majorUnit"];
		
		if("minorUnit" in json)
			this.minorUnit = json["minorUnit"];
		
		if("title" in json)
		{
			var titlePro = json["title"];
			if(titlePro==null)
				this.title = null;
			else
			{
				if(this.title==null)
				{
					this.title = new concord.chart.model.Title();
					this.title.loadFromJson(titlePro);
				}
				else
				{	
					this.title.set(titlePro);
				}
			}
		}
		
		if("txPr" in json)
		{
			if(this.textPro==null)
				this.textPro = json["txPr"];
			else
			{
				if(json["txPr"]==null)
					this.textPro = null;
				else
					dojo.mixin(this.textPro,json["txPr"]);
			}
		}
	},
	
	getReverseSettings: function(pro)
	{
		var undoPro = {};
		if(!pro)
			return undoPro;
		
		if("cat" in pro)
		{
			if(this.categorySeq==null)
				undoPro.cat = "";
			else
			{
				var address = this.categorySeq.getAddress();
				if(address)
					undoPro.cat = {ref:address};
				else
				{
					var data = this.categorySeq.getData();
					undoPro.cat = {cache:{"pts":data}};
				}
			}
		}
		
		if("spPr" in pro)
		{
			if(this.spPr==null)
				undoPro.spPr = null;
			else
				undoPro.spPr = this.utils.reverseSpPr(pro.spPr,this.spPr);
		}
		
		if("txPr" in pro)
		{
			if(this.textPro==null)
				undoPro.txPr = null;
			else
				undoPro.txPr = this.utils.reverseTxPr(pro.txPr,this.textPro);
		}
		
		if("scaling" in pro)
		{
			var scaling = pro["scaling"];
			if(scaling)
			{
				undoPro.scaling = {};
				if("min" in scaling)
					undoPro.scaling.min = this.min;
				if("max" in scaling)
					undoPro.scaling.max = this.max;
			}
		}
		
		if("majorUnit" in pro)
			undoPro.majorUnit = this.majorUnit;
		
		if("minorUnit" in pro)
			undoPro.minorUnit = this.minorUnit;
		
		if("title" in pro)
		{
			if(this.title==null)
				undoPro.title = null;
			else
			{
				undoPro.title = this.title.getReverseSettings(pro.title);
			}
		}
		
		return undoPro;
	},
	
	isCateDirty: function()
	{
		return (this.changes & 0x01) || (this.categorySeq && this.categorySeq.isDirty());
	},
	
	setCategorySeq: function(seq)
	{
		if(this.categorySeq)
			this.categorySeq.destroy();
		
		this.categorySeq = seq;
		if(seq!=null)
			this.categorySeq.setParent(this);
	}
});