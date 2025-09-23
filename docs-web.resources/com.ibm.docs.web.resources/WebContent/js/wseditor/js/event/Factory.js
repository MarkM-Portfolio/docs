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

dojo.provide("websheet.event.Factory");

dojo.require("websheet.Constant");

dojo.declare("websheet.event._event", null, {

	action: null,
	refType: null,
	refValue: null,
	attrs: null,

	message: null,

	Event: websheet.Constant.Event,
	bUndoDefault: websheet.Constant.bUndoDefault,
	
	constructor: function(refValue, attrs) {
	    this.refValue = refValue;
	    if(this instanceof websheet.event.InsertRow
	     ||this instanceof websheet.event.InsertColumn
	     ||this instanceof websheet.event.InsertSheet
	     ||this instanceof websheet.event.SetUnnameRange
	     ||this instanceof websheet.event.InsertRange
	     || this instanceof websheet.event.SetCell)
	    	this.attrs = attrs;
	    else
	    	this.attrs = websheet.Helper.cloneJSON(attrs);
	},

	// to be overriden
	setData: function(data) {
	},

	_setData: function (data) {

	    this.setData(data);
	},

	setAttrs: function(o) {
	    if (!this.attrs) return;
	    
	    for (var attr in this.attrs)
	    	o[attr] = this.attrs[attr];
	},

	// to be overriden for message that has reverse event containing multiple updates
	// use content to create additional event and append them to 'updates'
	reverse: function (updates, content) {
	},

	_init: function() {
	    var msg = {
		action: this.action,
		reference: {
		    refType: this.refType,
		    refValue: this.refValue
		},
		data: {}
	    };

	    this._setData(msg.data);

	    return msg;
	},

	// return one message in JSON that would contain multiple updates
	getMessage: function() {
	    if (this.message) return this.message;

	    this.message = {};
	    var updates = new Array();
	    var count = 0;

	    var event = this._init();
	    updates[0] = event;
	    this.message.updates = updates;

	    return this.message;
	}
    });

////////////////////////////////////////////
/////// RANGE EVENTS ///////////////////////
////////////////////////////////////////////

////// BASE CLASS for RANGE EVENTS ////////
dojo.declare("websheet.event._range", [websheet.event._event], {

	constructor: function (refValue, attrs) {
	    this.refType = this.Event.SCOPE_RANGE;
	},

	setData: function (data) {
	    this.setAttrs(data);
	}
    });

dojo.declare("websheet.event.SetRange", [websheet.event._range], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SET;
	}	
    });
dojo.declare("websheet.event.InsertRange", [websheet.event._range], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_INSERT;
	}	
    });
dojo.declare("websheet.event.DeleteRange", [websheet.event._range], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_DELETE;
	}	
    });
///////////////////////////////////////////
////////// CELL EVENTS ////////////////////
///////////////////////////////////////////

//// BASE CLASS for CELL EVENTS////////////

dojo.declare("websheet.event._cell", [websheet.event._event], {

	constructor: function (refValue, attrs) {
	    this.refType = this.Event.SCOPE_CELL;
	},

	setData: function (data) {
	    data.cell = {};
	    this.setAttrs(data.cell);
	}
    });

dojo.declare("websheet.event.SetCell", [websheet.event._cell], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SET;
	},
	
	setData: function(data) {
		this.inherited(arguments);
		if (this.attrs.bR) {
			data.bR = this.attrs.bR;
			// workaround here to delete redundant bR setting
			delete data.cell.bR;
		}
		if(this.attrs.bCut){
			data.bCut = this.attrs.bCut;
			delete data.cell.bCut;
		}
		if(this.attrs[this.bUndoDefault])
		{
			data[this.bUndoDefault] = true;
			delete data.cell[this.bUndoDefault];
		}
	}
	
    });


////////////////////////////////////////////
/////// SHEET EVENTS ///////////////////////
////////////////////////////////////////////

////// BASE CLASS for SHEET EVENTS ////////

dojo.declare("websheet.event._sheet", [websheet.event._event], {

	constructor: function(refValue, attrs) {
	    this.refType = this.Event.SCOPE_SHEET;
	},

	setData: function (data) {
	    data.sheet = {};
	    this.setAttrs(data.sheet);
	}
    });


dojo.declare("websheet.event.InsertSheet", [websheet.event._sheet], {

	constructor: function(refValue, attrs) {
	    this.action = this.Event.ACTION_INSERT;
	}
    });

dojo.declare("websheet.event.SetSheet", [websheet.event._sheet], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SET;
	}
    });

dojo.declare("websheet.event.DeleteSheet", [websheet.event._sheet], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_DELETE;
	},

	reverse: function (updates, content)
	{
		if(!content)
			return;
		
		var ranges = content.cRanges;
	    if(ranges){
	    	var undoCharts = {};
	    	for(var rId in ranges)
			{
				var attrs = ranges[rId];
				var ref = attrs.address;
				var chartDataSeqList = attrs._chartDataSeqList;
				if(chartDataSeqList){
					var length = chartDataSeqList.length;
					for(var i = 0; i < length; i++){
						var chartDataSeq = chartDataSeqList[i];
						var role = chartDataSeq.getProperty("role");
						var seqKey = role;
						var chartId = chartDataSeq.getChartId();
						var chart = undoCharts[chartId];
						if(chart==null)
							chart = undoCharts[chartId] = {};
						
						var addrlist = null;
						if(role=="cat")
						{
							var axis = chart["axis"];
							if(axis==null)
								axis = chart["axis"] = {};
							var axId = chartDataSeq._parent.id;
							if(axis[axId]==null)
								axis[axId] = {};
							if(axis[axId]["cat"]==null)
								axis[axId]["cat"] = chartDataSeq.getAddrsList();
							addrlist = axis[axId]["cat"];
						}
						else
						{
							var series = chart["series"];
							if(series==null)
								series = chart["series"] = {};
							var serId = chartDataSeq._parent.seriesId;
							if(series[serId]==null)
								series[serId] = {};
							if(series[serId][role]==null)
							   series[serId][role] = chartDataSeq.getAddrsList();
							addrlist = series[serId][role];
						}
						var rList = chartDataSeq._refList;
						for(var j = 0; j< rList.length; j++)
						{
							if(rList[j] && rList[j].getId() == rId)
							{
								addrlist[j] = ref;
							}
						}						
					}
				}
			}
	    	for(var chartId in undoCharts)
    		{
	    		var chart = undoCharts[chartId];
	    		var settings = {};
	    		var axisMap = chart["axis"];
	    		if(axisMap!=null)
	    			settings.axis = {};
	    		for(var id in axisMap)
	    		{
	    			settings.axis[id] = {};
	    			var axis = axisMap[id];
	    			var catAddrs = axis["cat"];
	    			var ref = catAddrs.join(",");
				    if(catAddrs.length>1)
				         ref = "(" + ref + ")";
				    settings.axis[id]["cat"] = {ref: ref};
	    		}
	    		var seriesMap = chart["series"];
	    		var data = null;
	    		if(seriesMap!=null)
	    			settings.series = {};
	    		for(var id in seriesMap)
	    		{
	    			settings.series[id] = {};
	    			var data = settings.series[id].data = {};
	    			var series = seriesMap[id];
	    			for(var role in series)
	    			{    
				     var roleRefs = series[role];			
	    			 var ref = roleRefs.join(",");
				     if(roleRefs.length>1)
				         ref = "(" + ref + ")";
   				     data[role] = {ref: ref};
	    			}
	    		}
	    		var attrs = {"chartId" : chartId , "settings" : settings};
	    		var refValue = websheet.Utils.getRefValue4Chart(chartId);
	    		if(!refValue){//chart also in the sheet
	    		    var sheetName = updates[0].reference.refValue.split("|")[0];
	    			refValue = websheet.Helper.createVirtualRef(sheetName);
	    		}
	    		var event = new websheet.event.SetChart(refValue, attrs);
				var m = event.getMessage().updates[0];
				updates.push(m);
    		}
	    }
	    delete content.cRanges;
		
		var areas = content.areas;
		if(areas){
			for(var usage in areas){
				if(usage == websheet.Constant.RangeUsage.COMMENTS){
					var usageAreas = areas[usage];
				
					for(var rId in usageAreas){
						var attrs = usageAreas[rId];
						var ref = attrs.parsedref.getAddress();
						delete attrs.range;
						delete attrs.parsedref;
						var event = new websheet.event.InsertUnnameRange(ref, attrs);
						var m = event.getMessage().updates[0];
						updates.push(m);
					}
				} else if(usage == websheet.Constant.RangeUsage.NAME){
					var usageAreas = areas[usage];
				
					for(var rId in usageAreas){
						var attrs = usageAreas[rId];
						var ref = attrs.parsedref.getAddress();
						delete attrs.range;
						delete attrs.parsedref;
						var event = new websheet.event.SetRange(ref, attrs);
						var m = event.getMessage().updates[0];
						updates.push(m);
					}
				}
			}
		}
		
		var cells = content.cells;
		for(var addr in cells)
		{
			var attrs = cells[addr];
			var event = new websheet.event.SetCell(addr, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
		
		var shareRanges = content.shareRanges;
		for(var id in shareRanges)
		{
			var attrs = shareRanges[id];
			var addr = attrs.refValue;
			delete attrs.refValue;
			delete attrs.sharedRange;
			var event = new websheet.event.InsertUnnameRange(addr, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
	}
	});

dojo.declare("websheet.event.MoveSheet", [websheet.event._sheet], {
	
	constructor: function(refValue, attrs) {
		this.action = this.Event.ACTION_MOVE;
	},
	
	reverse: function (updates, content)
	{
		if(!content)
			return;
		var areas = content.areas;
		if(areas){
			for(var usage in areas){
				if(usage == websheet.Constant.RangeUsage.NAME){
					var usageAreas = areas[usage];
				
					for(var rId in usageAreas){
						var attrs = usageAreas[rId];
						var ref = attrs.parsedref.getAddress();
						delete attrs.range;
						delete attrs.parsedref;
						var event = new websheet.event.SetRange(ref, attrs);
						var m = event.getMessage().updates[0];
						updates.push(m);
					}
				}
			}
		}
		
		var cells = content.cells;
		for(var addr in cells)
		{
			var attrs = cells[addr];
			var event = new websheet.event.SetCell(addr, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
	},
	
	setData: function (data) {
	    // VERY ODD
	    this.setAttrs(data);
	}
    });

dojo.declare("websheet.event.FreezeWindow", [websheet.event._event], {
	
	constructor: function(refValue, attrs) {
		this.action = this.Event.ACTION_FREEZE;
		if(attrs.row || attrs.col){
			this.refType = this.Event.SCOPE_SHEET;
			this.refValue = refValue;
		}else{
			var parsedRef = websheet.Helper.parseRef(refValue);
			this.refType = parsedRef ? 
					((parsedRef.refMask & websheet.Constant.DEFAULT_ROWS_MASK) ==  websheet.Constant.DEFAULT_ROWS_MASK) ? this.Event.SCOPE_ROW : this.Event.SCOPE_COLUMN 
							: this.Event.SCOPE_SHEET;
		}
	},
	
	setData: function (data) {
	    this.setAttrs(data);
	}
    });

////////////////////////////////////////
//////// ROW EVENTS ////////////////////
////////////////////////////////////////

/////// BASE CLASS for ROW EVENTS //////

dojo.declare("websheet.event._row", [websheet.event._event], {

	constructor: function (refValue, attrs) {
	    this.refType = this.Event.SCOPE_ROW;
	},

	setData: function (data) {
	    data.rows = {};
	    this.setAttrs(data.rows);
	}
    });

dojo.declare("websheet.event.InsertRow", [websheet.event._row], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_INSERT;
	},
	setData: function (data)
	 {
		if(this.attrs)
		{
			data.rows = this.attrs.rows;
			data.meta = this.attrs.meta;
			data.uuid = this.attrs.uuid;
		}
	},
	reverse: function(updates, content) {
		if(!content)
			return;
		var shareRanges = content.shareRanges;
		for(var id in shareRanges)
		{
			var attrs = shareRanges[id];
			var addr = attrs.refValue;
			delete attrs.refValue;
			delete attrs.sharedRange;
			var event = new websheet.event.InsertUnnameRange(addr, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
	}
});

dojo.declare("websheet.event.SetRow", [websheet.event._row], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SET;
	},
	
	setData: function (data)
	{
		this.setAttrs(data);
	},
	
	reverse: function(updates, content)
	{
		 if(null != this.attrs.visibility ||
		 	undefined != this.attrs.visibility)
		 {
		 	updates.splice(0,updates.length);
			for(var index = 0; index < content.length; index++)
			{
				var attrs = {};
			    attrs.visibility = null;//!this.attrs.visibility; reverse the invisible to visible for hide or filter.
				if(this.attrs.visibility == websheet.Constant.ROW_VISIBILITY_ATTR.SHOW){
				    attrs.visibility = websheet.Constant.ROW_VISIBILITY_ATTR.HIDE;
				}else{
				    attrs.visibility = websheet.Constant.ROW_VISIBILITY_ATTR.SHOW;
				}
				var event = new websheet.event.SetRow(content[index],attrs);
				var m = event.getMessage().updates[0];
				updates.push(m); 
			}
		 }
		 else
		{
			 updates[0].data.rows = content.rows;
			 if(content[this.bUndoDefault])
				 updates[0].data[this.bUndoDefault] = true;
		}
	}
	});

dojo.declare("websheet.event.ClearRow", [websheet.event._row], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_CLEAR;
	},

	setData: function (data) {
	    this.setAttrs(data);
	},
	
	reverse: function(updates, content)
	{
		updates[0].data.rows = content;
//		var sheetName = this.refValue.substring(0,this.refValue.indexOf("!"));
//		var count = 0;
//		for(var rIndex in content)
//		{
//			var row = content[rIndex];
//			for(var cIndex in row.cells)
//			{
//				var cell = row.cells[cIndex];
//				var refValue = sheetName + "!" + cIndex + rIndex;
//				var event = new websheet.event.SetCell(refValue,cell); 
//				var msg = event.getMessage(); 
//				updates[count] = msg.updates[0];
//				count++;
//			}
//		}
	}
    });

dojo.declare("websheet.event.DeleteRow", [websheet.event._row], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_DELETE;
	},
    setData: function (data) {
	    this.setAttrs(data);
	},
	reverse: function(updates, content)
	{
		if(!content)
			return;
		var refValueParsedRef = websheet.Helper.parseRef(this.refValue);
		var undoRanges = {};
		var areas = content.areas;
		if(areas){
			for(var usage in areas){
				var usageAreas = areas[usage];
				if(usage == websheet.Constant.RangeUsage.FILTER){
					continue;
				}
				if(usage == websheet.Constant.RangeUsage.COMMENTS){
					for(var rId in usageAreas){
						var attrs = usageAreas[rId];
						var ref = attrs.parsedref.getAddress();
						delete attrs.range;
						delete attrs.parsedref;
						var event = new websheet.event.InsertUnnameRange(ref, attrs);
						var m = event.getMessage().updates[0];
						updates.push(m);
					}
				} else {
					for(var rId in usageAreas){
						var attrs = usageAreas[rId];
						var rangeId = attrs.rangeid;
						var ref = attrs.parsedref;/*instanceof parsedRef*/
						var deltaData = websheet.Utils.getRangeDelta(ref,refValueParsedRef,this.refType);
						deltaData.usage = attrs.usage;
						if(attrs.data)
							deltaData.data = attrs.data;
						undoRanges[rangeId] = deltaData;
					}
				}
			}
		}
				
	    updates[0].data.undoRanges = undoRanges;

		var undoCharts = {};
		ranges = content.cRanges;
	    if(ranges){
	    	for(var rId in ranges)
			{
				var attrs = ranges[rId];
				var ref = attrs.parsedref;
				var deltaData = websheet.Utils.getRangeDelta(ref,refValueParsedRef,this.refType);
				var chartDataSeqList = attrs._chartDataSeqList;
				if(chartDataSeqList){
					var length = chartDataSeqList.length;
					for(var i = 0; i < length; i++){
						var chartDataSeq = chartDataSeqList[i];
						var role = chartDataSeq.getProperty("role");
						var seqKey = role;
						var chartId = chartDataSeq.getChartId();
						if(role != "cat"){
							var seriesId = chartDataSeq._parent.seriesId;
							seqKey = role + " " + seriesId;
						}
						else
						{
							var axId = chartDataSeq._parent.id;
							seqKey = role + " " + axId;
						}
						if(!undoCharts[chartId])
							undoCharts[chartId] = {};
						
						if(!undoCharts[chartId][seqKey])
							undoCharts[chartId][seqKey] = [];
						
						var rList = chartDataSeq._refList;
						for(var j=0; j< rList.length; j++){
							if(rList[j] && rList[j].getId() == rId){
								if(undoCharts[chartId][seqKey].length < j){
									for(var k = undoCharts[chartId][seqKey].length; k< j; k++)
										undoCharts[chartId][seqKey].push(null);
								}
								if(undoCharts[chartId][seqKey].length > j)
									undoCharts[chartId][seqKey][j] = deltaData;
								else
									undoCharts[chartId][seqKey].push(deltaData);
							}
						}						
					}
				}
			}
	    }
	    delete content.cRanges;
	    updates[0].data.undoCharts = undoCharts;
		
	    if(content.freeze)
	    	updates[0].data.undoFreeze = content.freeze;
	    else
	    	updates[0].data.undoFreeze = {};
	    delete content.freeze;
	    
		var filter = content.filter;
		if(filter)
		{
			var us = filter.getMessage().updates;
			for(var i=0;i<us.length;i++)
				updates.push(us[i]);
		}
		delete content.filter;
		

		var cells = content.cells;
		for(var addr in cells)
		{
			var attrs = cells[addr];
			var event = new websheet.event.SetCell(addr, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
		
		var shareRanges = content.shareRanges;
		for(var id in shareRanges)
		{
			var attrs = shareRanges[id];
			var addr = attrs.refValue;
			delete attrs.refValue;
			delete attrs.sharedRange;
			var event = new websheet.event.InsertUnnameRange(addr, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
	}
    });

///////////////////////////////////////////////////
//////// COLUMN EVENTS ////////////////////////////
///////////////////////////////////////////////////

//////// BASE CLASS for COLUMN EVENTS ////////////

dojo.declare("websheet.event._column", [websheet.event._event], {
	
	constructor: function (refValue, attrs) {
	    this.refType = this.Event.SCOPE_COLUMN;
	},

	setData: function (data) {
	    this.setAttrs (data);
	}
});

dojo.declare("websheet.event.InsertColumn", [websheet.event._column], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_INSERT;
	},
	
	setData: function (data) {
		if (this.attrs) {
			if(this.attrs.rows)
			{
				data.rows = this.attrs.rows;
			}
			if(this.attrs.meta)
			{
				data.meta = this.attrs.meta;
			}
			if(this.attrs.columns)
			{
				data.columns = this.attrs.columns;
			}
			if(this.attrs.uuid){
			    data.uuid = this.attrs.uuid;
			}
		}
	},

	reverse: function(updates, content) {
		if(!content)
			return;
		var shareRanges = content.shareRanges;
		for(var id in shareRanges)
		{
			var attrs = shareRanges[id];
			var addr = attrs.refValue;
			delete attrs.refValue;
			delete attrs.sharedRange;
			var event = new websheet.event.InsertUnnameRange(addr, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
	}
});

dojo.declare("websheet.event.SetColumn", [websheet.event._column], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SET;
	},
	
	setData: function (data)
	{
		if(this.attrs)
		{
			var wcs = websheet.Constant.Style;
			if(this.attrs[wcs.WIDTH] !== undefined)
				data[wcs.WIDTH] = this.attrs[wcs.WIDTH];
			else if (this.attrs.style)
				data.style = this.attrs.style;
			else if(this.attrs.visibility !== undefined)
				data.visibility = this.attrs.visibility;
			if(this.attrs.columns !== undefined)
				data.columns = this.attrs.columns;
			if(this.attrs.rows !== undefined)
				data.rows = this.attrs.rows;
		}
	},
	
	reverse: function(updates, content)
	{
		if (content.rows) {
			updates[0].data.rows = content.rows;
		}
		 
		if(content[this.bUndoDefault]) {
			updates[0].data[this.bUndoDefault] = true;
		}
		
		if(content.columns)
		{
			updates[0].data.columns = content.columns;
		}	
		if (content.style) {
			updates[0].data["style"] = content.style;
		}
		
		if(this.attrs.visibility && content && content instanceof Array)
		{
			updates.splice(0,updates.length);
			var visibility = websheet.Constant.COLUMN_VISIBILITY_ATTR;
			for(var index = 0; index < content.length; index++)
			{
				var attrs = {};
			    attrs.visibility = this.attrs.visibility == visibility.SHOW ? visibility.HIDE : visibility.SHOW;
				var event = new websheet.event.SetColumn(content[index],attrs);
				var m = event.getMessage().updates[0];
				updates.push(m); 
			}
		}
	}
    });

dojo.declare("websheet.event.DeleteColumn", [websheet.event._column], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_DELETE;
	},
 	setData: function (data) {
	    this.setAttrs(data);
	},
	reverse: function(updates, content)
	{
		if(!content)
			return;
		var refValueParsedRef = websheet.Helper.parseRef(this.refValue);
		var undoRanges = {};
		var areas = content.areas;
		if(areas){
			for(var usage in areas){
				var usageAreas = areas[usage];
				if(usage == websheet.Constant.RangeUsage.FILTER){
					continue;
				}
				if(usage == websheet.Constant.RangeUsage.COMMENTS){
					for(var rId in usageAreas){
						var attrs = usageAreas[rId];
						var ref = attrs.parsedref.getAddress();
						delete attrs.range;
						delete attrs.parsedref;
						var event = new websheet.event.InsertUnnameRange(ref, attrs);
						var m = event.getMessage().updates[0];
						updates.push(m);
					}
				} else {
					for(var rId in usageAreas){
						var attrs = usageAreas[rId];
						var rangeId = attrs.rangeid;
						var ref = attrs.parsedref;/*instanceof parsedRef*/
						var deltaData = websheet.Utils.getRangeDelta(ref,refValueParsedRef,this.refType);
						deltaData.usage = attrs.usage;
						if(attrs.data)
							deltaData.data = attrs.data;
						undoRanges[rangeId] = deltaData;
					}
				}
			}
		}
		
		updates[0].data.undoRanges=undoRanges;
		
		var undoCharts = {};
		ranges = content.cRanges;
	    if(ranges){
	    	for(var rId in ranges)
			{
				var attrs = ranges[rId];
				var ref = attrs.parsedref;
				var deltaData = websheet.Utils.getRangeDelta(ref,refValueParsedRef,this.refType);
				var chartDataSeqList = attrs._chartDataSeqList;
				if(chartDataSeqList){
					var length = chartDataSeqList.length;
					for(var i = 0; i < length; i++){
						var chartDataSeq = chartDataSeqList[i];
						var role = chartDataSeq.getProperty("role");
						var seqKey = role;
						var chartId = chartDataSeq.getChartId();
						if(role != "cat"){
							var seriesId = chartDataSeq._parent.seriesId;
							seqKey = role + " " + seriesId;
						}
						else
						{
							var axId = chartDataSeq._parent.id;
							seqKey = role + " " + axId;
						}
						if(!undoCharts[chartId])
							undoCharts[chartId] = {};
						
						if(!undoCharts[chartId][seqKey])
							undoCharts[chartId][seqKey] = [];
						
						var rList = chartDataSeq._refList;
						for(var j=0; j< rList.length; j++){
							if(rList[j] && rList[j].getId() == rId){
								if(undoCharts[chartId][seqKey].length < j){
									for(var k = undoCharts[chartId][seqKey].length; k< j; k++)
										undoCharts[chartId][seqKey].push(null);
								}
								if(undoCharts[chartId][seqKey].length > j)
									undoCharts[chartId][seqKey][j] = deltaData;
								else
									undoCharts[chartId][seqKey].push(deltaData);
							}
						}						
					}
				}
			}
	    }
	    delete content.cRanges;
	    updates[0].data.undoCharts = undoCharts;
		
	    if(content.freeze)
	    	updates[0].data.undoFreeze = content.freeze;
	    else
	    	updates[0].data.undoFreeze = {};
	    delete content.freeze;
	    
		var filter = content.filter;
		if(filter)
		{
			var us = filter.getMessage().updates;
			for(var i=0;i<us.length;i++){
				us[i].data.startCol = refValueParsedRef.startCol;
				updates.push(us[i]);
			}
		}	
		delete content.filter;
		
		var cells = content.cells;
		for(var addr in cells)
		{
			var attrs = cells[addr];
			var event = new websheet.event.SetCell(addr, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
		
		var shareRanges = content.shareRanges;
		for(var id in shareRanges)
		{
			var attrs = shareRanges[id];
			var addr = attrs.refValue;
			delete attrs.refValue;
			delete attrs.sharedRange;
			var event = new websheet.event.InsertUnnameRange(addr, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
	}
	});

///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
///// UNNAME RANGE EVENTS /////////////////////////////
//////////////////////////////////////////////////////

/////// BASE CLASS for UNNAME RANGE events ////////////

dojo.declare("websheet.event._unnameRange", [websheet.event._event], {
	
	constructor: function (refValue, attrs) {
	    this.refType = this.Event.SCOPE_UNNAMERANGE;
	},

	setData: function (data) {
	    this.setAttrs (data);
	}
});

dojo.declare("websheet.event.InsertUnnameRange", [websheet.event._unnameRange], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_INSERT;
	},
	
	reverse: function(updates, content)
	{
		if(content) {
			var dvs = content.dvs;
			if(dvs && dvs.length > 0){
				for(var i = 0; i < dvs.length; i ++){
					var dv = dvs[i];
					var ref = dv.refValue;
					var dvJson = dv.data;
					var event = new websheet.event.InsertUnnameRange(ref, dvJson);
					var m = event.getMessage().updates[0];
					updates.push(m);
				}
			}
		}
	}
});

dojo.declare("websheet.event.SetUnnameRange", [websheet.event._unnameRange], {
	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SET;
	},
	
	reverse: function(updates, content)
	{
		if(content)
		{
			var mergeCells = content.mergeCells;
			if(mergeCells) {
				var len = mergeCells.length;
				for(var index = 0; index < len; index++)
				{
					var event = new websheet.event.MergeCells(mergeCells[index]);
					var m = event.getMessage().updates[0];
					updates.push(m); 
				}
			}
		}	
	},
	
	getMessage: function()
	{
		var message = this.inherited(arguments);
		var updates = this.message.updates;
		var update = updates[0];
		if(update.data)
		{
			var dvs = update.data.dvs;
			if(dvs)
			{
				for(var i = 0; i < dvs.length; i ++){
					var dv = dvs[i];
					var ref = dv.refValue;
					var dvJson = dv.data;
					var event = new websheet.event.InsertUnnameRange(ref, dvJson);
					var m = event.getMessage().updates[0];
					updates.push(m);
				}
				delete update.data.dvs;
			}
			var cmts = update.data.cmts;
			if(cmts){
				for(var i = 0; i < cmts.length; i++){
					var cmt = cmts[i];
					var ref = cmt.refValue;
					var jsonData = cmt.data;
					var event = new websheet.event.InsertUnnameRange(ref, jsonData);
					var m = event.getMessage().updates[0];
					updates.push(m);
				}
				delete update.data.cmts;
			}
			if(update.data.data)
			{
				var add = update.data.data.insert;
				if(add)
				{
					var event = new websheet.event.InsertUnnameRange(add.rangeAddr, add.attrs);
					var m = event.getMessage().updates[0];
					updates.push(m);
					delete update.data.data.insert;
				}
				var dlt = update.data.data.remove;
				if(dlt)
				{
					var event = new websheet.event.DeleteUnnameRange(dlt.rangeAddr, dlt.attrs);
					var m = event.getMessage().updates[0];
					updates.push(m);
					delete update.data.data.remove;
				}
			}	
		}
		return message;
	}
});

dojo.declare("websheet.event.ClearUnnameRange", [websheet.event._unnameRange], {

	constructor: function (refValue) {
	    this.action = this.Event.ACTION_CLEAR;
	    this.attrs = { rows: {} };
	}
});

dojo.declare("websheet.event.DeleteUnnameRange", [websheet.event._unnameRange], {

	constructor: function (refValue,attrs) {
	    this.action = this.Event.ACTION_DELETE;
	},

	reverse: function(updates, content) {
		if(content) {
			var hiddenRows = content.hiddenRows;
			if (hiddenRows && hiddenRows.length > 0) {
				// create instant filter here
				// FIXME the same logic as implemented in getReverseMsg() in Filter.js
				var rangeid = content.rangeid;
				var filterAttr = {rangeid: rangeid, col: 0, h: hiddenRows, usage: websheet.Constant.RangeUsage.FILTER};
				var event = new websheet.event.Filter(this.refValue, filterAttr); 
				var m = event.getMessage().updates[0];
				updates.push(m);
			}
			var dvs = content.dvs;
			if(dvs && dvs.length > 0){
				for(var i = 0; i < dvs.length; i ++){
					var dv = dvs[i];
					var ref = dv.refValue;
					var dvJson = dv.data;
					var event = new websheet.event.InsertUnnameRange(ref, dvJson);
					var m = event.getMessage().updates[0];
					updates.push(m);
				}
			}
		}
	}
});

dojo.declare("websheet.event.MergeCells",[websheet.event._unnameRange],{
	
	constructor: function (refValue,attrs)
	{
	    this.action = this.Event.ACTION_MERGE;
	}
});

dojo.declare("websheet.event.SplitCells",[websheet.event._unnameRange],{
	constructor: function (refValue,attrs)
	{
	    this.action = this.Event.ACTION_SPLIT;
	},
	
	reverse: function(updates,content)
	{
		var bakEvent = updates[0];
		// remove all the events in the updates
		updates.splice(0,updates.length);
		for(var index = 0; index < content.length; index++)
		{
			var event = websheet.Helper.cloneJSON(bakEvent);
			event.reference.refValue = content[index];
			updates.push(event); 
		}
	}
	
});

dojo.declare("websheet.event.SortRange", [websheet.event._unnameRange], {
	
	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SORT;
	},
	
	reverse: function(updates, content)
	{
		for(var ref in content)
		{
			var attrs = content[ref];
			var event;
			event = new websheet.event.SetCell(ref, attrs);
			var m = event.getMessage().updates[0];
			updates.push(m);
		}
	}
});

dojo.declare("websheet.event.Filter", [websheet.event._unnameRange], {
	
	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_FILTER;
	},
	
	reverse: function(updates, content)
	{
		for(var ref in content)
		{
    		var attrs = content[ref];
			var event = new websheet.event.Filter(ref, attrs); 
			var m = event.getMessage().updates[0];
			updates.push(m);
		}     
	}
});

///////////////////////////////////////////////////////
/////////IMAGE EVENTS//////////////////////////////////
/////// BASE CLASS for IMAGE events ////////////

dojo.declare("websheet.event._image", [websheet.event._event], {
	
	constructor: function (refValue, attrs) {
	    this.refType = this.Event.SCOPE_IMAGE;
	},

	setData: function (data) {
	    this.setAttrs (data);
	}
});

dojo.declare("websheet.event.InsertImage", [websheet.event._image], {
	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_INSERT;
	}
});

dojo.declare("websheet.event.SetImage", [websheet.event._image], {
	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SET;
	}
});

dojo.declare("websheet.event.DeleteImage", [websheet.event._image], {
	constructor: function (refValue,attrs) {
	    this.action = this.Event.ACTION_DELETE;
	}
});

dojo.declare("websheet.event.MoveImage", [websheet.event._image], {
	constructor: function (refValue,attrs) {
	    this.action = this.Event.ACTION_MOVE;
	}
});

////////////////////////////////////////////
/////////FRAGMENT EVENTS////////////////////
dojo.declare("websheet.event._fragment", [websheet.event._event], {

	constructor: function (refValue, attrs) {
	    this.refType = this.Event.SCOPE_FRAGMENT;
	}

    });

dojo.declare("websheet.event.SetFragment", [websheet.event._fragment], {

	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SET;
	},
	
	setData: function (data) {
	    this.setAttrs(data);
	}
    });
///////////////////////////////////////////
///////////////////////////////////////////
///// CHART EVENTS ///////////////
//////////////////////////////////////////

dojo.declare("websheet.event._chart", [websheet.event._event], {
	
	constructor: function (refValue, attrs) {
	    this.refType = this.Event.SCOPE_CHART;
	},

	setData: function (data) {
	    this.setAttrs (data);
	}
});

dojo.declare("websheet.event.SetChart", [websheet.event._chart], {
	constructor: function (refValue, attrs) {
	    this.action = this.Event.ACTION_SET;
	}
});
///////////////////////////////////////////
///////////////////////////////////////////
///// NON-OPERATION EVENTS ///////////////
//////////////////////////////////////////

dojo.declare("websheet.event.Lock", [websheet.event._event], {

	constructor: function (refValue) {
	    this.refType = this.Event.LOCK;
	    this.action = this.Event.LOCK;
	}
    });

dojo.declare("websheet.event.Release", [websheet.event._event], {

	constructor: function (refValue) {
	    this.refType = this.Event.RELEASE;
	    this.action = this.Event.RELEASE;
	}
    });

//////////////////////////////////////////////////////
/////////////////////////////////////////////////////
///////// Reverse Event /////////////////////////////
/////////////////////////////////////////////////////

dojo.declare("websheet.event.Reverse", null, {
	event: null, // source

	action: null,
	refType: null,
	attrs: null,

	message: null,

	reverseContent: null, // content being used to create additional updates (option)

	Event: websheet.Constant.Event,

	constructor: function(event, refValue, attrs, reverseContent) {
	    this.event = event;
	    this.refType = event.refType;
	    this.refValue = refValue;
	    // the delete action(reverse is insert) may contain huge attrs, 
	    // do not clone it
	    if(event.action == this.Event.ACTION_DELETE)
	    	this.attrs = attrs;
	    else
	    	this.attrs = websheet.Helper.cloneJSON(attrs);
	    this.reverseContent = reverseContent;

	    switch (event.action) {
	    case this.Event.ACTION_INSERT:
	    	this.action = this.Event.ACTION_DELETE;
	    	break;
	    case this.Event.ACTION_DELETE:
	    	this.action = this.Event.ACTION_INSERT;
	    	break;
	    case this.Event.ACTION_CLEAR:
	    	this.action = this.Event.ACTION_SET;
	    	break;
		case this.Event.ACTION_MERGE:
			this.action = this.Event.ACTION_SET;//set unname range, so that to recover the covered cell value/style
			break;
		case this.Event.ACTION_SPLIT:
			this.action = this.Event.ACTION_MERGE;
			break;
	    default:
	    	this.action = event.action;
			break;
	    }
	},

	getMessage: function() {
	    if (this.message) return this.message;

	    var e = null;

	    switch (this.refType) {
	    case this.Event.SCOPE_CELL: 
	    	if (this.action == this.Event.ACTION_SET)
	    		e = new websheet.event.SetCell(this.refValue, this.attrs);
	    	break;
	    case this.Event.SCOPE_ROW:
	    	if (this.action == this.Event.ACTION_INSERT)
	    		e = new websheet.event.InsertRow(this.refValue, this.attrs);
	    	else if (this.action == this.Event.ACTION_DELETE)
	    		e = new websheet.event.DeleteRow(this.refValue);
	    	else if (this.action == this.Event.ACTION_SET)
	    		e = new websheet.event.SetRow(this.refValue, this.attrs);
	    	else if (this.action == this.Event.ACTION_CLEAR)
	    		e = new websheet.event.SetRow(this.refValue);
	    	break;
	    case this.Event.SCOPE_COLUMN:
	    	if (this.action == this.Event.ACTION_INSERT)
	    		e = new websheet.event.InsertColumn(this.refValue, this.attrs);
	    	else if (this.action == this.Event.ACTION_DELETE)
	    		e = new websheet.event.DeleteColumn(this.refValue);
	    	else if (this.action == this.Event.ACTION_SET)
	    		e = new websheet.event.SetColumn(this.refValue, this.attrs);
	    	break;
	    case this.Event.SCOPE_SHEET:
	    	if (this.action == this.Event.ACTION_MOVE)
	    		e = new websheet.event.MoveSheet(this.refValue, this.attrs);
	    	else if (this.action == this.Event.ACTION_SET)
	    		e = new websheet.event.SetSheet(this.refValue, this.attrs);
	    	else if (this.action == this.Event.ACTION_INSERT)
	    		e = new websheet.event.InsertSheet(this.refValue, this.attrs);
	    	else if (this.action == this.Event.ACTION_DELETE)
	    		e = new websheet.event.DeleteSheet(this.refValue, this.attrs);
	    	break;
		case this.Event.SCOPE_UNNAMERANGE:
			if (this.action == this.Event.ACTION_SORT)
				e = new websheet.event.SortRange(this.refValue, this.attrs);		
			else if (this.action == this.Event.ACTION_FILTER)
				e = new websheet.event.Filter(this.refValue, this.attrs);					
			else if (this.action == this.Event.ACTION_INSERT)
				e = new websheet.event.InsertUnnameRange(this.refValue, this.attrs);
			else if (this.action == this.Event.ACTION_DELETE)
				e = new websheet.event.DeleteUnnameRange(this.refValue, this.attrs);
			else if (this.action == this.Event.ACTION_SET)
				e = new websheet.event.SetUnnameRange(this.refValue, this.attrs);
			else if (this.action == this.Event.ACTION_CLEAR)
				e = new websheet.event.SetUnnameRange(this.refValue);
			else if (this.action == this.Event.ACTION_MERGE)
				e = new websheet.event.MergeCells(this.refValue);
			else if (this.action == this.Event.ACTION_SPLIT)
				e = new websheet.event.SplitCells(this.refValue);
			break;
		case this.Event.SCOPE_RANGE:
			if (this.action == this.Event.ACTION_SET)
				e = new websheet.event.SetRange(this.refValue, this.attrs);
			else if (this.action == this.Event.ACTION_INSERT)
				e = new websheet.event.InsertRange(this.refValue, this.attrs);
			else if (this.action == this.Event.ACTION_DELETE)
				e = new websheet.event.DeleteRange(this.refValue, this.attrs);
			break;
		case this.Event.SCOPE_IMAGE:
			if (this.action == this.Event.ACTION_SET)
				e = new websheet.event.SetImage(this.refValue, this.attrs);
			else if (this.action == this.Event.ACTION_INSERT)
				e = new websheet.event.InsertImage(this.refValue, this.attrs);
			else if (this.action == this.Event.ACTION_MOVE)
				e = new websheet.event.MoveImage(this.refValue, this.attrs);
			else if (this.action == this.Event.ACTION_DELETE)
				e = new websheet.event.DeleteImage(this.refValue, this.attrs);
			break;
		case this.Event.SCOPE_CHART:
			if (this.action == this.Event.ACTION_SET)
				e = new websheet.event.SetChart(this.refValue, this.attrs);
			break;
	    default:
		// wont create reverse event here
	    	break;
	    }
	    
	    if (!e) return null;

	    this.message = e.getMessage();
	    if (this.reverseContent)
	    	this.event.reverse(this.message.updates, this.reverseContent);

	    return this.message;
	}
    });