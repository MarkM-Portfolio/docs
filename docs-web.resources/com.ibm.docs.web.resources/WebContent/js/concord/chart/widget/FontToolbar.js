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
dojo.require("dijit.form.ToggleButton");
dojo.require("concord.chart.widget.ColorPickerDropDownButton");
dojo.require("concord.chart.widget.FontSizeDropDownButton");
dojo.require("concord.chart.widget.FontNameDropDownButton");
dojo.provide("concord.chart.widget.FontToolbar");

dojo.requireLocalization("concord.chart.dialogs","ChartPropDlg");

dojo.declare("concord.chart.widget.FontToolbar", [dijit._Widget, dijit._Templated], {
	
	widgetsInTemplate: true,
	templateString: dojo.cache("concord.chart.widget", "templates/FontToolbar.html"),
	
	constructor: function() 
	{
		this.nls = dojo.i18n.getLocalization("concord.chart.dialogs","ChartPropDlg");
	},
	
	onChange: function(key, value) 
	{
		
	},
	
	postCreate: function(){
		this.inherited(arguments);
		
		dojo.addClass(this.bold.iconNode, "fontToolbarIcon boldIcon");
		dojo.addClass(this.italic.iconNode, "fontToolbarIcon italicIcon");
		
		dojo.addClass(this.bold.containerNode, "dijitDisplayNone");
		dojo.addClass(this.italic.containerNode, "dijitDisplayNone");
		
		this.color.setColor("#000000");
		this.connect(this.bold,"onClick", dojo.hitch(this,function()
		{
			this.onChange("b",this.bold.checked ? 1:0);
		}));
		
		this.connect(this.italic,"onClick", dojo.hitch(this,function()
		{
			this.onChange("i",this.italic.checked ? 1:0);
		}));
		
		this.connect(this.size,"onChange", dojo.hitch(this,function(fontsize)
		{
			this.onChange("sz",fontsize);
		}));
		
		this.connect(this.color,"onChange", dojo.hitch(this,function(color)
		{
			this.onChange("color", color);
		}));
	},
	
	setState: function(bold, italic, size, color, family)
	{
		this.bold.setChecked(!!bold);
		this.italic.setChecked(!!italic);
		
		this.size.setLabel(dojo.number.format(size,{pattern:"#.##"}));
		this.color.setColor(color || "#000000");
		
//		this.family.setLabel(family || "Arial");
	},
	
	setWaiState: function(pre)
	{
		var szTitle = this.nls.selectFontSize;
		this.size.focusNode.title = szTitle;
		dijit.setWaiState(this.size.focusNode,"label",szTitle);
		
		var boldTitle = this.nls.setBold;
		this.bold.focusNode.title = boldTitle;
		dijit.setWaiState(this.bold.focusNode,"label",boldTitle);
		
		var italicTitle = this.nls.setItalic;
		this.italic.focusNode.title = italicTitle;
		dijit.setWaiState(this.italic.focusNode,"label",italicTitle);
		
		var colorTitle = this.nls.setFontColor;
		this.color.focusNode.title = colorTitle;
		dijit.setWaiState(this.color.focusNode,"label",colorTitle);
	},
	
	setBold: function(bold)
	{
		this.bold.setChecked(!!bold);
	},
	
	setSize: function(size)
	{
		this.size.setLabel(dojo.number.format(size,{pattern:"#.##"}));
	},
	
	reset: function()
	{
		this.setState(0,0,10,"#000000","Arial");
	}
});