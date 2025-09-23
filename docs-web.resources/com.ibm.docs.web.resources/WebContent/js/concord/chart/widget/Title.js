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
dojo.provide("concord.chart.widget.Title");

dojo.requireLocalization("concord.chart.dialogs","ChartPropDlg");

dojo.declare("concord.chart.widget.Title", [dijit._Widget, dijit._Templated], {
	
	widgetsInTemplate: true,
	templateString: dojo.cache("concord.chart.widget", "templates/Title.html"),
	
	constructor: function() 
	{
		this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartPropDlg");
	},
	
	onChange: function(key,value) 
	{
		
	},
	
	onSubmit: function()
	{
		
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		dijit.setWaiState(this.content,"label",this.nls.enterTitle);
		
		this.connect(this.content,"onchange", dojo.hitch(this,function()
		{
			this.onChange("text",this.content.value);
		}));
		
		this.connect(this.content,"onkeypress", dojo.hitch(this,function(e)
		{
			if(e.keyCode == dojo.keys.ENTER)
			{
				this.onChange("text",this.content.value);
				this.onSubmit();
			}
		}));
		
		this.connect(this.font,"onChange", dojo.hitch(this,function(key, value)
		{
			var txPr = {};
			txPr[key] = value;
			this.onChange("txPr",txPr);
		}));
	},
	
	setState: function(title)
	{
		if(title)
		{
			var txPr = title.textPro;
			if(txPr)
				this.font.setState(!(txPr.b==0),txPr.i,txPr.sz || 18,txPr.color, txPr.latin);
			else
				this.reset();
			
			this.content.value = title.text || "";
		}
		else
			this.reset();
	},
	
	reset: function()
	{
		this.content.value = "";
		this.font.reset();
		this.font.setBold(1);
	}
});