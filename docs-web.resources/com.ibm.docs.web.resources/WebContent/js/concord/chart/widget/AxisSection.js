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

dojo.require("concord.chart.widget.FontToolbar");
dojo.require("concord.chart.widget.DropDownButton");
dojo.require("concord.chart.widget.LineThickDropDownButton");
dojo.require("concord.chart.widget.Title");
dojo.require("concord.chart.widget.Border");
dojo.provide("concord.chart.widget.AxisSection");
dojo.require("concord.util.BidiUtils");

dojo.requireLocalization("concord.chart.dialogs","ChartPropDlg");

dojo.declare("concord.chart.widget.AxisSection", [dijit._Widget, dijit._Templated], {
	
	widgetsInTemplate: true,
	templateString: dojo.cache("concord.chart.widget", "templates/AxisSection.html"),
	
	focusId: null,
	allChanges: null,
	axes: null,
	
	errorCode: 0,
	
	constructor: function() 
	{
		this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartPropDlg"); 
	},
	
	/**
	 * @param axisId
	 * @param key
	 * @param value
	 * @param code  1: max change, 2: min change, 4: major unit change, 8: minor unit change
	 */
	onChange: function(axisId,key,value,code) 
	{
		
	},
	
	onError: function(errCode) 
	{
		if(errCode==1)
			this.scale_error.innerHTML = this.nls.inputNumberWarning;
		else if( errCode==2)
			this.scale_error.innerHTML = this.nls.inputNumberWarning;
		else if(errCode==4)
			this.scale_error.innerHTML = this.nls.inputPosNumberWarning;
		else if(errCode==8)
			this.scale_error.innerHTML = this.nls.inputPosNumberWarning;
	},
	
	onSubmit: function()
	{
		
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		dijit.setWaiRole(this.scale_error,'alert');
		dijit.setWaiState(this.axis_list_btn.focusNode,"label",this.nls.selectAxis);
		this.axis_title.font.setWaiState(this.nls.axisTitle);
		this.label_font.setWaiState(this.nls.axis + " " + this.nls.labelfont);
		this.line.setWaiState("line");
		dijit.setWaiState(this.scale_min,"label",this.nls.minimum);
		dijit.setWaiState(this.scale_max,"label",this.nls.maximum);
		dijit.setWaiState(this.scale_major,"label",this.nls.majorunit);
		dijit.setWaiState(this.scale_minor,"label",this.nls.minorunit);
		
		dojo.style(this.axis_list_btn.containerNode, {"backgroudColor":"#ccc","width": "50px"});
		dojo.addClass(this.axis_list_btn.containerNode,"buttonLabelTruncate");
		dojo.style(this.axis_list_btn.titleNode, {"backgroudColor":"#ccc"});
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.axis_list_btn.dropDown = new dijit.Menu({baseClass: "chartdropmenu","class":"lotusActionMenu", dir: dirAttr});
		if(dirAttr) {
			dojo.style(this.scale_max, "direction", "ltr");
			dojo.style(this.scale_min, "direction", "ltr");
			dojo.style(this.scale_major, "direction", "ltr");
			dojo.style(this.scale_minor, "direction", "ltr");
		}
		this.connect(this.label_font,"onChange",dojo.hitch(this, function(key, value)
		{
			var ntxPr = {};
			ntxPr[key] = value;
			this.onChange(this.focusId, "txPr", ntxPr);
			
			var axis = this._prepareAxis();
			var txPr = axis.txPr;
			if(!txPr)
				txPr = axis.txPr = {};
			txPr[key] = value;
		}));
		
		this.connect(this.axis_title,"onChange", dojo.hitch(this, function(key, value)
		{
			var ntitle = {};
			ntitle[key] = value;
			this.onChange(this.focusId, "title", ntitle);
			
			var axis = this._prepareAxis();
			var title = axis.title;
			if(!title)
				title = axis.title = {};
			if(key=="txPr")
			{
				if(!title.txPr)
					title.txPr = value;
				else
					dojo.mixin(title.txPr,value);
			}
			else
				title[key] = value;
		}));
		
		this.connect(this.axis_title,"onSubmit", dojo.hitch(this, function()
		{
			this.onSubmit();
		}));
		this.connect(this.axis_title,"onKeyUp", dojo.hitch(this, function(key, value)
		{
			dojo.attr(this.axis_title.content, "dir", (this.bidiTextDir == "auto") ? BidiUtils.calculateDirForContextual(this.axis_title.content.value) : this.bidiTextDir);
		}));
		
		this.connect(this.line, "onChange", dojo.hitch(this, function(key, value)
		{
			var nspPr = {ln:{}};
			nspPr.ln[key] = value;
			this.onChange(this.focusId, "spPr", nspPr);
			
			var axis = this._prepareAxis();
			
			var spPr = axis.spPr;
			if(!spPr)
				axis.spPr = nspPr;
			else
			{
				if(!spPr.ln)
					spPr.ln = {};
				spPr.ln[key] = value;
			}
		}));
		
		this.connect(this.scale_max, "onchange", dojo.hitch(this, "_maxChange"));
		this.connect(this.scale_max, "onkeypress", dojo.hitch(this, function(e)
		{
			if(this.errorCode==1)
				this.scale_error.innerHTML = "";
			if(e.keyCode == dojo.keys.ENTER)
			{
				this._maxChange();
				this.onSubmit();
			}
		}));
		
		this.connect(this.scale_min, "onchange", dojo.hitch(this, "_minChange"));
		this.connect(this.scale_min, "onkeypress", dojo.hitch(this, function(e)
		{
			if(this.errorCode==2)
				this.scale_error.innerHTML = "";
			if(e.keyCode == dojo.keys.ENTER)
			{
				this._minChange();
				this.onSubmit();
			}
		}));
		
		this.connect(this.scale_major, "onchange", dojo.hitch(this, "_majorChange"));
		this.connect(this.scale_major, "onkeypress", dojo.hitch(this, function(e)
		{
			if(this.errorCode==4)
				this.scale_error.innerHTML = "";
			if(e.keyCode == dojo.keys.ENTER)
			{
				this._majorChange();
				this.onSubmit();
			}
		}));
		
		this.connect(this.scale_minor, "onchange", dojo.hitch(this, "_minorChange"));
		this.connect(this.scale_minor, "onkeypress", dojo.hitch(this, function(e)
		{
			if(this.errorCode==8)
				this.scale_error.innerHTML = "";
			if(e.keyCode == dojo.keys.ENTER)
			{
				this._minorChange();
				this.onSubmit();
			}
		}));
	},
	
	_getMax: function()
	{
		var change = null;
		if(this.allChanges.axis)
			change = this.allChanges.axis[this.focusId];
		var max = (change && change.scaling && "max" in change.scaling) ? change.scaling.max : this.focusAxis.max;
		return max;
	},
	
	_getMin: function()
	{
		var change = null;
		if(this.allChanges.axis)
			change = this.allChanges.axis[this.focusId];
		var min = (change && change.scaling && "min" in change.scaling) ? change.scaling.min : this.focusAxis.min;
		return min;
	},
	
	_maxChange: function()
	{
		var value = this.scale_max.value;
		if(value!="")
		{
			var options = {type:"decimal", locale: pe.scene.getLocale()};
	   		var fValue = dojo.number.parse( value, options);
	   		if(isNaN(fValue))
			{
	   			dijit.setWaiState(this.scale_max, "invalid", true);
				this.scale_max.focus();
				this.onError(1);
				this.errorCode |= 1;
				this.axis_list_btn.setDisabled(true);
				return;
			}
	   		var min = this._getMin();
	   		if(min!=null && fValue<=min)
	   		{
	   			var oldmax = this._getMax();
	   			this.scale_max.value = oldmax || "";
	   			return;
	   		}
			value = fValue;
			if(fValue>0x7FFFFFFFFFFFFFFF || fValue<-0x8000000000000000)
			{
				this.scale_max.value = "";
				return;
			}
		}
		else
			value = null;
		
		dijit.setWaiState(this.scale_max, "invalid", false);
		this.errorCode &= (0xFF & ~1);
		if(this.errorCode==0)
			this.axis_list_btn.setDisabled(false);
		
		var scaling = {};
		scaling.max = value;
		this.onChange(this.focusId, "scaling", scaling,1);
		
		var axis = this._prepareAxis();
		if(!axis.scaling)
			axis.scaling = {};
		axis.scaling.max = value;
	},
	
	_minChange: function()
	{
		var value = this.scale_min.value;
		if(value!="")
		{
			var options = {type:"decimal", locale: pe.scene.getLocale()};
	   		var fValue = dojo.number.parse( value, options);
	   		if(isNaN(fValue))
			{
	   			dijit.setWaiState(this.scale_min, "invalid", true);
				this.scale_min.focus();
				this.onError(2);
				this.errorCode |= 2;
				this.axis_list_btn.setDisabled(true);
				return;
			}
	   		var max = this._getMax();
	   		if(max!=null && fValue>=max)
	   		{
	   			var oldmin = this._getMin();
	   			this.scale_min.value = oldmin || "";
	   			return;
	   		}
			value = fValue;
			if(fValue>0x7FFFFFFFFFFFFFFF || fValue<-0x8000000000000000)
			{
				this.scale_min.value = "";
				return;
			}
		}
		else
			value = null;
		
		dijit.setWaiState(this.scale_min, "invalid", false);
		this.errorCode &= (0xFF & ~2);
		if(this.errorCode==0)
			this.axis_list_btn.setDisabled(false);
		var scaling = {};
		scaling.min = value;
		this.onChange(this.focusId, "scaling", scaling, 2);
		
		var axis = this._prepareAxis();
		if(!axis.scaling)
			axis.scaling = {};
		axis.scaling.min = value;
	},
	
	_majorChange: function()
	{
		var major = this.scale_major.value;
		if(major!="")
		{
			var options = {type:"decimal", locale: pe.scene.getLocale()};
	   		var fValue = dojo.number.parse( major, options);
	   		if(isNaN(fValue) || fValue<=0)
			{
	   			dijit.setWaiState(this.scale_major, "invalid", true);
				this.scale_major.focus();
				this.onError(4);
				this.errorCode |= 4;
				this.axis_list_btn.setDisabled(true);
				return;
			}
			major = fValue;
			if(fValue>0x7FFFFFFFFFFFFFFF)
			{
				this.scale_major.value = "";
				return;
			}
		}
		else
			major = null;
		
		dijit.setWaiState(this.scale_major, "invalid", false);
		this.errorCode &= (0xFF & ~4);
		if(this.errorCode==0)
			this.axis_list_btn.setDisabled(false);
		
		this.onChange(this.focusId, "majorUnit", major,4);
		var axis = this._prepareAxis();
		axis.majorUnit = major;
	},
	
	_minorChange: function()
	{
		var minor = this.scale_minor.value;
		if(minor!="")
		{
			var options = {type:"decimal", locale: pe.scene.getLocale()};
	   		var fValue = dojo.number.parse( minor, options);
	   		if(isNaN(fValue) || fValue<=0)
			{
	   			dijit.setWaiState(this.scale_minor, "invalid", true);
				this.scale_minor.focus();
				this.onError(8);
				this.errorCode |= 8;
				this.axis_list_btn.setDisabled(true);
				return;
			}
			minor = fValue;
			if(fValue>0x7FFFFFFFFFFFFFFF)
			{
				this.scale_minor.value = "";
				return;
			}
		}
		else
			minor = null;
		
		dijit.setWaiState(this.scale_minor, "invalid", false);
		this.errorCode &= (0xFF & ~8);
		if(this.errorCode==0)
			this.axis_list_btn.setDisabled(false);
		
		this.onChange(this.focusId, "minorUnit", minor,8);
		var axis = this._prepareAxis();
		axis.minorUnit = minor;
	},
	
	_prepareAxis: function()
	{
		var axes = this.allChanges.axis;
		if(!axes)
			axes = this.allChanges.axis = {};
		var axis = axes[this.focusId];
		if(!axis)
			axis = axes[this.focusId] = {};
		return axis;
	},
	
	setState: function(axes, allChanges)
	{
		this.allChanges = allChanges;
		this.axis_list_btn.dropDown.destroyDescendants();
		this.scale_error.innerHTML = "";
		this.axis_list_btn.setDisabled(false);
		
		this.errorCode = 0;
		this.axes = axes;
		//Display the value axis by default
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		for(var i=0;i<axes.length;i++)
		{
			var axis = axes[i];
			if(axis.type!="catAx")
			{
				this._setState(axis);
				this.focusId = axis.id;
				this.focusAxis = axis;
				break;
			}
		}
		var displayed = {};
		for(var i=0;i<axes.length;i++)
		{
			var axis = axes[i];
			if(axis.invisible)
				continue;
			//only one axis can be show for each side. For example, there can be two axis at left side.
			if(displayed[axis.position])
				continue;
			
			displayed[axis.position] = 1;
			var item = new dijit.MenuItem({label:this.nls[axis.position], dir: dirAttr});
			this.connect(item,"onClick", dojo.hitch(this,function(axis)
			{
				this._setState(axis);
				this.focusId = axis.id;
				this.focusAxis = axis;
			},axis));
			
			this.axis_list_btn.dropDown.addChild(item);
		}
	},
	
	_setState: function(axis)
	{
		var change = null;
		if(this.allChanges.axis)
			change = this.allChanges.axis[axis.id];
		
		this.axis_list_btn.setLabel(this.nls[axis.position]);
		
		var txPr = dojo.mixin({},axis._chart.textPro,axis.textPro);
		if(change && change.txPr)
		    dojo.mixin(txPr, change.txPr);
		
		this.label_font.setState(txPr.b,txPr.i,txPr.sz || 10,txPr.color, txPr.latin);
		
		var spPr = null;
		if(change && change.spPr)
		    spPr = dojo.mixin({}, axis.spPr, change.spPr);
		else
			spPr = axis.spPr;
		if(spPr && spPr.ln)
			this.line.setState(spPr.ln);
		else
			this.line.setState({w:1,solidFill:"#000000"});
		
		var title = {};
		title.textPro = dojo.mixin({sz : 10},axis._chart.textPro);
		if(axis.title)
		{
			title.text = axis.title.text;
			dojo.mixin(title.textPro, axis.title.textPro);
		}
		if(change && change.title)
		{
			if("text" in change.title)
				title.text = change.title.text;
			if("txPr" in change.title)
				dojo.mixin(title.textPro,change.title.txPr);
		}
		this.axis_title.setState(title);
		if (BidiUtils.isBidiOn()){
			dojo.attr(this.axis_title.content, "dir", this.bidiTextDir);
		}
		
		if(axis.type && axis.type!="catAx" && !axis.percentStacked)
		{
			this.scale.style.display = "";
			var options = {type:"decimal", locale: pe.scene.getLocale()};
			
			var max = (change && change.scaling && "max" in change.scaling) ? change.scaling.max : axis.max;
			this.scale_max.value = max!=null ? dojo.number.format(max,options) : "";
			var min = (change && change.scaling && "min" in change.scaling) ? change.scaling.min : axis.min;
			this.scale_min.value = min!=null ? dojo.number.format(min,options) : "";
			var major = (change && "majorUnit" in change) ? change.majorUnit : axis.majorUnit;
			this.scale_major.value = major!=null ? dojo.number.format(major,options) : "";
			var minor = (change && "minorUnit" in change) ? change.minorUnit : axis.minorUnit;
			this.scale_minor.value = minor!=null ? dojo.number.format(minor,options) : "";
		}
		else
			this.scale.style.display = "none";
	},
	
	reset: function()
	{
	},
	setBidiTextDir: function (dir)
	{
		this.bidiTextDir = dir;
	},
	onTextDirChange: function(newTextDir) {
		if (!BidiUtils.isBidiOn())
			return;
		this.bidiTextDir = newTextDir;
		dojo.attr(this.axis_title.content, "dir", (this.bidiTextDir == "auto")? BidiUtils.calculateDirForContextual(this.axis_title.content.value) : this.bidiTextDir);
	}
});