dojo.provide("websheet.model.chart.Chart");
dojo.require("concord.chart.controller.Chart");

dojo.declare("websheet.model.chart.Chart",[concord.chart.controller.Chart],{
	
	sheetDoc: null,
	isCalcing: false,
	_bPR: false,       //partial chart data source is loaded
	
	constructor: function(chartId, doc)
	{
		this.sheetDoc = doc;
	},
	
	loadFromJson: function(content)
	{
		if(content.bPR)
            this._bPR = true;
		
		this.inherited(arguments);
	},
	
	render: function()
	{
		var unsupported = this.getUnsupportedType();
		if(unsupported!=null)
		{
			this.showMsg(dojo.string.substitute(this.nls.UNSUPPORTED_CHART,[unsupported]));
			return;
		}
		
		if(this._bPR)
		{
			var method = dojo.hitch(this, "render");
			this.sheetDoc._partialMgr.addNotify(method);
			return;
		}
			
		var dataSeqList = this.getDataSequenceList();
   		var dataDirty = false;
   		var dpNum = 0;
   		for(var i=0;i<dataSeqList.length;i++)
		{
			var seq = dataSeqList[i];
			if(seq.isDirty())
				dataDirty = true;
			if(seq.getProperty("role")=="yVal")
				dpNum += seq.getDataPointNumber();
		}
   		if(dpNum > this._dataPointsLimit)
   		{
   			this.detroyView();
   			this.showMsg(this._tooManyPointsMsg);
   			return;
   		}
   		
   		if(!dataDirty)
   			return this.inherited(arguments);
   		
   		var controller = this.sheetDoc.controller;
		//partial load all the ranges in chart data source
   		if(this.checkData)
   		{
       		var sheetNames = {};
       		for(var i=0;i<dataSeqList.length;i++)
			{
				var seq = dataSeqList[i];
				for(var j=0;j<seq._refList.length;j++)
				{
					var ref = seq._refList[j];
					if(!ref || !ref.isValid())
						continue;
					var rangeInfo = ref._getRangeInfo();
					sheetNames[rangeInfo.sheetName] = rangeInfo.sheetName;
				}
			}
       		var hasUnLoad = false;
       		for(var s in sheetNames)
       		{           			
				var bRet = controller && controller.getPartial(s);
				if(bRet)
					hasUnLoad = true;
			}
       		this.checkData = false;
       		
       		if(hasUnLoad)
       		{
       			var method = dojo.hitch(this, "render");
       			this.sheetDoc._partialMgr.addNotify(method);
       			return;
       		}
   		}
   		
   		var n = 0;
   		var reflist = [];
		for(var i=0;i<dataSeqList.length;i++)
		{
			var seq = dataSeqList[i];
			if(!seq.prepareData())
			{
				for(var j=0;j<seq._refList.length;j++)
				{
					var ref = seq._refList[j];
					if(ref)
					{
    					var rangeInfo = ref._getRangeInfo();
    					if(!rangeInfo.calc){
	    					rangeInfo.calc = 0;
//	    					rangeInfo.sheetId = ref._sheetId;//TODO: should use sheetName
	    					reflist[n] = rangeInfo;
	    					n++;
    					}
					}
				}
			}
		}
		
		//var pcm = new websheet.model.PartialCalcManager({controller: controller});
		var pcm = this.sheetDoc._mhelper.getPartialCalcManager();
		var tm = this.sheetDoc._taskMgr;
		
		for(var i=0;i<n;i++)
		{
			var callback = dojo.hitch(this,"_setStatus",reflist,i);
			tm.addTask(pcm, "startWithCondition", [reflist[i],callback], tm.Priority.UserOperation);
			tm.start();
		}
		
		if(n>0)
		{
			this.isCalcing = true;
			return;
		}
   		
		this.inherited(arguments);
	},
	
	_setStatus : function(reflist,i)
	{
		if(!this.isCalcing)//the chart has already finished the calculation
			return;
		reflist[i].calc = 1;
		for(var t=0;t<reflist.length;t++)
		{
			if(reflist[t].calc!=1)
				return;
		}
		this.render();
		this.isCalcing = false;
	}
	
});