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

dojo.require("concord.chart.widget.ColorPickerDropDownButton");
dojo.require("concord.chart.widget.DropDownButton");
dojo.require("concord.util.BidiUtils");
dojo.provide("concord.chart.widget.Border");
dojo.requireLocalization("concord.chart.dialogs","ChartPropDlg");

dojo.declare("concord.chart.widget.Border", [dijit._Widget, dijit._Templated], {
	
	widgetsInTemplate: true,
	templateString: dojo.cache("concord.chart.widget", "templates/Border.html"),
	opts: null,
	defaultWidth: 1,
	
	constructor: function()
	{
		var nls = this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartPropDlg");
		this.opts = [this.nls.n, "1 px","2 px","3 px","4 px","5 px","6 px","7 px","8 px"];
	},
	
	onChange: function(key,value) 
	{
		
	},
	
	postCreate: function(){
		this.inherited(arguments);
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.thickness.dropDown = new dijit.Menu({baseClass: "chartdropmenu","class":"lotusActionMenu", dir: dirAttr});
		
		this.thickness.setLabel(this.opts[0]);
		
		dojo.style(this.thickness.containerNode,"width", "80px");
		dojo.addClass(this.thickness.containerNode,"buttonLabelTruncate");
		for(var i=0;i<this.opts.length;i++)
		{
			var item = new dijit.MenuItem({label:this.opts[i], dir: dirAttr});
			dijit.setWaiState(item.domNode,"label",this.opts[i]);
			this.connect(item,"onClick", dojo.hitch(this,function(w)
			{
				this.thickness.setLabel(this.opts[w]);
				if(w==0)
				{
					this.color.setColor("");
					this.onChange("noFill", 1);
				}
				else
				{
					if(this.color.getColor()==="")
					{
						this.color.setColor("#000000");
						this.onChange("solidFill", "#000000");
					}
					this.onChange("w", w);
				}
			},i));
			
			this.thickness.dropDown.addChild(item);
		}
		
		this.connect(this.color,"onChange", dojo.hitch(this,function(value)
		{
			this.onChange("solidFill",value);
			if(this.thickness.label==this.nls.n)
			{
				this.onChange("w",this.defaultWidth);
				this.thickness.setLabel(this.defaultWidth + " px");
			}
		}));
		
	},
	
	setState: function(ln)
	{
		if(!ln)
		{
			this.thickness.setLabel(this.opts[0]);
			this.color.setColor("");
			return;
		}
		if(ln.noFill==1)
		{
			this.thickness.setLabel(this.opts[0]);
			this.color.setColor("");
		}
		else
		{
			if(ln.w)
			{
				this.thickness.setLabel(dojo.number.format(ln.w,{pattern:"#.##"}) + " px");
				if(!ln.solidFill)
					this.color.setColor("#000000");
			}
			if(ln.solidFill)
			{
				if(!ln.w)
					this.thickness.setLabel(this.defaultWidth + " px");
				this.color.setColor(ln.solidFill);
			}
			if(!ln.w && !ln.solidFill)
				this.reset();
		}
	},
	
	reset: function()
	{
		this.thickness.setLabel(this.opts[0]);
		this.color.setColor("");
	},
	
	setWaiState: function(type)
	{
		if(type=="line")
		{
			this.thickness.attr("title", this.nls.setLineWidth);
			this.thickness.attr("value", this.nls.setLineWidth);
			dijit.setWaiState(this.thickness.focusNode,"label",this.nls.setLineWidth);
			
			this.color.attr("title", this.nls.setLineColor);
			this.color.attr("value", this.nls.setLineColor);
			dijit.setWaiState(this.color.focusNode,"label",this.nls.setLineColor);
		}
		else
		{
			this.thickness.attr("title", this.nls.setBorderWidth);
			this.thickness.attr("value", this.nls.setBorderWidth);
			dijit.setWaiState(this.thickness.focusNode,"label",this.nls.setBorderWidth);
			
			this.color.attr("title", this.nls.setBorderColor);
			this.color.attr("value", this.nls.setBorderColor);
			dijit.setWaiState(this.color.focusNode,"label",this.nls.setBorderColor);
		}
	}
});