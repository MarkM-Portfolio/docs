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
dojo.provide("websheet.event.undo.ChartEvents");
dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.Event");

dojo.declare("websheet.event.undo.SetChartEvent",[websheet.event.undo.Event], {	
	axisRefIds: null,
	seriesRefIds: null,
	axisRefAddrs: null,
	seriesRefAddrs: null,
	
	constructor: function(jsonEvent)
	{
		dojo.mixin(this, jsonEvent);		
	
		if(this.data && this.data.settings)
			this.transformData2Id();
	},
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Id: function()
	{
		var series = this.data.settings.series;
		var axis = this.data.settings.axis;
		var msgTransformer = this.getMsgTransformer();
		if(series){
			this.seriesRefIds = {};
			this.seriesRefAddrs = {};
			for(var serId in series){
				var ser = series[serId].data;
				if(ser){
					var serIds = {};
					var serAddrs = {};
					for(var role in ser)
					{
						var val = ser[role];
						if(val && val.ref){
							var _rangeIds = [];
							var addrs = websheet.Helper.getRanges(val.ref);
							for(var k = 0; k < addrs.length; k++){
								var parsedRef = websheet.Helper.parseRef(addrs[k]);
								if(parsedRef && parsedRef.isValid()){
									var range = new websheet.event.undo.Range(addrs[k],null,this._idManager);
									var _rangeId = msgTransformer.addRange(range,this.bTrans);
									 _rangeIds.push(_rangeId);
								}else
									_rangeIds.push(null);
							}
							if(_rangeIds.length > 0){
								serIds[role] = _rangeIds;
								serAddrs[role] = addrs;
							}
						}
					}
					this.seriesRefIds[serId] = serIds;
					this.seriesRefAddrs[serId] = serAddrs;
				}				
			}
		}
		if(axis){
			this.axisRefIds = {};
			this.axisRefAddrs = {};
			for(var axisId in axis){
				var cat = axis[axisId].cat;
				if(cat && cat.ref){
					var _rangeIds = [];
					var addrs = websheet.Helper.getRanges(cat.ref);
					for(var k = 0; k < addrs.length; k++){
						var parsedRef = websheet.Helper.parseRef(addrs[k]);
						if(parsedRef && parsedRef.isValid()){
							var range = new websheet.event.undo.Range(addrs[k],null,this._idManager);
							var _rangeId = msgTransformer.addRange(range,this.bTrans);
							 _rangeIds.push(_rangeId);
						}else
							_rangeIds.push(null);
					}
					if(_rangeIds.length > 0){
						this.axisRefIds[axisId] = _rangeIds;
						this.axisRefAddrs[axisId] = addrs;
					}
				}
			}
		}
	},
	/*
	 * transform index -> id for data in the josn event
	 */
	transformData2Index: function()
	{
		if(this.data && this.data.settings){
			var msgTransformer = this.getMsgTransformer();
			var msgRangeList = msgTransformer.getRangeList(this.bTrans);
			if(this.seriesRefIds){
				var series = this.data.settings.series;
				for(var serId in this.seriesRefIds){
					var ser = series[serId].data;
					var serIds = this.seriesRefIds[serId];
					var serAddrs = this.seriesRefAddrs[serId];
					for(var role in serIds){
						var rangeIds = serIds[role];
						var addrs = serAddrs[role];
						if(addrs){
					    	var addr = websheet.Utils.getAddr(addrs, rangeIds, msgRangeList);
					    	if(addr.length > 0)
					    		ser[role].ref = addr;
					    }
					}
				}
			}
			if(this.axisRefIds){
				var axis = this.data.settings.axis;
				for(var axisId in this.axisRefIds){
					var cat = axis[axisId].cat;
					var rangeIds = this.axisRefIds[axisId];
					var addrs = this.axisRefAddrs[axisId];
					if(addrs){
				    	var addr = websheet.Utils.getAddr(addrs, rangeIds, msgRangeList);
				    	if(addr.length > 0)
				    		cat.ref = addr;
				    }
				}
			}
		}
		return this.data;
	},
	
	clear: function()
	{
		var rangeList = this.getMsgTransformer().getRangeList(this.bTrans);
		if(this.seriesRefIds){
			for(var serId in this.seriesRefIds){
				var serIds = this.seriesRefIds[serId];
				if(serIds){
					for(var role in serIds){
						var rangeIds = serIds[role];
						if(rangeIds){
							for(var i = 0; i < rangeIds.length; i++){
								var rangeId = rangeIds[i];
								if(rangeId){
									var range = rangeList.getRange(rangeId);
									if(range) rangeList.deleteRange(range);
								}
							}
						}
					}
				}
			}
		}
		if(this.axisRefIds){
			for(var axisId in this.axisRefIds){
				var rangeIds = this.axisRefIds[axisId];
				if(rangeIds){
					for(var i = 0; i < rangeIds.length; i++){
						var rangeId = rangeIds[i];
						if(rangeId){
							var range = rangeList.getRange(rangeId);
							if(range) rangeList.deleteRange(range);
						}
					}
				}
			}
		}
	}
});
