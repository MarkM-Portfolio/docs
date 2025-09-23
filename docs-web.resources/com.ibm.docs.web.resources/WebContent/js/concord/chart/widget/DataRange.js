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

dojo.provide("concord.chart.widget.DataRange");

dojo.require("dijit.form.RadioButton");
dojo.declare("concord.chart.widget.DataRange", [dijit._Widget, dijit._Templated], {
	widgetsInTemplate: true,
	templateString: dojo.cache("concord.chart.widget", "templates/DataRange.html"),
	type:"auto",
	onChange: function(key,value) {},
	onKeypress: function(){},
	rangeAddr: "",
	
	constructor: function() 
	{
		this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartTypesDlg");
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		dijit.setWaiState(this.range,"label",this.nls.DATA_RANGE);
		
		this.connect(this.range,"onblur", dojo.hitch(this,function()
		{
			if(this.rangeAddr!=this.range.value)
			{
				this.rangeAddr = this.range.value;
				this.onChange("ref",this.range.value);
			}
		}));
		this.connect(this.range,"onkeypress", dojo.hitch(this,function(e)
		{
			this.onKeypress(e);
		}));
		
		this.connect(this.radio1,"onClick", dojo.hitch(this,function()
		{
			if(this.type!="row")
			{
				this.type = "row";
				this.onChange("type","row");
			}
		}));
		this.connect(this.radio2,"onClick", dojo.hitch(this,function()
		{
			if(this.type!="column")
			{
				this.type = "column";
				this.onChange("type","column");
			}
		}));
		this.connect(this.radio3,"onClick", dojo.hitch(this,function()
		{
			if(this.type!="auto")
			{
				this.type = "auto";
				this.onChange("type","auto");
			}
		}));
	},
	
	setState: function(range)
	{
		if(range)
		{
			this.range.value = range;
		}
		else
			this.range.value = "";
	},
	
	applyAddress: function()
	{
		this.onChange("ref",this.range.value);
	},
	
	getState: function()
	{
		return {"address": this.range.value, "type" : this.type};
	},
	
	onShow: function(){
		this.range.focus();
	},
	
	_select:function(radioID)
	{
		if(this[radioID])
			this[radioID].setChecked(true);		
	},
	
	reset: function()
	{
		this.type = "auto";
		this._select("radio3");
	}
	
});