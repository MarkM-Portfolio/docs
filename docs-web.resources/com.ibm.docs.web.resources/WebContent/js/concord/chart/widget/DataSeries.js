/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.require("concord.chart.widget.DropDownButton");
dojo.provide("concord.chart.widget.DataSeries");
dojo.require("concord.chart.config.DefaultSettings");
dojo.require("concord.util.BidiUtils");

dojo.declare("concord.chart.widget.DataSeries", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("concord.chart.widget", "templates/DataSeries.html"),
	
	onChange: function(settings) {},
	onKeypress: function(){},
	onError: function(){},
	
	focusSeries: null,
	focusSeriesId: null,
	catAxisId: null,
	allChanges: null,
	focusRole: null,
	lastFocus: null,
	
	bMS: true,
	chart: null,
	dlg: null,
	errorMap:{"label":16, "xVal": 32, "yVal": 64, "cat": 128},
	errorCode: 0,
	_oriValue: null,
	_defaultSettings: concord.chart.config.DefaultSettings,
	defaultFocus: "label",
	
	constructor: function() 
	{
		this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartPropDlg");
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		dijit.setWaiState(this.series_list_btn.focusNode,"label",this.nls.selectSeries);
		dijit.setWaiState(this.label,"label",this.nls.label);
		dijit.setWaiState(this.xVal,"label",this.nls.xVal);
		dijit.setWaiState(this.cat,"label",this.nls.cat);
		
		//dojo.style(this.series_list_btn.containerNode, {"backgroudColor":"#ccc","maxWidth": "230px", "minWidth":"30px","textAlign":"left"});
		dojo.style(this.series_list_btn.titleNode, {"backgroudColor":"#ccc"});
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.series_list_btn.dropDown = new dijit.Menu({baseClass: "chartdropmenu",id:"S_d_ChartProp_d_series",dir: dirAttr});
		dojo.addClass(this.series_list_btn.containerNode,"buttonLabelTruncate");

		var popupmenu = dijit.byId("S_d_ChartProp_d_series");
		this.connect(popupmenu,"onOpen",dojo.hitch(this,function()
		{
			if(popupmenu.domNode.parentNode.clientHeight+10 > popupmenu.domNode.clientHeight)
				dojo.style(popupmenu.domNode,"paddingRight","0");
			else
				dojo.style(popupmenu.domNode,"paddingRight","10px");
		}));
		
		this.connect(popupmenu,"onItemClick",dojo.hitch(this,function(evt)
		{
			if (BidiUtils.isBidiOn()){
				dojo.attr(this.series_list_btn.domNode, "dir", (this.bidiTextDir == 'auto') ? BidiUtils.calculateDirForContextual(evt.label) : this.bidiTextDir);
			}
		}));
		this.connect(this.label, "onblur", dojo.hitch(this,function()
		{
			if(!this._changed){
				this._validationCheck("label");
			}
			this._changed = false;
		}));
		this.connect(this.yVal, "onblur", dojo.hitch(this,function()
		{
			if(!this._changed){
				this._validationCheck("yVal");
			}
			this._changed = false;
		}));
		this.connect(this.xVal, "onblur", dojo.hitch(this,function()
		{	if(!this._changed){		
				this._validationCheck("xVal");
			}
			this._changed = false;
		}));
		this.connect(this.cat, "onblur", dojo.hitch(this,function()
		{
			if(!this._changed){
				this._validationCheck("cat");
			}
			this._changed = false;
		}));
		
		this.connect(this.label, "onchange", dojo.hitch(this,function()
		{
			this._applyValue("label");
			this._changed = true;
		}));
		this.connect(this.label, "onkeyup", dojo.hitch(this,function()
		{
			var textDir = this.bidiTextDir;
			if (this.allChanges.bidi && this.allChanges.bidi.textDir)
				textDir = this.allChanges.bidi.textDir;
			this.onTextDirChange(textDir);
		}));

		this.connect(this.yVal, "onchange", dojo.hitch(this,function()
		{
			this._applyValue("yVal");
			this._changed = true;
		}));
		this.connect(this.xVal, "onchange", dojo.hitch(this,function()
		{
			this._applyValue("xVal");						
			this._changed = true;
		}));
		this.connect(this.cat, "onchange", dojo.hitch(this,function()
		{
			this._applyValue("cat");
			this._changed = true;
		}));
		
		this.connect(this.label,"onkeypress", dojo.hitch(this,function(e)
		{
			if((this.errorCode &(~this.errorMap["label"])) == 0)
				this.onKeypress(e, true);
			else
				this.onKeypress(e);
		}));
		this.connect(this.xVal,"onkeypress", dojo.hitch(this,function(e)
		{
			if((this.errorCode &(~this.errorMap["xVal"])) == 0)
				this.onKeypress(e, true);
			else
				this.onKeypress(e);
		}));
		this.connect(this.yVal,"onkeypress", dojo.hitch(this,function(e)
		{
			if((this.errorCode &(~this.errorMap["yVal"])) == 0)
				this.onKeypress(e, true);
			else
				this.onKeypress(e);
		}));
		this.connect(this.cat,"onkeypress", dojo.hitch(this,function(e)
		{
			if((this.errorCode &(~this.errorMap["cat"])) == 0)
				this.onKeypress(e, true);
			else
				this.onKeypress(e);
		}));
		
		this.connect(this.label,"onfocus", dojo.hitch(this,function()
		{
			this.focusRole = "label";
			this.lastFocus = null;
			this.dlg.highlightAddress(this.label.value);
		}));
		this.connect(this.xVal,"onfocus", dojo.hitch(this,function()
		{
			this.focusRole = "xVal";
			this.lastFocus = null;
			this.dlg.highlightAddress(this.xVal.value);
		}));
		this.connect(this.yVal,"onfocus", dojo.hitch(this,function()
		{
			this.focusRole = "yVal";
			this.lastFocus = null;
			this.dlg.highlightAddress(this.yVal.value);
		}));
		this.connect(this.cat,"onfocus", dojo.hitch(this,function()
		{
			this.focusRole = "cat";
			this.lastFocus = null;
			this.dlg.highlightAddress(this.cat.value);
		}));
	},
	
	_getOriValue: function()
	{
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", pe.scene.getLocale());
		var separator = bundle["decimal"]=="," ? ";" : ",";
		var val;
		if(this.focusRole != "cat"){	  
			var val = this.focusSeries.getRoleInfo(this.focusRole,this.bMS,separator, true);			
			if(dojo.isArray(val)){
				val = val.join(separator);
				if(this.focusRole == "label")
					val = '"' + val + '"';
				else
					val = "{" + val + "}";
			}
			if(val == null)
				val = "";
		}else{
			var catAxis = this.focusSeries.parent.getCatAxis();
			if(catAxis!=null)
			{
				var seq = catAxis.categorySeq;
				if(seq==null)
					val = "";
				else{
					var addr = seq.getAddress(this.bMS,separator, true);
					if(addr)
					{
						if(addr == "#MULT")
							val = "";
						else
							val = addr;
					}
					else{
						var catInfo = seq.getData();
						var info = "{";
						for(var i=0;i<catInfo.length;i++)
						{
							var v = catInfo[i];
							if(typeof v != "number")
								v = '"' + v + '"';
							info += v;
							if(i<catInfo.length-1)
								info += separator;
						}
						info += "}";
						val =  info;
					}
				}
			}
		}
		return val;
	},
	
	_prepareSeriesData: function()
	{
		var seriesList = this.allChanges.series;
		if(!seriesList)
			seriesList = this.allChanges.series = {};
		var series = seriesList[this.focusSeriesId];
		if(!series)
			series = seriesList[this.focusSeriesId] = {};
		if(!series.data)
			series.data = {};
		return series.data;
	},
	
	_prepareAxis: function()
	{
		if(!this.catAxisId)
			return null;
		var axes = this.allChanges.axis;
		if(!axes)
			axes = this.allChanges.axis = {};
		var axis = axes[this.catAxisId];
		if(!axis)
			axis = axes[this.catAxisId] = {};
		return axis;
	},	
	
	_removeAxisChange: function()
	{
		if(!this.catAxisId)
			return;
		var axes = this.allChanges.axis;
		if(!axes)
			return;
		var axis = axes[this.catAxisId];
		if(!axis)
			return;
		delete axis.cat;
		if(Object.keys(axis).length == 0)
			delete axes[this.catAxisId];
		if(Object.keys(axes).length == 0)
			delete this.allChanges.axis;
	},
	
	_removeSeriesChange: function(type)
	{
		var seriesList = this.allChanges.series;
		if(!seriesList)
			return;
		var series = seriesList[this.focusSeriesId];
		if(!series)
			return;
		var seriesData = series.data;
		if(!seriesData)
			return;
		
		delete seriesData[type];
		if(Object.keys(seriesData).length == 0)
			delete series.data;
		
		if(Object.keys(series).length == 0)
			delete  seriesList[this.focusSeriesId];	
		
		if(Object.keys(seriesList).length == 0)
			delete  this.allChanges.series;
	},
	
	_getChangedValue: function(role)
	{
		if(role == "cat"){
			if(!this.catAxisId)
				return null;
			var axes = this.allChanges.axis;
			if(!axes)
				return null;
			var axis = axes[this.catAxisId];
			if(!axis)
				return null;
			var cat = axis.cat;
			if(!cat)
				return null;
			if("ref" in cat)
				return this.chart.getDataProvider().address4Dlg(cat.ref);//true mean ods
			if("cache" in cat)
				return cat.cache.pts;
			return "";
		}else{
			var seriesList = this.allChanges.series;
			if(!seriesList)
				return null;
			var series = seriesList[this.focusSeriesId];
			if(!series)
				return null;
			var data = series.data;
			if(!data)
				return null;
			if(role in data)
			{
				var tmp = data[role];
				if(!tmp)
					return "";
				
				if("v" in tmp)
					return tmp.v;
				if("ref" in tmp)
				{					
					return this.chart.getDataProvider().address4Dlg(tmp.ref);
				}					
				if("cache" in tmp)
					return tmp.cache.pts;
				
				return "";
			}
			return null;
		}			
	},
	
	_validationCheck: function(type)
	{
//		var oriVal = this._getOriValue();
//		if(oriVal == this[type].value){
//			this.errorCode = this.errorCode &(~this.errorMap[type]);
//			if(this.errorCode == 0){
//				this.series_list_btn.setDisabled(false);
//				this.dlg.setWarningMsg("");
//			}
//			if(type == "cat")
//				this._removeAxisChange();
//			else
//				this._removeSeriesChange(type);
//			return null;
//		}
    	
    	var validRes = null;
    	try
    	{
    		validRes = this.chart.getDataProvider().parseData(this[type].value,type);
    	}
    	catch(e)
    	{
    		var errType = type;
    		if(errType=="yVal" && this.focusSeries.getType()!="scatter")
    			errType = "val";
    		this.dlg.setWarningMsg(this.nls[e]);
    		this.onError(e);
    	}
		if(validRes == null)
		{
			this.errorCode = this.errorCode | this.errorMap[type];
			this.series_list_btn.setDisabled(true);
			dijit.setWaiState(this[type], "invalid", true);
			return null;
    	}else{
    		this.errorCode = this.errorCode &(~this.errorMap[type]);
    		dijit.setWaiState(this[type], "invalid", false);
			if(this.errorCode == 0){
				this.series_list_btn.setDisabled(false);
				this.dlg.setWarningMsg("");
			}
    		return validRes;
    	}
		return null;
	},
	
    _applyValue: function(type)
    {
    	var validRes = this._validationCheck(type);
    	if(validRes != null)
		{			
			if(type == "cat"){
				var axis = this._prepareAxis();
				if(axis)
				{
					axis.cat = validRes;
					
					//For preview
					var settings = {axis:{}};
					var _axis = settings.axis[this.catAxisId] = {};
					_axis.cat = validRes;
					this.onChange(settings);
				}
			}
			else{
				var seriesData = this._prepareSeriesData();
				seriesData[type] = validRes;
				
				//For preview
				var settings = {series:{}};
				var series = settings.series[this.focusSeriesId] = {};
				series.data = {};
				series.data[type] = validRes;
				this.onChange(settings);
			}
			this.dlg.highlightAddress(this[type].value);
		}
    },

	updateAddress: function(address)
	{
		if(this.focusRole)
		{
			this[this.focusRole].focus();
			var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", pe.scene.getLocale());
			var separator = bundle["decimal"]=="," ? ";" : ",";
			var newValue;

			if(this._oriValue == null){
				var tmp = this[this.focusRole].value;
				if(tmp){
					this._selection = this._selection ? this._selection : this._getInputTextSelectionPositon(this[this.focusRole]);
					if((this._selection.start > 0 &&  tmp[this._selection.start - 1] == separator) || (this._selection.start == 1 && tmp[this._selection.start - 1] == "("))
						this._oriValue = tmp;
				}
			}
			if(this._oriValue  && this._selection){
				var length = this._oriValue.length;
		        latterStr = this._oriValue.slice(this._selection.end,length);
		        preStr = this._oriValue.slice(0,this._selection.start);
		        newValue = preStr + address + latterStr;
			}else
				newValue = address;

			this[this.focusRole].value = newValue;
			if((this.errorCode &(~this.errorMap[this.focusRole])) == 0)
				this.dlg._reset();
		}
	},
	
	applyAddressOnMouseUp: function()
	{
		if(this.focusRole)
			this._applyValue(this.focusRole);
		this._oriValue = null;
		this._selection = null;
	},

    /*
	 * for the tag "input" element of the dom node,
	 * return the selection start and end
	 */
	_getInputTextSelectionPositon: function(inputText)
	{
		var selection = {};
		var start=0;
		var end=0;
		try{
			if(dojo.isIE && dojo.isIE < 10)
			{
				inputText.focus();										
				var sTextRange = document.selection.createRange();
				var sTextLength = sTextRange.text.length;

				sTextRange.setEndPoint("StartToStart",inputText.createTextRange()); 
				
				if(0 == sTextLength)
				{
					start = sTextRange.text.length;
					end = start;
				}
				else
				{
					end = sTextRange.text.length;
					start = end - sTextLength;
				}						
			}
			else// if(dojo.isFF || dojo.isSafari)
			{
				start = inputText.selectionStart;
				end = inputText.selectionEnd;
			}
		}catch(e)
		{
			console.log("selection err: " + e);
		}

		selection.start = start;
		selection.end = end;
		return selection;
	},	
	
	setState: function(chart, allChanges, dlg)
	{
		this.errorCode = 0;
		this.series_list_btn.setDisabled(false);
		this.chart = chart;
		this.dlg = dlg;
		this.series_list_btn.dropDown.destroyDescendants();
		this.allChanges = allChanges;
		var allSeriesState = chart._viewAdapter.getAllSeriesState();
		
		var allSeries = chart._diagram.allSeries;
		this.seriesString = "";
		
		var plots = chart._diagram.plotArea.plots;
		if(plots.length==1 && this._defaultSettings.supportedTypes[plots[0].type]=="pie")
		{
			this.defaultFocus = "yVal";
			dojo.style(this.series_list,"display","none");
			dojo.style(this.nameDiv,"display","none");
			var focusSeries = allSeries[plots[0].seriesList[0]];
			if(!focusSeries || focusSeries.hide)
				return false;
			
			this.focusSeriesId = focusSeries.seriesId;
			this.focusSeries = focusSeries;
			this._setState(focusSeries, "1");
		}
		else
		{
			this.defaultFocus = "label";
			if(allSeriesState.length==0)
				return false;
			
			dojo.style(this.series_list,"display","");
			dojo.style(this.nameDiv,"display","");
			var first = allSeriesState[0];
			var focusSeries = allSeries[first.id];
			this.focusSeriesId = focusSeries.seriesId;
			this.focusSeries = focusSeries;
			this._setState(focusSeries, first.name);
			var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
			for(var i=0;i<allSeriesState.length;i++)
			{
				var state = allSeriesState[i];
				this.seriesString += state.name + "<br>";
				var item = new dijit.MenuItem({label:state.name + '', dir: dirAttr});
				dijit.setWaiState(item.domNode,"label",state.name);
				this.connect(item,"onClick", dojo.hitch(this,function(state)
				{
					var focusSeries = allSeries[state.id];
					this.focusSeriesId = focusSeries.seriesId;
					this.focusSeries = focusSeries;
					this._setState(focusSeries, state.name);
				},state));
				if (BidiUtils.isBidiOn()){
					dojo.attr(item, "dir", this.bidiTextDir);
				}
					
				this.series_list_btn.dropDown.addChild(item);
			}
			if (BidiUtils.isBidiOn()){
				dojo.attr(this.series_list_btn.domNode, "dir", this.bidiTextDir);
			}
			this.connect(this.series_list_btn.dropDown,"onChange", dojo.hitch(this,function(e)
			{
				setTimeout(dojo.hitch(this,function(){
					this.label.focus();
				}));				
			}));			
		}
		
		this.series_list_btn.openDropDown();
		var popupmenu = dijit.byId("S_d_ChartProp_d_series");
		this.seiresBtnWidth = popupmenu.domNode.clientWidth - 20;
		this.series_list_btn.toggleDropDown();
		return true;
	},
	
	_setState: function(series, name)
	{
		var locale =  pe.scene.getLocale();
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number",locale);
		var decimal = bundle["decimal"];
		var separator = decimal=="," ? ";" : ",";
		
		this.series_list_btn.setLabel(name);
		var type = series.getType();		
		
		var label = this._getChangedValue("label");
		if(label === null)			
			label = series.getRoleInfo("label",this.bMS,separator, true);
		
		if(dojo.isArray(label))
			label = label.join(separator);
		if(label==null)
			label = "";
		
		this.label.value = label;
		if (BidiUtils.isBidiOn()){
			dojo.attr(this.label, "dir", this.bidiTextDir);
		}
		this[this.defaultFocus].focus();
		
		var yVal = this._getChangedValue("yVal");
		if(yVal === null)			
			yVal = series.getRoleInfo("yVal",this.bMS,separator, true);
		
		if(dojo.isArray(yVal))
		{
			yVal = "{" + yVal.join(separator) + "}";
			yVal = yVal.replace(/\./g, decimal);
		}
		
		this.yVal.value = yVal;
		
		var catAxis = series.parent.getCatAxis();
		if(catAxis!=null)
		{
			dojo.style(this.catDiv,"display","");
			this.catAxisId = catAxis.id;
			var cat = this._getChangedValue("cat");
			if(cat === null)
			{
				var seq = catAxis.categorySeq;
				if(seq==null)
					cat = "";
				else
				{
					var addr = seq.getAddress(this.bMS,separator, true);
					if(addr)
					{
						if(addr == "#MULT")
							cat = "";
						else
							cat = addr;
					}
					else
					{
						var catInfo = seq.getData();
						var info = "{";
						for(var i=0;i<catInfo.length;i++)
						{
							var v = catInfo[i];
							if(typeof v != "number")
								v = '"' + v + '"';
							else
								v = (v+"").replace(/\./g, decimal);
							info += v;
							if(i<catInfo.length-1)
								info += separator;
						}
						info += "}";
						cat =  info;
					}
				}
			}else{
				if(dojo.isArray(cat))
					cat = "{" + cat.join(separator) + "}";
			}
			this.cat.value = cat;
		}
		else
		{
			this.catAxisId = null;
			dojo.style(this.catDiv,"display","none");
		}
		
		if(type=="scatter"){
			this.valLabel.innerHTML = this.nls.yVal;
			dijit.setWaiState(this.yVal,"label",this.nls.yVal);
			dojo.style(this.xValDiv,"display","");
			var xVal = this._getChangedValue("xVal");
			if(xVal === null)
				xVal = series.getRoleInfo("xVal",this.bMS,separator, true);
			
			if(dojo.isArray(xVal))
			{
				xVal = '{' + xVal.join(separator) + '}';
				xVal = xVal.replace(/\./g, decimal);
			}
			if(xVal==null)
				xVal = "";
			
			this.xVal.value = xVal;
		}else{
			dojo.style(this.xValDiv,"display","none");
			this.valLabel.innerHTML = this.nls.val;
			dijit.setWaiState(this.yVal,"label",this.nls.val);
		}
	},
	
	reset: function()
	{
		this.series_list_btn.containerNode.style.cssText = "backgroudc-olor:#ccc;max-width:210px;min-width:50px;";
		var label = this.series_list_btn.label;
		this.series_list_btn.setLabel(this.seriesString);
		dojo.style(this.series_list_btn.containerNode,{"width":this.series_list_btn.containerNode.clientWidth + "px"});
		this.series_list_btn.setLabel(label);
		
		if(this.errorCode & this.errorMap["label"])
			this.label.focus();
		else if(this.errorCode & this.errorMap["xVal"])
			this.xVal.focus();
		else if(this.errorCode & this.errorMap["yVal"])
			this.yVal.focus();
		else if(this.errorCode & this.errorMap["cat"])
			this.cat.focus();			
		else this[this.defaultFocus].focus();
	},
	setBidiTextDir: function (dir)
	{
		this.bidiTextDir = dir;
	},
	onTextDirChange: function(newTextDir) {
		if (!BidiUtils.isBidiOn())
			return;
		this.bidiTextDir = newTextDir;
		dojo.attr(this.label, "dir", (this.bidiTextDir == "auto")? BidiUtils.calculateDirForContextual(this.label.value) : this.bidiTextDir);
		var items = this.series_list_btn.dropDown.getChildren();
		for(var i=0;i<items.length;i++){
			var item = items[i];
			var bidiDir = this.bidiTextDir;
			if (bidiDir == "auto")
				bidiDir = BidiUtils.calculateDirForContextual(item.label);
			dojo.attr(item, "dir", (this.bidiTextDir == "auto")? BidiUtils.calculateDirForContextual(item.label) : this.bidiTextDir);
		}
		dojo.attr(this.series_list_btn.domNode, "dir", (this.bidiTextDir == "auto")? BidiUtils.calculateDirForContextual(this.series_list_btn.label) : this.bidiTextDir);
	}
	});